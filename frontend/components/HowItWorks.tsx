const STEPS = [
  { n: 1, title: "اعمل طلب", desc: "اكتب مشكلتك وحدد المادة والوقت", color: "bg-mint" },
  { n: 2, title: "هنوصلك بأفضل مدرسين", desc: "هنختار لك أفضل 3 مدرسين مناسبين", color: "bg-sun" },
  { n: 3, title: "احجز الجلسة", desc: "اختار المدرس والوقت المناسب وادفع", color: "bg-lilac" },
  { n: 4, title: "تعلم وافهم", desc: "خد الجلسة واسأل براحتك", color: "bg-coral" },
  { n: 5, title: "اختبار وتقييم", desc: "حل اختبار صغير وقيم المدرس", color: "bg-mint" },
  { n: 6, title: "اكسب نقاط", desc: "اكسب نقاط واستبدلها بمكافآت", color: "bg-sun" },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
      <h2 className="mb-14 text-center text-4xl font-black text-ink">إزاي نشتغل؟</h2>

      <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-4">
        {STEPS.map((step, i) => (
          <div key={step.n} className="flex flex-1 items-start gap-4 md:flex-col md:items-center md:text-center">
            <div className="relative shrink-0">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-sand bg-white text-lg font-bold text-ink shadow-sm">
                {step.n}
              </div>
              <span className={`absolute -top-1 -left-1 h-4 w-4 rounded-full ${step.color} ring-2 ring-cream`} />
            </div>
            <div>
              <h3 className="font-bold text-ink">{step.title}</h3>
              <p className="mt-1 max-w-[10rem] text-sm leading-6 text-ink/50">{step.desc}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div
                aria-hidden
                className="mt-7 hidden h-px flex-1 border-t-2 border-dashed border-sand md:block"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
