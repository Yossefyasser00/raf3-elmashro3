"use client";

import { useState } from "react";
import { CheckCircle2, Sparkles, Video, GraduationCap, DollarSign, ArrowLeft } from "lucide-react";

export default function TeacherApplySection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [university, setUniversity] = useState("جامعة القاهرة");
  const [faculty, setFaculty] = useState("");
  const [experience, setExperience] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const token = window.localStorage.getItem("fz_token");
    if (!token) {
      setError("سجل دخولك أولاً ثم أرسل طلب الانضمام كمعلم.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/tutors/apply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            universityName: university,
            facultyName: faculty,
            experienceSummary: experience,
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message ?? "تعذر إرسال الطلب للمراجعة.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("تعذر الاتصال بالسيرفر. حاول مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="apply-tutor" className="mx-auto max-w-7xl px-6 py-16 lg:px-10 font-arabic">
      <div className="rounded-[2.5rem] border border-mint/30 bg-gradient-to-br from-mint/15 via-cream to-white p-8 md:p-14 shadow-sm">
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-mint/20 px-3.5 py-1 text-xs font-black text-mint">
              <Sparkles className="h-4 w-4" />
              <span>انضم لنخبة المعلمين المعتمدين 👨‍🏫</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-ink leading-tight">
              عندك خبرة تدريس وعايز دخل إضافي محترم؟
            </h2>

            <p className="text-ink/70 text-base leading-relaxed font-semibold">
              انضم لفريق فك زنقة وقدم شروحاتك ومساعدتك للطلاب في جامعتك أو أونلاين. حدد أسعارك وساعات عملك بنفسك واحصل على أرباحك فوراً بأقل عمولة في مصر.
            </p>

            <div className="grid gap-3 sm:grid-cols-2 text-xs font-bold text-ink">
              <div className="flex items-center gap-2 rounded-2xl bg-white p-3 border border-sand">
                <CheckCircle2 className="h-4 w-4 text-mint shrink-0" />
                <span>أرباح تصل إلى 15,000 ج.م شهرياً</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white p-3 border border-sand">
                <CheckCircle2 className="h-4 w-4 text-mint shrink-0" />
                <span>سحب أرباح لحظي عبر إنستاباي</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white p-3 border border-sand">
                <CheckCircle2 className="h-4 w-4 text-mint shrink-0" />
                <span>حرية اختيار مواعيد وتخصصات الشرح</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white p-3 border border-sand">
                <CheckCircle2 className="h-4 w-4 text-mint shrink-0" />
                <span>حماية كاملة لحقوقك المالية</span>
              </div>
            </div>

            <button
              onClick={() => { setModalOpen(true); setSubmitted(false); setError(null); }}
              className="inline-flex items-center gap-2 rounded-full bg-mint px-8 py-4 text-sm font-black text-white shadow-lg shadow-mint/30 hover:brightness-95 transition"
            >
              قدم طلب انضمام كمعلم الآن 🚀
            </button>
          </div>

          <div className="rounded-3xl border border-sand bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-black text-ink">خطوات الاعتماد في 3 خطوات بسيطة:</h3>
            <div className="space-y-3">
              {[
                { step: "1", title: "قدم طلبك الأكاديمي", desc: "اكتب جامعتك وخبرتك في المواد التي تجيد تدريسها." },
                { step: "2", title: "مراجعة واعتماد الأدمن", desc: "يقوم فريق الإدارة بفحص بياناتك وتفعيل حسابك ومنحك الشارة الموثقة." },
                { step: "3", title: "استقبل طلبات الطلاب واربح", desc: "يبدأ الطلاب بالتواصل معك وتأكيد الجلسات وسحب أرباحك دورياً." },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-3 rounded-2xl bg-cream/40 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-mint text-white font-black text-xs">
                    {s.step}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-ink">{s.title}</h4>
                    <p className="text-xs text-ink/60 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-sand bg-white p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-sand pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mint/15 text-xl text-mint">
                  👨‍🏫
                </div>
                <div>
                  <h3 className="text-lg font-black text-ink">طلب انضمام كمعلم معتمد</h3>
                  <p className="text-xs text-ink/50">سيتم مراجعة طلبك بواسطة أدمن المنصة خلال 24 ساعة.</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-full bg-ink/5 p-2 text-ink/60 hover:bg-ink/10"
              >
                ✕
              </button>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint/20 text-3xl">
                  🎉
                </div>
                <h4 className="text-xl font-black text-ink">تم إرسال طلبك بنجاح!</h4>
                <p className="text-xs text-ink/60 max-w-sm mx-auto">
                  تم إدراج طلبك في لوحة إدارة المنصة (Admin Portal) وسيتم إشعارك فور الاعتماد وتفعيل الصلاحيات.
                </p>
                <button
                  onClick={() => setModalOpen(false)}
                  className="mt-4 rounded-full bg-mint px-6 py-2.5 text-xs font-black text-white hover:brightness-95"
                >
                  إغلاق
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">الاسم الكامل</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: د. كريم سيد أحمد"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-2xl border border-sand bg-transparent p-3 text-xs font-bold text-ink outline-none focus:border-mint"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">البريد الإلكتروني</label>
                    <input
                      type="email"
                      required
                      placeholder="teacher@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-sand bg-transparent p-3 text-xs font-bold text-ink outline-none focus:border-mint"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">رقم الهاتف / الواتساب</label>
                    <input
                      type="tel"
                      required
                      placeholder="010xxxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-2xl border border-sand bg-transparent p-3 text-xs font-bold text-ink outline-none focus:border-mint"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">الجامعة</label>
                    <select
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      className="w-full rounded-2xl border border-sand bg-transparent p-3 text-xs outline-none font-bold text-ink"
                    >
                      <option value="جامعة القاهرة">جامعة القاهرة</option>
                      <option value="جامعة عين شمس">جامعة عين شمس</option>
                      <option value="جامعة الإسكندرية">جامعة الإسكندرية</option>
                      <option value="جامعة حلوان">جامعة حلوان</option>
                      <option value="جامعة المنصورة">جامعة المنصورة</option>
                      <option value="أخرى">أخرى</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">الكلية والتخصص</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: هندسة / علوم / تجارة"
                      value={faculty}
                      onChange={(e) => setFaculty(e.target.value)}
                      className="w-full rounded-2xl border border-sand bg-transparent p-3 text-xs font-bold text-ink outline-none focus:border-mint"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">ملخص خبرتك والمواد التي تدرسها</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="اكتب نبذة عن خبرتك التدريسية والمقررات التي يمكنك شرحها..."
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full rounded-2xl border border-sand bg-transparent p-3 text-xs font-bold text-ink outline-none focus:border-mint"
                  />
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-full border border-sand px-4 py-2 text-xs font-bold text-ink/70"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full bg-mint px-6 py-2.5 text-xs font-black text-white hover:brightness-95 shadow-md shadow-mint/20"
                  >
                    {submitting ? "جارٍ الإرسال..." : "إرسال الطلب للمراجعة ✓"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
