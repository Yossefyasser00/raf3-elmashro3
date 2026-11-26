"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, BellOff, BellRing, CheckCheck, Loader2, X } from "lucide-react";
import { usePushNotifications } from "@/lib/usePushNotifications";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

interface InAppNotification {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  metadata?: { url?: string; tag?: string } | null;
}

export default function NotificationBell() {
  const { permission, isSubscribed, isSupported, isLoading, subscribe, unsubscribe } = usePushNotifications();
  const [showPopup, setShowPopup] = useState(false);
  const [justEnabled, setJustEnabled] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastAlert, setToastAlert] = useState<InAppNotification | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const isFirstFetchRef = useRef(true);

  const fetchNotifications = async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("fz_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/v1/push/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const items: InAppNotification[] = Array.isArray(data?.items) ? data.items : [];
      setNotifications(items);
      setUnreadCount(typeof data?.unreadCount === "number" ? data.unreadCount : 0);

      // Detect newly arrived unread notifications after first fetch
      if (isFirstFetchRef.current) {
        items.forEach((n) => seenIdsRef.current.add(n.id));
        isFirstFetchRef.current = false;
      } else {
        const newestUnread = items.find((n) => !n.isRead && !seenIdsRef.current.has(n.id));
        items.forEach((n) => seenIdsRef.current.add(n.id));
        if (newestUnread) {
          setToastAlert(newestUnread);
          setTimeout(() => setToastAlert(null), 5000);
        }
      }
    } catch {
      // ignore transient network errors
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleTogglePush = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      const ok = await subscribe();
      if (ok) {
        setJustEnabled(true);
        setTimeout(() => setJustEnabled(false), 3000);
      }
    }
  };

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem("fz_token");
    if (!token) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await fetch(`${API_BASE}/api/v1/push/read-all`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  };

  const handleNotificationClick = async (item: InAppNotification) => {
    const token = localStorage.getItem("fz_token");
    if (!item.isRead && token) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      await fetch(`${API_BASE}/api/v1/push/${item.id}/read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    setShowPopup(false);
    if (item.metadata?.url && item.metadata.url !== window.location.pathname) {
      window.location.href = item.metadata.url;
    }
  };

  const formatTime = (iso: string) => {
    try {
      const diffMins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
      if (diffMins < 1) return "الآن";
      if (diffMins < 60) return `منذ ${diffMins} د`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `منذ ${diffHours} س`;
      return new Date(iso).toLocaleDateString("ar-EG");
    } catch {
      return "";
    }
  };

  return (
    <div className="relative">
      {/* Live In-App Toast when a new notification arrives */}
      {toastAlert && (
        <div
          onClick={() => handleNotificationClick(toastAlert)}
          className="fixed top-16 left-4 right-4 sm:left-6 sm:right-auto sm:w-80 z-[60] cursor-pointer rounded-2xl border border-coral/40 bg-white dark:bg-slate-900 p-3.5 shadow-2xl animate-in slide-in-from-top-4"
          dir="rtl"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs font-black text-coral">{toastAlert.title}</div>
              <div className="text-[11px] text-ink/80 dark:text-slate-200 mt-0.5 leading-relaxed">
                {toastAlert.body}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setToastAlert(null);
              }}
              className="text-ink/40 hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          setShowPopup(!showPopup);
          if (!showPopup) fetchNotifications();
        }}
        className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition ${
          unreadCount > 0
            ? "bg-coral/15 text-coral hover:bg-coral/25"
            : isSubscribed
              ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25"
              : "bg-ink/5 text-ink/60 hover:bg-ink/10 dark:bg-slate-700 dark:text-slate-300"
        }`}
        title={isSubscribed ? "الإشعارات مفعّلة" : "الإشعارات"}
      >
        {unreadCount > 0 || isSubscribed ? (
          <BellRing className="h-5 w-5" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white shadow">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : isSubscribed ? (
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        ) : null}
      </button>

      {showPopup && (
        <div
          className="absolute left-0 top-12 z-50 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-3xl border border-sand bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-800"
          dir="rtl"
        >
          <div className="mb-3 flex items-center justify-between border-b border-sand/60 pb-2.5 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-ink dark:text-white">🔔 الإشعارات</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-coral/15 px-2 py-0.5 text-[10px] font-black text-coral">
                  {unreadCount} جديد
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-coral hover:bg-coral/10 transition"
                  title="تحديد الكل كمقروء"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  قراءة الكل
                </button>
              )}
              <button
                onClick={() => setShowPopup(false)}
                className="text-ink/40 hover:text-ink dark:text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {justEnabled && (
            <div className="mb-3 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400">
              ✅ تم تفعيل إشعارات الجهاز بنجاح!
            </div>
          )}

          {/* Push Subscription Banner */}
          {isSupported && (
            <div className="mb-3 flex items-center justify-between gap-2 rounded-2xl bg-cream/70 dark:bg-slate-900/60 p-2.5 border border-sand/60 dark:border-slate-700">
              <span className="text-[11px] font-bold text-ink/70 dark:text-slate-300">
                {isSubscribed
                  ? "✅ إشعارات الجهاز مفعّلة"
                  : permission === "denied"
                    ? "⚠️ إشعارات المتصفح محظورة"
                    : "فعّل إشعارات الخلفية على جهازك"}
              </span>
              <button
                onClick={handleTogglePush}
                disabled={isLoading || permission === "denied"}
                className={`shrink-0 flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-black transition disabled:opacity-50 ${
                  isSubscribed
                    ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                    : "bg-coral text-white hover:bg-coralDark shadow-sm"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isSubscribed ? (
                  <>
                    <BellOff className="h-3 w-3" /> إيقاف
                  </>
                ) : (
                  <>
                    <Bell className="h-3 w-3" /> تفعيل
                  </>
                )}
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-72 overflow-y-auto space-y-2 pr-0.5">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-ink/50 dark:text-slate-400">
                لا توجد إشعارات حتى الآن
              </div>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`w-full text-right rounded-2xl p-3 transition border ${
                    item.isRead
                      ? "bg-white border-sand/50 hover:bg-cream/50 dark:bg-slate-800/60 dark:border-slate-700"
                      : "bg-coral/5 border-coral/30 hover:bg-coral/10 dark:bg-coral/10 dark:border-coral/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-black text-ink dark:text-white flex items-center gap-1.5">
                      {!item.isRead && (
                        <span className="inline-block h-2 w-2 rounded-full bg-coral shrink-0" />
                      )}
                      {item.title}
                    </span>
                    <span className="text-[10px] text-ink/40 dark:text-slate-400 shrink-0">
                      {formatTime(item.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-ink/70 dark:text-slate-300 leading-relaxed">
                    {item.body}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
