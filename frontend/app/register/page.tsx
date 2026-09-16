"use client";

import { useState } from "react";
import { UserPlus, Eye, EyeOff, ArrowLeft } from "lucide-react";

type Role = "STUDENT" | "TUTOR";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [initialRole, setInitialRole] = useState<Role>("STUDENT");
  const [collegeCardFile, setCollegeCardFile] = useState<File | null>(null);
  const [gradeLevel, setGradeLevel] = useState<string>("");
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
      const collegeCardDataUrl = collegeCardFile
        ? await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result ?? ""));
            reader.onerror = () => reject(new Error("failed to read college card"));
            reader.readAsDataURL(collegeCardFile);
          })
        : null;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName,
            email,
            phone,
            password,
            initialRole,
            collegeCardFileName: collegeCardDataUrl ?? null,
            gradeLevel: gradeLevel || null,
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message ?? "حدث خطأ أثناء إنشاء الحساب");
      } else {
        if (typeof window !== "undefined") {
          localStorage.setItem("fz_token", data.accessToken);
          localStorage.setItem("fz_refresh", data.refreshToken);
          localStorage.setItem("fz_roles", JSON.stringify(data.roles ?? []));
          localStorage.setItem("fz_full_name", data.fullName ?? "");
        }
        setSuccess({ roles: data.roles ?? [] });
        const target = initialRole === "TUTOR" ? "/dashboard/tutor" : "/dashboard/student";
        setTimeout(() => {
          if (typeof window !== "undefined") window.location.href = target;
        }, 900);
      }
    } catch (err) {
      setError("تعذر الاتصال بالسيرفر — تأكد من تشغيل الـ Backend على منفذ 4000");
    } finally {
      setSubmitting(false);
    }
  }

  const pwdLenOk = password.length >= 8;

  return (
    <main className="min-h-screen bg-cream transition-colors duration-300 dark:bg-[#0B0F19]">
      <div className="mx-auto max-w-3xl px-6 py-10 lg:py-16">
        <a
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-ink/60 transition hover:text-coral dark:text-slate-300 dark:hover:text-coral"
        >
          <ArrowLeft className="h-4 w-4" />
          عاود للرئيسية
        </a>

        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-lilac to-lilac/60 text-3xl shadow-md">
            ✨
          </div>
          <div>
            <h1 className="text-3xl font-black text-ink">حساب جديد</h1>
            <p className="text-sm text-ink/50 dark:text-slate-300">أهلاً بيك في فك زنقة — خلينا نبني ملفك.</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border border-sand bg-white p-6 lg:p-8 dark:border-slate-700 dark:bg-slate-800/80 dark:shadow-none"
        >
          <div>
            <label className="mb-3 block text-sm font-bold text-ink">أنا هنا عشان</label>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { k: "STUDENT", label: "🎓 طالب", desc: "عايز مدرس يفهمني المادة" },
                  { k: "TUTOR", label: "👨‍🏫 مدرس", desc: "عايز أعمل دروس واربح فلوس" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.k}
                  type="button"
                  onClick={() => setInitialRole(opt.k)}
                  className={
                    "rounded-2xl border p-4 text-start transition " +
                    (initialRole === opt.k
                      ? "border-coral bg-coral/5 ring-2 ring-coral/30 dark:border-coral dark:bg-coral/10 dark:ring-coral/40"
                      : "border-sand hover:border-ink/20 dark:border-slate-600 dark:hover:border-slate-400 dark:bg-slate-900/40")
                  }
                >
                  <div className="text-lg font-black text-ink">{opt.label}</div>
                  <div className="text-xs text-ink/60 dark:text-slate-300">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="fullName" className="mb-2 block text-sm font-bold text-ink dark:text-slate-200">
              الاسم بالكامل
            </label>
            <input
              id="fullName"
              type="text"
              required
              minLength={2}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="مثال: أحمد محمد"
              className="w-full rounded-2xl border border-sand bg-white p-3.5 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-coral dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-bold text-ink dark:text-slate-200">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-sand bg-white p-3.5 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-coral dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
            />
          </div>

          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-bold text-ink dark:text-slate-200">
              رقم الهاتف
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01012345678"
              className="w-full rounded-2xl border border-sand bg-white p-3.5 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-coral dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
            />
          </div>

          <div>
            <label htmlFor="college-card" className="mb-2 block text-sm font-bold text-ink dark:text-slate-200">
              ارسل كارنيه الكلية
            </label>
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-sand bg-cream p-3.5 transition hover:border-coral dark:border-slate-600 dark:bg-slate-900/60">
              <span className="text-sm font-bold text-coral">اختر صورة</span>
              <span className="text-xs text-ink/60 dark:text-slate-300">
                {collegeCardFile ? collegeCardFile.name : "لا توجد صورة محددة"}
              </span>
              <input
                id="college-card"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setCollegeCardFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div>
            <label htmlFor="gradeLevel" className="mb-2 block text-sm font-bold text-ink dark:text-slate-200">
              الصف
            </label>
            <select
              id="gradeLevel"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full rounded-2xl border border-sand bg-white p-3.5 text-sm text-ink outline-none transition focus:border-coral dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">اختر الصف</option>
              {Array.from({ length: 7 }, (_, index) => index + 1).map((grade) => (
                <option key={grade} value={String(grade)}>
                  الصف {grade}
                </option>
              ))}
            </select>
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
                placeholder="٨ حروف على الأقل"
                className="w-full rounded-2xl border border-sand bg-white p-3.5 pr-12 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-coral dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/50 hover:text-coral dark:text-slate-300 dark:hover:text-coral"
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className={"mt-2 text-xs " + (password ? (pwdLenOk ? "text-mint" : "text-coral") : "text-ink/40 dark:text-slate-400")}>
              {pwdLenOk ? "✅ كلمة المرور مناسبة" : "ℹ️ لازم كلمة المرور تكون ٨ حروف أو أكتر"}
            </p>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-200">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="rounded-2xl border border-mint/30 bg-mint/10 px-4 py-3 text-sm font-semibold text-mint dark:border-mint/50 dark:bg-mint/10 dark:text-mint">
              ✅ الحساب اتنشأ! جاري التحويل للداشبورد الخاص بـ
              {" "}
              {initialRole === "TUTOR" ? "المدرس" : "الطالب"}...
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-coral py-4 text-base font-bold text-white shadow-lg shadow-coral/30 transition hover:bg-coralDark disabled:opacity-60"
          >
            <UserPlus className="h-5 w-5" />
            {submitting ? "بننشأ حسابك..." : "إنشاء الحساب"}
          </button>

          <div className="pt-2 text-center text-sm">
            <span className="text-ink/60 dark:text-slate-300">عندك حساب بالفعل؟ </span>
            <a href="/login" className="font-bold text-coral hover:underline">
              سجل دخولك من هنا
            </a>
          </div>
        </form>

        {initialRole === "TUTOR" && (
          <div className="mt-6 rounded-3xl border border-sun/40 bg-sun/10 p-6 dark:border-sun/60 dark:bg-slate-900/70">
            <p className="mb-2 text-sm font-black text-ink">💡 هل تعرف؟</p>
            <p className="text-sm text-ink/70 dark:text-slate-300">
              بعد إنشاء حساب مدرس، هنحتاج ترسل طلب قبول (TutorApplication) عشان يدخل تحت مراجعة الإدارة ويتحقق من بياناتك
              وبعد كده تقدر تشوف الطلبات اللي بنوصلك إياها.
              ومتنساش تكمل بياناتك في الملف الشخصي عشان تقدر توصل للناس.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
