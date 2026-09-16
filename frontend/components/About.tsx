import { Shield, Users, Heart, Award, Mail, Phone, MapPin } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="bg-ink py-24 text-cream">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-14 grid gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-bold text-sun">من نحن</p>
            <h2 className="mb-5 text-4xl font-black leading-tight">
              فك زنقة مش مجرد منصة،
              <br />
              إحنا معاك لحد ما تفهم.
            </h2>
            <p className="text-base leading-8 text-cream/70">
              فكرة فك زنقة جاية من خبرة واقع: كتير من الطلبة في الجامعات المصرية بيلاقوا صعوبة في فهم مادة معينة،
              ومش عارفين يروحوا لمين — والخصوصي غالي وساعات مش مرتب بمستواهم. إحنا هنا عشان نربط بين الطالب اللي محتاج
              مساعدة وبين مدرس جامعي شاطر ومُعتمد بخصم واضح، وبتيرة بسيطة، وبضمان.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Users, title: "+٢٬١٠٠", sub: "طالب ومدرس" },
              { icon: Award, title: "+١٢٬٠٠٠", sub: "جلسة مكتملة" },
              { icon: Shield, title: "١٠٠٪", sub: "دفع آمن ومضمون" },
              { icon: Heart, title: "٤.٩/٥", sub: "معدل رضا المستخدمين" },
            ].map((s) => (
              <div
                key={s.sub}
                className="rounded-3xl border border-cream/10 bg-cream/5 p-5 backdrop-blur"
              >
                <s.icon className="mb-3 h-6 w-6 text-sun" />
                <div className="text-2xl font-black">{s.title}</div>
                <div className="text-xs font-bold text-cream/50">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 rounded-[2rem] border border-cream/10 bg-cream/5 p-8 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <h3 className="mb-3 text-xl font-black">تواصل معانا</h3>
            <p className="mb-5 max-w-md text-sm leading-7 text-cream/60">
              عندك سؤال، اقتراح، أو مشكلة؟ فريق الدعم بتاعنا شغال طول أيام الأسبوع عشان نجاوبك بسرعة.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sun/15 text-sun">
                  <Mail className="h-4 w-4" />
                </span>
                fokzanqa@gmail.com
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-mint/15 text-mint">
                  <Phone className="h-4 w-4" />
                </span>
                01097321202 — 01020246369              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-lilac/15 text-lilac">
                  <MapPin className="h-4 w-4" />
                </span>
                مصر - المنصوره
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-black text-sun">روابط سريعة</h4>
            <ul className="space-y-2 text-sm text-cream/70">
              <li><a href="/login" className="hover:text-sun">تسجيل الدخول</a></li>
              <li><a href="/register" className="hover:text-sun">إنشاء حساب</a></li>
              <li><a href="#workshops" className="hover:text-sun">ورش العمل</a></li>
              <li><a href="#tutors" className="hover:text-sun">المدرسين</a></li>
              <li><a href="/register" className="hover:text-sun">تقديم طلب كمدرس</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-black text-sun">سياسات المنصة</h4>
            <ul className="space-y-2 text-sm text-cream/70">
              <li><a href="#" className="hover:text-sun">الأسئلة الشائعة</a></li>
              <li><a href="#" className="hover:text-sun">شروط الاستخدام</a></li>
              <li><a href="#" className="hover:text-sun">سياسة الخصوصية</a></li>
            </ul>
          </div>
        </div>

        <p className="mt-12 border-t border-cream/10 pt-6 text-center text-xs text-cream/40">
          © {new Date().getFullYear()} فك زنقة — جميع الحقوق محفوظة · صنع بحب للأغلبية في كل جامعات مصر 🇪🇬
        </p>
      </div>
    </section>
  );
}
