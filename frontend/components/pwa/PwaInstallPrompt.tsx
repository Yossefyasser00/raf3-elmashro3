"use client";

import React, { useEffect, useState } from "react";
import { Download, Smartphone, X, Sparkles, CheckCircle2 } from "lucide-react";

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already running as standalone PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(iosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Auto-trigger prompt after 2 seconds on mobile/desktop visit
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Show prompt on iOS Safari if not dismissed before
    if (iosDevice && !localStorage.getItem("fz_pwa_dismissed")) {
      setTimeout(() => setShowPrompt(true), 2500);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  async function handleInstallClick() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setInstalled(true);
      }
      setDeferredPrompt(null);
      setShowPrompt(false);
    } else if (isIos) {
      alert("📱 لتثبيت التطبيق على آيفون:\n1. اضغط على زر المشاركة (Share) في أسفل متصفح Safari.\n2. اختر 'إضافة إلى الشاشة الرئيسية Add to Home Screen'.");
      setShowPrompt(false);
    }
  }

  function handleDismiss() {
    setShowPrompt(false);
    localStorage.setItem("fz_pwa_dismissed", "true");
  }

  if (installed || !showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto animate-in slide-in-from-bottom-5 duration-500 font-arabic dir-rtl">
      <div className="bg-[#161B33] dark:bg-slate-900 border-2 border-[#EE5A36] text-white p-4 sm:p-5 rounded-3xl shadow-2xl space-y-3 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#EE5A36]/30 rounded-full blur-xl pointer-events-none"></div>

        <button
          onClick={handleDismiss}
          className="absolute top-3 left-3 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#EE5A36] to-orange-600 flex items-center justify-center text-white text-2xl shadow-lg shrink-0">
            📱
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <Sparkles className="w-3.5 h-3.5" /> تطبيق فك زنقة الجوال
            </div>
            <h3 className="font-extrabold text-base text-white mt-0.5">ثبت التطبيق على موبايلك الآن!</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              تصفح أسرع، استلام إشعارات فورية للزنقات، واستخدام ميزات الذكاء الاصطناعي بدون فتح المتصفح.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-[#EE5A36] hover:bg-[#d94e2b] text-white py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
          >
            <Download className="w-4 h-4" /> تثبيت التطبيق الآن
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition"
          >
            لاحقاً
          </button>
        </div>
      </div>
    </div>
  );
}
