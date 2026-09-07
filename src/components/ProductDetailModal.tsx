import { useState } from 'react';
import { X, ShoppingBag, Star, ShieldCheck, MapPin, Check, Truck, ArrowRight } from 'lucide-react';
import { Product, UserLocation } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, variation?: string) => void;
  userLocation: UserLocation | null;
  deliveryFee: number | null;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  userLocation,
  deliveryFee
}: ProductDetailModalProps) {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<string | undefined>(undefined);
  const [addedNotice, setAddedNotice] = useState(false);

  if (!product) return null;

  const currentPrice = product.discountedPrice || product.price;
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedVariation);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 1800);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto border border-gray-100">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full flex items-center justify-center transition cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gallery */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-3 border border-gray-200">
              <img
                src={product.images[selectedImageIdx] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                      selectedImageIdx === idx ? 'border-purple-600 ring-2 ring-purple-600/30' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Vendor badge */}
            <div className="mt-4 p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs">
              <div className="flex items-center gap-2 font-bold text-purple-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Sold by: {product.vendorName || 'Verified Merchant'}</span>
              </div>
              <p className="text-gray-600 text-[11px] mt-1">
                Verified Nigerian merchant. Backed by Oso-Ahia escrow & 48-hour buyer protection guarantee.
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span className="font-bold text-purple-700 uppercase tracking-wider">{product.brand}</span>
                <span className="font-mono text-[11px]">{product.sku}</span>
              </div>

              <h2 className="text-lg font-bold text-gray-900 leading-snug">{product.name}</h2>

              {/* Rating & Condition */}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-xs">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{product.ratingAvg.toFixed(1)}</span>
                  <span className="text-gray-400">({product.ratingCount} reviews)</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-purple-100 text-purple-800">
                  Condition: {product.condition}
                </span>
              </div>

              {/* Price */}
              <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-purple-950">
                    ₦{currentPrice.toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-gray-400 line-through">
                      ₦{product.price.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                  {product.stock > 0 ? `In Stock: ${product.stock} units available` : 'Currently out of stock'}
                </p>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-600 mt-3 leading-relaxed">
                {product.description}
              </p>

              {/* Variations if any */}
              {product.variations && product.variations.length > 0 && (
                <div className="mt-4 space-y-2">
                  {product.variations.map((v, i) => (
                    <div key={i}>
                      <label className="block text-xs font-bold text-gray-700 mb-1">{v.name}</label>
                      <div className="flex flex-wrap gap-2">
                        {v.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => setSelectedVariation(opt.label)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                              selectedVariation === opt.label
                                ? 'bg-purple-700 text-white border-purple-700'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Specifications</h4>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <div key={key} className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <span className="text-gray-500 block text-[10px]">{key}</span>
                        <span className="font-semibold text-gray-800">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Estimation Box */}
              <div className="mt-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Truck className="w-4 h-4 text-amber-700" />
                  <span>Doorstep Delivery to: {userLocation?.lga || 'Ikeja'}, {userLocation?.state || 'Lagos'}</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-gray-700 text-[11px]">
                  <span>Estimated Delivery Fee:</span>
                  <span className="font-bold text-purple-900">
                    ₦{deliveryFee !== null ? deliveryFee.toLocaleString() : '1,500'}
                  </span>
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  Same-day to 24-hour dispatch via verified Nigerian logistics partners.
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-3">
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-gray-50">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-200 font-bold transition cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 py-2 text-sm font-bold text-gray-800 min-w-[32px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-200 font-bold transition cursor-pointer"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={product.stock <= 0}
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer ${
                  product.stock > 0
                    ? addedNotice
                      ? 'bg-emerald-600 text-white'
                      : 'bg-purple-700 hover:bg-purple-800 text-white'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {addedNotice ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add {quantity} to Cart (₦{(currentPrice * quantity).toLocaleString()})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
