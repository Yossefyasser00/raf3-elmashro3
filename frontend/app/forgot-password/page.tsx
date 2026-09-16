"use client";

import { useState } from "react";
import { ArrowLeft, KeyRound, Mail, Phone } from "lucide-react";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"request" | "verify" | "done">("request");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  // Dev-only: OTP returned in response when Gmail not configured
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4001";

  // ── Step 1: Request OTP ──────────────────────────────────────────────────
  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message ?? "تعذّر إرسال رمز التحقق، حاول مرة أخرى.");
        return;
      }

      setSentMessage(
        data?.otpCode
          ? `[وضع التطوير] رمز OTP الخاص بك: ${data.otpCode}`
          : (data?.message ?? "تم إرسال رمز التحقق، تحقق من بريدك الإلكتروني.")
      );
      setDevOtp(data?.otpCode ?? null);
      setStep("verify");
    } catch {
      setError("تعذّر الاتصال بالسيرفر، تحقق من اتصالك بالإنترنت.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP & Reset Password ──────────────────────────────────
  const submitReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }
    if (newPassword.length < 8) {
      setError("يجب أن تكون كلمة المرور 8 أحرف على الأقل.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API}/api/v1/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          otpCode: otpCode.trim(),
          newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.message ?? "تعذّر تحديث كلمة المرور.");
        return;
      }

      setStep("done");
    } catch {
      setError("تعذّر الاتصال بالسيرفر، تحقق من اتصالك بالإنترنت.");
    } finally {
      setLoading(false);
    }
  };

  // ── Go back to step 1 ────────────────────────────────────────────────────
  const goBack = () => {
    setStep("request");
    setOtpCode("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setSentMessage(null);
    setDevOtp(null);
  };

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Back link */}
        <a
          href="/login"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-ink/60 transition hover:text-coral"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة لتسجيل الدخول
        </a>

        <div className="rounded-3xl border border-sand bg-white p-6 shadow-xl lg:p-8">
          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-coral to-coralDark">
              <KeyRound className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink">استعادة كلمة المرور</h1>
              <p className="text-sm text-ink/50">
                {step === "request" && "أدخل بريدك الإلكتروني لتلقي رمز التحقق"}
                {step === "verify" && "أدخل الرمز وكلمة المرور الجديدة"}
                {step === "done" && "تمّ بنجاح!"}
              </p>
            </div>
          </div>

          {/* ── STEP 1: Request ── */}
          {step === "request" && (
            <form onSubmit={submitRequest} className="space-y-5">
              <div>
                <label htmlFor="identifier" className="mb-2 block text-sm font-bold text-ink">
                  البريد الإلكتروني أو رقم الهاتف
                </label>
                <div className="relative">
                  <Mail className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
                  <input
                    id="identifier"
                    type="text"
                    required
                    autoFocus
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="you@example.com أو 9665xxxxxxx"
                    className="w-full rounded-2xl border border-sand p-3.5 pr-10 text-sm outline-none transition focus:border-coral"
                    dir="ltr"
                  />
                </div>
              </div>

              {error && <ErrorBox message={error} />}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-coral py-4 text-base font-bold text-white shadow-lg shadow-coral/30 transition hover:bg-coralDark disabled:opacity-60"
              >
                {loading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
              </button>
            </form>
          )}

          {/* ── STEP 2: Verify OTP + New Password ── */}
          {step === "verify" && (
            <form onSubmit={submitReset} className="space-y-5">
              {/* Info banner */}
              {sentMessage && (
                <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                  devOtp
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-mint/30 bg-mint/10 text-mint"
                }`}>
                  {devOtp ? "🛠️" : "📧"} {sentMessage}
                </div>
              )}

              {/* OTP input */}
              <div>
                <label htmlFor="otpCode" className="mb-2 block text-sm font-bold text-ink">
                  رمز التحقق (OTP)
                </label>
                <input
                  id="otpCode"
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full rounded-2xl border border-sand p-3.5 text-center text-2xl font-bold tracking-widest outline-none transition focus:border-coral"
                  dir="ltr"
                />
                <p className="mt-1 text-xs text-ink/40">الرمز صالح لمدة 10 دقائق فقط</p>
              </div>

              {/* New password */}
              <div>
                <label htmlFor="newPassword" className="mb-2 block text-sm font-bold text-ink">
                  كلمة المرور الجديدة
                </label>
                <input
                  id="newPassword"
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="8 أحرف على الأقل"
                  className="w-full rounded-2xl border border-sand p-3.5 text-sm outline-none transition focus:border-coral"
                />
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-bold text-ink">
                  تأكيد كلمة المرور
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد كتابة كلمة المرور"
                  className="w-full rounded-2xl border border-sand p-3.5 text-sm outline-none transition focus:border-coral"
                />
              </div>

              {error && <ErrorBox message={error} />}

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="flex w-full items-center justify-center gap-3 rounded-full bg-coral py-4 text-base font-bold text-white shadow-lg shadow-coral/30 transition hover:bg-coralDark disabled:opacity-60"
              >
                {loading ? "جاري التحديث..." : "تحديث كلمة المرور"}
              </button>

              <button
                type="button"
                onClick={goBack}
                className="w-full text-center text-sm text-ink/50 hover:text-coral transition"
              >
                ← أعد إرسال الرمز
              </button>
            </form>
          )}

          {/* ── STEP 3: Done ── */}
          {step === "done" && (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-mint/10 text-5xl">
                ✅
              </div>
              <h2 className="text-xl font-black text-ink">تم تغيير كلمة المرور!</h2>
              <p className="text-sm text-ink/60">
                يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.
              </p>
              <a
                href="/login"
                className="flex w-full items-center justify-center gap-3 rounded-full bg-coral py-4 text-base font-bold text-white shadow-lg shadow-coral/30 transition hover:bg-coralDark"
              >
                تسجيل الدخول
              </a>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
      ⚠️ {message}
    </div>
  );
}
