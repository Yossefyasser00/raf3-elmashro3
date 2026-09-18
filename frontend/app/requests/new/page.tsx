"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, CheckCircle2, Clock, AlertTriangle, Video, MapPin, DollarSign, Building2 } from "lucide-react";

import { useSearchParams } from "next/navigation";

const SUBJECTS = [
  "الكيمياء العضوية",
  "الفيزياء الهندسية",
  "الرياضيات التطبيقية",
  "خوارزميات وبرمجة",
  "علم الأدوية (فارما)",
  "المحاسبة والمالية",
  "علم التشريح (Anatomy)",
  "مادة أخرى",
];

const UNIVERSITIES = [
  "جامعة المنصورة",
];

const DEFAULT_LOCATIONS = [
  { id: "loc-1", name: "مقر فك زنقة التعليمي — المنصورة (بجوار كلية هندسة)", address: "شارع جيهان، المنصورة", details: "قاعات مكيفة ومجهزة بالسبورات الذكية وواي فاي سريع" },
  { id: "loc-2", name: "مساحة عمل كروان (Karawan Workspace) — حي الجامعة", address: "أمام بوابة جامعة المنصورة الرئيسية", details: "غرف دراسة هادئة وخدمة مشروبات" },
  { id: "loc-3", name: "مساحة دافنشي الأكاديمية — بجوار كلية الطب", address: "شارع كلية الآداب، المنصورة", details: "بيئة دراسية مريحة ومناسبة للمذاكرة الجماعية" },
  { id: "loc-4", name: "ساحة المذاكرة المعتمدة — الحرم الجامعي", address: "داخل مجمع كليات جامعة المنصورة", details: "مكان معتمد ومجاني مخصص لطلاب الجامعة" },
];

