import { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, Building, Copy, Check, ArrowRight, ShieldCheck, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { CartItem, UserLocation, Order, PlatformPaymentSettings } from '../types';

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: any) => { openIframe: () => void };
    };
  }
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  userLocation: UserLocation | null;
  authToken?: string;
  onOrderSuccess: (order: Order) => void;
  platformSettings?: PlatformPaymentSettings | null;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  userLocation,
  authToken,
  onOrderSuccess,
  platformSettings
}: CheckoutModalProps) {
  const [step, setStep] = useState<'shipping' | 'payment' | 'manual_proof'>('shipping');
  const [fullName, setFullName] = useState('Chioma Adebayo');
  const [phone, setPhone] = useState('08023456789');
  const [street, setStreet] = useState('Plot 12, Admiralty Way, Lekki Phase 1');
  const [instructions, setInstructions] = useState('');
  const [deliveryFee, setDeliveryFee] = useState<number>(1500);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'manual_transfer'>('paystack');
  const [orderData, setOrderData] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Manual Transfer details
  const [manualGateway, setManualGateway] = useState<'OPay' | 'Paystack'>('OPay');
  const [transferRef, setTransferRef] = useState('TRX-99881122');
  const [proofUrl, setProofUrl] = useState('');
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Test Paystack popup simulation state if official popup is unavailable
  const [showPaystackSimulator, setShowPaystackSimulator] = useState(false);
  const [simulatedRef, setSimulatedRef] = useState('');

  useEffect(() => {
    const calcSubtotal = cartItems.reduce((sum, item) => {
      const price = item.product.discountedPrice || item.product.price;
      return sum + price * item.quantity;
    }, 0);
    setSubtotal(calcSubtotal);

    if (userLocation) {
      axios
        .post('/api/delivery/calculate', {
          state: userLocation.state,
          lga: userLocation.lga
        })
        .then((res) => {
          if (res.data.fee) setDeliveryFee(res.data.fee);
        })
        .catch((err) => console.error('Error fetching delivery fee', err));
    }
  }, [cartItems, userLocation]);

  if (!isOpen) return null;

  const total = subtotal + deliveryFee;

  const handleInitiateOrder = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const payload = {
        items: cartItems.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
          variation: i.variation || null
        })),
        deliveryAddress: {
          fullName,
          phone,
          street,
          state: userLocation?.state || 'Lagos',
          lga: userLocation?.lga || 'Ikeja',
          instructions
        },
        paymentMethod
      };

      const res = await axios.post('/api/orders/create', payload, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      });

      const createdOrder: Order = res.data.order;
      setOrderData(createdOrder);

      if (paymentMethod === 'paystack') {
        launchPaystack(createdOrder);
      } else {
        setStep('manual_proof');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Order creation failed');
    } finally {
      setLoading(false);
    }
  };

  const launchPaystack = (order: Order) => {
    const generatedRef = 'OSO_' + Math.floor(Math.random() * 1000000000 + 1);
    setSimulatedRef(generatedRef);

    // If Paystack inline JS is available and configured with a public key
    const publicKey = (import.meta as any).env?.VITE_PAYSTACK_PUBLIC_KEY || '';
    const hasConfiguredKey = publicKey && (publicKey.startsWith('pk_live_') || (publicKey.startsWith('pk_test_') && publicKey !== 'pk_test_demo1234567890'));

    if (window.PaystackPop && typeof window.PaystackPop.setup === 'function' && hasConfiguredKey) {
      try {
        const handler = window.PaystackPop.setup({
          key: publicKey,
          email: order.customerDetails.email || 'customer@osoahia.ng',
          amount: Math.round(order.total * 100),
          currency: 'NGN',
          ref: generatedRef,
          callback: async function (response: any) {
            await verifyPaystackOnBackend(response.reference || generatedRef, order.id);
          },
          onClose: function () {
            setErrorMsg('Paystack transaction was cancelled.');
          }
        });
        handler.openIframe();
        return;
      } catch (err) {
        console.warn('Paystack inline iframe failed, launching secure test gateway simulator', err);
      }
    }

    // Interactive high-fidelity test modal for sandbox/preview testing
    setShowPaystackSimulator(true);
  };

  const verifyPaystackOnBackend = async (reference: string, orderId: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await axios.post(
        '/api/payments/paystack/verify',
        {
          reference,
          orderId
        },
        {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
        }
      );

      setShowPaystackSimulator(false);
      onOrderSuccess(res.data.order || orderData);
      onClose();
    } catch (vErr: any) {
      setErrorMsg('Server verification failed: ' + (vErr.response?.data?.error || vErr.message));
    } finally {
      setLoading(false);
    }
  };

  const handleManualProofSubmit = async () => {
    if (!orderData) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await axios.post(
        '/api/payments/manual/submit',
        {
          orderId: orderData.id,
          accountTransferredTo: manualGateway,
          transferReference: transferRef,
          proofUrl: proofUrl || null
        },
        {
          headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
        }
      );

      onOrderSuccess(res.data.order || orderData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const opayNumber = platformSettings?.opayManualAccount?.accountNumber || '8101234567';
  const opayName = platformSettings?.opayManualAccount?.accountName || 'Oso-Ahia Ent / OPay';
  const titanNumber = platformSettings?.paystackManualAccount?.accountNumber || '9920123456';
  const titanName = platformSettings?.paystackManualAccount?.accountName || 'Oso-Ahia Merchant / Titan';
  const titanBank = platformSettings?.paystackManualAccount?.bankName || 'Paystack-Titan';

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[92vh] overflow-y-auto border border-gray-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Marketplace Checkout</span>
            <h2 className="text-lg font-black text-gray-900">
              {step === 'shipping' && '1. Delivery Information'}
              {step === 'payment' && '2. Payment Method'}
              {step === 'manual_proof' && '3. Complete Direct Bank Transfer'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: SHIPPING DETAILS */}
        {step === 'shipping' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Recipient Full Name</label>
              <input
                id="checkout-fullname-input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                placeholder="e.g. Chioma Adebayo"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Phone Number (WhatsApp reachable for dispatch rider)
              </label>
              <input
                id="checkout-phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                placeholder="08012345678"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Street Address</label>
              <textarea
                id="checkout-street-input"
                rows={2}
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                placeholder="House/Plot number, street name, nearest landmark"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs text-gray-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                placeholder="e.g. Call security gate on arrival"
              />
            </div>

            {/* Price & Delivery breakdown */}
            <div className="bg-purple-50/60 border border-purple-100 p-3.5 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between text-gray-600">
                <span>Destination LGA:</span>
                <span className="font-bold text-purple-900">
                  {userLocation?.lga || 'Ikeja'}, {userLocation?.state || 'Lagos'}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal:</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Doorstep Delivery Fee:</span>
                <span className="font-semibold text-gray-900">₦{deliveryFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-purple-950 pt-2 border-t border-purple-200">
                <span>Total Amount to Pay:</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              id="proceed-to-payment-button"
              type="button"
              onClick={() => setStep('payment')}
              disabled={!fullName || !phone || !street}
              className="w-full bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>Continue to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: PAYMENT METHOD */}
        {step === 'payment' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Select Secure Payment Channel
              </label>
              <button
                onClick={() => setStep('shipping')}
                className="text-xs text-purple-700 hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" /> Edit shipping
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* Paystack Card/USSD */}
              <div
                id="payment-option-paystack"
                onClick={() => setPaymentMethod('paystack')}
                className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex items-start gap-3 ${
                  paymentMethod === 'paystack'
                    ? 'border-purple-700 bg-purple-50/50 shadow-xs ring-1 ring-purple-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 mt-0.5">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">
                      Paystack (Card, Transfer, USSD)
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                      Instant Confirmation
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Pay securely with your Nigerian ATM card (Mastercard, Visa, Verve) or USSD bank code.
                  </p>
                </div>
              </div>

              {/* Direct Manual Transfer */}
              <div
                id="payment-option-manual"
                onClick={() => setPaymentMethod('manual_transfer')}
                className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex items-start gap-3 ${
                  paymentMethod === 'manual_transfer'
                    ? 'border-purple-700 bg-purple-50/50 shadow-xs ring-1 ring-purple-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Building className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">
                      Direct Manual Bank Transfer
                    </span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                      Admin Verified
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Transfer directly to Oso-Ahia OPay or Paystack-Titan account and submit session reference.
                  </p>
                </div>
              </div>
            </div>

            {/* Total summary */}
            <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-sm">
              <span className="text-gray-600 font-medium">Amount to Pay:</span>
              <span className="text-base font-black text-purple-950">₦{total.toLocaleString()}</span>
            </div>

            <button
              id="confirm-and-pay-button"
              type="button"
              onClick={handleInitiateOrder}
              disabled={loading}
              className="w-full bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating order & opening gateway...</span>
                </>
              ) : (
                <span>Pay ₦{total.toLocaleString()} Now</span>
              )}
            </button>
          </div>
        )}

        {/* STEP 3: MANUAL TRANSFER PROOF SUBMISSION */}
        {step === 'manual_proof' && orderData && (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-900 text-sm">
                  Send Exactly ₦{orderData.total.toLocaleString()} to:
                </span>
                <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded text-purple-800 border">
                  Ref: {orderData.orderNumber}
                </span>
              </div>

              {/* OPay Account Box */}
              <div className="bg-white p-3 rounded-lg border border-purple-200/80 shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Option 1: OPay Account</span>
                    <p className="text-sm font-mono font-black text-purple-950">{opayNumber}</p>
                    <p className="text-xs text-gray-600">{opayName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(opayNumber, 'opay')}
                    className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 px-2.5 py-1 rounded-md font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    {copiedAccount === 'opay' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAccount === 'opay' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Paystack-Titan Account Box */}
              <div className="bg-white p-3 rounded-lg border border-purple-200/80 shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Option 2: {titanBank}</span>
                    <p className="text-sm font-mono font-black text-purple-950">{titanNumber}</p>
                    <p className="text-xs text-gray-600">{titanName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(titanNumber, 'titan')}
                    className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 px-2.5 py-1 rounded-md font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    {copiedAccount === 'titan' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAccount === 'titan' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Which Account Did You Pay To?</label>
              <select
                id="manual-gateway-select"
                value={manualGateway}
                onChange={(e) => setManualGateway(e.target.value as any)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              >
                <option value="OPay">OPay Account ({opayNumber})</option>
                <option value="Paystack">Paystack Dedicated Account ({titanNumber})</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Bank Transaction Reference / Session ID
              </label>
              <input
                id="manual-reference-input"
                type="text"
                value={transferRef}
                onChange={(e) => setTransferRef(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-sm font-mono text-gray-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                placeholder="e.g. TRX-99881122 or 090123230910..."
              />
              <span className="text-[11px] text-gray-500 mt-1 block">
                Found on your bank transfer receipt / SMS alert.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Proof Receipt URL / Note (Optional)</label>
              <input
                type="text"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs text-gray-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                placeholder="e.g. https://receipts.bank.ng/ref-123 or transfer note"
              />
            </div>

            <button
              id="submit-manual-proof-button"
              type="button"
              onClick={handleManualProofSubmit}
              disabled={!transferRef || loading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Transfer Details...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>I Have Sent The Money</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Paystack Inline Simulation Dialog (When running in preview environment) */}
      {showPaystackSimulator && orderData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border-t-4 border-emerald-500 text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Paystack Checkout Simulation</h3>
            <p className="text-xs text-gray-500 mt-1">
              Test payment for Order <strong>{orderData.orderNumber}</strong>
            </p>
            <div className="my-4 p-3 bg-gray-50 rounded-xl text-left text-xs space-y-1 border">
              <p><strong>Amount:</strong> ₦{orderData.total.toLocaleString()} ({Math.round(orderData.total * 100)} Kobo)</p>
              <p><strong>Customer:</strong> {orderData.customerDetails.fullName}</p>
              <p className="font-mono text-[11px]"><strong>Reference:</strong> {simulatedRef}</p>
            </div>
            <div className="space-y-2">
              <button
                id="paystack-test-success-button"
                type="button"
                onClick={() => verifyPaystackOnBackend(simulatedRef, orderData.id)}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Simulate Successful Card Payment</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPaystackSimulator(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-xl text-xs transition cursor-pointer"
              >
                Cancel Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
