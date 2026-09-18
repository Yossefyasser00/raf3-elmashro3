"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Star,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Users,
  Award,
  DollarSign,
  Video,
  MapPin,
  TrendingUp,
  Share2,
} from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";

interface TutorProfileData {
  id: string;
  bio?: string | null;
  teachingMode: "ONLINE" | "IN_PERSON" | "BOTH";
  priceMinEGP?: number | null;
  priceMaxEGP?: number | null;
  isVerified: boolean;
  ratingAvg: number;
  completedSessionsCount: number;
  studentsHelpedCount: number;
  responseRatePct: number;
  successRatePct: number;
  user: {
    fullName: string;
    avatarUrl?: string | null;
    createdAt: string;
  };
  university?: { name: string } | null;
  faculty?: { name: string } | null;
  department?: { name: string } | null;
  subjects: Array<{
    subject: { id: string; name: string };
  }>;
  workshops?: Array<{
    id: string;
    title: string;
    description?: string | null;
    type: "FREE" | "PAID";
    priceEGP?: number | null;
    startsAt: string;
    endsAt: string;
    youtubeVideoId?: string | null;
    thumbnailUrl?: string | null;
  }>;
  reviewsReceived: Array<{
    id: string;
    overallRating: number;
    explanationRating?: number;
    communicationRating?: number;
    helpfulnessRating?: number;
    comment?: string | null;
    createdAt: string;
    author: {
      fullName: string;
      avatarUrl?: string | null;
    };
  }>;
}

