"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, ShieldCheck, Clock, Award } from "lucide-react";

const FAQS = [
  {
    q: "إزاي منصة فك زنقة بتضمن إن المدرس هيفهمني بجد؟",
    a: "كل المدرسين بيمروا بمرحلة مراجعة وتدقيق من إدارة المنصة، وبتشوف تقييمات الطلاب الحقيقية ومعدل الجلسات المكتملة قبل ما تختار. بالإضافة إلى إن فلوسك محمية في المنصة لحد ما الجلسة تنتهي وتكون راضي تماماً.",
  },
  {
    q: "لو عندي امتحان بكره الصبح، في مدرس هيلحقني دلوقتي؟",
    a: "نعم! رادار فك زنقة بيدعم خاصية 'عاجل جداً ASAP'، والطلبات دي بتتبعت فوراً للمدرسين المتصلين وبيتطابق طلبك في أقل من 15 دقيقة لبدء الجلسة فوراً أونلاين.",
  },
  {
    q: "إيه الفرق بين الشرح الأونلاين والحضوري؟",
    a: "الشرح الأونلاين بيتم عبر قاعات فيديو تفاعلية مدمجة مع سبورة ذكية. أما الحضوري بيتم في أماكن دراسة معتمدة بالقرب من جامعتك مع رسوم بسيطة لتغطية المكان.",
  },
  {
    q: "إزاي نظام النقاط والمكافآت بيشتغل؟",
    a: "أول ما تسجل بتكسب 100 نقطة ترحيبية، وكل جلسة بتكملها وتكتب تقييم للمدرس بتكسب نقاط إضافية تقدر تستبدلها بخصومات كاش وورش عمل مجانية ليلة الامتحان.",
  },
  {
    q: "كيف يتم ضمان حقوق المعلمين واستلام الأرباح؟",
    a: "الطالب بيدفع المبلغ للمنصة قبل بدء الجلسة كوديعة آمنة، وفور انتهاء الجلسة بتتحول أرباح المعلم لمحفظته ويقدر يسحبها فوراً عبر إنستاباي أو فودافون كاش.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-5xl px-6 py-16 lg:px-10 font-arabic">
      <div className="text-center space-y-3 mb-12">
        <span className="rounded-full bg-lilac/15 px-3.5 py-1 text-xs font-black text-lilac">
          إجابات سريعة وواضحة 💡
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-ink">الأسئلة الأكثر شيوعاً</h2>
        <p className="text-xs sm:text-sm text-ink/60 max-w-md mx-auto">
          كل ما تحتاج معرفته عن طريقة عمل المنصة، الأمان، الدفع وحماية حقوق الطلاب والمعلمين.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="rounded-3xl border border-sand bg-white transition hover:border-lilac/40 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between p-5 text-right font-black text-ink text-sm sm:text-base gap-4"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`h-5 w-5 text-coral shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-sand/60 bg-cream/30 p-5 pt-3 text-xs sm:text-sm text-ink/70 leading-relaxed font-semibold">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
