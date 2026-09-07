import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, ShoppingBag, User as UserIcon, Bell, ChevronDown, Store, ShieldCheck, Package } from 'lucide-react';
import { User, UserLocation, Vendor } from '../types';

interface ShopHeaderProps {
  location: UserLocation | null;
  onOpenLocationModal: () => void;
  cartCount: number;
  onCartClick: () => void;
  currentUser: User;
  vendor: Vendor | null;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenProfile: (tab?: 'profile' | 'orders' | 'vendor' | 'admin') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  deliveryFee: number | null;
  orderCount?: number;
}

export default function ShopHeader({
  location,
  onOpenLocationModal,
  cartCount = 0,
  onCartClick,
  currentUser,
  unreadCount,
  onOpenNotifications,
  onOpenProfile,
  searchQuery,
  onSearchChange,
  deliveryFee,
  orderCount = 0
}: ShopHeaderProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileMenuOpen]);
  return (
    <header id="app-header" className="sticky top-0 z-40 bg-purple-900 text-white shadow-md transition-all">
      {/* Top micro-announcement banner */}
      <div className="bg-purple-950 text-purple-200 text-xs py-1.5 px-4 text-center font-medium border-b border-purple-800/60 hidden sm:flex items-center justify-between max-w-7xl mx-auto">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Same-Day Dispatch Active across Lagos LGAs
        </span>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Paystack Card & USSD Secured</span>
          <span className="text-purple-400">•</span>
          <span>Verified Direct Bank Transfer (OPay & Titan)</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3 md:gap-6">
        {/* Brand */}
        <div id="brand-logo" className="flex items-center gap-2.5 cursor-pointer select-none shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 bg-amber-400 text-purple-950 rounded-xl flex items-center justify-center font-black text-2xl shadow-md transform hover:scale-105 transition">
            O
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white">Oso-Ahia</span>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-400/30">NG</span>
            </div>
            <span className="block text-[10px] text-purple-200 uppercase tracking-widest font-semibold">
              Market Rush
            </span>
          </div>
        </div>

        {/* Dynamic Location Badge */}
        <button
          id="location-badge-button"
          onClick={onOpenLocationModal}
          className="flex items-center gap-1.5 bg-purple-800 hover:bg-purple-700/80 border border-purple-600/80 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition shadow-xs shrink-0 cursor-pointer"
          title="Change delivery location"
        >
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate max-w-[130px] sm:max-w-none">
            {location ? `${location.lga}, ${location.state}` : 'Select LGA'}
          </span>
          {deliveryFee !== null && (
            <span className="hidden lg:inline text-[11px] text-amber-300 font-normal">
              (₦{deliveryFee.toLocaleString()})
            </span>
          )}
          <ChevronDown className="w-3 h-3 text-purple-300 shrink-0" />
        </button>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-lg hidden md:block">
          <div className="relative">
            <input
              id="global-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search phones, cashmere fabrics, appliances, provisions..."
              className="w-full bg-purple-950/70 border border-purple-700 rounded-xl py-2 pl-4 pr-10 text-sm text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-purple-950 transition"
            />
            <Search className="w-4 h-4 absolute right-3.5 top-3 text-purple-300 pointer-events-none" />
          </div>
        </div>

        {/* Actions & Navigation Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Logged-In User Profile Button & Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              id="header-user-profile-button"
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-purple-800 text-purple-100 hover:text-white transition cursor-pointer border border-purple-800 hover:border-purple-700 select-none shadow-xs"
              title={`${currentUser.fullName} (${currentUser.role})`}
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="true"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-purple-950 font-black text-xs flex items-center justify-center shadow-xs">
                {currentUser.fullName ? currentUser.fullName[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold leading-tight truncate max-w-[110px]">
                  {currentUser.fullName ? currentUser.fullName.split(' ')[0] : 'Account'}
                </span>
                <span className="text-[10px] text-amber-300 font-medium leading-none capitalize">
                  {currentUser.role}
                </span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-purple-300 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div
                id="header-user-profile-dropdown"
                className="absolute right-0 mt-2 w-72 bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80 rounded-t-2xl">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-full bg-purple-900 text-amber-300 font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {currentUser.fullName ? currentUser.fullName[0].toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-gray-900 truncate">{currentUser.fullName}</div>
                      <div className="text-[11px] text-gray-500 truncate">{currentUser.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-gray-500 font-medium">Logged-in Role:</span>
                    {currentUser.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full text-[10px]">
                        <ShieldCheck className="w-3 h-3 text-purple-700" /> Admin
                      </span>
                    ) : currentUser.role === 'vendor' ? (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full text-[10px]">
                        <Store className="w-3 h-3 text-amber-700" /> Vendor
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full text-[10px]">
                        <UserIcon className="w-3 h-3 text-blue-700" /> Customer
                      </span>
                    )}
                  </div>
                </div>

                {/* Profile navigation actions */}
                <div className="py-1">
                  {/* Profile Overview */}
                  <button
                    id="profile-dropdown-overview-button"
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenProfile('profile');
                    }}
                    className="w-full px-4 py-2.5 text-xs text-left text-gray-700 hover:bg-purple-50 hover:text-purple-900 flex items-center justify-between transition cursor-pointer font-medium"
                  >
                    <div className="flex items-center gap-2.5">
                      <UserIcon className="w-4 h-4 text-purple-700" />
                      <span>Profile & Account</span>
                    </div>
                    <span className="text-[10px] text-gray-400">View</span>
                  </button>

                  {/* Orders Tab - strictly on user profile */}
                  <button
                    id="profile-dropdown-orders-button"
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenProfile('orders');
                    }}
                    className="w-full px-4 py-2.5 text-xs text-left text-gray-700 hover:bg-purple-50 hover:text-purple-900 flex items-center justify-between transition cursor-pointer font-medium"
                  >
                    <div className="flex items-center gap-2.5">
                      <Package className="w-4 h-4 text-purple-700" />
                      <span>My Orders</span>
                    </div>
                    {orderCount > 0 && (
                      <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {orderCount}
                      </span>
                    )}
                  </button>

                  {/* Vendor Hub Tab - strictly on user profile */}
                  <button
                    id="profile-dropdown-vendor-button"
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenProfile('vendor');
                    }}
                    className="w-full px-4 py-2.5 text-xs text-left text-gray-700 hover:bg-amber-50 hover:text-amber-900 flex items-center justify-between transition cursor-pointer font-medium"
                  >
                    <div className="flex items-center gap-2.5">
                      <Store className="w-4 h-4 text-amber-600" />
                      <span>Vendor Hub</span>
                    </div>
                    {currentUser.role === 'vendor' && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        Store
                      </span>
                    )}
                  </button>

                  {/* Admin Tab - strictly on user profile ONLY when role === 'admin' */}
                  {currentUser.role === 'admin' && (
                    <button
                      id="profile-dropdown-admin-button"
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenProfile('admin');
                      }}
                      className="w-full px-4 py-2.5 text-xs text-left text-purple-950 hover:bg-purple-100/70 flex items-center justify-between transition cursor-pointer font-bold bg-purple-50/50"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-purple-700" />
                        <span>Admin Operations</span>
                      </div>
                      <span className="bg-purple-700 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                        Admin
                      </span>
                    </button>
                  )}
                </div>

                {/* Footer Location link */}
                <div className="px-4 pt-2 pb-1 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenLocationModal();
                    }}
                    className="hover:text-purple-700 flex items-center gap-1 font-semibold transition cursor-pointer"
                  >
                    <MapPin className="w-3 h-3 text-amber-600" />
                    <span>Change LGA</span>
                  </button>
                  <span className="text-[10px] text-gray-400">Oso-Ahia NG</span>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <button
            id="header-notifications-button"
            onClick={onOpenNotifications}
            className="relative p-2 hover:bg-purple-800 rounded-xl text-purple-200 hover:text-white transition cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Cart Trigger */}
          <button
            id="header-cart-button"
            onClick={onCartClick}
            className="relative px-3.5 py-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-purple-950 font-bold rounded-xl flex items-center gap-2 text-sm shadow-md transition transform hover:scale-[1.02] cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-black">Cart</span>
            {cartCount > 0 && (
              <span className="bg-purple-950 text-amber-300 rounded-full text-[11px] min-w-[20px] h-5 px-1.5 flex items-center justify-center font-black shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile search bar on smaller devices */}
      <div className="px-4 pb-3 md:hidden">
        <div className="relative">
          <input
            id="mobile-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products, groceries, fabrics..."
            className="w-full bg-purple-950/70 border border-purple-700 rounded-xl py-2 pl-3.5 pr-10 text-xs text-white placeholder-purple-300/70 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-purple-300 pointer-events-none" />
        </div>
      </div>
    </header>
  );
}
