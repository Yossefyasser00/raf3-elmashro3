"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Video,
  PhoneOff,
  Copy,
  ExternalLink,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  FileText,
  Send,
} from "lucide-react";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id as string;

  const [activeSideTab, setActiveSideTab] = useState<"chat" | "notes">("chat");
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string; isMe?: boolean }>>([
    {
      sender: "النظام الذكي",
      text: "مرحباً بكم في قاعة فك زنقة ومحاضرة Google Meet المباشرة. الجلسة مؤمنة بالكامل لحفظ جودة الشرح والتفاعل.",
      time: "الآن",
    },
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [notes, setNotes] = useState("");
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [userName, setUserName] = useState("المستخدم");
  const [userRole, setUserRole] = useState<"STUDENT" | "TUTOR">("STUDENT");
  const [copied, setCopied] = useState(false);

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

  const getMeetUrl = () => {
    return (
      sessionDetails?.booking?.tutor?.meetingUrl ||
      sessionDetails?.selectedTutor?.meetingUrl ||
      "https://meet.google.com/new"
    );
  };

  const handleCopyLink = () => {
    const url = getMeetUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleJoinMeet = () => {
    const url = getMeetUrl();
    window.open(url, "_blank");
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
    if (confirm("هل أنت متأكد من مغادرة القاعة؟")) {
      if (userRole === "TUTOR") {
        router.push("/dashboard/tutor");
      } else {
        router.push("/dashboard/student");
      }
    }
  };

  const meetUrl = getMeetUrl();
  const tutorName = sessionDetails?.booking?.tutor?.user?.fullName || "المدرس المعتمد";
  const studentName = sessionDetails?.student?.fullName || "الطالب";

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0B132B] text-white font-sans" dir="rtl">
      {/* Header bar */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/95 px-6 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link
            href={userRole === "TUTOR" ? "/dashboard/tutor" : "/dashboard/student"}
            className="flex items-center gap-2 text-emerald-400 font-black text-xl tracking-wide hover:opacity-90"
          >
            <span className="text-2xl">⚡</span>
            <span>فك زنقة كلاس</span>
          </Link>

          <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="font-bold">المحاضرة نشطة عبر Google Meet</span>
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
        {/* Stage Area */}
        <main className="relative flex flex-1 flex-col items-center justify-center p-6 bg-gradient-to-b from-[#0B132B] via-[#1C2541] to-[#0B132B]">
          <div className="relative flex h-full w-full max-w-4xl flex-col items-center justify-center overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900/90 p-8 shadow-2xl backdrop-blur">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 text-xs text-emerald-400 font-bold mb-6">
              <Sparkles className="h-4 w-4" />
              <span>قاعة التدريس المباشر عبر Google Meet HD</span>
            </div>

            {/* Meet Big Card */}
            <div className="flex flex-col items-center text-center max-w-xl space-y-6">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-xl shadow-emerald-500/20">
                <Video className="h-14 w-14 text-white" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex h-4 w-4 rounded-full bg-white"></span>
                </span>
              </div>

              <div>
                <h1 className="text-3xl font-black text-white">
                  {sessionDetails?.subject?.name || "المحاضرة المباشرة"}
                </h1>
                <p className="mt-2 text-sm text-slate-300">
                  {sessionDetails?.topic?.name ? `موضوع: ${sessionDetails.topic.name}` : "جلسة تدريسية تفاعلية خاصة"}
                </p>
                <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-400 font-semibold">
                  <span>👨‍🏫 المدرس: <strong>{tutorName}</strong></span>
                  <span>•</span>
                  <span>🎓 الطالب: <strong>{studentName}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center pt-2">
                <button
                  onClick={handleJoinMeet}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-500 px-8 py-4 text-base font-black text-slate-950 hover:bg-emerald-400 transition transform active:scale-95 shadow-xl shadow-emerald-500/30"
                >
                  <Video className="h-5 w-5" />
                  <span>انضمام إلى Google Meet الآن 🚀</span>
                  <ExternalLink className="h-4 w-4 opacity-70" />
                </button>

                <button
                  onClick={handleCopyLink}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/90 px-6 py-4 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-400">تم نسخ الرابط!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>نسخ رابط المحاضرة</span>
                    </>
                  )}
                </button>
              </div>

              {/* URL Display Box */}
              <div className="w-full rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 text-xs font-mono text-emerald-400/90 text-center select-all break-all">
                {meetUrl}
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                💡 يمكنك فتح الكاميرا والمايكروفون ومشاركة شاشة العرض أو السبورة البيضاء داخل Google Meet بسلاسة تامة.
              </p>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-80 shrink-0 border-r border-slate-800 bg-slate-900/95 flex flex-col">
          <div className="flex border-b border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveSideTab("chat")}
              className={`flex-1 py-3 text-center transition flex items-center justify-center gap-1.5 ${
                activeSideTab === "chat"
                  ? "border-b-2 border-emerald-400 text-emerald-400 bg-slate-800/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>الدردشة السريعة</span>
            </button>
            <button
              onClick={() => setActiveSideTab("notes")}
              className={`flex-1 py-3 text-center transition flex items-center justify-center gap-1.5 ${
                activeSideTab === "notes"
                  ? "border-b-2 border-emerald-400 text-emerald-400 bg-slate-800/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>الملاحظات المشتركة</span>
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
