import { Star, TrendingUp, Clock, GraduationCap } from "lucide-react";

const FEATURES = [
  {
    icon: Star,
    iconBg: "bg-sun/15",
    iconColor: "text-sun",
    title: "كسب نقاط ومكافآت",
    desc: "اكسب نقاط من كل طلب واستبدلها بمكافآت رائعة",
  },
  {
    icon: TrendingUp,
    iconBg: "bg-lilac/15",
    iconColor: "text-lilac",
    title: "متابعة بعد الجلسة",
    desc: "اختبار صغير بعد الجلسة علشان تتأكد إنك فهمت",
  },
  {
    icon: Clock,
    iconBg: "bg-coral/15",
    iconColor: "text-coral",
    title: "لأي مادة وفي أي وقت",
    desc: "اطلب مساعدة في أي مادة وفي الوقت اللي يناسبك",
  },
  {
    icon: GraduationCap,
    iconBg: "bg-mint/15",
    iconColor: "text-mint",
    title: "مدرسين متفهمين",
    desc: "مدرسين جامعيين شاطرين يفهموك بأسلوب بسيط",
  },
];

export default function FeatureStrip() {
  return (
    <section className="mx-auto max-w-7xl px-6 lg:px-10">
      <div className="grid grid-cols-1 gap-8 rounded-3xl border border-sand bg-white/60 p-8 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="flex items-start gap-4 text-right">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${f.iconBg}`}>
              <f.icon className={`h-5 w-5 ${f.iconColor}`} />
            </div>
            <div>
              <h3 className="font-bold text-ink">{f.title}</h3>
              <p className="mt-1 text-sm leading-6 text-ink/50">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
