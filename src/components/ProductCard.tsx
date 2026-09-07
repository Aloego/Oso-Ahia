import { ShoppingCart, Star, Eye, ShieldCheck, MapPin } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  selectedLga?: string;
  key?: string | number;
}

export default function ProductCard({
  product,
  onAddToCart,
  onViewDetails,
  selectedLga
}: ProductCardProps) {
  const currentPrice = product.discountedPrice || product.price;
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountedPrice!) / product.price) * 100)
    : 0;

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'New':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Used':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Refurbished':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div
      id={`product-card-${product.id}`}
      className="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col group relative"
    >
      {/* Image container */}
      <div
        className="relative aspect-4/3 bg-gray-100 overflow-hidden cursor-pointer"
        onClick={() => onViewDetails(product)}
      >
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Condition Badge */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-md border shadow-xs ${getConditionColor(
              product.condition
            )}`}
          >
            {product.condition}
          </span>
          {hasDiscount && (
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-red-600 text-white shadow-xs">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Verified Vendor Tag */}
        <div className="absolute bottom-2.5 left-2.5 z-10 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span className="truncate max-w-[130px]">{product.vendorName || 'Verified Vendor'}</span>
        </div>

        {/* Quick view hover icon */}
        <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="w-8 h-8 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center shadow-md transition cursor-pointer"
            title="Quick View Specs"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-purple-700">{product.brand}</span>
            <span className="text-[11px] text-gray-400 font-mono">{product.sku}</span>
          </div>

          <h3
            onClick={() => onViewDetails(product)}
            className="text-sm font-bold text-gray-900 line-clamp-2 hover:text-purple-700 cursor-pointer transition leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-600">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-bold text-gray-800">{product.ratingAvg.toFixed(1)}</span>
            <span className="text-gray-400 text-[11px]">({product.ratingCount})</span>
          </div>

          {/* Location Delivery indicator */}
          <div className="mt-2 flex items-center gap-1 text-[11px] text-gray-600">
            <MapPin className="w-3 h-3 text-purple-600 shrink-0" />
            <span className="truncate">
              Dispatches to <strong>{selectedLga || 'Lagos'}</strong>
            </span>
          </div>
        </div>

        {/* Price & Cart footer */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-base font-black text-purple-950">
              ₦{currentPrice.toLocaleString()}
            </div>
            {hasDiscount && (
              <div className="text-xs text-gray-400 line-through">
                ₦{product.price.toLocaleString()}
              </div>
            )}
            <div className="text-[10px] text-gray-500 font-medium">
              {product.stock > 0 ? (
                product.stock <= 5 ? (
                  <span className="text-red-600 font-bold">Only {product.stock} left</span>
                ) : (
                  <span className="text-emerald-700 font-medium">{product.stock} in stock</span>
                )
              ) : (
                <span className="text-gray-400 font-bold">Out of stock</span>
              )}
            </div>
          </div>

          <button
            id={`add-to-cart-${product.id}`}
            onClick={() => onAddToCart(product)}
            disabled={product.stock <= 0}
            className={`p-2.5 rounded-xl font-bold flex items-center justify-center transition shadow-xs cursor-pointer ${
              product.stock > 0
                ? 'bg-purple-700 hover:bg-purple-800 text-white active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            title="Add to Shopping Cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
