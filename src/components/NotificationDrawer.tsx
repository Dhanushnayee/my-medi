import React from 'react';
import { useQueue } from '../context/QueueContext';
import { X, Bell, CheckCheck, Trash2, Clock, Volume2 } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, clearNotifications, language } = useQueue();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col justify-between border-l border-slate-200">
        {/* Header */}
        <div>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">
                {language === 'te' ? 'నోటిఫికేషన్లు & హెచ్చరికలు' : 'Queue & SMS Alerts'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-130px)]">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                {language === 'te' ? 'ఎలాంటి కొత్త నోటిఫికేషన్లు లేవు' : 'No notifications right now'}
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-xs ${
                    notif.read
                      ? 'bg-slate-50/60 border-slate-200 text-slate-600'
                      : 'bg-indigo-50/50 border-indigo-200 text-slate-900 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-slate-900">
                      {language === 'te' ? notif.titleTe : notif.title}
                    </strong>
                    <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {language === 'te' ? notif.messageTe : notif.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={clearNotifications}
              className="flex items-center gap-1.5 text-slate-500 hover:text-rose-600 font-semibold cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === 'te' ? 'అన్నీ తొలగించు' : 'Clear All'}</span>
            </button>
            <span className="text-slate-400 text-[10px]">Auto-refreshed with live queue</span>
          </div>
        )}
      </div>
    </div>
  );
};
