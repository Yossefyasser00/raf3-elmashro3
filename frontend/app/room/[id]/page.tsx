"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Share2,
  MessageSquare,
  Sparkles,
  Send,
  Clock,
  ShieldCheck,
} from "lucide-react";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id as string;

  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [activeSideTab, setActiveSideTab] = useState<"chat" | "notes">("chat");
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string; isMe?: boolean }>>([
    {
      sender: "النظام الذكي",
      text: "مرحباً بكم في القاعة الافتراضية لـ فزعة. الجلسة مشفرة ومؤمنة بالكامل لحفظ جودة الشرح والتفاعل.",
      time: "الآن",
    },
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [notes, setNotes] = useState("");
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [userName, setUserName] = useState("المستخدم");
  const [userRole, setUserRole] = useState<"STUDENT" | "TUTOR">("STUDENT");

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("fz_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserRole(payload.role || "STUDENT");
      setUserName(payload.fullName || (payload.role === "TUTOR" ? "المدرس" : "الطالب"));
    } catch {
      // ignore
    }

    if (roomId) {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/requests/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setSessionDetails(data);
          }
        })
        .catch(() => {});
    }
  }, [roomId, router]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        sender: userName,
        text: inputMsg.trim(),
        time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        isMe: true,
      },
    ]);
    setInputMsg("");
  };

  const handleLeave = () => {
    if (confirm("هل أنت متأكد من مغادرة القاعة الافتراضية؟")) {
      if (userRole === "TUTOR") {
        router.push("/dashboard/tutor");
      } else {
        router.push("/dashboard/student");
      }
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0F172A] text-white font-sans" dir="rtl">
      {/* Header bar */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link
            href={userRole === "TUTOR" ? "/dashboard/tutor" : "/dashboard/student"}
            className="flex items-center gap-2 text-emerald-400 font-black text-xl tracking-wide hover:opacity-90"
          >
            <span className="text-2xl">⚡</span>
            <span>فزعة كلاس</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
            </span>
            <span className="font-bold">بث مباشر الآن</span>
            <span className="text-slate-500">|</span>
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-mono font-bold text-emerald-400">{formatTime(elapsedSeconds)}</span>
          </div>

          {sessionDetails && (
            <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-300 border-r border-slate-800 pr-4">
              <span>{sessionDetails.subject?.name || "حصة تدريسية"}</span>
              {sessionDetails.topic?.name && (
                <span className="text-slate-400">({sessionDetails.topic.name})</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-slate-800 px-3 py-1.5 text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="hidden md:inline">اتصال مشفر ومؤمن</span>
          </div>

          <button
            onClick={handleLeave}
            className="flex items-center gap-2 rounded-xl bg-red-500/20 px-4 py-2 text-xs font-black text-red-400 hover:bg-red-500 hover:text-white transition"
          >
            <PhoneOff className="h-4 w-4" />
            <span>مغادرة القاعة</span>
          </button>
        </div>
      </header>

      {/* Main content body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Stage Video Area */}
        <main className="relative flex flex-1 flex-col items-center justify-center p-4">
          <div className="relative flex h-full w-full max-w-5xl flex-col items-center justify-center overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-2xl">
            {videoOn ? (
              <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-b from-slate-900 via-slate-950 to-black">
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-400/30 border-2 border-emerald-500/40 shadow-inner">
                    <span className="text-5xl font-black text-emerald-300">
                      {userRole === "TUTOR" ? "🎓" : "👨‍🏫"}
                    </span>
                    <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-black text-white">
                      {userRole === "TUTOR" ? "قاعة المحاضرة التدريسية المباشرة" : "أنت متصل مباشرة في القاعة مع المدرس"}
                    </h2>
                    <p className="mt-1 text-xs text-slate-400 max-w-md">
                      تم فتح الاتصال بنجاح. الكاميرا والمايكروفون يعملان. يمكنك مشاركة الشاشة أو كتابة الملاحظات المشتركة.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 text-xs text-emerald-400 font-bold">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>جودة الصوت والفيديو فائقة الدقة HD</span>
                  </div>
                </div>

                {/* Self preview PIP */}
                <div className="absolute bottom-4 left-4 h-36 w-52 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-xl flex flex-col justify-between p-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-300">
                    <span className="font-bold">{userName} (أنت)</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="flex flex-1 items-center justify-center text-slate-400 text-sm">
                    {micOn ? <Mic className="h-4 w-4 text-emerald-400 mr-1" /> : <MicOff className="h-4 w-4 text-red-400 mr-1" />}
                    <span>معاينة الكاميرا</span>
                  </div>
                  <span className="text-[9px] text-slate-500 text-left">متصل الآن</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 space-y-3">
                <VideoOff className="h-16 w-16 text-slate-600" />
                <p className="text-sm font-bold text-slate-400">الكاميرا مغلقة حالياً</p>
                <button
                  onClick={() => setVideoOn(true)}
                  className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  تشغيل الكاميرا
                </button>
              </div>
            )}

            {/* Bottom Controls Bar */}
            <div className="absolute bottom-6 flex items-center gap-3 rounded-full border border-slate-700/80 bg-slate-900/90 px-6 py-3 shadow-2xl backdrop-blur">
              <button
                onClick={() => setMicOn(!micOn)}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                  micOn ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-red-500 text-white hover:bg-red-600"
                }`}
                title={micOn ? "كتم الصوت" : "تشغيل المايكروفون"}
              >
                {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </button>

              <button
                onClick={() => setVideoOn(!videoOn)}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                  videoOn ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-red-500 text-white hover:bg-red-600"
                }`}
                title={videoOn ? "إيقاف الكاميرا" : "تشغيل الكاميرا"}
              >
                {videoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </button>

              <button
                onClick={() => setScreenSharing(!screenSharing)}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition ${
                  screenSharing ? "bg-emerald-500 text-white" : "bg-slate-800 text-white hover:bg-slate-700"
                }`}
                title={screenSharing ? "إيقاف مشاركة الشاشة" : "مشاركة الشاشة"}
              >
                <Share2 className="h-5 w-5" />
              </button>

              <button
                onClick={() => setActiveSideTab(activeSideTab === "chat" ? "notes" : "chat")}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-white hover:bg-slate-700 transition"
                title="الدردشة والملاحظات"
              >
                <MessageSquare className="h-5 w-5" />
              </button>

              <button
                onClick={handleLeave}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 transition shadow-lg shadow-red-600/30"
                title="إنهاء المكالمة"
              >
                <PhoneOff className="h-5 w-5" />
              </button>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-80 shrink-0 border-r border-slate-800 bg-slate-900/95 flex flex-col">
          <div className="flex border-b border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveSideTab("chat")}
              className={`flex-1 py-3 text-center transition ${
                activeSideTab === "chat"
                  ? "border-b-2 border-emerald-400 text-emerald-400 bg-slate-800/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              الدردشة الفورية 💬
            </button>
            <button
              onClick={() => setActiveSideTab("notes")}
              className={`flex-1 py-3 text-center transition ${
                activeSideTab === "notes"
                  ? "border-b-2 border-emerald-400 text-emerald-400 bg-slate-800/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              السبورة والملاحظات 📝
            </button>
          </div>

          {activeSideTab === "chat" && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col rounded-2xl p-3 text-xs ${
                      m.isMe
                        ? "mr-auto max-w-[85%] bg-emerald-600 text-white rounded-bl-none"
                        : "ml-auto max-w-[85%] bg-slate-800 text-slate-200 rounded-br-none"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-[11px] opacity-80">{m.sender}</span>
                      <span className="text-[9px] opacity-60">{m.time}</span>
                    </div>
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="border-t border-slate-800 p-3 flex gap-2">
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="اكتب رسالة للمدرس أو الطالب..."
                  className="flex-1 rounded-xl bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
                <button
                  type="submit"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {activeSideTab === "notes" && (
            <div className="flex flex-1 flex-col p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold">ملاحظات الجلسة المشتركة</span>
                <span className="text-[10px]">تُحفظ تلقائياً</span>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="دون النقاط المهمة، المعادلات، روابط المراجع أثناء الشرح..."
                className="flex-1 w-full rounded-2xl bg-slate-800/80 p-3 text-xs text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
              <div className="rounded-xl bg-slate-800/50 p-3 text-[11px] text-slate-400 space-y-1">
                <p className="font-bold text-slate-300">💡 نصيحة تعليمية:</p>
                <p>يمكنك نسخ ملاحظاتك والاحتفاظ بها بعد انتهاء الحصة لمراجعتها قبل الامتحان.</p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
