"use client";

import { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";

const SUBJECTS = ["الكيمياء", "الفيزياء", "الرياضيات", "الأحياء", "برمجة", "إنجليزي", "عربي", "أخرى"];

export default function NewRequestCTA() {
  const [subject, setSubject] = useState<string | null>(null);
  const [desc, setDesc] = useState("");
  const [budget, setBudget] = useState(200);
  const [submitting, setSubmitting] = useState(false);

  return (
    <section id="new-request" className="relative overflow-hidden py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-sun/20 via-cream to-lilac/10" />
      <div className="mx-auto max-w-4xl px-6 lg:px-10">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-bold text-coral">جاهز تبدأ؟</p>
          <h2 className="text-4xl font-black leading-tight text-ink">
            قولنا إيه اللي مزنقك — واحنا نوصلك بالمدرس في غضون ساعة.
          </h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitting(true);
            setTimeout(() => {
              if (typeof window !== "undefined") {
                const token = localStorage.getItem("fz_token");
                if (!token) {
                  window.location.href = "/login";
                } else {
                  const qs = new URLSearchParams();
                  if (subject) qs.set("subject", subject);
                  if (desc) qs.set("desc", desc);
                  if (budget) qs.set("budget", budget.toString());
                  window.location.href = `/requests/new?${qs.toString()}`;
                }
              }
            }, 600);
          }}
          className="space-y-6 rounded-[2.5rem] border border-sand bg-white p-8 shadow-2xl shadow-coral/5"
        >
          <div>
            <label className="mb-3 block text-sm font-bold text-ink">المادة اللي محتاجها</label>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  className={
                    "rounded-full border px-4 py-2 text-sm font-bold transition " +
                    (subject === s
                      ? "border-coral bg-coral/10 text-coral ring-2 ring-coral/30"
                      : "border-sand text-ink/70 hover:border-coral hover:text-coral")
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label htmlFor="lp-desc" className="mb-2 block text-sm font-bold text-ink">
                شوية تفاصيل عن مشكلتك
              </label>
              <input
                id="lp-desc"
                type="text"
                required
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="مثال: مش فاهم الفصل التالت في كيمياء عضوية + عايز حل مسائل"
                className="w-full rounded-2xl border border-sand bg-transparent p-3.5 text-sm font-bold text-ink outline-none transition focus:border-coral"
              />
            </div>
            <div>
              <label htmlFor="lp-budget" className="mb-2 block text-sm font-bold text-ink">
                ميزانيتك (جنيه)
              </label>
              <input
                id="lp-budget"
                type="number"
                min={50}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                placeholder="200"
                className="w-full rounded-2xl border border-sand bg-transparent p-3.5 text-sm font-bold text-ink outline-none transition focus:border-coral"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-coral py-4 text-base font-black text-white shadow-lg shadow-coral/30 transition hover:bg-coralDark disabled:opacity-60"
          >
            {submitting ? (
              <>
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                بننقلك لصفحة الطلب...
              </>
            ) : (
              <>
                <ArrowLeft className="h-5 w-5" />
                ابدأ بنشر الطلب دلوقتي
                <Send className="h-4 w-4 opacity-80" />
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
