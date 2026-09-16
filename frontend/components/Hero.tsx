"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star, Video, FlaskConical, Search, Sparkles, CheckCircle2, Shield } from "lucide-react";

const POPULAR_SUBJECTS = [
  "الكيمياء العضوية",
  "الفيزياء الهندسية",
  "تفاضل وتكامل ٢",
  "خوارزميات وهياكل بيانات",
  "علم الأدوية (فارما)",
  "محاسبة مالية",
];

export default function Hero() {
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = POPULAR_SUBJECTS.filter((s) =>
    s.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-16 pt-8 lg:grid-cols-2 lg:px-10 font-arabic">
      {/* Text column */}
      <div className="order-2 lg:order-1 space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-coral/10 border border-coral/30 px-4 py-1.5 text-xs font-black text-coral">
          <Sparkles className="h-4 w-4" />
          <span>منصة الإنقاذ الأكاديمي الأولى لطلاب الجامعات 🇪🇬</span>
        </div>

        <h1 className="text-5xl font-black leading-[1.18] text-ink sm:text-6xl">
          إيـه اللـي
          <br />
          <span className="text-coral">مـزنـوق</span> فيـه؟
        </h1>

        <p className="max-w-lg text-base sm:text-lg leading-relaxed text-ink/70 font-semibold">
          امتحانك بكره ومش فاهم؟ اكتب مشكلتك بالتفصيل واحنا هنوصلك بأفضل مدرس جامعي معتمد يشرحلك ويفهمك في نفس اليوم.
        </p>

        {/* Live Subject Search Input */}
        <div className="rounded-3xl border border-sand bg-white p-2 shadow-lg shadow-ink/5 max-w-lg relative">
          <div className="flex items-center gap-2 px-3 py-1">
            <Search className="h-5 w-5 text-coral shrink-0" />
            <input
              type="text"
              placeholder="ابحث عن مادتك (مثلاً: كيمياء عضوية، فيزياء، برمجة...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm font-bold text-ink outline-none placeholder:text-ink/40"
            />
            <Link
              href="/requests/new"
              className="rounded-full bg-coral px-5 py-2.5 text-xs font-black text-white hover:bg-coralDark transition shrink-0"
            >
              افك زنقتي
            </Link>
          </div>

          {searchTerm && (
            <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-sand bg-white p-3 shadow-xl z-20 space-y-1">
              <div className="text-[11px] font-bold text-ink/40 px-2">نتائج فورية للمواد:</div>
              {filtered.map((sub) => (
                <Link
                  key={sub}
                  href={`/requests/new?subject=${encodeURIComponent(sub)}`}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-ink hover:bg-coral/10 hover:text-coral transition"
                >
                  <span>{sub}</span>
                  <span className="text-[10px] text-mint">مدرسين متاحين الآن ✓</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Popular Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-ink/50">أكثر المواد طلباً:</span>
          {POPULAR_SUBJECTS.slice(0, 4).map((s) => (
            <Link
              key={s}
              href={`/requests/new?subject=${encodeURIComponent(s)}`}
              className="rounded-full border border-sand bg-white px-3 py-1 text-[11px] font-bold text-ink/70 hover:border-coral hover:text-coral transition"
            >
              {s}
            </Link>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-sand/70">
          <div className="flex items-center gap-2 text-xs font-bold text-ink/80">
            <CheckCircle2 className="h-4 w-4 text-mint" />
            <span>+10,000 زنقة اتفكت بنجاح</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-ink/80">
            <Shield className="h-4 w-4 text-lilac" />
            <span>ضمان استرداد الأموال 100%</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-ink/80">
            <Star className="h-4 w-4 text-sun fill-sun" />
            <span>تقييم 4.9 من 5</span>
          </div>
        </div>
      </div>

      {/* Visual column with interactive cards */}
      <div className="relative order-1 mx-auto h-[460px] w-full max-w-md lg:order-2">
        {/* Yellow blob backdrop */}
        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-[45%_55%_60%_40%/50%_45%_55%_50%] bg-sun/80 shadow-2xl shadow-sun/40" />

        {/* Center avatar representation */}
        <div className="absolute left-1/2 top-1/2 flex h-80 w-64 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-white/90 to-cream/90 border-2 border-white shadow-2xl">
          <div className="text-center space-y-2">
            <span className="text-7xl block">🧑🏻‍🎓</span>
            <div className="font-black text-ink text-base">طالب في ورطة؟</div>
            <span className="inline-block rounded-full bg-mint/20 px-3 py-0.5 text-xs font-black text-mint">
              مدرسك متاح خلال 15 دقيقة
            </span>
          </div>
        </div>

        {/* Floating card 1: Top 3 Tutors */}
        <div className="absolute right-2 top-4 w-48 rounded-2xl bg-white p-3.5 shadow-xl shadow-ink/5 border border-sand/80 animate-bounce duration-1000">
          <p className="text-xs font-black text-ink">أفضل 3 مدرسين معتمدين</p>
          <p className="text-[11px] text-mint font-bold mb-2">متاحين لاختيارك فوراً</p>
          <div className="flex -space-x-2 space-x-reverse">
            {["👨🏻‍🏫", "👩🏽‍🏫", "🧑🏻‍🔬"].map((e, i) => (
              <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-sand text-sm">
                {e}
              </div>
            ))}
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-coral text-[11px] font-black text-white">
              +128
            </div>
          </div>
        </div>

        {/* Floating card 2: Fast Session Response */}
        <div className="absolute left-2 top-12 flex w-52 items-center gap-2.5 rounded-2xl bg-white p-3.5 shadow-xl shadow-ink/5 border border-sand/80">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint/15 text-xl">
            ⚡
          </div>
          <div>
            <p className="text-xs font-black text-ink">سرعة مطابقة قياسية</p>
            <p className="text-[11px] text-ink/50">أقل من 15 دقيقة</p>
          </div>
        </div>

        {/* Floating card 3: Subject card */}
        <div className="absolute bottom-6 left-4 flex w-52 items-center gap-2.5 rounded-2xl bg-white p-3.5 shadow-xl shadow-ink/5 border border-sand/80">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lilac/15 text-lilac">
            <FlaskConical className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-black text-ink">شرح + حل شيتات</p>
            <p className="text-[11px] text-coral font-bold">أونلاين أو في جامعتك</p>
          </div>
        </div>
      </div>
    </section>
  );
}
