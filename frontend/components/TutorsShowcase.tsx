import Link from "next/link";
import { ArrowLeft, Star, ShieldCheck } from "lucide-react";

export default async function TutorsShowcase() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/tutors/featured`, {
    next: { revalidate: 60 },
  }).catch(() => null);
  
  const tutors = res?.ok ? await res.json() : [];

  return (
    <section id="tutors" className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-4 text-center">
          <p className="mb-2 text-sm font-bold text-mint">المدرسين</p>
          <h2 className="text-4xl font-black text-ink">مدرسين ذهبيين بانتظار مساعدتك</h2>
        </div>
        <p className="mx-auto mb-12 max-w-2xl text-center text-base leading-8 text-ink/60">
          كل مدرس في فك زنقة بيجي من أفضل الجامعات المصرية، وبيعدّم سيرته الذاتية وبيخلص مراجعة كاملة من إدارته قبل ما يبدأ يتلقى طلبات.
        </p>

        {tutors.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {tutors.map((tutor: any) => (
                <Link
                  key={tutor.id}
                  href={`/tutor/${tutor.id}`}
                  className="group rounded-3xl border border-sand bg-white p-6 shadow-sm transition hover:shadow-lg hover:-translate-y-1 block"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-sand/30 flex items-center justify-center overflow-hidden shrink-0 border border-sand">
                      {tutor.user?.avatarUrl ? (
                        <img src={tutor.user.avatarUrl} alt={tutor.user.fullName} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-ink/50">{tutor.user?.fullName?.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <h3 className="text-lg font-bold text-ink group-hover:text-coral transition truncate">{tutor.user?.fullName}</h3>
                        <ShieldCheck className="h-4 w-4 text-mint shrink-0" />
                      </div>
                      <p className="text-xs font-bold text-ink/60 truncate">{tutor.faculty?.name || 'مدرس معتمد'}</p>
                      <div className="mt-1 flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>{tutor.ratingAvg ? tutor.ratingAvg.toFixed(1) : "5.0"} ⭐</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-xs font-medium text-ink/70 line-clamp-2 leading-relaxed">
                    {tutor.bio || 'مدرس موثق وجاهز لمساعدتك في موادك الجامعية بأفضل طرق الشرح.'}
                  </div>
                  <div className="mt-4 border-t border-sand/60 pt-3 flex items-center justify-between text-xs font-black text-coral">
                    <span>عرض البروفايل الكامل</span>
                    <ArrowLeft className="h-3.5 w-3.5 transition transform group-hover:-translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/tutors"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-8 py-3.5 text-xs font-black text-cream hover:bg-coral hover:text-white transition shadow-md"
              >
                <span>استعراض جميع المدرسين المعتمدين 🎓</span>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-sand bg-white p-10 text-center text-ink/60">
            سيتم عرض المدرسين المعتمدين هنا بعد انضمامهم ومراجعة بياناتهم.
          </div>
        )}
      </div>
    </section>
  );
}

