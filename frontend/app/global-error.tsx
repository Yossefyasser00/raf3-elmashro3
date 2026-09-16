"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#FBF7F0] min-h-screen flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md text-center space-y-4">
          <div className="text-4xl">🚨</div>
          <h2 className="text-xl font-bold text-slate-900">خطأ عام في التطبيق</h2>
          <p className="text-sm text-slate-600">يرجى إعادة تحميل الصفحة.</p>
          <button
            onClick={() => reset()}
            className="bg-[#EE5A36] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md"
          >
            إعادة المحاولة 🔄
          </button>
        </div>
      </body>
    </html>
  );
}
