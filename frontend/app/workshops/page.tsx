"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Video,
  CreditCard,
  Play,
  ArrowRight,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Lock,
  Filter,
  Users,
} from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";

interface WorkshopItem {
  id: string;
  title: string;
  description?: string | null;
  type: "FREE" | "PAID";
  priceEGP?: number | null;
  startsAt: string;
  endsAt: string;
  capacity?: number | null;
  youtubeVideoId?: string | null;
  thumbnailUrl?: string | null;
  tutor?: {
    fullName: string;
    avatarUrl?: string | null;
  } | null;
}

export default function AllWorkshopsPage() {
  const [workshops, setWorkshops] = useState<WorkshopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"ALL" | "FREE" | "PAID">("ALL");

  // Payment Modal State
  const [selectedPaidWorkshop, setSelectedPaidWorkshop] = useState<WorkshopItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"instapay" | "vodafone">("instapay");
  const [phoneOrAccount, setPhoneOrAccount] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);
  const [myEnrollments, setMyEnrollments] = useState<any[]>([]);

  // Video Player Modal State
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [activeVideoTitle, setActiveVideoTitle] = useState<string>("");

  useEffect(() => {
    async function loadWorkshops() {
      setLoading(true);
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
        const token = localStorage.getItem("fz_token");

        const [publicRes, enrollRes] = await Promise.all([
          fetch(`${apiBase}/api/v1/workshops/public`),
          token ? fetch(`${apiBase}/api/v1/workshops/my-enrollments`, { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve(null),
        ]);

        if (publicRes.ok) {
          const data = await publicRes.json();
          setWorkshops(data);
        } else {
          const featRes = await fetch(`${apiBase}/api/v1/workshops/featured`);
          if (featRes.ok) {
            const featData = await featRes.json();
            setWorkshops(featData);
          }
        }

        if (enrollRes && enrollRes.ok) {
          const enrollData = await enrollRes.json();
          setMyEnrollments(enrollData);
        }
      } catch (err) {
        console.error("Failed to fetch workshops", err);
      } finally {
        setLoading(false);
      }
    }

    loadWorkshops();
  }, []);

  const filteredWorkshops = workshops.filter((w) => {
    if (filterType === "FREE") return w.type === "FREE";
    if (filterType === "PAID") return w.type === "PAID";
    return true;
  });

  async function handlePaySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPaidWorkshop) return;
    setIsSubmittingPay(true);

    try {
      const token = localStorage.getItem("fz_token");
      if (token) {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
        const res = await fetch(`${apiBase}/api/v1/workshops/${selectedPaidWorkshop.id}/enroll`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ paidWithPoints: false }),
        });
        if (res.ok) {
          const newEnroll = await res.json();
          setMyEnrollments(prev => [...prev.filter(e => e.workshopId !== selectedPaidWorkshop.id), newEnroll]);
        }
      }
    } catch (err) {
      console.error("Failed to register enrollment", err);
    }

    setTimeout(() => {
      setIsSubmittingPay(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        setPaymentSuccess(false);
        setSelectedPaidWorkshop(null);
      }, 3000);
    }, 1200);
  }

  return (
    <main className="min-h-screen bg-cream pb-24 pt-6 transition-colors duration-300 dark:bg-[#0B0F19]">
      {/* Header Bar */}
      <header className="mx-auto max-w-7xl px-4 sm:px-6 mb-8">
        <div className="flex items-center justify-between rounded-2xl border border-sand bg-white/80 p-4 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-black text-ink/70 hover:text-coral dark:text-slate-300 dark:hover:text-coral transition"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للرئيسية
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/student"
              className="rounded-full bg-mint/15 px-4 py-1.5 text-xs font-black text-mint hover:bg-mint/25 transition"
            >
              لوحة تحكم الطالب
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Banner */}
        <div className="mb-10 text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-coral/15 px-4 py-1.5 text-xs font-black text-coral">
            <Sparkles className="h-3.5 w-3.5" />
            ورش عمل ومراجعات نهائية
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-ink dark:text-white">
            جميع ورش العمل المتاحة في فك زنقة
          </h1>
          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-ink/60 dark:text-slate-400 font-medium">
            شاهد الورش المجانية مباشرة على يوتيوب، أو اشترك وادفع في الورش المدفوعة المكثفة مع نخبة من أفضل المدرسين.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-sand bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {[
              { id: "ALL", label: `جميع الورش (${workshops.length})` },
              { id: "FREE", label: `🎬 ورش مجانية (${workshops.filter((w) => w.type === "FREE").length})` },
              { id: "PAID", label: `💳 ورش مدفوعة (${workshops.filter((w) => w.type === "PAID").length})` },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id as any)}
                className={`rounded-xl px-4 py-2 text-xs font-black transition ${
                  filterType === f.id
                    ? "bg-ink text-white dark:bg-coral shadow-sm"
                    : "text-ink/70 hover:bg-cream dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Workshops Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-coral border-t-transparent" />
            <p className="text-xs font-bold text-ink/50 dark:text-slate-400">جاري تحميل الورش...</p>
          </div>
        ) : filteredWorkshops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkshops.map((workshop) => {
              const startDate = new Date(workshop.startsAt);
              const isFree = workshop.type === "FREE";

              return (
                <div
                  key={workshop.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-sand bg-white shadow-sm transition hover:shadow-xl hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900"
                >
                  {/* Thumbnail / Header */}
                  {workshop.thumbnailUrl ? (
                    <div className="relative h-44 w-full overflow-hidden bg-sand/30">
                      <img
                        src={workshop.thumbnailUrl}
                        alt={workshop.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-3 right-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black shadow-md ${
                            isFree ? "bg-mint text-white" : "bg-coral text-white"
                          }`}
                        >
                          {isFree ? "مجانية 🎁" : `${workshop.priceEGP ?? 0} ج.م`}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-36 w-full bg-gradient-to-br from-coral/20 via-lilac/20 to-mint/20 flex items-center justify-center">
                      <span className="text-4xl">🎬</span>
                      <div className="absolute top-3 right-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black shadow-sm ${
                            isFree
                              ? "bg-mint/90 text-white"
                              : "bg-coral/90 text-white"
                          }`}
                        >
                          {isFree ? "مجانية 🎁" : `${workshop.priceEGP ?? 0} ج.م`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {workshop.tutor?.fullName && (
                        <p className="text-[11px] font-bold text-ink/50 dark:text-slate-400 mb-1">
                          تقديم: {workshop.tutor.fullName}
                        </p>
                      )}
                      <h3 className="text-lg font-black text-ink dark:text-white line-clamp-2">
                        {workshop.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-ink/60 dark:text-slate-300 line-clamp-3 font-medium">
                        {workshop.description || "ورشة عمل تفاعلية وشرح تفصيلي للمفاهيم الأساسية وحل الأسئلة المهمة."}
                      </p>
                    </div>

                    {/* Date & Time info */}
                    <div className="mt-4 pt-4 border-t border-sand/60 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-ink/70 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-coral" />
                          <span>{startDate.toLocaleDateString("ar-EG", { month: "short", day: "numeric", year: "numeric" })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-coral" />
                          <span>{startDate.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </div>

                      {/* Action Button: Watch Now vs Pay Now vs Pending Approval */}
                      {isFree ? (
                        workshop.youtubeVideoId ? (
                          <a
                            href={`https://www.youtube.com/watch?v=${workshop.youtubeVideoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full rounded-2xl bg-red-600 p-3 text-center text-xs font-black text-white hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-md shadow-red-600/20"
                          >
                            <Play className="h-4 w-4 fill-white" />
                            <span>شاهد الآن 🎬 (يوتيوب)</span>
                          </a>
                        ) : (
                          <button
                            onClick={() => {
                              alert("هذه الورشة مجانية وسيتم إتاحة تسجيل الفيديو قريباً!");
                            }}
                            className="w-full rounded-2xl bg-mint p-3 text-center text-xs font-black text-white hover:brightness-95 transition flex items-center justify-center gap-2 shadow-sm"
                          >
                            <Play className="h-4 w-4" />
                            <span>شاهد الآن 🎬 (مجانية)</span>
                          </button>
                        )
                      ) : (() => {
                        const enrollment = myEnrollments.find(e => e.workshopId === workshop.id || e.workshop?.id === workshop.id);
                        if (enrollment?.status === "APPROVED") {
                          return workshop.youtubeVideoId ? (
                            <a
                              href={`https://www.youtube.com/watch?v=${workshop.youtubeVideoId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full rounded-2xl bg-mint p-3 text-center text-xs font-black text-white hover:brightness-95 transition flex items-center justify-center gap-2 shadow-md shadow-mint/20"
                            >
                              <Play className="h-4 w-4 fill-white" />
                              <span>شاهد الورشة 🎬 (تم التفعيل ✓)</span>
                            </a>
                          ) : (
                            <div className="w-full rounded-2xl bg-mint/15 border border-mint/30 p-2.5 text-center text-xs font-bold text-mint">
                              ✓ تم تفعيل اشتراكك — بانتظار بدء الورشة
                            </div>
                          );
                        }
                        if (enrollment?.status === "PENDING") {
                          return (
                            <div className="w-full rounded-2xl bg-amber-500/15 border border-amber-500/30 p-2.5 text-center text-xs font-bold text-amber-600 dark:text-amber-400">
                              ⏳ تم إرسال الدفع — بانتظار موافقة وتفعيل الإدارة
                            </div>
                          );
                        }
                        return (
                          <button
                            onClick={() => setSelectedPaidWorkshop(workshop)}
                            className="w-full rounded-2xl bg-coral p-3 text-center text-xs font-black text-white hover:bg-coralDark transition flex items-center justify-center gap-2 shadow-lg shadow-coral/25 transform active:scale-95"
                          >
                            <CreditCard className="h-4 w-4" />
                            <span>ادفع الآن 💳 ({workshop.priceEGP ?? 0} ج.م)</span>
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-sand bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sand/40 text-2xl">
              🔍
            </div>
            <h3 className="text-lg font-black text-ink dark:text-white">لا توجد ورش مطابقة حالياً</h3>
            <p className="mt-1 text-xs text-ink/50 dark:text-slate-400">
              تابعنا باستمرار حيث يتم إضافة ورش عمل ومراجعات أسبوعياً
            </p>
          </div>
        )}
      </div>

      {/* Payment Modal for Paid Workshops */}
      {selectedPaidWorkshop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-sand bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-4 border-b border-sand dark:border-slate-800">
              <div>
                <span className="text-[11px] font-black text-coral">حجز ودفع الورشة</span>
                <h3 className="text-base font-black text-ink dark:text-white truncate">
                  {selectedPaidWorkshop.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPaidWorkshop(null)}
                className="rounded-full bg-sand/50 px-2.5 py-1 text-xs font-bold text-ink/60 dark:bg-slate-800 dark:text-slate-300"
              >
                ✕
              </button>
            </div>

            {paymentSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 text-3xl">
                  ⏳
                </div>
                <h4 className="text-lg font-black text-ink dark:text-white">تم استلام طلب الدفع!</h4>
                <p className="text-xs text-ink/60 dark:text-slate-400">
                  تم تسجيل إثبات التحويل بنجاح، وسيتم تفعيل وفتح الورشة لك فور مراجعة الإدارة وتأكيد الدفع.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePaySubmit} className="mt-4 space-y-4">
                {/* Price Display */}
                <div className="rounded-2xl bg-cream/70 p-4 dark:bg-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-ink/70 dark:text-slate-300">
                    المبلغ المطلوب سداده:
                  </span>
                  <span className="text-xl font-black text-coral">
                    {selectedPaidWorkshop.priceEGP ?? 0} ج.م
                  </span>
                </div>

                {/* Method selector */}
                <div>
                  <label className="block text-xs font-bold text-ink dark:text-slate-200 mb-2">
                    اختر طريقة الدفع:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "vodafone", label: "فودافون كاش 📱" },
                      { id: "instapay", label: "إنستاباي ⚡" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`rounded-xl border p-2.5 text-xs font-bold transition ${
                          paymentMethod === m.id
                            ? "border-coral bg-coral/15 text-coral font-black"
                            : "border-sand bg-cream/30 text-ink/70 hover:bg-cream dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transfer Instructions */}
                {paymentMethod === "vodafone" ? (
                  <div className="rounded-2xl bg-orange-500/10 border border-orange-500/20 p-3.5 text-xs space-y-1.5">
                    <div className="font-bold text-orange-600">📱 حوّل المبلغ إلى رقم فودافون كاش:</div>
                    <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-orange-500/20">
                      <span className="font-mono text-base font-black text-ink dark:text-white tracking-widest">01020246369</span>
                      <span className="text-[10px] text-orange-600 font-bold">رقم المنصة الرسمي</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-purple-500/10 border border-purple-500/20 p-3.5 text-xs space-y-1.5">
                    <div className="font-bold text-purple-600">⚡ حوّل المبلغ عبر تطبيق إنستاباي إلى:</div>
                    <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/80 p-2 rounded-xl border border-purple-500/20">
                      <span className="font-mono text-base font-black text-ink dark:text-white tracking-widest">01097321202</span>
                      <span className="text-[10px] text-purple-600 font-bold">حساب المنصة الرسمي</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-ink dark:text-slate-200 mb-1">
                    {paymentMethod === "vodafone"
                      ? "رقم محفظة فودافون كاش التي حوّلت منها (للتأكيد):"
                      : "رقم الهاتف أو عنوان IPA الذي حوّلت منه (للتأكيد):"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={paymentMethod === "vodafone" ? "010xxxxxxxx" : "010xxxxxxxx أو username@instapay"}
                    value={phoneOrAccount}
                    onChange={(e) => setPhoneOrAccount(e.target.value)}
                    className="w-full rounded-2xl border border-sand bg-cream/40 p-3 text-xs font-semibold text-ink outline-none transition focus:border-coral dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmittingPay}
                    className="flex-1 rounded-2xl bg-coral p-3 text-center text-xs font-black text-white hover:bg-coralDark transition shadow-md shadow-coral/25 disabled:opacity-50"
                  >
                    {isSubmittingPay ? "جاري معالجة الدفع..." : `تأكيد الدفع (${selectedPaidWorkshop.priceEGP ?? 0} ج.م) ✓`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPaidWorkshop(null)}
                    className="rounded-2xl border border-sand px-4 py-3 text-xs font-bold text-ink/70 dark:border-slate-700 dark:text-slate-300"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}