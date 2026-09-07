import { useState } from 'react';
import { Package, Truck, CheckCircle2, Clock, X, AlertCircle } from 'lucide-react';
import { Order } from '../types';

interface CustomerOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

export default function CustomerOrdersModal({
  isOpen,
  onClose,
  orders
}: CustomerOrdersModalProps) {
  if (!isOpen) return null;

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'Pending':
        return 1;
      case 'Confirmed':
        return 2;
      case 'Processing':
        return 3;
      case 'Shipped':
        return 4;
      case 'Delivered':
        return 5;
      default:
        return 1;
    }
  };

  const steps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[88vh] flex flex-col border border-gray-100 relative">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-700" />
            <h2 className="text-base font-bold text-gray-900">My Orders & Live Tracking</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="font-semibold text-gray-600">No orders placed yet.</p>
              <p className="mt-1">Add items to your cart and checkout to begin tracking.</p>
            </div>
          ) : (
            orders.map((order) => {
              const displayStatus = order.orderStatus || order.status || 'Pending';
              const currentStep = getStatusStep(displayStatus);
              return (
                <div
                  key={order.id}
                  className="p-4 rounded-xl border border-gray-200 bg-white text-xs shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-gray-100 pb-2.5">
                    <div>
                      <span className="font-mono font-black text-purple-950 text-sm">
                        {order.orderNumber}
                      </span>
                      <span className="text-gray-400 text-[11px] ml-2">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                      <span className="font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded text-[10px]">
                        {displayStatus}
                      </span>
                    </div>
                  </div>

                  {/* Progress Tracker bar */}
                  <div className="my-3 py-2">
                    <div className="flex justify-between items-center relative">
                      <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0" />
                      <div
                        className="absolute top-1/2 left-0 h-1 bg-purple-600 -translate-y-1/2 z-0 transition-all"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                      />

                      {steps.map((st, i) => {
                        const stepNum = i + 1;
                        const isDone = stepNum <= currentStep;
                        return (
                          <div key={st} className="flex flex-col items-center z-10">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border-2 transition ${
                                isDone
                                  ? 'bg-purple-600 text-white border-purple-600'
                                  : 'bg-white text-gray-400 border-gray-300'
                              }`}
                            >
                              {stepNum}
                            </div>
                            <span
                              className={`text-[9px] mt-1 font-semibold ${
                                isDone ? 'text-purple-900' : 'text-gray-400'
                              }`}
                            >
                              {st}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Items and Address summary */}
                  <div className="bg-gray-50 p-2.5 rounded-lg text-gray-700 space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-semibold">₦{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="pt-1.5 mt-1 border-t border-gray-200 flex justify-between font-bold text-purple-950">
                      <span>Total (incl. Delivery):</span>
                      <span>₦{order.total.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] text-gray-500 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>
                      Fulfillment to: {order.deliveryAddress.street}, {order.deliveryAddress.lga}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
