"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Star,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Filter,
  CheckCircle2,
  Users,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";

interface TutorListItem {
  id: string;
  bio?: string | null;
  teachingMode: "ONLINE" | "IN_PERSON" | "BOTH";
  priceMinEGP?: number | null;
  priceMaxEGP?: number | null;
  isVerified: boolean;
  ratingAvg: number;
  completedSessionsCount: number;
  studentsHelpedCount: number;
  user: {
    fullName: string;
    avatarUrl?: string | null;
  };
  university?: { name: string } | null;
  faculty?: { name: string } | null;
  subjects: Array<{
    subject: { id: string; name: string };
  }>;
  reviewsReceived: Array<{
    overallRating: number;
  }>;
}

export default function TutorsListingPage() {
  const [tutors, setTutors] = useState<TutorListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modeFilter, setModeFilter] = useState<"ALL" | "ONLINE" | "IN_PERSON">("ALL");

  useEffect(() => {
    async function fetchTutors() {
      setLoading(true);
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
        const res = await fetch(`${apiBase}/api/v1/tutors/all`);
        if (res.ok) {
          const data = await res.json();
          setTutors(data);
        }
      } catch (err) {
        console.error("Failed to load tutors", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTutors();
  }, []);

  const filteredTutors = tutors.filter((tutor) => {
    const nameMatch = tutor.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const facultyMatch = tutor.faculty?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const subjectMatch = tutor.subjects?.some((s) =>
      s.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const searchMatch = !searchTerm || nameMatch || facultyMatch || subjectMatch;

    const modeMatch =
      modeFilter === "ALL" ||
      tutor.teachingMode === modeFilter ||
      tutor.teachingMode === "BOTH";

    return searchMatch && modeMatch;
  });

  return (
    <main className="min-h-screen bg-cream pb-24 pt-6 transition-colors duration-300 dark:bg-[#0B0F19]">
      {/* Top Bar Header */}
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
              className="rounded-full bg-coral/15 px-4 py-1.5 text-xs font-black text-coral hover:bg-coral/25 transition"
            >
              لوحة تحكم الطالب
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Banner Section */}
        <div className="mb-10 text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-mint/15 px-4 py-1.5 text-xs font-black text-mint">
            <Sparkles className="h-3.5 w-3.5" />
            دليل المدرسين المعتمدين والموثقين
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-ink dark:text-white">
            اختر مدرسك المتخصص وابدأ جلستك الآن
          </h1>
          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-ink/60 dark:text-slate-400 font-medium">
            تصفح بروفايلات المدرسين، استكشف المواد والتقييمات الحقيقية من الطلاب، واحجز شرحك فورياً بأمان تام.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8 flex flex-col sm:flex-row gap-3 items-center justify-between rounded-3xl border border-sand bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40 dark:text-slate-500" />
            <input
              type="text"
              placeholder="ابحث باسم المدرس، المادة، أو الكلية..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-sand bg-cream/40 pr-10 pl-4 py-2.5 text-xs font-semibold text-ink outline-none transition focus:border-coral dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Mode Filters */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {[
              { id: "ALL", label: "جميع طرق التدريس" },
              { id: "ONLINE", label: "💻 أونلاين" },
              { id: "IN_PERSON", label: "🏫 حضوري" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setModeFilter(f.id as any)}
                className={`shrink-0 rounded-2xl px-4 py-2 text-xs font-black transition ${
                  modeFilter === f.id
                    ? "bg-ink text-white dark:bg-coral"
                    : "border border-sand bg-cream/30 text-ink/70 hover:bg-cream dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tutor Cards Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-coral border-t-transparent" />
            <p className="text-xs font-bold text-ink/50 dark:text-slate-400">جاري جلب بيانات المدرسين...</p>
          </div>
        ) : filteredTutors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutors.map((tutor) => {
              const reviewCount = tutor.reviewsReceived?.length || 0;
              const rating = tutor.ratingAvg || 5.0;

              return (
                <div
                  key={tutor.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-sand bg-white p-6 shadow-sm transition hover:shadow-xl hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900"
                >
                  {/* Card top accent */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-sand group-hover:bg-coral transition-colors duration-300" />

                  <div>
                    {/* Header info */}
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <div className="h-16 w-16 rounded-2xl border border-sand bg-sand/30 flex items-center justify-center overflow-hidden shadow-sm dark:border-slate-700">
                          {tutor.user.avatarUrl ? (
                            <img
                              src={tutor.user.avatarUrl}
                              alt={tutor.user.fullName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl font-black text-ink/40 dark:text-slate-500">
                              {tutor.user.fullName.charAt(0)}
                            </span>
                          )}
                        </div>
                        {tutor.isVerified && (
                          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-lg bg-mint text-white text-[10px] shadow">
                            ✓
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-black text-ink dark:text-white truncate">
                            {tutor.user.fullName}
                          </h3>
                        </div>
                        <p className="mt-0.5 text-[11px] font-bold text-ink/50 dark:text-slate-400 truncate">
                          {tutor.faculty?.name || "كلية الهندسة والعلوم"}
                        </p>

                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <div className="flex items-center gap-1 text-amber-500 font-black">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span>{rating.toFixed(1)}</span>
                          </div>
                          <span className="text-ink/30 dark:text-slate-600">({reviewCount} تقييم)</span>
                          <span className="text-ink/20 dark:text-slate-700">•</span>
                          <span className="text-[10px] font-bold text-mint">
                            {tutor.completedSessionsCount || 15}+ حصة
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bio snippet */}
                    <p className="mt-4 text-xs leading-relaxed text-ink/70 dark:text-slate-300 line-clamp-2 font-medium">
                      {tutor.bio ||
                        "مدرس معتمد وجاهز لمساعدتك في شرح المسائل والمفاهيم المعقدة ونماذج الامتحانات بأسلوب سهل وسريع."}
                    </p>

                    {/* Subjects Chips */}
                    <div className="mt-4">
                      <div className="mb-1.5 text-[10px] font-bold text-ink/40 dark:text-slate-500">
                        المواد التدريسية:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {tutor.subjects && tutor.subjects.length > 0 ? (
                          <>
                            {tutor.subjects.slice(0, 3).map(({ subject }) => (
                              <span
                                key={subject.id}
                                className="rounded-xl border border-sand bg-cream/60 px-2.5 py-1 text-[11px] font-bold text-ink/80 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                              >
                                {subject.name}
                              </span>
                            ))}
                            {tutor.subjects.length > 3 && (
                              <span className="rounded-xl bg-sand/30 px-2 py-1 text-[10px] font-bold text-ink/50 dark:text-slate-400">
                                +{tutor.subjects.length - 3} أخرى
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-[11px] text-ink/40 dark:text-slate-500 font-semibold">
                            مواد عامة وتخصصية
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Pricing & Action */}
                  <div className="mt-6 border-t border-sand dark:border-slate-800 pt-4 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-ink/40 dark:text-slate-500">
                        السعر للجلسة
                      </div>
                      <div className="text-sm font-black text-mint">
                        {tutor.priceMinEGP ? `${tutor.priceMinEGP} ج.م` : "150 ج.م"}
                      </div>
                    </div>

                    <Link
                      href={`/tutor/${tutor.id}`}
                      className="rounded-full bg-ink px-4 py-2 text-xs font-black text-cream hover:bg-coral hover:text-white transition dark:bg-slate-800 dark:text-white dark:hover:bg-coral"
                    >
                      عرض البروفايل 👤
                    </Link>
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
            <h3 className="text-lg font-black text-ink dark:text-white">لم يتم العثور على مدرسين مطابقين</h3>
            <p className="mt-1 text-xs text-ink/50 dark:text-slate-400">
              جرب تغيير كلمة البحث أو فلاتر طرق التدريس
            </p>
          </div>
        )}
      </div>
    </main>
  );
}