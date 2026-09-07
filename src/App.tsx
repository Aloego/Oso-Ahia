import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Package,
  Layers,
  Search,
  Store,
  ChevronRight
} from 'lucide-react';
import { User, Vendor, Product, Category, UserLocation, CartItem, Order, Notification, PlatformPaymentSettings } from './types';
import ShopHeader from './components/ShopHeader';
import RoleSwitcherBanner from './components/RoleSwitcherBanner';
import LocationModal from './components/LocationModal';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AdminDashboardModal from './components/AdminDashboardModal';
import VendorPortalModal from './components/VendorPortalModal';
import CustomerOrdersModal from './components/CustomerOrdersModal';
import NotificationsModal from './components/NotificationsModal';
import UserProfileModal from './components/UserProfileModal';

export default function App() {
  // -------------------------------------------------------------
  // USER & LOCATION STATE
  // -------------------------------------------------------------
  const [currentUser, setCurrentUser] = useState<User>({
    uid: 'user-customer-1',
    email: 'chioma@example.ng',
    displayName: 'Chioma Adebayo',
    role: 'customer',
    phoneNumber: '08023456789',
    deliveryAddress: {
      fullName: 'Chioma Adebayo',
      phone: '08023456789',
      street: 'Plot 12, Admiralty Way, Lekki Phase 1',
      state: 'Lagos',
      lga: 'Ikeja'
    }
  });
  const [vendor, setVendor] = useState<Vendor | null>(null);

  const [location, setLocation] = useState<UserLocation>(() => {
    try {
      const saved = localStorage.getItem('osoahia_user_location');
      return saved ? JSON.parse(saved) : { state: 'Lagos', lga: 'Ikeja' };
    } catch {
      return { state: 'Lagos', lga: 'Ikeja' };
    }
  });

  const [deliveryFee, setDeliveryFee] = useState<number>(1500);

  // -------------------------------------------------------------
  // MARKET DATA STATE
  // -------------------------------------------------------------
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // -------------------------------------------------------------
  // CART & ORDERS
  // -------------------------------------------------------------
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('osoahia_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformPaymentSettings | null>(null);

  // -------------------------------------------------------------
  // MODAL CONTROLS
  // -------------------------------------------------------------
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(() => {
    try {
      return !localStorage.getItem('osoahia_user_location');
    } catch {
      return false;
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isVendorOpen, setIsVendorOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'orders' | 'vendor' | 'admin'>('profile');
  const [orderSuccessNotice, setOrderSuccessNotice] = useState<Order | null>(null);

  // Save cart in local storage
  useEffect(() => {
    localStorage.setItem('osoahia_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Calculate delivery fee whenever location changes
  useEffect(() => {
    if (location?.state && location?.lga) {
      axios
        .post('/api/delivery/calculate', {
          state: location.state,
          lga: location.lga
        })
        .then((res) => {
          if (res.data.fee) setDeliveryFee(res.data.fee);
        })
        .catch((err) => console.error('Error calculating delivery fee', err));
    }
  }, [location]);

  // Initial load of categories, products, user, notifications, settings
  const loadInitialData = async () => {
    try {
      const [catRes, prodRes, userRes, notifRes, setRes] = await Promise.all([
        axios.get('/api/categories'),
        axios.get('/api/products'),
        axios.get('/api/auth/current'),
        axios.get('/api/notifications', { headers: { Authorization: `Bearer ${currentUser.uid}` } }),
        axios.get('/api/platformSettings/paymentSettings')
      ]);

      setCategories(catRes.data);
      setProducts(prodRes.data);
      if (userRes.data.user) {
        setCurrentUser(userRes.data.user);
        setVendor(userRes.data.vendor);
      }
      setNotifications(notifRes.data || []);
      setPlatformSettings(setRes.data);
    } catch (err) {
      console.error('Initial data loading error:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Fetch orders for current user
  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${currentUser.uid}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser]);

  // Switch demo account
  const handleSwitchUser = async (userId: string) => {
    try {
      const res = await axios.post('/api/auth/switch-user', { userId });
      setCurrentUser(res.data.user);
      setVendor(res.data.vendor);

      // Refresh notifications & orders for new user
      const [nRes, oRes] = await Promise.all([
        axios.get('/api/notifications', { headers: { Authorization: `Bearer ${userId}` } }),
        axios.get('/api/orders', { headers: { Authorization: `Bearer ${userId}` } })
      ]);
      setNotifications(nRes.data);
      setOrders(oRes.data);
    } catch (err) {
      console.error('User switch error', err);
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1, variation?: string) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.variation === variation
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity = Math.min(product.stock, next[existingIdx].quantity + quantity);
        return next;
      }
      return [...prev, { product, quantity, variation }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, qty: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => (item.product.id === productId ? { ...item, quantity: qty } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleOrderSuccess = (order: Order) => {
    setCartItems([]);
    setOrderSuccessNotice(order);
    fetchOrders();
    // Refresh products to show decremented inventory immediately
    axios.get('/api/products').then((res) => setProducts(res.data));
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await axios.post(
        `/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${currentUser.uid}` } }
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Error marking read', err);
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
        return false;
      }
      // Condition filter
      if (selectedCondition !== 'all' && p.condition !== selectedCondition) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBrand = p.brand.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchVendor = p.vendorName.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchDesc && !matchVendor) return false;
      }
      return true;
    });
  }, [products, selectedCategory, selectedCondition, searchQuery]);

  const totalCartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-purple-200">
      {/* 1. Quick RBAC Switcher Bar for Seamless MVP Testing */}
      <RoleSwitcherBanner
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
      />

      {/* 2. Main Navigation Header */}
      <ShopHeader
        location={location}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        cartCount={totalCartCount}
        onCartClick={() => setIsCartOpen(true)}
        currentUser={currentUser}
        vendor={vendor}
        unreadCount={unreadNotifsCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenProfile={(tab = 'profile') => {
          setProfileModalTab(tab);
          setIsProfileModalOpen(true);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        deliveryFee={deliveryFee}
        orderCount={orders.length}
      />

      {/* 3. Order Success Banner Notice */}
      {orderSuccessNotice && (
        <div className="bg-emerald-600 text-white py-3 px-4 shadow-md transition animate-in slide-in-from-top duration-300">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-300 shrink-0" />
              <div>
                <span className="font-bold text-sm">Order Placed Successfully!</span>
                <span className="ml-2 font-mono font-bold bg-emerald-700 px-2 py-0.5 rounded">
                  {orderSuccessNotice.orderNumber}
                </span>
                <span className="ml-2">
                  Total: ₦{orderSuccessNotice.total.toLocaleString()} • Payment:{' '}
                  <strong>{orderSuccessNotice.paymentStatus}</strong>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOrdersOpen(true)}
                className="bg-white text-emerald-900 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-50 transition cursor-pointer"
              >
                Track Order
              </button>
              <button
                onClick={() => setOrderSuccessNotice(null)}
                className="text-emerald-100 hover:text-white p-1 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Category Filter Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-2 overflow-x-auto py-2.5 no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-purple-900 text-amber-300 shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-purple-900 text-amber-300 shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Condition Filter */}
          <div className="flex items-center gap-1 shrink-0 pl-3 border-l border-gray-200 text-xs">
            <span className="text-gray-400 font-medium text-[11px] hidden sm:inline">Condition:</span>
            {['all', 'New', 'Used', 'Refurbished'].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCondition(c)}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                  selectedCondition === c
                    ? 'bg-purple-100 text-purple-900 font-bold border border-purple-300'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {c === 'all' ? 'Any' : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Main Storefront Hero & Trust Badges */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* Marketplace Trust Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-2xl text-white shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold flex items-center gap-1.5">
                <span>Same-Day LGA Dispatch</span>
                <span className="text-[10px] bg-amber-400 text-purple-950 font-black px-1.5 py-0.2 rounded">
                  LAGOS
                </span>
              </div>
              <p className="text-[11px] text-purple-200 mt-0.5">
                Dynamic automated rider calculation to <strong>{location.lga}</strong> (₦
                {deliveryFee.toLocaleString()})
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-white border border-gray-200/90 rounded-2xl shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-900">Escrow & Manual Bank Verifications</span>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Instant Paystack or verified transfers to OPay & Titan merchant accounts.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-white border border-gray-200/90 rounded-2xl shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-900">Verified Nigerian Merchants</span>
              <p className="text-[11px] text-gray-500 mt-0.5">
                CAC vetted vendors from Ikeja Computer Village, Alaba & Balogun markets.
              </p>
            </div>
          </div>
        </div>

        {/* 6. Product Catalogue Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
              <span>Marketplace Catalogue</span>
              <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                {filteredProducts.length} items
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing authentic products ready for delivery to{' '}
              <span
                onClick={() => setIsLocationModalOpen(true)}
                className="text-purple-700 font-bold underline cursor-pointer hover:text-purple-900"
              >
                {location.lga}, {location.state}
              </span>
            </p>
          </div>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-purple-700 font-bold hover:underline cursor-pointer"
            >
              Clear search "{searchQuery}"
            </button>
          )}
        </div>

        {/* 7. Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 p-6">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800">No products match your criteria</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Try adjusting your category selection or clear your search term to see more Nigerian merchandise.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedCondition('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(p) => handleAddToCart(p, 1)}
                onViewDetails={(p) => {
                  setSelectedProduct(p);
                  setIsDetailModalOpen(true);
                }}
                selectedLga={location.lga}
              />
            ))}
          </div>
        )}
      </main>

      {/* 8. Footer */}
      <footer className="bg-purple-950 text-purple-200 border-t border-purple-900 text-xs py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-amber-400 text-purple-950 rounded-lg flex items-center justify-center font-black text-sm">
                O
              </div>
              <span className="font-bold text-white text-sm">Oso-Ahia (Market Rush)</span>
            </div>
            <p className="text-purple-300 text-[11px] leading-relaxed">
              Nigeria's premier multi-vendor commerce engine. Built specifically for Nigerian trade dynamics,
              LGA-level logistics, and dual Paystack + manual bank escrow workflows.
            </p>
          </div>

          <div>
            <span className="font-bold text-white text-xs block mb-2">Platform Features</span>
            <ul className="space-y-1 text-[11px] text-purple-300">
              <li>• Automated LGA-level Dispatch Fee Matrix (Lagos State)</li>
              <li>• Atomic Server-Side Paystack Payment Verification</li>
              <li>• Admin Manual Bank Review (OPay & Titan Direct)</li>
              <li>• CAC Merchant Verification & Product Moderation</li>
            </ul>
          </div>

          <div>
            <span className="font-bold text-white text-xs block mb-2">Operational Roles</span>
            <div className="space-y-1.5 text-[11px]">
              <button
                onClick={() => handleSwitchUser('user-customer-1')}
                className="text-amber-300 hover:underline block cursor-pointer"
              >
                👤 Customer: Chioma Adebayo (Browse & Checkout)
              </button>
              <button
                onClick={() => handleSwitchUser('user-vendor-1')}
                className="text-amber-300 hover:underline block cursor-pointer"
              >
                🏪 Vendor: Emeka Nwosu (Gadget Express - Manage Products)
              </button>
              <button
                onClick={() => handleSwitchUser('user-admin-1')}
                className="text-amber-300 hover:underline block cursor-pointer"
              >
                🛡️ Admin: Kolawole Danjuma (Approve Payments & Vendors)
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-6 pt-4 border-t border-purple-900/60 text-[10px] text-purple-400 flex justify-between items-center">
          <span>© 2026 Oso-Ahia Marketplace MVP. All rights reserved.</span>
          <span>Currency: Nigerian Naira (NGN ₦)</span>
        </div>
      </footer>

      {/* ------------------------------------------------------------- */}
      {/* MODALS */}
      {/* ------------------------------------------------------------- */}

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={location}
        onLocationConfirmed={(loc) => setLocation(loc)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        userLocation={location}
        deliveryFee={deliveryFee}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        userLocation={location}
        authToken={currentUser.uid}
        onOrderSuccess={handleOrderSuccess}
        platformSettings={platformSettings}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => {
          setSelectedProduct(null);
          setIsDetailModalOpen(false);
        }}
        onAddToCart={handleAddToCart}
        userLocation={location}
        deliveryFee={deliveryFee}
      />

      {/* Admin Operations Portal Modal */}
      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        authToken={currentUser.uid}
        onRefreshData={() => {
          axios.get('/api/products').then((res) => setProducts(res.data));
          fetchOrders();
        }}
      />

      {/* Vendor Portal Modal */}
      <VendorPortalModal
        isOpen={isVendorOpen}
        onClose={() => setIsVendorOpen(false)}
        currentUser={currentUser}
        vendor={vendor}
        categories={categories}
        authToken={currentUser.uid}
        onRefreshData={() => {
          axios.get('/api/products').then((res) => setProducts(res.data));
        }}
      />

      {/* Customer Orders Modal */}
      <CustomerOrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orders}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
      />

      {/* Logged-In User Profile Modal (Host for Orders, Vendor Hub, and Admin Tabs) */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        vendor={vendor}
        orders={orders}
        location={location}
        initialTab={profileModalTab}
        onOpenOrders={() => {
          setIsProfileModalOpen(false);
          setIsOrdersOpen(true);
        }}
        onOpenVendorPortal={() => {
          setIsProfileModalOpen(false);
          setIsVendorOpen(true);
        }}
        onOpenAdminPortal={() => {
          setIsProfileModalOpen(false);
          setIsAdminOpen(true);
        }}
        onChangeLocation={() => {
          setIsProfileModalOpen(false);
          setIsLocationModalOpen(true);
        }}
      />
    </div>
  );
}
