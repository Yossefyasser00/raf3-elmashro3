"use client";

import { useState } from "react";
import { LogIn, Eye, EyeOff, ArrowLeft, BookOpen } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<null | { roles: string[] }>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message ?? "خطأ في بيانات الدخول");
      } else {
        if (typeof window !== "undefined") {
          localStorage.setItem("fz_token", data.accessToken);
          localStorage.setItem("fz_refresh", data.refreshToken);
          localStorage.setItem("fz_roles", JSON.stringify(data.roles ?? []));
          localStorage.setItem("fz_full_name", data.fullName ?? "");
        }
        setSuccess({ roles: data.roles ?? [] });
        const roles: string[] = data.roles ?? [];
        const target = roles.includes("ADMIN")
          ? "/dashboard/admin"
          : roles.includes("TUTOR")
            ? "/dashboard/tutor"
            : "/dashboard/student";
        setTimeout(() => {
          if (typeof window !== "undefined") window.location.href = target;
        }, 800);
      }
    } catch (err) {
      setError("تعذر الاتصال بالسيرفر — تأكد من تشغيل الـ Backend على منفذ 4000");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream transition-colors duration-300 dark:bg-[#0B0F19]">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-2 lg:py-20">
        <div className="order-2 lg:order-1">
          <a
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-ink/60 transition hover:text-coral dark:text-slate-300 dark:hover:text-coral"
          >
            <ArrowLeft className="h-4 w-4" />
            عاود للرئيسية
          </a>
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-coral to-coralDark text-2xl shadow-md font-black text-white tracking-tighter">
              FZ
            </div>
            <div>
              <h1 className="text-3xl font-black text-ink">أهلاً بيك تاني 👋</h1>
              <p className="text-sm text-ink/50 dark:text-slate-300">سجل دخولك ونكمل زي ما بنشتغل</p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-3xl border border-sand bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/80 dark:shadow-none"
          >
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-bold text-ink dark:text-slate-200">
                البريد الإلكتروني أو رقم الهاتف
              </label>
              <input
                id="email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com أو 9665xxxxx"
                className="w-full rounded-2xl border border-sand bg-white p-3.5 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-coral dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-bold text-ink dark:text-slate-200">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-sand bg-white p-3.5 pr-12 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-coral dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/50 hover:text-coral dark:text-slate-300 dark:hover:text-coral"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-200">
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div className="rounded-2xl border border-mint/30 bg-mint/10 px-4 py-3 text-sm font-semibold text-mint dark:border-mint/50 dark:bg-mint/10 dark:text-mint">
                ✅ تم تسجيل الدخول بنجاح! جاري التحويل للداشبورد... (رول: {success.roles.join(" + ")})
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-coral py-4 text-base font-bold text-white shadow-lg shadow-coral/30 transition hover:bg-coralDark disabled:opacity-60"
            >
              <LogIn className="h-5 w-5" />
              {submitting ? "جاري تسجيل الدخول..." : "دخول"}
            </button>

            <div className="flex flex-col gap-2 pt-2 text-center text-sm sm:flex-row sm:items-center sm:justify-between">
              <a href="/register" className="font-bold text-coral hover:underline">
                معنديش حساب؟ اعمل حساب جديد
              </a>
              <a href="/forgot-password" className="text-ink/50 hover:text-ink/80 dark:text-slate-300 dark:hover:text-slate-100">
                نسيت كلمة المرور؟
              </a>
            </div>
          </form>
        </div>

        <div className="order-1 lg:order-2">
          <div className="sticky top-10 overflow-hidden rounded-[2.5rem] border border-sand bg-gradient-to-br from-sand/60 to-white p-10 shadow-xl dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-sun to-coral text-5xl shadow-md">
              🎯
            </div>
            <h2 className="mb-4 text-2xl font-black leading-tight text-ink">
              إما تذاكر وحدك أو نذاكر سوا
              <br />
              على مزاجك.
            </h2>
            <p className="mb-8 text-ink/60 dark:text-slate-300">
              الداشبورد هيتغير بناءً على دورك:
            </p>
            <ul className="space-y-4">
              {[
                { icon: "🎓", title: "طالب", desc: "تنشر طلبك، تتواصل مع مدرسين، تتابع الجلسات والفواتير." },
                { icon: "👨‍🏫", title: "مدرس", desc: "تشوف الطلبات الجديدة، تدير مواعيدك وتقييمك، وتتابع أرباحك." },
              ].map((item) => (
                <li
                  key={item.title}
                  className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900/80 dark:shadow-none"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cream text-2xl">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-black text-ink">{item.title}</div>
                    <div className="text-xs text-ink/60 dark:text-slate-300">{item.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-center gap-3 rounded-2xl bg-ink p-4 text-cream">
              <BookOpen className="h-6 w-6 text-sun" />
              <p className="text-sm font-bold leading-snug">
                اول طلب تنشره بتحصل على 100 نقطة مكافأة 🎁
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
