import { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import {
  Store,
  PlusCircle,
  Package,
  Clock,
  ShieldCheck,
  AlertCircle,
  X,
  CheckCircle2,
  Upload,
  Loader2
} from 'lucide-react';
import { User, Vendor, Product, Category } from '../types';
import { LAGOS_LGAS } from './LocationModal';

interface VendorPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  vendor: Vendor | null;
  categories: Category[];
  authToken?: string;
  onRefreshData?: () => void;
}

export default function VendorPortalModal({
  isOpen,
  onClose,
  currentUser,
  vendor: initialVendor,
  categories,
  authToken,
  onRefreshData
}: VendorPortalModalProps) {
  const [vendor, setVendor] = useState<Vendor | null>(initialVendor);
  const [activeTab, setActiveTab] = useState<'products' | 'new_product' | 'onboarding'>('products');
  const [vendorProducts, setVendorProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New product form
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Infinix');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-electronics');
  const [condition, setCondition] = useState<'New' | 'Used' | 'Refurbished'>('New');
  const [price, setPrice] = useState('185000');
  const [discountedPrice, setDiscountedPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600');
  const [specKey, setSpecKey] = useState('Storage');
  const [specVal, setSpecVal] = useState('256GB');
  const [specs, setSpecs] = useState<{ [k: string]: string }>({ Storage: '256GB', RAM: '8GB' });

  // Onboarding form
  const [businessName, setBusinessName] = useState('Ikeja Computer Village Hub');
  const [businessAddress, setBusinessAddress] = useState('Otigba Street, Computer Village, Ikeja');
  const [state, setState] = useState('Lagos');
  const [lga, setLga] = useState('Ikeja');
  const [bankName, setBankName] = useState('Guaranty Trust Bank');
  const [accountNumber, setAccountNumber] = useState('0123456789');
  const [accountName, setAccountName] = useState('Ikeja Hub Nig Ltd');
  const [docUrl, setDocUrl] = useState('https://storage.osoahia.ng/cac-cert-ikeja.pdf');

  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  const fetchVendorData = async () => {
    setLoading(true);
    try {
      const vRes = await axios.get('/api/vendors/current', { headers });
      const currentV = vRes.data.vendor;
      setVendor(currentV);

      if (currentV) {
        const pRes = await axios.get(`/api/products?vendorId=${currentV.id}&includePending=true`);
        setVendorProducts(pRes.data);
      }
    } catch (err) {
      console.error('Error fetching vendor data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchVendorData();
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleRegisterVendor = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        '/api/vendors/register',
        {
          businessName,
          businessAddress,
          state,
          lga,
          bankDetails: { bankName, accountNumber, accountName },
          verificationDocUrl: docUrl
        },
        { headers }
      );
      setVendor(res.data.vendor);
      setFeedback({
        type: 'success',
        message: 'Vendor registration submitted! Awaiting Admin verification.'
      });
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        '/api/products/create',
        {
          name,
          brand,
          categoryId,
          condition,
          price: Number(price),
          discountedPrice: discountedPrice ? Number(discountedPrice) : null,
          stock: Number(stock),
          description,
          images: [imageUrl],
          specifications: specs,
          supportedStates: ['Lagos']
        },
        { headers }
      );
      setFeedback({
        type: 'success',
        message: `Product "${res.data.product.name}" created! Submitted for Admin review.`
      });
      setName('');
      setDescription('');
      setActiveTab('products');
      fetchVendorData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.error || 'Product creation failed' });
    } finally {
      setLoading(false);
    }
  };

  const addSpecItem = () => {
    if (!specKey || !specVal) return;
    setSpecs({ ...specs, [specKey]: specVal });
    setSpecKey('');
    setSpecVal('');
  };

  const removeSpecItem = (k: string) => {
    const updated = { ...specs };
    delete updated[k];
    setSpecs(updated);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl max-h-[92vh] flex flex-col border border-gray-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-purple-950 flex items-center justify-center font-black text-xl shadow-xs">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-gray-900">
                  {vendor ? vendor.businessName : 'Vendor Hub'}
                </h2>
                {vendor && (
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                      vendor.verificationStatus === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : vendor.verificationStatus === 'pending'
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {vendor.verificationStatus}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Multi-Vendor Merchant Portal • Escrow Payouts: {vendor?.bankDetails?.bankName || 'Direct'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-sm font-bold transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
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

        {/* Tab switcher if vendor exists and approved */}
        {vendor && vendor.verificationStatus === 'approved' && (
          <div className="flex border-b border-gray-200 mt-2 shrink-0 gap-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-2 px-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'products'
                  ? 'border-purple-700 text-purple-900 bg-purple-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>My Catalog ({vendorProducts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('new_product')}
              className={`py-2 px-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'new_product'
                  ? 'border-purple-700 text-purple-900 bg-purple-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>List New Product</span>
            </button>
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* CASE 1: NOT YET REGISTERED AS VENDOR */}
          {!vendor && (
            <form onSubmit={handleRegisterVendor} className="space-y-4 max-w-xl mx-auto">
              <div className="text-center mb-4">
                <h3 className="text-base font-bold text-gray-900">Become a Verified Merchant on Oso-Ahia</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Sell to thousands of Nigerian buyers across Lagos and nationwide with guaranteed automated escrow protection.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Registered Business / Trade Name</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Physical Business Address (Shop / Warehouse)</label>
                <input
                  type="text"
                  required
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">State</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-sm"
                  >
                    <option value="Lagos">Lagos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">LGA</label>
                  <select
                    value={lga}
                    onChange={(e) => setLga(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-sm"
                  >
                    {LAGOS_LGAS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-100 space-y-2.5">
                <span className="text-xs font-bold text-purple-900 block">Payout Bank Account (Nigerian NGN)</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-gray-500 uppercase font-semibold">Bank</label>
                    <input
                      type="text"
                      required
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded p-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 uppercase font-semibold">Account Number</label>
                    <input
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded p-1.5 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 uppercase font-semibold">Account Name</label>
                    <input
                      type="text"
                      required
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded p-1.5"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">CAC Document / Valid Government ID URL</label>
                <input
                  type="text"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Submit Vendor Application</span>
              </button>
            </form>
          )}

          {/* CASE 2: VENDOR APPLICATION PENDING */}
          {vendor && vendor.verificationStatus === 'pending' && (
            <div className="text-center py-10 max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Application Under Verification</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Your business profile for <strong>{vendor.businessName}</strong> and document details have been submitted.
                The marketplace compliance team verifies all merchant CAC and bank credentials within 24 hours.
              </p>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 text-left">
                <p className="font-semibold mb-1">Submitted Information:</p>
                <p>• Address: {vendor.businessAddress}, {vendor.lga}, {vendor.state}</p>
                <p>• Payout: {vendor.bankDetails.bankName} - {vendor.bankDetails.accountNumber}</p>
              </div>
              <p className="text-[11px] text-gray-400">
                Tip: You can switch to the <strong>Admin</strong> role using the top bar to approve this vendor application immediately.
              </p>
            </div>
          )}

          {/* CASE 3: APPROVED VENDOR - PRODUCT CATALOG */}
          {vendor && vendor.verificationStatus === 'approved' && activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">
                  Products in Your Storefront ({vendorProducts.length})
                </h3>
                <button
                  onClick={() => setActiveTab('new_product')}
                  className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>List New Product</span>
                </button>
              </div>

              <div className="space-y-3">
                {vendorProducts.map((p) => (
                  <div key={p.id} className="p-3 rounded-xl border border-gray-200 bg-white flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-14 h-14 object-cover rounded-lg bg-gray-100 border border-gray-100 shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900">{p.name}</h4>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              p.approvalStatus === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.approvalStatus === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {p.approvalStatus}
                          </span>
                        </div>
                        <p className="text-gray-500 text-[11px]">
                          Price: ₦{p.price.toLocaleString()} • Stock: {p.stock} units • Condition: {p.condition}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CASE 4: APPROVED VENDOR - ADD NEW PRODUCT */}
          {vendor && vendor.verificationStatus === 'approved' && activeTab === 'new_product' && (
            <form onSubmit={handleCreateProduct} className="space-y-4 max-w-xl mx-auto">
              <h3 className="text-sm font-bold text-gray-900">Add New Inventory Item</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs"
                    placeholder="e.g. Infinix Note 40 Pro 5G"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs"
                  >
                    <option value="New">Brand New</option>
                    <option value="Used">Used / Pre-owned</option>
                    <option value="Refurbished">Refurbished</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Stock Units</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Price (₦ NGN)</label>
                  <input
                    type="number"
                    min={100}
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Discounted Price (₦ NGN - Optional)
                  </label>
                  <input
                    type="number"
                    min={100}
                    value={discountedPrice}
                    onChange={(e) => setDiscountedPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs"
                    placeholder="e.g. 175000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Product Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs"
                  placeholder="Specs, features, warranty, in-box contents..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Primary Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2 text-xs"
                />
              </div>

              {/* Specs editor */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-gray-800 block mb-2">Specifications</span>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={specKey}
                    onChange={(e) => setSpecKey(e.target.value)}
                    placeholder="Key (e.g. RAM)"
                    className="w-1/3 bg-white border border-gray-300 rounded p-1.5 text-xs"
                  />
                  <input
                    type="text"
                    value={specVal}
                    onChange={(e) => setSpecVal(e.target.value)}
                    placeholder="Value (e.g. 8GB)"
                    className="flex-1 bg-white border border-gray-300 rounded p-1.5 text-xs"
                  />
                  <button
                    type="button"
                    onClick={addSpecItem}
                    className="px-3 py-1.5 bg-purple-700 text-white text-xs font-bold rounded"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(specs).map(([k, v]) => (
                    <span key={k} className="bg-white px-2 py-1 rounded text-[11px] border flex items-center gap-1">
                      <strong>{k}:</strong> {v}
                      <button type="button" onClick={() => removeSpecItem(k)} className="text-red-500 font-bold ml-1">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                <span>Publish Item (Awaiting Admin Moderation)</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