export default function TutorPublicProfilePage() {
  const params = useParams();
  const tutorId = params?.id as string;

  const [tutor, setTutor] = useState<TutorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!tutorId) return;

    async function loadTutorProfile() {
      setLoading(true);
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
        const res = await fetch(`${apiBase}/api/v1/tutors/profile/${tutorId}`);
        if (!res.ok) {
          throw new Error("تعذر العثور على بروفايل المدرس");
        }
        const data = await res.json();
        setTutor(data);
      } catch (err: any) {
        setError(err.message || "حدث خطأ أثناء تحميل الملف الشخصي");
      } finally {
        setLoading(false);
      }
    }

    loadTutorProfile();
  }, [tutorId]);

  function handleShare() {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-cream px-4 py-16 transition-colors dark:bg-[#0B0F19] text-ink dark:text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-coral border-t-transparent" />
          <p className="text-sm font-bold text-ink/60 dark:text-slate-400">جاري تحميل بروفايل المدرس...</p>
        </div>
      </main>
    );
  }

  if (error || !tutor) {
    return (
      <main className="min-h-screen bg-cream px-4 py-16 transition-colors dark:bg-[#0B0F19] text-ink dark:text-slate-100">
        <div className="mx-auto max-w-xl rounded-3xl border border-sand bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-coral/10 text-3xl">
            🔍
          </div>
          <h1 className="text-2xl font-black text-ink dark:text-white">لم نتمكن من العثور على المدرس</h1>
          <p className="mt-2 text-sm text-ink/60 dark:text-slate-400">{error || "تأكد من صحة الرابط"}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/tutors"
              className="rounded-full bg-coral px-6 py-2.5 text-xs font-black text-white hover:bg-coralDark"
            >
              استعراض المدرسين
            </Link>
            <Link
              href="/"
              className="rounded-full border border-sand px-6 py-2.5 text-xs font-black text-ink/70 dark:border-slate-700 dark:text-slate-300"
            >
              الرئيسية
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const teachingModeLabel =
    tutor.teachingMode === "ONLINE"
      ? "أونلاين فقط 💻"
      : tutor.teachingMode === "IN_PERSON"
      ? "حضوري فقط 🏫"
      : "أونلاين وحضوري 💻🏫";

  return (
    <main className="min-h-screen bg-cream pb-24 pt-6 transition-colors duration-300 dark:bg-[#0B0F19]">
      {/* Top Bar Navigation */}
      <header className="mx-auto max-w-6xl px-4 sm:px-6 mb-6">
        <div className="flex items-center justify-between rounded-2xl border border-sand bg-white/80 p-4 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
          <Link
            href="/tutors"
            className="inline-flex items-center gap-2 text-xs font-black text-ink/70 hover:text-coral dark:text-slate-300 dark:hover:text-coral transition"
          >
            <ArrowRight className="h-4 w-4" />
            تصفح جميع المدرسين
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-full border border-sand bg-cream/50 px-3.5 py-1.5 text-xs font-bold text-ink/70 hover:bg-cream dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition"
            >
              <Share2 className="h-3.5 w-3.5" />
              {copied ? "تم النسخ ✓" : "مشاركة البروفايل"}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Left/Center Content (2 Columns on large screens) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Header Profile Card */}
            <div className="relative overflow-hidden rounded-3xl border border-sand bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              {/* Decorative accent top stripe */}
              <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-coral via-lilac to-mint" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-2">
                {/* Avatar */}
                <div className="relative">
                  <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl border-2 border-sand bg-sand/30 flex items-center justify-center overflow-hidden shadow-md dark:border-slate-700">
                    {tutor.user.avatarUrl ? (
                      <img
                        src={tutor.user.avatarUrl}
                        alt={tutor.user.fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-black text-ink/40 dark:text-slate-500">
                        {tutor.user.fullName.charAt(0)}
                      </span>
                    )}
                  </div>
                  {tutor.isVerified && (
                    <div
                      title="مدرس معتمد وموثق"
                      className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-xl bg-mint text-white shadow-md ring-2 ring-white dark:ring-slate-900"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-ink dark:text-white truncate">
                      {tutor.user.fullName}
                    </h1>
                    {tutor.isVerified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-mint/15 px-3 py-1 text-[11px] font-black text-mint">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        موثق رسمياً
                      </span>
                    )}
                  </div>

                  <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-ink/60 dark:text-slate-400">
                    <GraduationCap className="h-4 w-4 text-coral" />
                    {tutor.faculty?.name || "كلية الهندسة والعلوم"} · {tutor.university?.name || "جامعة معتمدة"}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-semibold text-ink/70 dark:text-slate-300">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span>{tutor.ratingAvg ? tutor.ratingAvg.toFixed(1) : "5.0"}</span>
                      <span className="text-ink/40 dark:text-slate-500 font-normal">
                        ({tutor.reviewsReceived.length} تقييم)
                      </span>
                    </div>
                    <span className="text-ink/20 dark:text-slate-700">•</span>
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-ink/50 dark:text-slate-400" />
                      <span>{tutor.studentsHelpedCount || 12}+ طالب</span>
                    </div>
                    <span className="text-ink/20 dark:text-slate-700">•</span>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-mint" />
                      <span>{tutor.completedSessionsCount || 18} حصة مكتملة</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-sand bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="text-2xl font-black text-coral">
                  {tutor.completedSessionsCount || 18}
                </div>
                <div className="mt-0.5 text-[11px] font-bold text-ink/50 dark:text-slate-400">
                  جلسة مكتملة
                </div>
              </div>
              <div className="rounded-2xl border border-sand bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="text-2xl font-black text-mint">
                  {tutor.studentsHelpedCount || 12}
                </div>
                <div className="mt-0.5 text-[11px] font-bold text-ink/50 dark:text-slate-400">
                  طالب تم مساعدتهم
                </div>
              </div>
              <div className="rounded-2xl border border-sand bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="text-2xl font-black text-lilac">
                  {tutor.successRatePct ? `${Math.round(tutor.successRatePct)}%` : "100%"}
                </div>
                <div className="mt-0.5 text-[11px] font-bold text-ink/50 dark:text-slate-400">
                  نسبة الرضا
                </div>
              </div>
              <div className="rounded-2xl border border-sand bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="text-2xl font-black text-amber-500">
                  {tutor.ratingAvg ? `${tutor.ratingAvg.toFixed(1)} ⭐` : "5.0 ⭐"}
                </div>
                <div className="mt-0.5 text-[11px] font-bold text-ink/50 dark:text-slate-400">
                  التقييم الإجمالي
                </div>
              </div>
            </div>

            {/* About / Bio Section */}
            <div className="rounded-3xl border border-sand bg-white p-6 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
              <h2 className="text-lg font-black text-ink dark:text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-coral" />
                نبذة عن المدرس
              </h2>
              <div className="text-sm leading-relaxed text-ink/80 dark:text-slate-300 whitespace-pre-line font-medium">
                {tutor.bio ||
                  "مدرس متخصص وموثق في منصة فك زنقة. يقدم شروحات مبسطة ومباشرة تركز على حل المسائل ونماذج الامتحانات وفهم المفاهيم الأساسية بسرعة واحترافية."}
              </div>
            </div>

            {/* Subjects & Topics (المواد التي يدرّسها) */}
            <div className="rounded-3xl border border-sand bg-white p-6 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-ink dark:text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-mint" />
                  المواد التي يدرسها ({tutor.subjects.length || 0})
                </h2>
                <span className="text-xs font-bold text-ink/40 dark:text-slate-500">
                  جاهز لمساعدتك في أي منها
                </span>
              </div>

              {tutor.subjects.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {tutor.subjects.map(({ subject }) => (
                    <span
                      key={subject.id}
                      className="inline-flex items-center gap-1.5 rounded-2xl border border-sand bg-cream/70 px-4 py-2 text-xs font-bold text-ink shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition hover:border-mint hover:bg-mint/10"
                    >
                      <span className="h-2 w-2 rounded-full bg-mint" />
                      {subject.name}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-sand bg-cream/30 p-6 text-center text-xs font-bold text-ink/50 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                  لم يتم إضافة مواد محددة بعد — تواصل مع المدرس لمعرفة مواده المتاحة.
                </div>
              )}
            </div>

            {/* Tutor Workshops Section (ورش العمل الخاصة بالمدرس) */}
            <div className="rounded-3xl border border-sand bg-white p-6 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-ink dark:text-white flex items-center gap-2">
                  <Video className="h-5 w-5 text-coral" />
                  ورش العمل الخاصة بالمدرس ({tutor.workshops?.length || 0})
                </h2>
                <Link
                  href="/workshops"
                  className="text-xs font-bold text-coral hover:underline"
                >
                  عرض جميع الورش
                </Link>
              </div>

              {tutor.workshops && tutor.workshops.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tutor.workshops.map((ws) => {
                    const wsDate = new Date(ws.startsAt);
                    const isWsFree = ws.type === "FREE";

                    return (
                      <div
                        key={ws.id}
                        className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-sand bg-cream/30 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-800/60"
                      >
                        {ws.thumbnailUrl ? (
                          <div className="relative h-32 w-full overflow-hidden bg-sand/30">
                            <img
                              src={ws.thumbnailUrl}
                              alt={ws.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute top-2 right-2">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-black shadow ${
                                  isWsFree ? "bg-mint text-white" : "bg-coral text-white"
                                }`}
                              >
                                {isWsFree ? "مجانية 🎁" : `${ws.priceEGP ?? 0} ج.م`}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="relative h-24 w-full bg-gradient-to-br from-coral/15 to-mint/15 flex items-center justify-center">
                            <span className="text-2xl">🎬</span>
                            <div className="absolute top-2 right-2">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                                  isWsFree ? "bg-mint text-white" : "bg-coral text-white"
                                }`}
                              >
                                {isWsFree ? "مجانية 🎁" : `${ws.priceEGP ?? 0} ج.م`}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-sm font-black text-ink dark:text-white line-clamp-1">
                              {ws.title}
                            </h3>
                            <p className="mt-1 text-[11px] leading-relaxed text-ink/60 dark:text-slate-300 line-clamp-2">
                              {ws.description || "ورشة عمل وتدريب مكثف على المسائل ونماذج الامتحانات."}
                            </p>
                          </div>

                          <div className="mt-3 pt-3 border-t border-sand/50 dark:border-slate-700 space-y-2.5">
                            <div className="flex items-center justify-between text-[10px] font-semibold text-ink/60 dark:text-slate-400">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-coral" />
                                <span>{wsDate.toLocaleDateString("ar-EG", { month: "short", day: "numeric" })}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-coral" />
                                <span>{wsDate.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</span>
                              </div>
                            </div>

                            {/* Action Button: Watch vs Pay */}
                            {isWsFree ? (
                              ws.youtubeVideoId ? (
                                <a
                                  href={`https://www.youtube.com/watch?v=${ws.youtubeVideoId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full rounded-xl bg-red-600 p-2 text-center text-[11px] font-black text-white hover:bg-red-700 transition flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                  <span>شاهد الآن 🎬 (يوتيوب)</span>
                                </a>
                              ) : (
                                <Link
                                  href="/workshops"
                                  className="w-full rounded-xl bg-mint p-2 text-center text-[11px] font-black text-white hover:brightness-95 transition flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                  <span>شاهد الآن 🎬 (مجانية)</span>
                                </Link>
                              )
                            ) : (
                              <Link
                                href="/workshops"
                                className="w-full rounded-xl bg-coral p-2 text-center text-[11px] font-black text-white hover:bg-coralDark transition flex items-center justify-center gap-1.5 shadow-md shadow-coral/20"
                              >
                                <span>ادفع الآن 💳 ({ws.priceEGP ?? 0} ج.م)</span>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-sand bg-cream/20 p-6 text-center text-xs font-bold text-ink/50 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                  🎬 لم يقم المدرس بنشر ورش عمل حتى الآن.
                </div>
              )}
            </div>

            {/* Student Reviews Section (تقييمات الطلاب) */}
            <div className="rounded-3xl border border-sand bg-white p-6 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-ink dark:text-white flex items-center gap-2">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  تقييمات وآراء الطلاب ({tutor.reviewsReceived.length})
                </h2>
                {tutor.reviewsReceived.length > 0 && (
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    متوسط {tutor.ratingAvg ? tutor.ratingAvg.toFixed(1) : "5.0"} من 5
                  </span>
                )}
              </div>

              {tutor.reviewsReceived.length > 0 ? (
                <div className="space-y-4">
                  {tutor.reviewsReceived.map((rev) => (
                    <div
                      key={rev.id}
                      className="rounded-2xl border border-sand bg-cream/30 p-4 dark:border-slate-800 dark:bg-slate-800/60"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-sand/40 flex items-center justify-center font-bold text-sm text-ink/60 dark:bg-slate-700 dark:text-slate-300">
                            {rev.author.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-black text-ink dark:text-slate-200">
                              {rev.author.fullName}
                            </div>
                            <div className="text-[10px] text-ink/40 dark:text-slate-500">
                              {new Date(rev.createdAt).toLocaleDateString("ar-EG")}
                            </div>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < rev.overallRating ? "fill-amber-400 text-amber-400" : "text-sand dark:text-slate-700"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {rev.comment && (
                        <p className="mt-3 text-xs leading-relaxed text-ink/80 dark:text-slate-300 font-medium">
                          "{rev.comment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-sand bg-cream/20 p-8 text-center text-xs font-bold text-ink/50 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                  ⭐ لا توجد تقييمات مسجلة حتى الآن. احجز أول جلسة وشارك تجربتك!
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Booking & Pricing Action Card */}
          <div className="space-y-6">
            <div className="sticky top-6 rounded-3xl border border-sand bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 space-y-6">
              {/* Pricing Box */}
              <div className="rounded-2xl bg-cream/60 p-4 text-center dark:bg-slate-800/80 border border-sand dark:border-slate-700">
                <div className="text-[11px] font-bold text-ink/50 dark:text-slate-400">
                  سعر الجلسة التقديري
                </div>
                <div className="mt-1 flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-black text-mint">
                    {tutor.priceMinEGP ? `${tutor.priceMinEGP}` : "150"}
                    {tutor.priceMaxEGP && tutor.priceMaxEGP !== tutor.priceMinEGP
                      ? ` - ${tutor.priceMaxEGP}`
                      : ""}
                  </span>
                  <span className="text-xs font-bold text-ink/60 dark:text-slate-400">
                    ج.م / الحصة
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-ink/40 dark:text-slate-500">
                  يشمل شرح المسائل ونماذج الامتحانات مع متابعة فورية
                </p>
              </div>

              {/* Teaching Mode Features */}
              <div className="space-y-2.5 text-xs font-semibold text-ink/80 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-mint shrink-0" />
                  <span>طريقة التدريس: <strong>{teachingModeLabel}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-mint shrink-0" />
                  <span>ضمان استرداد كامل في حال عدم الرضا</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-mint shrink-0" />
                  <span>دفع آمن عبر فودافون كاش أو إنستاباي</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-mint shrink-0" />
                  <span>تسجيل الجلسة وملخص PDF بعد الانتهاء</span>
                </div>
              </div>



              <div className="border-t border-sand dark:border-slate-800 pt-4 text-center">
                <p className="text-[11px] font-bold text-ink/40 dark:text-slate-500">
                  🔒 معتمد من منصة فك زنقة التعليمية
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}