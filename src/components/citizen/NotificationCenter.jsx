import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  HardHat,
  Clock,
  Sparkles,
  AlertTriangle,
  FileCheck,
  ArrowRight,
  X,
  ExternalLink,
} from 'lucide-react';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from '../../services/notificationService';

export default function NotificationCenter({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    try {
      const list = await getNotifications();
      setNotifications(Array.isArray(list) ? list : []);
      const count = await getUnreadCount();
      setUnreadCount(typeof count === 'number' ? count : 0);
    } catch (err) {
      console.warn('Notification load error:', err);
    }
  };

  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => {
      loadNotifications();
    };

    window.addEventListener('civic_notifications_updated', handleUpdate);
    return () => {
      window.removeEventListener('civic_notifications_updated', handleUpdate);
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) && isOpen) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id);
    onClose();
    if (notif.ticketId) {
      navigate(`/my-reports/${notif.ticketId}`);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'resolved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'verification':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'assigned':
        return <HardHat className="w-4 h-4 text-amber-600" />;
      case 'rework':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      default:
        return <FileCheck className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
    >
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-white/10 text-blue-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm">Citizen Notifications</h3>
            <span className="text-[10px] text-slate-300">
              {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              className="text-[11px] font-bold text-blue-300 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark read
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <Bell className="w-8 h-8 mx-auto opacity-30" />
            <p className="text-xs font-semibold">No notifications yet</p>
            <p className="text-[11px] text-slate-400">
              You will receive status updates when your reports are processed.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 text-left ${
                !n.read ? 'bg-blue-50/40' : ''
              }`}
            >
              {/* Icon */}
              <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs shrink-0 mt-0.5">
                {getNotifIcon(n.type)}
              </div>

              {/* Message Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h4
                    className={`text-xs truncate ${
                      !n.read ? 'font-black text-slate-900' : 'font-semibold text-slate-700'
                    }`}
                  >
                    {n.title}
                  </h4>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  )}
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {n.message}
                </p>

                <div className="flex items-center justify-between pt-1.5 text-[10px] text-slate-400 font-medium">
                  {n.ticketId && (
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                      {n.ticketId}
                    </span>
                  )}
                  <span>{n.formattedTime || 'Recent'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate('/my-reports');
          }}
          className="text-xs font-bold text-slate-700 hover:text-blue-600 inline-flex items-center gap-1 transition-colors"
        >
          <span>View all tracked reports in My Reports</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
