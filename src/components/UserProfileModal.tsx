import { useState, useEffect } from 'react';
import {
  User as UserIcon,
  X,
  Package,
  Store,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  CreditCard,
  Building,
  AlertCircle
} from 'lucide-react';
import { User, Vendor, Order, UserLocation } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  vendor: Vendor | null;
  orders: Order[];
  location: UserLocation | null;
  onOpenOrders: () => void;
  onOpenVendorPortal: () => void;
  onOpenAdminPortal: () => void;
  onChangeLocation: () => void;
  initialTab?: 'profile' | 'orders' | 'vendor' | 'admin';
}

export default function UserProfileModal({
  isOpen,
  onClose,
  currentUser,
  vendor,
  orders,
  location,
  onOpenOrders,
  onOpenVendorPortal,
  onOpenAdminPortal,
  onChangeLocation,
  initialTab = 'profile'
}: UserProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'vendor' | 'admin'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isAdmin = currentUser.role === 'admin';
  const isVendor = currentUser.role === 'vendor';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = () => {
    switch (currentUser.role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
            Platform Administrator
          </span>
        );
      case 'vendor':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-300">
            <Store className="w-3.5 h-3.5 text-amber-700" />
            {vendor?.verificationStatus === 'approved' ? 'Verified Merchant' : 'Merchant (Pending)'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-200">
            <UserIcon className="w-3.5 h-3.5 text-blue-700" />
            Verified Customer
          </span>
        );
    }
  };

  return (
    <div
      id="user-profile-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div
        id="user-profile-modal-card"
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col border border-gray-100 relative overflow-hidden"
      >
        {/* Header Profile Banner */}
        <div className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white p-6 relative shrink-0">
          <button
            id="close-profile-modal-button"
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
            aria-label="Close profile"
            title="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 text-purple-950 flex items-center justify-center font-black text-2xl shadow-lg ring-4 ring-white/20 shrink-0">
              {getInitials(currentUser.fullName)}
            </div>
            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h2 className="text-xl font-bold text-white truncate">{currentUser.fullName}</h2>
                {getRoleBadge()}
              </div>
              <p className="text-xs text-purple-200 flex items-center justify-center sm:justify-start gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                {currentUser.email}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-purple-200 mt-2">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-purple-300" />
                  {currentUser.phone}
                </span>
                <span className="text-purple-400">•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  {location ? `${location.lga}, ${location.state}` : `${currentUser.defaultLocation.lga}, ${currentUser.defaultLocation.state}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Internal Tabs Navigation */}
        <div className="bg-gray-50 px-4 sm:px-6 border-b border-gray-200 flex items-center gap-2 overflow-x-auto shrink-0 no-scrollbar">
          <button
            id="tab-profile-overview"
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-purple-700 text-purple-900 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <UserIcon className="w-4 h-4 text-purple-600" />
            Profile Details
          </button>

          {/* Orders Tab */}
          <button
            id="tab-profile-orders"
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-3.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-purple-700 text-purple-900 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package className="w-4 h-4 text-purple-600" />
            My Orders
            <span className="ml-1 bg-purple-100 text-purple-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {orders.length}
            </span>
          </button>

          {/* Vendor Tab (appears on user profile) */}
          <button
            id="tab-profile-vendor"
            onClick={() => setActiveTab('vendor')}
            className={`py-3 px-3.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'vendor'
                ? 'border-purple-700 text-purple-900 bg-white shadow-xs rounded-t-lg'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Store className="w-4 h-4 text-amber-600" />
            Vendor Hub
            {isVendor && vendor && (
              <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                vendor.verificationStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {vendor.verificationStatus === 'approved' ? 'Active' : 'Pending'}
              </span>
            )}
          </button>

          {/* Admin Tab (ONLY appears on user profile for admin users) */}
          {isAdmin && (
            <button
              id="tab-profile-admin"
              onClick={() => setActiveTab('admin')}
              className={`py-3 px-3.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'admin'
                  ? 'border-purple-700 text-purple-900 bg-white shadow-xs rounded-t-lg'
                  : 'border-transparent text-purple-700 hover:text-purple-950 font-bold'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-700" />
              Admin Control
              <span className="ml-1 bg-purple-700 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                Operations
              </span>
            </button>
          )}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Profile Details */}
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    <MapPin className="w-4 h-4 text-purple-700" />
                    Delivery Jurisdiction
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {location ? `${location.lga}, ${location.state}` : `${currentUser.defaultLocation.lga}, ${currentUser.defaultLocation.state}`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Lagos State LGA dispatch zone with dynamic rider logistics.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onChangeLocation();
                    }}
                    className="mt-3 text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    Change Delivery Location →
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    <Calendar className="w-4 h-4 text-purple-700" />
                    Account Security & Info
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    User ID: <span className="font-mono text-xs text-purple-800">{currentUser.uid}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Created: {new Date(currentUser.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-emerald-700 font-semibold mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Two-factor session authenticated
                  </p>
                </div>
              </div>

              {/* Quick Navigation Cards */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                  Account Management
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="w-full bg-white hover:bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex items-center justify-between text-left transition cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">My Orders & Tracking</div>
                        <div className="text-[11px] text-gray-500">View recent purchases, delivery milestones, and payment receipts</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  <button
                    onClick={() => setActiveTab('vendor')}
                    className="w-full bg-white hover:bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex items-center justify-between text-left transition cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">Vendor Merchant Hub</div>
                        <div className="text-[11px] text-gray-500">
                          {isVendor ? 'Manage catalog, upload inventory, track payouts' : 'Sell products on Oso-Ahia marketplace'}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => setActiveTab('admin')}
                      className="w-full bg-purple-50 hover:bg-purple-100/70 p-3.5 rounded-xl border border-purple-200 flex items-center justify-between text-left transition cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-900 text-amber-300 rounded-lg">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-purple-950">Platform Operations & Moderation</div>
                          <div className="text-[11px] text-purple-700">Approve manual bank transfers, CAC documents, and product reviews</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-purple-600" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Your Order History</h3>
                  <p className="text-xs text-gray-500">Track current status and payment verifications</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenOrders();
                  }}
                  className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  Full Tracking Modal →
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-700">No orders found yet</p>
                  <p className="text-[11px] text-gray-500 mt-1">Browse our Nigerian marketplace catalog and add items to your cart.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs hover:border-purple-300 transition"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2 mb-2">
                        <div>
                          <span className="font-mono text-xs font-bold text-purple-900">{order.orderNumber}</span>
                          <span className="text-[11px] text-gray-400 ml-2">
                            {new Date(order.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            order.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.paymentStatus === 'Pending Verification'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            Payment: {order.paymentStatus}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900">
                            Status: {order.orderStatus || order.status || 'Pending'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 mb-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="text-gray-700 truncate max-w-[280px]">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="font-bold text-gray-900">₦{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs font-bold">
                        <span className="text-gray-500">Destination: {order.deliveryAddress?.lga}, {order.deliveryAddress?.state}</span>
                        <span className="text-purple-950 font-black">Total: ₦{order.total.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Vendor Hub Tab */}
          {activeTab === 'vendor' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Vendor & Merchant Management</h3>
                  <p className="text-xs text-gray-500">Marketplace merchant settings, inventory, and catalog status</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenVendorPortal();
                  }}
                  className="text-xs bg-amber-400 hover:bg-amber-500 text-purple-950 font-black px-3 py-1.5 rounded-lg transition cursor-pointer shadow-xs"
                >
                  Open Vendor Portal →
                </button>
              </div>

              {isVendor && vendor ? (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <Store className="w-4 h-4 text-amber-700" />
                        {vendor.businessName}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        vendor.verificationStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        CAC Status: {vendor.verificationStatus.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-900">
                      <div>
                        <strong>Address:</strong> {vendor.businessAddress}
                      </div>
                      <div>
                        <strong>Location:</strong> {vendor.lga}, {vendor.state}
                      </div>
                      <div>
                        <strong>Bank:</strong> {vendor.bankDetails.bankName} ({vendor.bankDetails.accountNumber})
                      </div>
                      <div>
                        <strong>Account Name:</strong> {vendor.bankDetails.accountName}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs space-y-2">
                    <div className="font-bold text-gray-800">Merchant Quick Actions:</div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          onClose();
                          onOpenVendorPortal();
                        }}
                        className="bg-purple-900 hover:bg-purple-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                      >
                        + Add New Product
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenVendorPortal();
                        }}
                        className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer"
                      >
                        View Stock & Pricing
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-purple-50 border border-purple-200 p-5 rounded-xl text-center">
                  <Store className="w-10 h-10 text-purple-700 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-purple-950">Become an Oso-Ahia Merchant</h4>
                  <p className="text-xs text-purple-800 mt-1 max-w-md mx-auto">
                    Reach thousands of verified Nigerian shoppers across Lagos LGAs. Register with your CAC credentials, list your inventory, and receive direct bank payouts.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenVendorPortal();
                    }}
                    className="mt-4 bg-purple-700 hover:bg-purple-800 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition cursor-pointer"
                  >
                    Register as a Vendor Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Admin Control Tab (Only visible to admin role) */}
          {activeTab === 'admin' && isAdmin && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Platform Operations & Control</h3>
                  <p className="text-xs text-gray-500">Security moderation, manual payment reviews, vendor vetting</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenAdminPortal();
                  }}
                  className="text-xs bg-purple-900 hover:bg-purple-800 text-amber-300 font-bold px-3 py-1.5 rounded-lg transition cursor-pointer shadow-xs"
                >
                  Open Full Admin Dashboard →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-xl text-center">
                  <div className="text-xl font-black text-purple-900">Direct Escrow</div>
                  <div className="text-xs text-purple-700 font-semibold mt-0.5">OPay & Paystack Titan</div>
                  <div className="text-[11px] text-gray-500 mt-1">Manual bank transfer approval queue</div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-center">
                  <div className="text-xl font-black text-amber-900">CAC Vetting</div>
                  <div className="text-xs text-amber-800 font-semibold mt-0.5">Vendor Verification</div>
                  <div className="text-[11px] text-gray-500 mt-1">Review merchant documentation</div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-center">
                  <div className="text-xl font-black text-emerald-900">Catalog Moderation</div>
                  <div className="text-xs text-emerald-800 font-semibold mt-0.5">Product Approvals</div>
                  <div className="text-[11px] text-gray-500 mt-1">Quality check prior to public listing</div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-xs space-y-2">
                <div className="font-bold text-gray-900">Platform Operations Quick Actions:</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdminPortal();
                    }}
                    className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    Review Pending Transfers
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdminPortal();
                    }}
                    className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    Manage Platform Accounts
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdminPortal();
                    }}
                    className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    LGA Delivery Rate Matrix
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
