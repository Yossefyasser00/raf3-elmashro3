"use client";

import { useState } from "react";
import { Bell, BellOff, BellRing, Loader2, X } from "lucide-react";
import { usePushNotifications } from "@/lib/usePushNotifications";

export default function NotificationBell() {
  const { permission, isSubscribed, isSupported, isLoading, subscribe, unsubscribe } = usePushNotifications();
  const [showPopup, setShowPopup] = useState(false);
  const [justEnabled, setJustEnabled] = useState(false);

  if (!isSupported) return null;

  const handleToggle = async () => {
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

  return (
    <div className="relative">
      <button
        onClick={() => setShowPopup(!showPopup)}
        className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition ${
          isSubscribed
            ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25"
            : "bg-ink/5 text-ink/50 hover:bg-ink/10 dark:bg-slate-700 dark:text-slate-300"
        }`}
        title={isSubscribed ? "الإشعارات مفعّلة" : "تفعيل الإشعارات"}
      >
        {isSubscribed ? (
          <BellRing className="h-5 w-5" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        {isSubscribed && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
          </span>
        )}
      </button>

      {showPopup && (
        <div className="absolute left-0 top-12 z-50 w-72 rounded-2xl border border-sand bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-800" dir="rtl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-black text-ink dark:text-white">🔔 الإشعارات</h3>
            <button onClick={() => setShowPopup(false)} className="text-ink/40 hover:text-ink dark:text-slate-400">
              <X className="h-4 w-4" />
            </button>
          </div>

          {justEnabled && (
            <div className="mb-3 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400">
              ✅ تم تفعيل الإشعارات بنجاح! هتوصلك على الموبايل والكمبيوتر.
            </div>
          )}

          <p className="mb-3 text-xs text-ink/60 dark:text-slate-400 leading-relaxed">
            {isSubscribed
              ? "الإشعارات مفعّلة — هتوصلك تنبيهات فورية عند أي تحديث."
              : "فعّل الإشعارات عشان توصلك تنبيهات فورية على موبايلك زي أي تطبيق عادي."}
          </p>

          <div className="space-y-2 mb-3 text-[11px] text-ink/50 dark:text-slate-500">
            <p>• طلبات جديدة وعروض أسعار</p>
            <p>• موافقة أو رفض طلبات</p>
            <p>• تذكير بمواعيد الجلسات</p>
            <p>• تقييمات جديدة</p>
          </div>

          <button
            onClick={handleToggle}
            disabled={isLoading || permission === "denied"}
            className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition disabled:opacity-50 ${
              isSubscribed
                ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                : "bg-coral text-white hover:bg-coralDark shadow-lg shadow-coral/25"
            }`}
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> جاري التفعيل...</>
            ) : isSubscribed ? (
              <><BellOff className="h-4 w-4" /> إيقاف الإشعارات</>
            ) : (
              <><Bell className="h-4 w-4" /> تفعيل الإشعارات 🔔</>
            )}
          </button>

          {permission === "denied" && (
            <p className="mt-2 text-[10px] text-red-500 text-center">
              ⚠️ الإشعارات محظورة — اسمح بها من إعدادات المتصفح
            </p>
          )}
        </div>
      )}
    </div>
  );
}
