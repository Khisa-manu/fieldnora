import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  X,
  Bell,
  CheckCircle,
  MessageSquare,
  Smartphone,
  CreditCard,
  Boxes,
  Send,
  Loader2
} from 'lucide-react';
import { AppNotification } from '../../types';

export const NotificationDrawer: React.FC = () => {
  const {
    notificationDrawerOpen,
    setNotificationDrawerOpen,
    notifications,
    markNotificationAsRead,
    showToast,
    refreshAppData,
  } = useApp();

  const [activeChannel, setActiveChannel] = useState<'all' | 'in_app' | 'sms' | 'whatsapp'>('all');
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [recipient, setRecipient] = useState('+254 722 000 111');
  const [testChannel, setTestChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [testMessage, setTestMessage] = useState(
    'Habari! Your technician Brian Kiprop is en route to Safaricom Plaza. ETA is 15 minutes.'
  );
  const [sending, setSending] = useState(false);

  if (!notificationDrawerOpen) return null;

  const filteredNotifs =
    activeChannel === 'all'
      ? notifications
      : notifications.filter(n => n.channel === activeChannel);

  const handleSendDispatchAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.sendNotification({
        channel: testChannel,
        recipient,
        message: testMessage,
        title: `Outbound ${testChannel.toUpperCase()} Notice`,
      });
      showToast(`${testChannel.toUpperCase()} queued for ${recipient}`, 'success');
      setTestModalOpen(false);
      await refreshAppData();
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch alert', 'error');
    } finally {
      setSending(false);
    }
  };

  const getNotifIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'inventory':
        return <Boxes className="w-4 h-4 text-amber-600" />;
      case 'dispatch':
      case 'status':
        return <Smartphone className="w-4 h-4 text-teal-600" />;
      default:
        return <Bell className="w-4 h-4 text-sky-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        onClick={() => setNotificationDrawerOpen(false)}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-teal-100 rounded-lg text-teal-800">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Notifications & Alerts</h3>
                <p className="text-[11px] text-slate-500">In-App, SMS & WhatsApp Gateways</p>
              </div>
            </div>
            <button
              onClick={() => setNotificationDrawerOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Channels Filter Tabs */}
          <div className="flex border-b border-slate-200 px-4 pt-2 gap-2 text-xs">
            <button
              onClick={() => setActiveChannel('all')}
              className={`pb-2 font-medium border-b-2 transition-all ${
                activeChannel === 'all'
                  ? 'border-[#14B8A6] text-[#0F172A]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              All Alerts
            </button>
            <button
              onClick={() => setActiveChannel('in_app')}
              className={`pb-2 font-medium border-b-2 transition-all ${
                activeChannel === 'in_app'
                  ? 'border-[#14B8A6] text-[#0F172A]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              In-App
            </button>
            <button
              onClick={() => setActiveChannel('whatsapp')}
              className={`pb-2 font-medium border-b-2 transition-all ${
                activeChannel === 'whatsapp'
                  ? 'border-[#14B8A6] text-[#0F172A]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              WhatsApp
            </button>
            <button
              onClick={() => setActiveChannel('sms')}
              className={`pb-2 font-medium border-b-2 transition-all ${
                activeChannel === 'sms'
                  ? 'border-[#14B8A6] text-[#0F172A]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              SMS
            </button>
          </div>

          {/* Quick Action Button */}
          <div className="p-3 bg-teal-50/50 border-b border-teal-100 flex items-center justify-between">
            <span className="text-xs text-teal-900 font-medium">Dispatch Gateway Ready</span>
            <button
              onClick={() => setTestModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-[#14B8A6] hover:bg-teal-700 rounded-lg shadow-2xs"
            >
              <Send className="w-3 h-3" />
              Send Customer SMS / WhatsApp
            </button>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredNotifs.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">
                No notifications recorded in this channel.
              </div>
            ) : (
              filteredNotifs.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                    notif.read
                      ? 'bg-white border-slate-200 text-slate-600'
                      : 'bg-teal-50/40 border-teal-200/80 text-slate-900 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-slate-100 mt-0.5">
                      {getNotifIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold">{notif.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider bg-slate-100 text-slate-600">
                          {notif.channel}
                        </span>
                        {!notif.read && (
                          <span className="text-[10px] text-teal-600 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                            Unread
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Test Dispatch Modal */}
          {testModalOpen && (
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <h4 className="text-xs font-bold text-slate-800 mb-2">Outbound Customer Dispatch Notification</h4>
              <form onSubmit={handleSendDispatchAlert} className="space-y-2.5 text-xs">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTestChannel('whatsapp')}
                    className={`flex-1 py-1.5 rounded-lg border font-semibold text-center ${
                      testChannel === 'whatsapp'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestChannel('sms')}
                    className={`flex-1 py-1.5 rounded-lg border font-semibold text-center ${
                      testChannel === 'sms'
                        ? 'bg-sky-600 text-white border-sky-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    SMS Gateway
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Kenyan Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    value={recipient}
                    onChange={e => setRecipient(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Dispatch Message
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={testMessage}
                    onChange={e => setTestMessage(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setTestModalOpen(false)}
                    className="px-3 py-1 text-slate-600 hover:bg-slate-200 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-[#14B8A6] rounded-lg shadow-xs"
                  >
                    {sending && <Loader2 className="w-3 h-3 animate-spin" />}
                    Send Alert
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