export default function NewRequestPage() {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialSubject = searchParams?.get("subject") || SUBJECTS[0];
  const initialDesc = searchParams?.get("desc") || "";
  const initialBudget = Number(searchParams?.get("budget")) || 300;

  const [university, setUniversity] = useState("جامعة القاهرة");
  const [faculty, setFaculty] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [customSubject, setCustomSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState(initialDesc);
  const [mode, setMode] = useState<"ONLINE" | "IN_PERSON">("ONLINE");
  const [urgency, setUrgency] = useState<"LOW" | "MEDIUM" | "HIGH" | "ASAP">("ASAP");
  const [budget, setBudget] = useState(initialBudget);
  const [preferredDateTime, setPreferredDateTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // In-Person approved locations from Admin
  const [locations, setLocations] = useState<Array<{ id: string; name: string; address: string; details?: string }>>(DEFAULT_LOCATIONS);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("loc-1");

  useEffect(() => {
    async function fetchLocations() {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
        const res = await fetch(`${apiBase}/api/v1/requests/locations`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setLocations(data);
            setSelectedLocationId(data[0].id);
          }
        }
      } catch {
        // fallback to DEFAULT_LOCATIONS
      }
    }
    fetchLocations();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("fz_token") : null;
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const chosenLocation = mode === "IN_PERSON" ? locations.find(l => l.id === selectedLocationId) : null;
      const locationText = chosenLocation ? `[مكان الحضور المعتمد: ${chosenLocation.name} — ${chosenLocation.address}] ` : "";

      const actualSubject = selectedSubject === "مادة أخرى" ? (customSubject || "مادة دراسية") : selectedSubject;
      const cleanTopic = topic.trim();
      const fullDescription = `${locationText}[${actualSubject}] (${cleanTopic}) ${description}`;

      // POST /api/v1/requests
      const reqPayload = {
        description: fullDescription,
        teachingMode: mode,
        budgetEGP: budget,
        urgency: urgency,
        preferredAt: preferredDateTime ? new Date(preferredDateTime).toISOString() : new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reqPayload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "حدث خطأ أثناء إنشاء الطلب");
        setSubmitting(false);
        return;
      }

      const created = await res.json();

      // PATCH /api/v1/requests/:id/publish
      const pubRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/requests/${created.id}/publish`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (pubRes.ok) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = "/dashboard/student";
        }, 1500);
      } else {
        alert("فشل في نشر الطلب");
        setSubmitting(false);
      }
    } catch (err) {
      alert("حدث خطأ في الاتصال بالخادم");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-cream dark:bg-[#0B0F19] px-4 py-10 sm:px-6 lg:px-8 font-arabic transition-colors">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/dashboard/student"
          className="inline-flex items-center gap-2 text-xs font-bold text-ink/60 dark:text-slate-300 hover:text-coral transition"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة للوحة تحكم الطالب
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="rounded-full bg-coral/15 px-3 py-1 text-xs font-black text-coral">
              نموذج الاستغاثة الأكاديمية 🚨
            </span>
            <h1 className="mt-2 text-3xl font-black text-ink dark:text-slate-100">قولنا إيه اللي مزنقك بالضبط؟</h1>
            <p className="mt-1 text-xs sm:text-sm text-ink/60 dark:text-slate-400">
              هنحلل مشكلتك ونرشحلك أفضل 3 مدرسين متخصصين في تخصصك خلال دقائق.
            </p>
          </div>
        </div>

        {success ? (
          <div className="rounded-3xl border border-mint/40 bg-white dark:bg-slate-800 p-10 text-center space-y-4 shadow-xl animate-in zoom-in-95">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-mint/20 text-3xl text-mint">
              🎉
            </div>
            <h2 className="text-2xl font-black text-ink dark:text-slate-100">تم نشر زنقتك وبدء المطابقة!</h2>
            <p className="text-sm text-ink/60 dark:text-slate-400 max-w-md mx-auto">
              جاري توجيهك إلى لوحة التحكم لاختيار المدرس من بين أفضل 3 مرشحين متاحين الآن...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-sand dark:border-slate-700 bg-white dark:bg-slate-800/80 p-6 sm:p-8 shadow-sm">
            {/* University & Faculty */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-ink dark:text-slate-200 mb-1.5">الجامعة</label>
                <select
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full rounded-2xl border border-sand dark:border-slate-600 bg-white dark:bg-slate-900 p-3.5 text-xs font-bold text-ink dark:text-slate-100 outline-none focus:border-coral dark:focus:border-coral"
                >
                  {UNIVERSITIES.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink dark:text-slate-200 mb-1.5">الكلية أو القسم</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: كلية العلوم — قسم الكيمياء"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  className="w-full rounded-2xl border border-sand dark:border-slate-600 bg-white dark:bg-slate-900 p-3.5 text-xs font-bold text-ink dark:text-slate-100 outline-none focus:border-coral dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Subject Picker */}
            <div>
              <label className="block text-xs font-bold text-ink dark:text-slate-200 mb-2">المادة الدراسية</label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSubject(s)}
                    className={
                      "rounded-full px-4 py-2 text-xs font-bold transition " +
                      (selectedSubject === s
                        ? "bg-coral text-white shadow-md shadow-coral/25"
                        : "border border-sand dark:border-slate-600 bg-white dark:bg-slate-700 text-ink/70 dark:text-slate-300 hover:bg-cream dark:hover:bg-slate-600")
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
              {selectedSubject === "مادة أخرى" && (
                <input
                  type="text"
                  required
                  placeholder="اكتب اسم المادة..."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="mt-3 w-full rounded-2xl border border-sand dark:border-slate-600 bg-white dark:bg-slate-900 p-3.5 text-xs font-bold text-ink dark:text-slate-100 outline-none focus:border-coral dark:placeholder:text-slate-500"
                />
              )}
            </div>

            {/* Topic & Specific problem */}
            <div>
              <label className="block text-xs font-bold text-ink dark:text-slate-200 mb-1.5">
                اسم الشابتر / الموضوع بالظبط
              </label>
              <input
                type="text"
                required
                placeholder="مثال: تفاعلات الألكينات وميكانيكية الرنين، أو شيت 3 كيرشوف"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full rounded-2xl border border-sand dark:border-slate-600 bg-white dark:bg-slate-900 p-3.5 text-xs font-bold text-ink dark:text-slate-100 outline-none focus:border-coral dark:placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink dark:text-slate-200 mb-1.5">
                احكيلنا المشكلة بالتفصيل ومحتاج إيه من المدرس
              </label>
              <textarea
                required
                minLength={15}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="مثال: عندي امتحان ميدتيرم بعد بكره، مش فاهم المسائل رقم 4 و 7 في الشيت ومحتاج المدرس يحلها معايا خطوة بخطوة ويوضح الفكرة."
                className="w-full rounded-2xl border border-sand dark:border-slate-600 bg-white dark:bg-slate-900 p-4 text-xs font-semibold text-ink dark:text-slate-100 leading-relaxed outline-none focus:border-coral dark:placeholder:text-slate-500"
              />
            </div>

            {/* Teaching Mode & Urgency */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-ink dark:text-slate-200 mb-1.5">نمط الشرح المفضل</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode("ONLINE")}
                    className={
                      "flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition " +
                      (mode === "ONLINE"
                        ? "border-coral bg-coral/10 text-coral font-black"
                        : "border-sand dark:border-slate-600 bg-white dark:bg-slate-700 text-ink/70 dark:text-slate-300 hover:bg-cream dark:hover:bg-slate-600")
                    }
                  >
                    <Video className="h-4 w-4" />
                    أونلاين (قاعة فيديو)
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("IN_PERSON")}
                    className={
                      "flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition " +
                      (mode === "IN_PERSON"
                        ? "border-coral bg-coral/10 text-coral font-black"
                        : "border-sand dark:border-slate-600 bg-white dark:bg-slate-700 text-ink/70 dark:text-slate-300 hover:bg-cream dark:hover:bg-slate-600")
                    }
                  >
                    <MapPin className="h-4 w-4" />
                    حضوري (في الجامعة)
                  </button>
                </div>
              </div>

              {/* In-Person Approved Locations Selection */}
              {mode === "IN_PERSON" && (
                <div className="sm:col-span-2 rounded-3xl border border-coral/30 bg-coral/5 dark:bg-coral/10 dark:border-coral/20 p-4 sm:p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-coral/15 pb-2.5">
                    <label className="text-xs font-black text-ink dark:text-slate-200 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-coral" />
                      <span>اختر مكان الحضور المعتمد من إدارة المنصة:</span>
                    </label>
                    <span className="text-[10px] font-bold text-coral bg-coral/15 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                      أماكن آمنة ومجهزة 🏫
                    </span>
                  </div>
                  <p className="text-[11px] text-ink/70 dark:text-slate-400 leading-relaxed">
                    حرصاً على أمان الطلاب وجودة التجربة، تتم اللقاءات الحضورية حصراً داخل هذه الأماكن المعتمدة والمكيفة:
                  </p>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {locations.map((loc) => {
                      const isSelected = selectedLocationId === loc.id;
                      return (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => setSelectedLocationId(loc.id)}
                          className={`rounded-2xl border p-3 text-right transition flex items-start gap-3 ${
                            isSelected
                              ? "border-coral bg-white dark:bg-slate-700 shadow-md shadow-coral/10 ring-2 ring-coral/30"
                              : "border-sand/70 dark:border-slate-600 bg-white/80 dark:bg-slate-700/60 hover:bg-white dark:hover:bg-slate-700 hover:border-sand"
                          }`}
                        >
                          <div className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? "border-coral bg-coral text-white" : "border-sand dark:border-slate-500 bg-cream dark:bg-slate-600"
                          }`}>
                            {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="text-xs font-black text-ink dark:text-slate-100">{loc.name}</div>
                            <div className="text-[11px] text-ink/70 dark:text-slate-400 font-semibold">📍 {loc.address}</div>
                            {loc.details && (
                              <div className="text-[10px] text-ink/50 dark:text-slate-500">💡 {loc.details}</div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-ink dark:text-slate-200 mb-1.5">مستوى العجلة والوقت</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: "LOW", label: "هادي" },
                    { id: "MEDIUM", label: "متوسط" },
                    { id: "HIGH", label: "سريع" },
                    { id: "ASAP", label: "عاجل 🚨" },
                  ].map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setUrgency(u.id as any)}
                      className={
                        "rounded-xl border py-3 text-center text-xs font-bold transition " +
                        (urgency === u.id
                          ? "border-coral bg-coral text-white font-black shadow-sm"
                          : "border-sand dark:border-slate-600 bg-white dark:bg-slate-700 text-ink/70 dark:text-slate-300 hover:bg-cream dark:hover:bg-slate-600")
                      }
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Date & Time and Budget */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="preferred-time-input" className="text-xs font-bold text-ink dark:text-slate-200">
                    ⏰ موعد الحصة المطلوب
                  </label>
                  <span className="text-[11px] text-ink/50 dark:text-slate-400">اختياري أو حدد بدقة</span>
                </div>
                <input
                  id="preferred-time-input"
                  type="datetime-local"
                  value={preferredDateTime}
                  onChange={(e) => setPreferredDateTime(e.target.value)}
                  className="w-full rounded-2xl border border-sand dark:border-slate-600 bg-white dark:bg-slate-900 p-3.5 text-xs font-bold text-ink dark:text-slate-100 outline-none focus:border-coral"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    { label: "خلال ساعتين ⚡", getVal: () => new Date(Date.now() + 2 * 3600000).toISOString().slice(0, 16) },
                    { label: "اليوم مساءً 🌙", getVal: () => {
                      const d = new Date();
                      d.setHours(20, 0, 0, 0);
                      return d.toISOString().slice(0, 16);
                    }},
                    { label: "غداً ٥:٠٠ م 📅", getVal: () => {
                      const d = new Date(Date.now() + 86400000);
                      d.setHours(17, 0, 0, 0);
                      return d.toISOString().slice(0, 16);
                    }},
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreferredDateTime(preset.getVal())}
                      className="rounded-lg bg-sand/30 dark:bg-slate-700 hover:bg-sand/60 dark:hover:bg-slate-600 px-2.5 py-1 text-[11px] font-semibold text-ink/70 dark:text-slate-300 transition"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="budget-input" className="text-xs font-bold text-ink dark:text-slate-200">
                    💰 سعرك المقترح للحصة (ج.م)
                  </label>
                  <span className="text-[11px] text-mint font-bold">يمكن للمدرس الموافقة أو التفاوض</span>
                </div>
                <input
                  id="budget-input"
                  type="number"
                  min="50"
                  step="10"
                  required
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value) || 0)}
                  placeholder="مثال: 200"
                  className="w-full rounded-2xl border border-sand dark:border-slate-600 bg-white dark:bg-slate-900 p-3.5 text-xs font-bold text-ink dark:text-slate-100 outline-none focus:border-coral dark:placeholder:text-slate-500"
                />
                <p className="text-[11px] text-ink/50 dark:text-slate-400 mt-2">
                  المدرسون سيشاهدون هذا السعر والميعاد في رادار الطلبات ويمكنهم قبوله فوراً.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-coral py-4 text-sm font-black text-white shadow-lg shadow-coral/30 hover:bg-coralDark transition disabled:opacity-60"
            >
              <Sparkles className="h-5 w-5" />
              {submitting ? "جاري البحث ومطابقة أفضل 3 مدرسين..." : "انشر زنقتك ودورلي على مدرس الآن"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
