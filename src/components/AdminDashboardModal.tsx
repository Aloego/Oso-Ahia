import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  Store,
  Package,
  Settings,
  RefreshCw,
  X,
  CreditCard,
  Eye,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { PaymentRecord, Order, Vendor, Product, PlatformPaymentSettings } from '../types';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  authToken?: string;
  onRefreshData?: () => void;
}

export default function AdminDashboardModal({
  isOpen,
  onClose,
  authToken,
  onRefreshData
}: AdminDashboardModalProps) {
  const [activeTab, setActiveTab] = useState<'payments' | 'orders' | 'vendors' | 'products' | 'settings'>('payments');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<PlatformPaymentSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [vendorCommissionInput, setVendorCommissionInput] = useState<{ [vendorId: string]: number }>({});

  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  const fetchData = async () => {
    setLoading(true);
    try {
      const [paymentsRes, ordersRes, vendorsRes, productsRes, settingsRes] = await Promise.all([
        axios.get('/api/admin/payments', { headers }),
        axios.get('/api/orders', { headers }),
        axios.get('/api/admin/vendors', { headers }),
        axios.get('/api/products?includePending=true', { headers }),
        axios.get('/api/platformSettings/paymentSettings')
      ]);

      setPayments(paymentsRes.data);
      setOrders(ordersRes.data);
      setVendors(vendorsRes.data);
      setProducts(productsRes.data);
      setSettings(settingsRes.data);
    } catch (err: any) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // 1. Review Manual Payment
  const handleReviewPayment = async (paymentId: string, decision: 'approve' | 'reject') => {
    setLoading(true);
    try {
      const res = await axios.post(
        '/api/admin/payments/manual/review',
        { paymentId, decision },
        { headers }
      );
      setFeedback({
        type: 'success',
        message: `Payment ${paymentId} successfully ${decision}d. Order status updated.`
      });
      fetchData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.error || err.message || 'Payment review failed'
      });
    } finally {
      setLoading(false);
    }
  };

  // 2. Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await axios.post('/api/admin/orders/status', { orderId, status }, { headers });
      setFeedback({ type: 'success', message: `Order #${orderId.slice(-6)} moved to "${status}"` });
      fetchData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Update failed' });
    }
  };

  // 3. Review Vendor
  const handleReviewVendor = async (vendorId: string, decision: 'approved' | 'rejected') => {
    try {
      const commission = vendorCommissionInput[vendorId] !== undefined ? vendorCommissionInput[vendorId] : 5;
      await axios.post(
        '/api/admin/vendors/review',
        { vendorId, decision, commissionRate: commission },
        { headers }
      );
      setFeedback({ type: 'success', message: `Vendor ${decision} successfully at ${commission}% commission.` });
      fetchData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Review failed' });
    }
  };

  // 4. Review Product
  const handleReviewProduct = async (productId: string, decision: 'approved' | 'rejected') => {
    try {
      await axios.post('/api/admin/products/review', { productId, decision }, { headers });
      setFeedback({ type: 'success', message: `Product ${decision} for marketplace catalogue.` });
      fetchData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Product review failed' });
    }
  };

  // 5. Update Platform Payment Accounts
  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await axios.put('/api/admin/platformSettings/paymentSettings', settings, { headers });
      setFeedback({ type: 'success', message: 'Platform bank accounts & settings saved successfully.' });
      fetchData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Failed saving settings' });
    }
  };

  // Reset demo store
  const handleResetData = async () => {
    if (!confirm('Reset all marketplace data back to default test seed state?')) return;
    try {
      await axios.post('/api/admin/reset-data', {}, { headers });
      setFeedback({ type: 'success', message: 'Marketplace reset to initial seed state.' });
      fetchData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Failed to reset' });
    }
  };

  const pendingPayments = payments.filter((p) => p.status === 'Pending Verification');
  const pendingVendors = vendors.filter((v) => v.verificationStatus === 'pending');
  const pendingProducts = products.filter((p) => p.approvalStatus === 'pending');

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-5xl w-full p-6 shadow-2xl max-h-[92vh] flex flex-col border border-gray-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-900 text-amber-400 flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-gray-900">Oso-Ahia Operations Control</h2>
                <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Admin RBAC
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Lagos Fulfillment & Multi-Vendor Escrow Moderation Panel
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetData}
              className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              title="Reset data to initial state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Seed Data</span>
            </button>
            <button
              onClick={fetchData}
              className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-bold transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`my-3 p-3 rounded-xl text-xs flex items-center justify-between shrink-0 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback(null)} className="font-bold text-xs">
              ✕
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mt-2 shrink-0 gap-1 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'payments'
                ? 'border-purple-700 text-purple-900 bg-purple-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Manual Payments</span>
            {pendingPayments.length > 0 && (
              <span className="bg-amber-500 text-white rounded-full text-[10px] px-1.5 py-0.2 font-bold">
                {pendingPayments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'orders'
                ? 'border-purple-700 text-purple-900 bg-purple-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vendors')}
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'vendors'
                ? 'border-purple-700 text-purple-900 bg-purple-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Vendors</span>
            {pendingVendors.length > 0 && (
              <span className="bg-amber-500 text-white rounded-full text-[10px] px-1.5 py-0.2 font-bold">
                {pendingVendors.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'products'
                ? 'border-purple-700 text-purple-900 bg-purple-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Catalog Moderation</span>
            {pendingProducts.length > 0 && (
              <span className="bg-amber-500 text-white rounded-full text-[10px] px-1.5 py-0.2 font-bold">
                {pendingProducts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2.5 px-3.5 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'settings'
                ? 'border-purple-700 text-purple-900 bg-purple-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Payment Accounts</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* TAB 1: MANUAL PAYMENTS AUDIT & APPROVAL */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">
                  Manual Bank Transfer Review Queue ({pendingPayments.length} Pending Approval)
                </h3>
                <span className="text-xs text-gray-500">
                  Transfers made via OPay or Paystack-Titan accounts
                </span>
              </div>

              {payments.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs">No payment records found.</div>
              ) : (
                <div className="space-y-3">
                  {payments.map((p) => {
                    const isPending = p.status === 'Pending Verification';
                    const relatedOrder = orders.find((o) => o.id === p.orderId);

                    return (
                      <div
                        key={p.id}
                        id={`payment-row-${p.id}`}
                        className={`p-4 rounded-xl border text-xs transition ${
                          isPending
                            ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-300'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 text-sm">
                                ₦{p.amount.toLocaleString()}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                  p.status === 'Paid'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : p.status === 'Pending Verification'
                                    ? 'bg-amber-100 text-amber-800 animate-pulse'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {p.status}
                              </span>
                              <span className="font-mono text-[11px] text-gray-500">
                                Order #{p.orderId.slice(-6)}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-gray-600">
                              <div>
                                <span className="text-gray-400 block text-[10px]">Gateway Account:</span>
                                <span className="font-semibold text-gray-800">{p.accountTransferredTo || p.gateway}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-[10px]">Bank Transfer Ref:</span>
                                <span className="font-mono font-bold text-purple-950">
                                  {p.transferReference || p.paystackReference || 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-[10px]">Customer:</span>
                                <span>{relatedOrder?.customerDetails?.fullName || p.customerId}</span>
                              </div>
                              <div>
                                <span className="text-gray-400 block text-[10px]">Submitted:</span>
                                <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {p.proofUrl && (
                              <div className="mt-2 text-[11px] text-purple-700 flex items-center gap-1">
                                <span>Proof:</span>
                                <a
                                  href={p.proofUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline font-medium hover:text-purple-900"
                                >
                                  {p.proofUrl}
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons for Pending Transfers */}
                          {isPending && (
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                id={`approve-payment-${p.id}`}
                                onClick={() => handleReviewPayment(p.id, 'approve')}
                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Approve Transfer</span>
                              </button>
                              <button
                                id={`reject-payment-${p.id}`}
                                onClick={() => handleReviewPayment(p.id, 'reject')}
                                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-semibold flex items-center gap-1 transition cursor-pointer"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Reject</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ALL ORDERS & FULFILLMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900">All Marketplace Orders ({orders.length})</h3>
              <div className="space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className="p-4 rounded-xl border border-gray-200 bg-white text-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                      <div>
                        <span className="font-mono font-bold text-purple-900 text-sm">
                          {o.orderNumber}
                        </span>
                        <span className="text-gray-400 ml-2 text-[11px]">
                          {new Date(o.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            o.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.paymentStatus === 'Pending Verification'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          Payment: {o.paymentStatus}
                        </span>
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-purple-100 text-purple-800">
                          Status: {o.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2.5">
                      <div>
                        <span className="text-gray-400 block text-[10px]">Customer:</span>
                        <p className="font-bold text-gray-900">{o.customerDetails.fullName}</p>
                        <p className="text-gray-500">{o.customerDetails.phone}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">Delivery Destination:</span>
                        <p className="text-gray-800 font-medium">
                          {o.deliveryAddress.street}, {o.deliveryAddress.lga}, {o.deliveryAddress.state}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">Financials:</span>
                        <p className="text-gray-900 font-bold">Total: ₦{o.total.toLocaleString()}</p>
                        <p className="text-gray-500 text-[11px]">
                          Subtotal ₦{o.subtotal.toLocaleString()} + Delivery ₦{o.deliveryFee.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Order items */}
                    <div className="bg-gray-50 p-2.5 rounded-lg my-2 space-y-1">
                      {o.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-gray-700 text-[11px]">
                          <span>
                            {it.quantity}x {it.name} {it.variation ? `(${it.variation})` : ''}
                          </span>
                          <span className="font-semibold">₦{(it.price * it.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    {/* Update order status control */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                      <span className="text-[11px] text-gray-500 font-medium">Advance Logistics Status:</span>
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                        className="bg-gray-100 border border-gray-300 rounded-lg px-2 py-1 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-600"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: VENDOR VERIFICATION & ONBOARDING */}
          {activeTab === 'vendors' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900">
                Vendor Registry & CAC Document Verification ({vendors.length})
              </h3>
              <div className="space-y-3">
                {vendors.map((v) => {
                  const isPending = v.verificationStatus === 'pending';
                  return (
                    <div
                      key={v.id}
                      className={`p-4 rounded-xl border text-xs ${
                        isPending ? 'bg-amber-50/40 border-amber-300' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-sm">{v.businessName}</span>
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                v.verificationStatus === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : v.verificationStatus === 'pending'
                                  ? 'bg-amber-100 text-amber-800 animate-pulse'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {v.verificationStatus}
                            </span>
                            <span className="text-gray-500 font-medium text-[11px]">
                              Commission: {v.commissionRate}%
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 text-gray-600">
                            <div>
                              <span className="text-gray-400 block text-[10px]">Location:</span>
                              <span>{v.businessAddress}, {v.lga}, {v.state}</span>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[10px]">Bank Account:</span>
                              <span className="font-mono text-gray-900">
                                {v.bankDetails.bankName} - {v.bankDetails.accountNumber} ({v.bankDetails.accountName})
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400 block text-[10px]">Verification Document:</span>
                              <a
                                href={v.verificationDocUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-700 underline truncate block"
                              >
                                {v.verificationDocUrl || 'Uploaded ID'}
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Review buttons */}
                        {isPending && (
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-gray-500">Comm %:</span>
                              <input
                                type="number"
                                min={1}
                                max={25}
                                defaultValue={v.commissionRate || 5}
                                onChange={(e) =>
                                  setVendorCommissionInput({
                                    ...vendorCommissionInput,
                                    [v.id]: Number(e.target.value)
                                  })
                                }
                                className="w-12 bg-white border border-gray-300 rounded px-1.5 py-1 text-xs font-bold text-center"
                              />
                            </div>
                            <button
                              id={`approve-vendor-${v.id}`}
                              onClick={() => handleReviewVendor(v.id, 'approved')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              id={`reject-vendor-${v.id}`}
                              onClick={() => handleReviewVendor(v.id, 'rejected')}
                              className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold transition cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: PRODUCT CATALOG MODERATION */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900">
                Product Catalog Moderation ({pendingProducts.length} Pending Approval)
              </h3>
              <div className="space-y-3">
                {products.map((prod) => (
                  <div key={prod.id} className="p-3 rounded-xl border border-gray-200 bg-white text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-14 h-14 object-cover rounded-lg bg-gray-100 border border-gray-200 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900">{prod.name}</h4>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              prod.approvalStatus === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : prod.approvalStatus === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {prod.approvalStatus}
                          </span>
                        </div>
                        <p className="text-gray-500 text-[11px]">
                          By: {prod.vendorName} • Price: ₦{prod.price.toLocaleString()} • Stock: {prod.stock} • Condition: {prod.condition}
                        </p>
                      </div>
                    </div>

                    {prod.approvalStatus === 'pending' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          id={`approve-prod-${prod.id}`}
                          onClick={() => handleReviewProduct(prod.id, 'approved')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition cursor-pointer"
                        >
                          Approve Product
                        </button>
                        <button
                          id={`reject-prod-${prod.id}`}
                          onClick={() => handleReviewProduct(prod.id, 'rejected')}
                          className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold transition cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PLATFORM PAYMENT ACCOUNTS SETTINGS */}
          {activeTab === 'settings' && settings && (
            <form onSubmit={handleSaveSettings} className="max-w-lg space-y-4">
              <h3 className="text-sm font-bold text-gray-900">
                Marketplace Escrow & Manual Bank Accounts Configuration
              </h3>
              <p className="text-xs text-gray-500">
                These bank account details are shown to Nigerian customers during manual bank transfer checkout.
              </p>

              {/* OPay Manual Account */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <span className="text-xs font-bold text-purple-900 block">OPay Manual Account</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-gray-500 uppercase font-semibold">Account Number</label>
                    <input
                      type="text"
                      value={settings.opayManualAccount.accountNumber}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          opayManualAccount: { ...settings.opayManualAccount, accountNumber: e.target.value }
                        })
                      }
                      className="w-full bg-white border border-gray-300 rounded p-1.5 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 uppercase font-semibold">Account Name</label>
                    <input
                      type="text"
                      value={settings.opayManualAccount.accountName}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          opayManualAccount: { ...settings.opayManualAccount, accountName: e.target.value }
                        })
                      }
                      className="w-full bg-white border border-gray-300 rounded p-1.5"
                    />
                  </div>
                </div>
              </div>

              {/* Paystack Dedicated Account */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <span className="text-xs font-bold text-purple-900 block">Paystack Dedicated Titan Account</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-gray-500 uppercase font-semibold">Account Number</label>
                    <input
                      type="text"
                      value={settings.paystackManualAccount.accountNumber}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          paystackManualAccount: { ...settings.paystackManualAccount, accountNumber: e.target.value }
                        })
                      }
                      className="w-full bg-white border border-gray-300 rounded p-1.5 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 uppercase font-semibold">Bank Name</label>
                    <input
                      type="text"
                      value={settings.paystackManualAccount.bankName}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          paystackManualAccount: { ...settings.paystackManualAccount, bankName: e.target.value }
                        })
                      }
                      className="w-full bg-white border border-gray-300 rounded p-1.5"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Default Platform Commission Rate (%)
                </label>
                <input
                  type="number"
                  value={settings.platformCommissionRate}
                  onChange={(e) =>
                    setSettings({ ...settings, platformCommissionRate: Number(e.target.value) })
                  }
                  className="w-24 bg-gray-50 border border-gray-300 rounded p-2 text-sm font-bold text-gray-900"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Save Payment Settings
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
