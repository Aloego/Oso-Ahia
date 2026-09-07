import { Bell, Check, Clock, X, Info } from 'lucide-react';
import { Notification } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkRead: (id: string) => void;
}

export default function NotificationsModal({
  isOpen,
  onClose,
  notifications,
  onMarkRead
}: NotificationsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[80vh] flex flex-col border border-gray-100 relative">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-700" />
            <h2 className="text-base font-bold text-gray-900">Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs">
              <Info className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-xl border text-xs transition flex items-start justify-between gap-2 ${
                  n.read ? 'bg-gray-50/70 border-gray-200' : 'bg-purple-50/60 border-purple-200 ring-1 ring-purple-300'
                }`}
              >
                <div>
                  <h4 className="font-bold text-gray-900 leading-snug">{n.title}</h4>
                  <p className="text-gray-600 text-[11px] mt-0.5">{n.message}</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {!n.read && (
                  <button
                    onClick={() => onMarkRead(n.id)}
                    className="text-purple-700 hover:text-purple-900 p-1 transition cursor-pointer shrink-0"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
