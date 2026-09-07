import { X, Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { CartItem, UserLocation } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  userLocation: UserLocation | null;
  deliveryFee: number;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  userLocation,
  deliveryFee
}: CartDrawerProps) {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => {
    const price = item.product.discountedPrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const total = items.length > 0 ? subtotal + deliveryFee : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 bg-purple-900 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold">Shopping Cart ({items.reduce((s, i) => s + i.quantity, 0)})</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-purple-800 rounded-lg text-purple-200 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-semibold text-gray-700">Your cart is empty</p>
                <p className="text-xs text-gray-400 mt-1">
                  Explore Nigerian phones, cashmere fabrics, and provisions to add items.
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => {
                const price = item.product.discountedPrice || item.product.price;
                return (
                  <div
                    key={item.product.id}
                    className="flex gap-3.5 p-3.5 rounded-xl border border-gray-200/80 hover:border-purple-200 bg-white shadow-xs transition"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg bg-gray-100 shrink-0 border border-gray-100"
                    />

                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-gray-900 truncate leading-snug">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-gray-400 hover:text-red-500 p-1 transition cursor-pointer shrink-0"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {item.variation && (
                          <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-medium inline-block mt-0.5">
                            {item.variation}
                          </span>
                        )}
                        <div className="text-xs font-black text-purple-950 mt-1">
                          ₦{price.toLocaleString()}
                        </div>
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                            className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-200 font-bold transition cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 text-xs font-bold text-gray-800 min-w-[24px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, Math.min(item.product.stock, item.quantity + 1))}
                            className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-200 font-bold transition cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs font-bold text-gray-700">
                          ₦{(price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Checkout Footer */}
          {items.length > 0 && (
            <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-3">
              {/* Delivery notice */}
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-purple-700" />
                  Delivery to {userLocation?.lga || 'Ikeja'}, {userLocation?.state || 'Lagos'}:
                </span>
                <span className="font-semibold text-gray-900">₦{deliveryFee.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-gray-900">₦{subtotal.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-sm font-black text-purple-950 pt-2 border-t border-gray-200">
                <span>Total Amount:</span>
                <span>₦{total.toLocaleString()}</span>
              </div>

              <button
                id="cart-checkout-button"
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
