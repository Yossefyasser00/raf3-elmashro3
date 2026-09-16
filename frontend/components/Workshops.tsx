import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Play, CreditCard } from "lucide-react";

export default async function Workshops() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/workshops/featured`, {
    next: { revalidate: 60 },
  }).catch(() => null);
  
  const workshops = res?.ok ? await res.json() : [];

  return (
    <section id="workshops" className="bg-ink/[0.02] py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-bold text-coral">ورش العمل</p>
            <h2 className="text-4xl font-black text-ink">ورش تفاعلية مفتوحة للجميع</h2>
          </div>
          <Link
            href="/workshops"
            className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-ink/70 transition hover:border-coral hover:text-coral shadow-sm"
          >
            شوف كل الورش
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
        <p className="mb-12 max-w-2xl text-base leading-8 text-ink/60">
          ورش عمل مكثفة مع أفضل المدرسين — مجانية ومدفوعة — تغطي المواد اللي غالباً ما بنلاقي صعوبة فيها.
        </p>

        {workshops.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {workshops.map((workshop: any) => {
              const startDate = new Date(workshop.startsAt);
              const isFree = workshop.type === 'FREE';

              return (
                <div
                  key={workshop.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-sand bg-white shadow-sm transition hover:shadow-lg hover:-translate-y-1"
                >
                  {/* Thumbnail */}
                  {workshop.thumbnailUrl ? (
                    <div className="relative h-40 w-full overflow-hidden bg-sand/30">
                      <img
                        src={workshop.thumbnailUrl}
                        alt={workshop.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute top-3 right-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold shadow-md ${
                            isFree ? "bg-mint text-white" : "bg-coral text-white"
                          }`}
                        >
                          {isFree ? 'مجانية' : `${workshop.priceEGP} جنيه`}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 pb-0">
                      <div className="mb-2 flex items-start justify-between">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                            isFree
                              ? "bg-mint/15 text-mint"
                              : "bg-coral/10 text-coral"
                          }`}
                        >
                          {isFree ? 'مجانية' : `${workshop.priceEGP} جنيه`}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="mb-2 text-xl font-bold text-ink">{workshop.title}</h3>
                      <p className="mb-4 text-sm text-ink/60 line-clamp-2">{workshop.description || "ورشة عمل تدريبية وشرح مفصل للمفاهيم الأساسية وحل الأسئلة المهمة."}</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-xs font-medium text-ink/70">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4 text-coral" />
                          {startDate.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-coral" />
                          {startDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {/* Action buttons: Watch Now vs Pay Now */}
                      {isFree ? (
                        workshop.youtubeVideoId ? (
                          <a
                            href={`https://www.youtube.com/watch?v=${workshop.youtubeVideoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full rounded-2xl bg-red-600 p-2.5 text-center text-xs font-black text-white hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-sm"
                          >
                            <Play className="h-3.5 w-3.5 fill-white" />
                            <span>شاهد الآن 🎬 (يوتيوب)</span>
                          </a>
                        ) : (
                          <Link
                            href="/workshops"
                            className="w-full rounded-2xl bg-mint p-2.5 text-center text-xs font-black text-white hover:brightness-95 transition flex items-center justify-center gap-2 shadow-sm"
                          >
                            <Play className="h-3.5 w-3.5" />
                            <span>شاهد الآن 🎬 (مجانية)</span>
                          </Link>
                        )
                      ) : (
                        <Link
                          href="/workshops"
                          className="w-full rounded-2xl bg-coral p-2.5 text-center text-xs font-black text-white hover:bg-coralDark transition flex items-center justify-center gap-2 shadow-md shadow-coral/20"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          <span>ادفع الآن 💳 ({workshop.priceEGP ?? 0} ج.م)</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-sand bg-white p-10 text-center text-ink/60">
            سيتم الإعلان عن الورش القادمة هنا بعد اعتماد مواعيدها ومدرسيها.
          </div>
        )}

      </div>
    </section>
  );
}

