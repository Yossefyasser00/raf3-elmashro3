"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBF7F0] p-6 text-center font-sans dir-rtl">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md space-y-4">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-xl font-bold text-slate-900">حدث خطأ مؤقت في تحميل الصفحة</h2>
        <p className="text-sm text-slate-600">
          تم رصد مشكلة صغيرة في العرض، يمكنك إعادة المحاولة فوراً.
        </p>
        <button
          onClick={() => reset()}
          className="bg-[#EE5A36] hover:bg-[#d94e2b] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition"
        >
          إعادة المحاولة 🔄
        </button>
      </div>
    </div>
  );
}
