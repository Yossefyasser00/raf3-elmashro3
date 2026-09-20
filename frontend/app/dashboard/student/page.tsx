"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Award,
  LogOut,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Star,
  Video,
  Send,
  PlusCircle,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Gift,
  HelpCircle,
  FileQuestion,
  Brain,
  Target,
  Rocket,
  Timer,
  Mic,
  Calendar,
  Filter,
  Sliders,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/theme/ThemeToggle";

interface TutorMatch {
  tutorId: string;
  tutorName: string;
  avatar: string;
  title: string;
  rating: number;
  sessions: number;
  price: number;
}

interface NegotiationItem {
  id: string;
  tutorId: string;
  tutorUserId?: string;
  tutorName: string;
  tutorAvatar?: string;
  tutorBio?: string;
  tutorRating?: number;
  tutorSessions?: number;
  proposedAmountEGP: number;
  proposedTime: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  isDirectAgreement?: boolean;
}

interface RequestItem {
  id: string;
  subject: string;
  topic: string;
  faculty?: string;
  university?: string;
  academicYear?: string;
  description: string;
  mode: "ONLINE" | "IN_PERSON";
  budget: number;
  urgency: "LOW" | "MEDIUM" | "HIGH" | "ASAP";
  status: "DRAFT" | "PUBLISHED" | "MATCHING" | "TUTOR_SELECTED" | "PAYMENT_PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "STUDENT_RATED" | "CANCELLED" | "DISPUTED";
  statusLabel: string;
  preferredTime: string;
  matches?: TutorMatch[];
  negotiations?: NegotiationItem[];
  selectedTutor?: {
    name: string;
    phone: string;
    rating: number;
    meetingUrl?: string;
  };
  reviewGiven?: {
    rating: number;
    comment: string;
  };
}

interface ChatMessage {
  id: string;
  sender: "student" | "tutor";
  text: string;
  time: string;
}

const INITIAL_REQUESTS: RequestItem[] = [];
const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];

interface WorkshopEnrollmentItem {
  id: string;
  createdAt: string;
  workshop: {
    id: string;
    title: string;
    type: "FREE" | "PAID";
    priceEGP?: number | null;
    startsAt: string;
    tutor?: { fullName: string } | null;
  };
}

// Student print invoice function (only shows details and total amount paid)
function printInvoice(inv: {
  invoiceNo: string;
  type: string;
  subject: string;
  studentName: string;
  tutorName?: string;
  amountEGP: number;
  date: string;
  status: string;
}) {
  const w = window.open("", "_blank", "width=700,height=600");
  if (!w) return;
  w.document.write(`
    <!DOCTYPE html><html dir="rtl" lang="ar">
    <head><meta charset="UTF-8"><title>فاتورة ${inv.invoiceNo}</title>
    <style>
      body { font-family: 'Cairo', sans-serif; padding: 40px; color: #1a1a2e; direction: rtl; }
      .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #e84393; padding-bottom: 16px; margin-bottom: 24px; }
      .logo { font-size: 24px; font-weight: 900; color: #e84393; }
      .badge { background: #f0fdf4; color: #16a34a; border: 2px solid #16a34a; border-radius: 999px; padding: 4px 16px; font-weight: 900; font-size: 14px; }
      .title { font-size: 20px; font-weight: 900; margin-bottom: 24px; }
      table { width: 100%; border-collapse: collapse; }
      td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
      td:first-child { font-weight: 700; color: #555; width: 40%; }
      .total-row td { font-weight: 900; font-size: 16px; background: #fef9c3; }
      .footer { margin-top: 32px; text-align: center; font-size: 12px; color: #888; }
    </style>
    </head><body>
    <div class="header">
      <div class="logo">⚡ فك زنقة</div>
      <div class="badge">✓ مدفوعة</div>
    </div>
    <div class="title">فاتورة ضريبية — ${inv.invoiceNo}</div>
    <table>
      <tr><td>نوع الفاتورة</td><td>${inv.type === "SESSION" ? "جلسة تدريسية خاصة" : "ورشة عمل"}</td></tr>
      <tr><td>المادة / الورشة</td><td>${inv.subject}</td></tr>
      <tr><td>اسم الطالب</td><td>${inv.studentName}</td></tr>
      ${inv.tutorName ? `<tr><td>اسم المدرس</td><td>${inv.tutorName}</td></tr>` : ""}
      <tr><td>التاريخ</td><td>${inv.date}</td></tr>
      <tr><td>الحالة</td><td>${inv.status}</td></tr>
      <tr class="total-row"><td>المبلغ الإجمالي المدفوع</td><td>${inv.amountEGP} ج.م</td></tr>
    </table>
    <div class="footer">فك زنقة للتعليم الذكي — جميع الحقوق محفوظة © 2025 | هذه الفاتورة إلكترونية معتمدة</div>
    <script>window.onload = () => { window.print(); }<\/script>
    </body></html>
  `);
  w.document.close();
}

const KNOWN_SUBJECTS: Array<{ keywords: string[]; name: string }> = [
  { keywords: ["كيمياء", "عضوية", "ألكين", "ألكان", "كيميائية"], name: "الكيمياء العضوية" },
  { keywords: ["فيزياء", "كيرشوف", "نيوتن", "كهربية", "مغناطيسية", "ديناميكا"], name: "الفيزياء الهندسية" },
  { keywords: ["رياضيات", "تفاضل", "تكامل", "جبر", "معادلات", "استاتيكا"], name: "الرياضيات التطبيقية" },
  { keywords: ["برمجة", "خوارزميات", "algorithm", "python", "java", "c++", "كود"], name: "خوارزميات وبرمجة" },
  { keywords: ["فارما", "أدوية", "صيدلة", "pharma"], name: "علم الأدوية (فارما)" },
  { keywords: ["محاسبة", "مالية", "اقتصاد", "accounting"], name: "المحاسبة والمالية" },
  { keywords: ["تشريح", "anatomy", "طب", "عظام", "أعصاب"], name: "علم التشريح (Anatomy)" },
];

const SUBJECT_TO_FACULTY: Record<string, string> = {
  "الكيمياء العضوية": "كلية العلوم / الصيدلة",
  "الفيزياء الهندسية": "كلية الهندسة",
  "الرياضيات التطبيقية": "كلية الهندسة / العلوم",
  "خوارزميات وبرمجة": "كلية الحاسبات والمعلومات / الهندسة",
  "علم الأدوية (فارما)": "كلية الصيدلة",
  "المحاسبة والمالية": "كلية التجارة وإدارة الأعمال",
  "علم التشريح (Anatomy)": "كلية الطب البشري",
};

function extractRequestMetadata(request: any) {
  let subject = request?.subject?.name;
  let topic = request?.topic?.name;
  let faculty = request?.faculty?.name || request?.student?.studentProfile?.facultyName || "";
  let university = request?.university?.name || request?.student?.studentProfile?.universityName || "";
  let academicYear = "";
  const desc = (request?.description || "").trim();

  // 1. Extract faculty if in description: [الكلية: ...]
  const facultyMatch = desc.match(/\[الكلية:\s*([^\]]+)\]/);
  if (facultyMatch) {
    faculty = facultyMatch[1].trim();
  }

  // 2. Extract university if in description: [الجامعة: ...]
  const uniMatch = desc.match(/\[الجامعة:\s*([^\]]+)\]/);
  if (uniMatch) {
    university = uniMatch[1].trim();
  }

  // 3. Extract academic year: [السنة الدراسية: ...] or [الفرقة: ...] or from profile/request
  const yearMatch = desc.match(/\[(?:السنة الدراسية|الفرقة|السنة):\s*([^\]]+)\]/);
  if (yearMatch) {
    const raw = yearMatch[1].trim();
    if (raw.includes("1") || raw.includes("أولى")) academicYear = "السنة 1";
    else if (raw.includes("2") || raw.includes("ثانية")) academicYear = "السنة 2";
    else if (raw.includes("3") || raw.includes("ثالثة")) academicYear = "السنة 3";
    else if (raw.includes("4") || raw.includes("رابعة")) academicYear = "السنة 4";
    else if (raw.includes("5") || raw.includes("خامسة")) academicYear = "السنة 5";
    else if (raw.includes("6") || raw.includes("سادسة")) academicYear = "السنة 6";
    else if (raw.includes("7") || raw.includes("سابعة")) academicYear = "السنة 7";
    else academicYear = raw;
  } else if (request?.academicYear) {
    const num = Number(request.academicYear);
    academicYear = `السنة ${num}`;
  } else if (request?.student?.studentProfile?.academicYear) {
    const num = Number(request.student.studentProfile.academicYear);
    academicYear = `السنة ${num}`;
  } else if (request?.student?.studentProfile?.gradeLevel) {
    academicYear = request.student.studentProfile.gradeLevel;
  }

  // 4. Extract subject if between [brackets] and not a location/faculty/uni/year tag
  if (!subject) {
    const bracketMatches = [...desc.matchAll(/\[([^\]]+)\]/g)];
    for (const match of bracketMatches) {
      const tag = match[1].trim();
      if (!tag.startsWith("مكان الحضور") && !tag.startsWith("الكلية:") && !tag.startsWith("الجامعة:") && !tag.startsWith("السنة الدراسية:") && !tag.startsWith("الفرقة:") && !tag.startsWith("السنة:")) {
        subject = tag;
        break;
      }
    }
  }

  // 5. Extract topic if between (parentheses)
  if (!topic) {
    const parenMatch = desc.match(/\(([^)]+)\)/);
    if (parenMatch) {
      topic = parenMatch[1].trim();
    }
  }

  // 6. If subject still not found, check known subject keywords
  if (!subject) {
    const lowerDesc = desc.toLowerCase();
    for (const sub of KNOWN_SUBJECTS) {
      if (sub.keywords.some((kw) => lowerDesc.includes(kw))) {
        subject = sub.name;
        break;
      }
    }
  }

  // 7. Clean remaining description
  const cleanDesc = desc
    .replace(/\[مكان الحضور المعتمد:[^\]]+\]/g, "")
    .replace(/\[الكلية:[^\]]+\]/g, "")
    .replace(/\[الجامعة:[^\]]+\]/g, "")
    .replace(/\[السنة الدراسية:[^\]]+\]/g, "")
    .replace(/\[الفرقة:[^\]]+\]/g, "")
    .replace(/\[السنة:[^\]]+\]/g, "")
    .replace(/\[[^\]]+\]/g, "")
    .replace(/\([^)]+\)/g, "")
    .trim();

  // 8. Fallback for topic
  if (!topic) {
    if (cleanDesc) {
      const parts = cleanDesc.split(/[-–—،,\n]/).map((p: string) => p.trim()).filter(Boolean);
      topic = parts[0]?.slice(0, 45) || "موضوع الحصة";
    }
  }

  const finalTopic = topic || (cleanDesc ? cleanDesc.slice(0, 40) : "شرح ومراجعة");
  const finalSubject = subject || "";

  // 9. Infer faculty if missing or generic
  if (!faculty || faculty === "كلية غير محددة" || faculty.trim() === "") {
    if (finalSubject && SUBJECT_TO_FACULTY[finalSubject]) {
      faculty = SUBJECT_TO_FACULTY[finalSubject];
    } else {
      const lowerAll = (desc + " " + (finalSubject || "") + " " + (finalTopic || "")).toLowerCase();
      if (lowerAll.includes("محاسب") || lowerAll.includes("مالي") || lowerAll.includes("اقتصاد") || lowerAll.includes("تجارة") || lowerAll.includes("accounting")) {
        faculty = "كلية التجارة وإدارة الأعمال";
      } else if (lowerAll.includes("فيزياء") || lowerAll.includes("هندس") || lowerAll.includes("ميكانيك") || lowerAll.includes("كهرب")) {
        faculty = "كلية الهندسة";
      } else if (lowerAll.includes("كيمياء") || lowerAll.includes("علوم") || lowerAll.includes("بيولوجي")) {
        faculty = "كلية العلوم";
      } else if (lowerAll.includes("برمج") || lowerAll.includes("حاسب") || lowerAll.includes("خوارزم") || lowerAll.includes("cs") || lowerAll.includes("it")) {
        faculty = "كلية الحاسبات والمعلومات";
      } else if (lowerAll.includes("فارما") || lowerAll.includes("أدوي") || lowerAll.includes("صيدل")) {
        faculty = "كلية الصيدلة";
      } else if (lowerAll.includes("تشريح") || lowerAll.includes("طب") || lowerAll.includes("anatomy") || lowerAll.includes("عظام")) {
        faculty = "كلية الطب البشري";
      } else if (lowerAll.includes("حقوق") || lowerAll.includes("قانون")) {
        faculty = "كلية الحقوق";
      } else if (lowerAll.includes("آداب") || lowerAll.includes("لغات") || lowerAll.includes("إنجليزي") || lowerAll.includes("ترجم")) {
        faculty = "كلية الآداب والألسن";
      } else {
        faculty = "كلية عامة";
      }
    }
  }

  if (!university || university === "جامعة غير محددة" || university.trim() === "") {
    university = "جامعة المنصورة";
  }

  if (!academicYear) {
    academicYear = "الفرقة الأولى";
  }

  return {
    subject: finalSubject,
    topic: finalTopic,
    faculty,
    university,
    academicYear,
    fullTitle: finalSubject && finalSubject !== finalTopic ? `${finalSubject} — ${finalTopic}` : (finalSubject || finalTopic),
  };
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState<
    "overview" | "requests" | "rewards" | "schedule" | "invoices"
  >("overview");
  const [requests, setRequests] = useState<RequestItem[]>(INITIAL_REQUESTS);
  const [points, setPoints] = useState<number>(0);
  const [redeemedCoupons, setRedeemedCoupons] = useState<any[]>([]);
  const [selectedReqForDetail, setSelectedReqForDetail] = useState<RequestItem | null>(null);

  // Filter state for Student Requests
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState("ALL");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("ALL");
  const [selectedYearFilter, setSelectedYearFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [inputMsg, setInputMsg] = useState("");

  // Rate Modal state
  const [ratingReq, setRatingReq] = useState<RequestItem | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Dispute Modal state
  const [disputeReq, setDisputeReq] = useState<RequestItem | null>(null);
  const [disputeReason, setDisputeReason] = useState("");

  // Invoice & payment state
  const [workshopEnrollments, setWorkshopEnrollments] = useState<WorkshopEnrollmentItem[]>([]);
  const [paymentModalReq, setPaymentModalReq] = useState<{ reqId: string; negId: string; amount: number; tutorName: string; subject: string } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"instapay" | "vodafone" | "card">("instapay");
  const [paymentAccount, setPaymentAccount] = useState("");
  const [sessionCouponInput, setSessionCouponInput] = useState("");
  const [appliedSessionCoupon, setAppliedSessionCoupon] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  function triggerToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  }

  function handleLogout() {
    localStorage.removeItem("fz_token");
    localStorage.removeItem("fz_refresh");
    localStorage.removeItem("fz_roles");
    window.location.href = "/login";
  }

  useEffect(() => {
    async function loadRequests() {
      const token = localStorage.getItem("fz_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/requests/my`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("fz_token");
          window.location.href = "/login";
          return;
        }

        if (!response.ok) throw new Error("Failed to load requests");

        const data = await response.json();
        setRequests(
          data.map((request: any): RequestItem => {
            const { subject, topic, faculty, university, academicYear } = extractRequestMetadata(request);
            return {
              id: request.id,
              subject,
              topic,
              faculty,
              university,
              academicYear,
              description: (request.description || "").replace(/\[(?:الكلية|الجامعة|السنة الدراسية|الفرقة|السنة|مكان الحضور المعتمد):[^\]]*\]\s*/g, "").replace(/\[([^\]]+)\]\s*/g, "").replace(/\(([^)]*)\)\s*/, "").trim(),
              mode: request.teachingMode,
              budget: request.budgetEGP ?? 0,
              urgency: request.urgency ?? "MEDIUM",
              status: request.status,
            statusLabel:
              request.status === "MATCHING"
                ? "جاري ترشيح المدرسين"
                : request.status === "DRAFT"
                  ? "مسودة"
                  : request.status === "CONFIRMED"
                    ? "مؤكدة"
                    : request.status === "TUTOR_SELECTED"
                      ? "تم اختيار مدرس وقبول العرض"
                      : request.status === "IN_PROGRESS"
                        ? "جارية الآن 🔴"
                        : request.status === "COMPLETED"
                          ? "مكتملة 🎉"
                          : request.status === "STUDENT_RATED"
                            ? "تم التقييم بنجاح ⭐"
                            : request.status === "CANCELLED"
                              ? "ملغية"
                              : request.status === "DISPUTED"
                                ? "قيد النزاع ⚠️"
                                : request.status,
            preferredTime: request.preferredAt
              ? new Date(request.preferredAt).toLocaleString("ar-EG")
              : "لم يتم تحديد موعد",
            matches: (request.matches ?? []).map((match: any) => ({
              tutorId: match.tutorId,
              tutorName: match.tutor?.user?.fullName ?? "مدرس متاح",
              avatar: "👨‍🏫",
              title: match.tutor?.bio ?? "مدرس متخصص",
              rating: match.tutor?.ratingAvg ?? 0,
              sessions: match.tutor?.completedSessionsCount ?? 0,
              price: match.tutor?.priceMinEGP ?? request.budgetEGP ?? 0,
            })),
            negotiations: (request.negotiations ?? []).map((negotiation: any): NegotiationItem => {
              const tp = negotiation.tutor?.tutorProfile;
              const isDirect = Number(negotiation.proposedAmountEGP) === Number(request.budgetEGP ?? 0);
              return {
                id: negotiation.id,
                tutorId: tp?.id ?? negotiation.tutorId,
                tutorUserId: negotiation.tutorId,
                tutorName: negotiation.tutor?.fullName ?? "مدرس متخصص",
                tutorAvatar: negotiation.tutor?.avatarUrl ?? "👨‍🏫",
                tutorBio: tp?.bio ?? "مدرس معتمد على المنصة",
                tutorRating: tp?.ratingAvg ?? 5.0,
                tutorSessions: tp?.completedSessionsCount ?? 0,
                proposedAmountEGP: negotiation.proposedAmountEGP,
                proposedTime: negotiation.proposedTime,
                status: negotiation.status,
                isDirectAgreement: isDirect,
              };
            }),
            selectedTutor: request.booking ? {
              name: request.booking.tutor?.user?.fullName ?? "المدرس",
              phone: "",
              rating: request.booking.tutor?.ratingAvg ?? 5.0,
              meetingUrl: request.booking.tutor?.meetingUrl ?? undefined,
            } : request.selectedTutorId ? {
              name: request.matches?.find((m: any) => m.tutorId === request.selectedTutorId)?.tutor?.user?.fullName ?? "المدرس",
              phone: "",
              rating: request.matches?.find((m: any) => m.tutorId === request.selectedTutorId)?.tutor?.ratingAvg ?? 5.0,
              meetingUrl: request.matches?.find((m: any) => m.tutorId === request.selectedTutorId)?.tutor?.meetingUrl ?? undefined,
            } : undefined,
          };
        }),
      );

        // Fetch Live Points Balance & Redeemed Coupons
        const pointsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/points/my`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (pointsRes.ok) {
          const pointsData = await pointsRes.json();
          setPoints(pointsData.pointsBalance ?? 0);
          setRedeemedCoupons(pointsData.redeemedCoupons ?? []);
        }

        // Fetch workshop enrollments for invoices
        const enrollRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/workshops/my-enrollments`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (enrollRes.ok) {
          const enrollData = await enrollRes.json();
          setWorkshopEnrollments(enrollData);
        }
      } catch {
        triggerToast("تعذر تحميل زنقاتك من السيرفر");
      }
    }

    loadRequests();
    const interval = setInterval(loadRequests, 4000);
    return () => clearInterval(interval);
  }, []);

  // Select Tutor from matches
  function handleSelectTutor(reqId: string, tutor: TutorMatch) {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === reqId) {
          return {
            ...r,
            status: "CONFIRMED",
            statusLabel: "مؤكدة — تم حجز الجلسة بنجاح ✅",
            selectedTutor: {
              name: tutor.tutorName,
              phone: "",
              rating: tutor.rating,
            },
          };
        }
        return r;
      })
    );
    triggerToast(`🎉 مبروك! تم اختيار ${tutor.tutorName} وتأكيد الجلسة ومشاركتك رابط الحضور.`);
  }

  async function handleRespondToNegotiation(
    reqId: string,
    negotiationId: string,
    action: "ACCEPT" | "REJECT",
  ) {
    const token = localStorage.getItem("fz_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/requests/${reqId}/negotiations/${negotiationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action }),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message ?? "تعذر تحديث التفاوض");
      }

      const data = await response.json().catch(() => ({}));

      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== reqId) return r;

          const updatedNegotiations: NegotiationItem[] = (r.negotiations ?? []).map((neg) =>
            neg.id === negotiationId
              ? { ...neg, status: action === "ACCEPT" ? "ACCEPTED" : "REJECTED" }
              : neg,
          );

          if (action === "ACCEPT") {
            const accepted = updatedNegotiations.find((neg) => neg.id === negotiationId);
            return {
              ...r,
              negotiations: updatedNegotiations,
              status: "TUTOR_SELECTED",
              statusLabel: "تم قبول عرض المدرس بنجاح ✅",
              selectedTutor: accepted
                ? {
                    name: accepted.tutorName,
                    phone: "",
                    rating: 0,
                  }
                : r.selectedTutor,
              budget: accepted?.proposedAmountEGP ?? r.budget,
            };
          }

          return {
            ...r,
            negotiations: updatedNegotiations,
            statusLabel: "تم رفض عرض المدرس",
          };
        }),
      );

      if (action === "ACCEPT") {
        // Find the accepted negotiation from the current requests state
        const req = requests.find(r => r.id === reqId);
        const neg = req?.negotiations?.find(n => n.id === negotiationId);
        // Check if student has an unused FZ50 discount coupon
        const discountCoupon = redeemedCoupons.find(c => c.type === "DISCOUNT_COUPON" || c.code.startsWith("FZ50"));
        setPaymentModalReq({
          reqId,
          negId: negotiationId,
          amount: neg?.proposedAmountEGP ?? req?.budget ?? 0,
          tutorName: neg?.tutorName ?? "المدرس",
          subject: req?.subject ?? "جلسة تدريسية",
        });
        setPaymentSuccess(false);
        setPaymentAccount("");
        setPaymentMethod("instapay");
        setAppliedSessionCoupon(discountCoupon ? discountCoupon.code : null);
        setSessionCouponInput(discountCoupon ? discountCoupon.code : "");
      } else {
        triggerToast("ℹ️ تم رفض عرض المدرس وسيظل الطلب مفتوحًا للمدرسين الآخرين.");
      }
    } catch (error: any) {
      triggerToast(error.message || "تعذر تحديث التفاوض");
    }
  }

  // Handle payment confirmation after accepting tutor
  async function handleConfirmPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentModalReq) return;
    setIsSubmittingPayment(true);
    const token = localStorage.getItem("fz_token");
    try {
      if (token) {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
        const senderInfo = appliedSessionCoupon
          ? `${paymentAccount.trim()} [كوبون خصم: ${appliedSessionCoupon} -50 ج.م]`
          : paymentAccount.trim();

        await fetch(`${apiBase}/api/v1/requests/${paymentModalReq.reqId}/confirm-payment`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            senderAccount: senderInfo,
            method: paymentMethod,
          }),
        });
      }

      // Mark request as PAYMENT_PENDING locally
      setRequests(prev => prev.map(r =>
        r.id === paymentModalReq.reqId
          ? { ...r, status: "PAYMENT_PENDING", statusLabel: "قيد المراجعة — في انتظار تأكيد الإدارة للدفع ⏳" }
          : r
      ));
      setPaymentSuccess(true);
      triggerToast("⏳ تم إرسال إثبات التحويل! سيتم تفعيل الجلسة فور تأكيد الإدارة للدفع.");
      setTimeout(() => {
        setPaymentModalReq(null);
        setPaymentSuccess(false);
      }, 3000);
    } catch {
      triggerToast("تعذر تأكيد الدفع، حاول مجدداً");
    } finally {
      setIsSubmittingPayment(false);
    }
  }

  // Submit Review
  async function handleSubmitReview() {
    if (!ratingReq) return;
    const token = localStorage.getItem("fz_token");
    if (!token) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/requests/${ratingReq.id}/rate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            overallRating: ratingStars,
            comment: reviewComment,
          }),
        },
      );

      if (res.ok) {
        setPoints((p) => p + 20);
        triggerToast("⭐ شكراً لتقييمك الصادق! تمت إضافة +20 نقطة لمكافآتك بنجاح 🎁");
      }
    } catch {
      setPoints((p) => p + 20);
    }

    setRequests((prev) =>
      prev.map((r) =>
        r.id === ratingReq.id
          ? {
              ...r,
              status: "STUDENT_RATED",
              statusLabel: "تم التقييم بنجاح ⭐",
              reviewGiven: { rating: ratingStars, comment: reviewComment },
            }
          : r
      )
    );
    setRatingReq(null);
    setReviewComment("");
  }

  // Open Dispute
  function handleOpenDispute() {
    if (!disputeReq) return;
    setRequests((prev) =>
      prev.map((r) =>
        r.id === disputeReq.id
          ? { ...r, status: "DISPUTED", statusLabel: "في نزاع — قيد مراجعة الإدارة ⚠️" }
          : r
      )
    );
    triggerToast("⚠️ تم تصعيد الشكوى لإدارة فك زنقة وسيتم التواصل معك وحفظ حقك المالي.");
    setDisputeReq(null);
    setDisputeReason("");
  }

  // Confirm Session Completion as Student
  async function handleStudentCompleteSession(requestId: string) {
    const token = localStorage.getItem("fz_token");
    if (!token) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/requests/${requestId}/complete`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? "تعذر تأكيد إنهاء الحصة");
      }

      triggerToast("🎉 تم تأكيد إنهاء الحصة بنجاح وحصلت على +50 نقطة!");
      const targetReq = requests.find((r) => r.id === requestId);
      if (targetReq) {
        setRatingReq(targetReq);
      }
      setPoints((p) => p + 50);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: "COMPLETED", statusLabel: "مكتملة 🎉" }
            : r
        )
      );
    } catch (err: any) {
      triggerToast(`⚠️ ${err.message || "حدث خطأ أثناء تأكيد إنهاء الحصة"}`);
    }
  }

  // Send Message
  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "student",
      text: inputMsg.trim(),
      time: "الآن",
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMsg("");

  }

  // Redeem Reward (500 Points -> 50 EGP discount or free workshop)
  async function handleRedeemReward(cost: number, rewardTitle: string, rewardType: string) {
    if (points < cost) {
      triggerToast(`⚠️ رصيد نقاطك (${points} نقطة) غير كافٍ. تحتاج إلى ${cost} نقطة للاستبدال.`);
      return;
    }

    const token = localStorage.getItem("fz_token");
    if (!token) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/points/redeem`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rewardType, title: rewardTitle }),
        },
      );

      const data = await res.json();
      if (res.ok) {
        setPoints(data.newPointsBalance);
        if (data.couponCode) {
          setRedeemedCoupons((prev) => [
            {
              code: data.couponCode,
              title: data.rewardSummary || rewardTitle,
              type: rewardType,
              createdAt: new Date().toISOString(),
              points: cost,
            },
            ...prev,
          ]);
        }
        triggerToast(data.message || `🎉 مبروك! كود المكافأة: ${data.couponCode}`);
      } else {
        triggerToast(data.message || "تعذر استبدال المكافأة");
      }
    } catch {
      triggerToast("حدث خطأ أثناء استبدال النقاط");
    }
  }

  const pendingNegotiationsList = requests.flatMap((req) =>
    (req.negotiations ?? [])
      .filter((n) => n.status === "PENDING")
      .map((n) => ({ req, negotiation: n }))
  );

  const directAcceptances = pendingNegotiationsList.filter(
    ({ negotiation }) => negotiation.isDirectAgreement
  );

  const counterOffers = pendingNegotiationsList.filter(
    ({ negotiation }) => !negotiation.isDirectAgreement
  );

  return (
    <main className="min-h-screen bg-cream font-arabic text-ink">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-2xl bg-ink px-5 py-3.5 text-sm font-bold text-cream shadow-2xl animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="h-5 w-5 text-sun" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="border-b border-sand bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-coral to-coralDark text-xl text-white shadow-md">
                🎓
              </div>
              <div>
                <span className="text-base font-black text-ink">فك زنقة</span>
                <span className="mr-2 rounded-md bg-coral/15 px-2 py-0.5 text-[11px] font-black text-coral">
                  بوابة الطالب (Student Portal)
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => window.location.href = "/"}
              className="rounded-xl bg-coral px-3 py-1.5 text-xs font-bold text-white transition hover:bg-coralDark shadow-sm shadow-coral/30"
            >
              الرئيسية
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-sand bg-white px-3 py-1.5 text-xs font-bold text-ink transition hover:border-red-300 hover:text-red-600"
            >
              <LogOut className="h-3.5 w-3.5" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-8 lg:py-8">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="sticky top-20 space-y-3">
            <div className="rounded-3xl border border-sand bg-white p-3 shadow-sm">
              <div className="mb-3 px-3 pt-2 text-xs font-bold text-ink/40">حساب الطالب</div>
              <nav className="space-y-1">
                {[
                  { id: "overview", label: "نظرة عامة والدروس", icon: LayoutDashboard },
                  {
                    id: "requests",
                    label: "كل طلباتي واستغاثاتي",
                    icon: FileText,
                    count: requests.length,
                    alertBadge: pendingNegotiationsList.length > 0 ? `${pendingNegotiationsList.length} تفاوض 🔔` : undefined,
                  },
                  { id: "schedule", label: "جدول مواعيد الحصص", icon: Calendar, count: requests.filter(r => ["CONFIRMED","TUTOR_SELECTED","IN_PROGRESS"].includes(r.status)).length || undefined },
                  { id: "invoices", label: "فواتيري 🧾", icon: FileText, count: (requests.filter(r => ["TUTOR_SELECTED","CONFIRMED","IN_PROGRESS","COMPLETED","STUDENT_RATED","DISPUTED"].includes(r.status)).length + workshopEnrollments.filter(e => e.workshop.type === "PAID").length) || undefined },
                  { id: "rewards", label: "نقاطي والمكافآت", icon: Award, badge: `${points} ⭐` },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id as any)}
                    className={
                      "flex w-full items-center justify-between rounded-2xl px-3.5 py-3 text-right text-sm font-bold transition " +
                      (activeNav === item.id
                        ? "bg-coral text-white shadow-md shadow-coral/30"
                        : "text-ink/70 hover:bg-ink/5")
                    }
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {item.alertBadge && (
                        <span className="animate-pulse rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">
                          {item.alertBadge}
                        </span>
                      )}
                      {item.count !== undefined && !item.alertBadge && (
                        <span
                          className={
                            "rounded-full px-2 py-0.5 text-[11px] font-black " +
                            (activeNav === item.id ? "bg-white/20 text-white" : "bg-coral/10 text-coral")
                          }
                        >
                          {item.count}
                        </span>
                      )}
                      {item.badge && (
                        <span className="rounded-full bg-sun/25 px-2.5 py-0.5 text-[11px] font-black text-ink">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </nav>

              
            </div>

            {/* Quick Balance Widget */}
            <div className="rounded-3xl border border-sun/40 bg-gradient-to-br from-sun/20 to-cream p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-ink/60">رصيد نقاطك الحالي</div>
                  <div className="text-2xl font-black text-ink">{points} نقطة</div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sun text-xl">
                  🎁
                </div>
              </div>
              <button
                onClick={() => setActiveNav("rewards")}
                className="mt-3 w-full rounded-full bg-white py-1.5 text-xs font-black text-ink shadow-sm hover:bg-sand transition"
              >
                استبدال المكافآت →
              </button>
            </div>
          </div>
        </aside>

        {/* Content Body */}
        <section className="flex-1 space-y-6">
          {/* ========================================================
              NAV 1: OVERVIEW & ACTIVE SESSIONS
          ======================================================== */}
          {activeNav === "overview" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-sand bg-white p-6 shadow-sm">
                <div>
                  <span className="rounded-full bg-coral/15 px-3 py-1 text-xs font-black text-coral">
                    أهلاً بك يا بطل 👋
                  </span>
                  <h1 className="mt-2 text-2xl font-black text-ink">كل زنقاتك الدراسية مفكوكة هنا</h1>
                  <p className="mt-1 text-sm text-ink/60">
                    تابع جلساتك المحجوزة، راجع عروض المدرسين وتفاوض معهم، أو انشر زنقة جديدة.
                  </p>
                </div>
                <Link
                  href="/requests/new"
                  className="inline-flex items-center gap-2 rounded-full bg-coral px-6 py-3 text-sm font-black text-white shadow-lg shadow-coral/30 hover:bg-coralDark transition"
                >
                  <Sparkles className="h-4 w-4" />
                  انشر طلب جديد الآن
                </Link>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: "طلبات منشورة", value: requests.length, icon: "📝", color: "from-coral to-coralDark" },
                  { label: "جلسات مؤكدة وقادمة", value: requests.filter(r => r.status === "CONFIRMED").length, icon: "📅", color: "from-mint to-green-600" },
                  { label: "عروض تفاوض جديدة", value: pendingNegotiationsList.length, icon: "🤝", color: "from-orange-500 to-amber-600" },
                  { label: "نقاط المكافآت", value: points, icon: "⭐", color: "from-sun to-orange-500" },
                ].map((s, i) => (
                  <div key={i} className="rounded-3xl border border-sand bg-white p-5 shadow-sm">
                    <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-md text-lg`}>
                      {s.icon}
                    </div>
                    <div className="text-3xl font-black text-ink">{s.value}</div>
                    <div className="mt-1 text-xs font-bold text-ink/60">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* 1. Direct Acceptances from Tutors (المدرسين الذين وافقوا بنفس السعر والميعاد) */}
              {directAcceptances.length > 0 && (
                <div className="rounded-3xl border-2 border-mint bg-gradient-to-br from-mint/10 via-white to-cream p-6 shadow-md space-y-4 animate-in fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint text-white text-2xl shadow-md shadow-mint/30">
                        ✅
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-ink">مدرسون وافقوا على طلبك بنفس السعر والميعاد!</h2>
                        <p className="text-xs text-ink/60">
                          وافق هؤلاء المدرسون المعتمدون على تقديم الحصة لك بنفس سعرك وميعادك المطلوب. أكد اختيارك للمدرس لتبدأ الحصة فوراً.
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-mint px-3.5 py-1 text-xs font-black text-white shadow-sm">
                      {directAcceptances.length} مدرسين بانتظار تأكيدك
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {directAcceptances.map(({ req, negotiation }) => (
                      <div
                        key={negotiation.id}
                        className="rounded-2xl border-2 border-mint/40 bg-white p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-mint transition"
                      >
                        <div>
                          <div className="flex items-center justify-between border-b border-sand pb-2">
                            <span className="font-mono text-xs font-bold text-mint">{req.id}</span>
                            <span className="rounded-full bg-mint/15 px-2.5 py-0.5 text-[11px] font-black text-mint">
                              موافق على السعر والميعاد المطلوب ✅
                            </span>
                          </div>
                          <h3 className="mt-2 text-base font-black text-ink">
                            {req.subject} — <span className="text-mint font-bold">{req.topic}</span>
                          </h3>

                          {/* Tutor Card */}
                          <Link
                            href={`/tutor/${negotiation.tutorId}`}
                            target="_blank"
                            className="mt-3 flex items-center gap-3 rounded-xl bg-cream/70 p-3 transition hover:bg-mint/10 group"
                            title="انقر لفتح بروفايل المدرس وتقييماته"
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mint/20 text-2xl group-hover:scale-105 transition">
                              {negotiation.tutorAvatar || "👨‍🏫"}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-black text-ink group-hover:text-mint transition flex items-center gap-1.5">
                                <span>{negotiation.tutorName}</span>
                                <span className="text-[10px] text-mint font-bold">(عرض البروفايل والتقييمات ↗)</span>
                              </div>
                              <div className="text-[11px] text-ink/60 font-semibold flex items-center gap-2 mt-0.5">
                                <span className="flex items-center gap-0.5 text-sun font-bold">
                                  <Star className="h-3 w-3 fill-sun text-sun inline" /> {negotiation.tutorRating ?? 5.0}
                                </span>
                                <span>·</span>
                                <span>{negotiation.tutorSessions ?? 0} جلسة مكتملة</span>
                              </div>
                            </div>
                          </Link>

                          <div className="mt-3 space-y-2 rounded-xl border border-sand/70 bg-cream/30 p-3.5 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-ink/60 font-bold">السعر المتفق عليه:</span>
                              <span className="text-base font-black text-mint">{req.budget} ج.م</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-sand/60 pt-2">
                              <span className="text-ink font-bold">موعد الحصة:</span>
                              <span className="font-black text-ink">{negotiation.proposedTime || req.preferredTime}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-sand/60">
                          <button
                            onClick={() => handleRespondToNegotiation(req.id, negotiation.id, "ACCEPT")}
                            className="w-full flex items-center justify-center gap-2 rounded-full bg-mint py-3 text-xs font-black text-white hover:brightness-95 transition shadow-md shadow-mint/20"
                          >
                            <span>🎯 اختيار وتأكيد المدرس وبدء الحصة</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Counter Offers from Tutors (المدرسين الذين تفاوضوا) */}
              {counterOffers.length > 0 && (
                <div className="rounded-3xl border-2 border-coral bg-gradient-to-br from-coral/10 via-white to-cream p-6 shadow-md space-y-4 animate-in fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-coral text-white text-2xl shadow-md shadow-coral/30">
                        🤝
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-ink">عروض تفاوض من المدرسين (سعر أو موعد مختلف)</h2>
                        <p className="text-xs text-ink/60">
                          قدم لك هؤلاء المدرسون عروضاً معدلة على السعر أو الموعد. يمكنك قبول العرض الأنسب لك أو رفضه.
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-coral px-3.5 py-1 text-xs font-black text-white shadow-sm">
                      {counterOffers.length} عرض تفاوض بانتظارك
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {counterOffers.map(({ req, negotiation }) => (
                      <div
                        key={negotiation.id}
                        className="rounded-2xl border-2 border-coral/30 bg-white p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-coral transition"
                      >
                        <div>
                          <div className="flex items-center justify-between border-b border-sand pb-2">
                            <span className="font-mono text-xs font-bold text-coral">{req.id}</span>
                            <span className="rounded-full bg-coral/15 px-2.5 py-0.5 text-[11px] font-black text-coral">
                              عرض تفاوض معلق ⏳
                            </span>
                          </div>
                          <h3 className="mt-2 text-base font-black text-ink flex flex-wrap items-center gap-2">
                            <span>
                              {req.subject && req.subject !== req.topic ? (
                                <>
                                  {req.subject} — <span className="text-coral font-bold">{req.topic}</span>
                                </>
                              ) : (
                                <span className="text-coral font-bold">{req.subject || req.topic}</span>
                              )}
                            </span>
                            {req.faculty && (
                              <span className="rounded-xl bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-0.5 text-xs font-bold inline-flex items-center gap-1 shadow-sm">
                                🏛️ {req.faculty}
                              </span>
                            )}
                          </h3>

                          {/* Tutor Card */}
                          <Link
                            href={`/tutor/${negotiation.tutorId}`}
                            target="_blank"
                            className="mt-3 flex items-center gap-3 rounded-xl bg-cream/70 p-3 transition hover:bg-coral/10 group"
                            title="انقر لفتح بروفايل المدرس وتقييماته"
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-coral/15 text-2xl group-hover:scale-105 transition">
                              {negotiation.tutorAvatar || "👨‍🏫"}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-black text-ink group-hover:text-coral transition flex items-center gap-1.5">
                                <span>{negotiation.tutorName}</span>
                                <span className="text-[10px] text-coral font-bold">(عرض البروفايل ↗)</span>
                              </div>
                              <div className="text-[11px] text-ink/60 font-semibold flex items-center gap-2 mt-0.5">
                                <span className="flex items-center gap-0.5 text-sun font-bold">
                                  <Star className="h-3 w-3 fill-sun text-sun inline" /> {negotiation.tutorRating ?? 5.0}
                                </span>
                                <span>·</span>
                                <span>مدرس معتمد على المنصة</span>
                              </div>
                            </div>
                          </Link>

                          <div className="mt-3 space-y-2 rounded-xl border border-sand/70 bg-cream/30 p-3.5 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-ink/60 font-bold">سعرك المطلوب أصلاً:</span>
                              <span className="font-bold text-ink/60 line-through">{req.budget} ج.م</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-ink font-bold">السعر المقترح من المدرس:</span>
                              <span className="text-base font-black text-coral">{negotiation.proposedAmountEGP} ج.م</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-sand/60 pt-2">
                              <span className="text-ink font-bold">الموعد المقترح:</span>
                              <span className="font-black text-mint">{negotiation.proposedTime}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-sand/60">
                          <button
                            onClick={() => handleRespondToNegotiation(req.id, negotiation.id, "ACCEPT")}
                            className="flex-1 rounded-full bg-coral py-2.5 text-xs font-black text-white hover:bg-coralDark transition shadow-sm shadow-coral/25"
                          >
                            قبول التفاوض واختيار المدرس ✓
                          </button>
                          <button
                            onClick={() => handleRespondToNegotiation(req.id, negotiation.id, "REJECT")}
                            className="rounded-full border border-sand px-4 py-2.5 text-xs font-bold text-ink/70 hover:bg-sand/40 transition"
                          >
                            رفض ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requests Pending Tutor Responses in Radar */}
              {requests.filter(r => (r.status === "MATCHING" || r.status === "PUBLISHED") && !(r.negotiations?.some(n => n.status === "PENDING"))).length > 0 && (
                <div className="space-y-4">
                  {requests.filter(r => (r.status === "MATCHING" || r.status === "PUBLISHED") && !(r.negotiations?.some(n => n.status === "PENDING"))).map(req => (
                    <div key={req.id} className="rounded-3xl border border-sun/60 bg-gradient-to-br from-sun/10 via-white to-white p-6 shadow-sm space-y-3 animate-in fade-in">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sand/60 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sun/20 text-2xl animate-pulse">
                            📡
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <code className="font-mono text-xs font-bold text-coral">{req.id}</code>
                              <span className="rounded-full bg-sun/25 px-2.5 py-0.5 text-[11px] font-black text-ink">
                                معروضة في رادار المدرسين ⏳
                              </span>
                              {req.faculty && (
                                <span className="rounded-full bg-lilac/25 text-purple-900 border border-lilac/40 px-2.5 py-0.5 text-[11px] font-black flex items-center gap-1">
                                  🏛️ {req.faculty} {req.university ? `(${req.university})` : ""}
                                </span>
                              )}
                            </div>
                            <h3 className="text-base font-black text-ink mt-0.5 flex flex-wrap items-center gap-2">
                              <span>
                                {req.subject && req.subject !== req.topic ? (
                                  <>
                                    {req.subject} — <span className="text-coral font-bold">{req.topic}</span>
                                  </>
                                ) : (
                                  <span className="text-coral font-bold">{req.subject || req.topic}</span>
                                )}
                              </span>
                              {req.faculty && (
                                <span className="rounded-xl bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-0.5 text-xs font-bold inline-flex items-center gap-1 shadow-sm">
                                  🏛️ {req.faculty}
                                </span>
                              )}
                            </h3>
                          </div>
                        </div>
                        <div className="text-left">
                          <span className="text-xs text-ink/50 font-bold block">سعرك المعروض:</span>
                          <strong className="text-lg font-black text-mint">{req.budget} ج.م</strong>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink/70">
                        <p className="leading-relaxed max-w-xl">
                          طلبك منشور حالياً ويظهر لجميع المدرسين المتخصصين في تخصصك. بمجرد أن يوافق مدرس أو يرسل تفاوضاً ستظهر لك موافقته هنا فوراً لتأكيد الحجز.
                        </p>
                        <span className="text-xs font-black text-ink bg-sand/30 px-3 py-1.5 rounded-full">
                          ⏰ موعدك المطلوب: {req.preferredTime}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Confirmed Active Session Banner */}
              {requests.filter(r => r.status === "CONFIRMED" || r.status === "IN_PROGRESS").map(req => {
                const hasStarted = !!req.selectedTutor?.meetingUrl || req.status === "IN_PROGRESS";
                const meetUrl = req.selectedTutor?.meetingUrl;

                return (
                  <div
                    key={req.id}
                    className={`rounded-3xl border-2 p-6 shadow-sm space-y-3 transition ${
                      hasStarted && meetUrl
                        ? "border-emerald-500 bg-gradient-to-br from-emerald-500/15 via-white to-cream"
                        : "border-sun/60 bg-gradient-to-br from-sun/10 via-white to-cream"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white text-2xl shadow-md ${
                            hasStarted && meetUrl
                              ? "bg-emerald-600 shadow-emerald-600/30 animate-bounce-slow"
                              : "bg-sun text-ink shadow-sun/30"
                          }`}
                        >
                          <Video className="h-7 w-7" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {hasStarted && meetUrl ? (
                              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-black text-emerald-800 animate-pulse">
                                🔴 المدرس بدأ المحاضرة الآن على Google Meet!
                              </span>
                            ) : (
                              <span className="rounded-full bg-sun/25 px-2.5 py-0.5 text-[11px] font-black text-ink">
                                ⏳ الجلسة مؤكدة — في انتظار فتح المدرس للقاعة كـ Host
                              </span>
                            )}
                            <span className="text-xs font-bold text-ink/50">{req.preferredTime}</span>
                          </div>
                          <h3 className="text-lg font-black text-ink mt-0.5">
                            {req.subject} — {req.topic} مع {req.selectedTutor?.name}
                          </h3>
                          <p className="text-xs text-ink/60">
                            {hasStarted && meetUrl
                              ? "اضغط على الزر الأخضر للدخول فوراً في نفس جلسة Google Meet مع المدرس."
                              : "بمجرد أن يضغط المدرس على بدء الجلسة، سيتاح لك زر الدخول الأخضر فوراً تلقائياً."}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {hasStarted && meetUrl ? (
                          <>
                            <a
                              href={meetUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-full bg-emerald-600 px-6 py-3 text-xs font-black text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/25 flex items-center gap-1.5 animate-pulse-slow"
                            >
                              <Video className="h-4 w-4" />
                              <span>انضمام للمحاضرة مع المدرس الآن (Google Meet) 🚀</span>
                            </a>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(meetUrl);
                                triggerToast("📋 تم نسخ رابط Google Meet بنجاح!");
                              }}
                              className="rounded-full border border-sand bg-white px-3.5 py-2.5 text-xs font-bold text-ink hover:bg-sand transition"
                              title="نسخ رابط المحاضرة"
                            >
                              نسخ الرابط 📋
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-ink/5 px-4 py-2.5 text-xs font-bold text-ink/50 flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5 animate-spin text-sun" />
                              <span>في انتظار قيام المدرس ببدء الجلسة وإضافة رابط Google Meet...</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================
              NAV 2: ALL STUDENT REQUESTS (SHOWED IN DETAIL)
          ======================================================== */}
          {activeNav === "requests" && (() => {
            const availableFaculties = Array.from(new Set(requests.map(r => r.faculty).filter(Boolean)));
            const availableSubjects = Array.from(new Set(requests.map(r => r.subject).filter(Boolean)));
            const availableYears = Array.from(new Set(requests.map(r => r.academicYear).filter(Boolean)));

            const filteredRequests = requests.filter((r) => {
              if (selectedFacultyFilter !== "ALL" && r.faculty !== selectedFacultyFilter) return false;
              if (selectedSubjectFilter !== "ALL" && r.subject !== selectedSubjectFilter) return false;
              if (selectedYearFilter !== "ALL" && r.academicYear !== selectedYearFilter) return false;
              if (searchQuery.trim()) {
                const q = searchQuery.trim().toLowerCase();
                const match = `${r.subject} ${r.topic} ${r.faculty || ""} ${r.academicYear || ""} ${r.description} ${r.statusLabel}`.toLowerCase();
                if (!match.includes(q)) return false;
              }
              return true;
            });

            const activeFiltersCount =
              (selectedFacultyFilter !== "ALL" ? 1 : 0) +
              (selectedSubjectFilter !== "ALL" ? 1 : 0) +
              (selectedYearFilter !== "ALL" ? 1 : 0) +
              (searchQuery.trim() ? 1 : 0);

            return (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-sand bg-white p-6 shadow-sm">
                  <div>
                    <h1 className="text-2xl font-black text-ink">📋 جميع طلباتي واستغاثاتي الأكاديمية</h1>
                    <p className="text-sm text-ink/60">
                      تتبع حالة كل طلب، راجع عروض التفاوض من المدرسين، وفلتر زنقاتك بالكلية أو المادة أو السنة.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowFilterPanel(!showFilterPanel)}
                      className={`rounded-full px-5 py-2.5 text-xs font-black transition flex items-center gap-2 shadow-sm ${
                        activeFiltersCount > 0
                          ? "bg-coral text-white shadow-coral/25"
                          : "border border-sand bg-cream/60 text-ink hover:bg-sand/50"
                      }`}
                    >
                      <Filter className="h-4 w-4" />
                      <span>فلترة الطلبات</span>
                      {activeFiltersCount > 0 && (
                        <span className="rounded-full bg-white text-coral px-2 py-0.5 text-[11px] font-black">
                          {activeFiltersCount}
                        </span>
                      )}
                    </button>
                    <Link
                      href="/requests/new"
                      className="rounded-full bg-coral px-5 py-2.5 text-xs font-black text-white hover:bg-coralDark transition shadow"
                    >
                      + انشر طلب جديد
                    </Link>
                  </div>
                </div>

                {/* Filter Panel (الكلية • المادة • السنة الدراسية) */}
                <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sand/60 pb-3">
                    <div className="flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-coral" />
                      <h3 className="text-sm font-black text-ink">تصفية وبحث طلباتي</h3>
                    </div>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={() => {
                          setSelectedFacultyFilter("ALL");
                          setSelectedSubjectFilter("ALL");
                          setSelectedYearFilter("ALL");
                          setSearchQuery("");
                        }}
                        className="text-xs font-bold text-coral hover:underline"
                      >
                        إعادة ضبط الفلاتر ↺
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Faculty Filter */}
                    <div>
                      <label className="block text-xs font-bold text-ink/70 mb-1 flex items-center gap-1">
                        <span>🏛️ الكلية / التخصص</span>
                      </label>
                      <select
                        value={selectedFacultyFilter}
                        onChange={(e) => setSelectedFacultyFilter(e.target.value)}
                        className="w-full rounded-2xl border border-sand bg-cream/40 p-2.5 text-xs font-bold text-ink outline-none focus:border-coral transition"
                      >
                        <option value="ALL">جميع الكليات ({availableFaculties.length})</option>
                        {availableFaculties.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>

                    {/* Subject Filter */}
                    <div>
                      <label className="block text-xs font-bold text-ink/70 mb-1 flex items-center gap-1">
                        <span>📚 المادة الدراسية</span>
                      </label>
                      <select
                        value={selectedSubjectFilter}
                        onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                        className="w-full rounded-2xl border border-sand bg-cream/40 p-2.5 text-xs font-bold text-ink outline-none focus:border-coral transition"
                      >
                        <option value="ALL">جميع المواد ({availableSubjects.length})</option>
                        {availableSubjects.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Academic Year Filter */}
                    <div>
                      <label className="block text-xs font-bold text-ink/70 mb-1 flex items-center gap-1">
                        <span>🎓 السنة الدراسية / الفرقة</span>
                      </label>
                      <select
                        value={selectedYearFilter}
                        onChange={(e) => setSelectedYearFilter(e.target.value)}
                        className="w-full rounded-2xl border border-sand bg-cream/40 p-2.5 text-xs font-bold text-ink outline-none focus:border-coral transition"
                      >
                        <option value="ALL">جميع الفرق والسنين</option>
                        {availableYears.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>

                    {/* Search query */}
                    <div>
                      <label className="block text-xs font-bold text-ink/70 mb-1 flex items-center gap-1">
                        <Search className="h-3 w-3 text-ink/50" />
                        <span>بحث بالكلمات</span>
                      </label>
                      <input
                        type="text"
                        placeholder="ابحث في طلباتك..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-2xl border border-sand bg-cream/40 p-2.5 text-xs font-bold text-ink outline-none focus:border-coral transition"
                      />
                    </div>
                  </div>

                  {/* Active Filter Badges */}
                  {activeFiltersCount > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-sand/40">
                      <span className="text-[11px] font-bold text-ink/50">الفلاتر المطبقة:</span>
                      {selectedFacultyFilter !== "ALL" && (
                        <span className="rounded-full bg-purple-100 text-purple-900 border border-purple-200 px-2.5 py-0.5 text-xs font-bold flex items-center gap-1">
                          <span>🏛️ {selectedFacultyFilter}</span>
                          <button onClick={() => setSelectedFacultyFilter("ALL")} className="text-[10px] hover:text-red-600">✕</button>
                        </span>
                      )}
                      {selectedSubjectFilter !== "ALL" && (
                        <span className="rounded-full bg-coral/15 text-coral border border-coral/30 px-2.5 py-0.5 text-xs font-bold flex items-center gap-1">
                          <span>📚 {selectedSubjectFilter}</span>
                          <button onClick={() => setSelectedSubjectFilter("ALL")} className="text-[10px] hover:text-red-600">✕</button>
                        </span>
                      )}
                      {selectedYearFilter !== "ALL" && (
                        <span className="rounded-full bg-mint/15 text-mint border border-mint/30 px-2.5 py-0.5 text-xs font-bold flex items-center gap-1">
                          <span>🎓 {selectedYearFilter}</span>
                          <button onClick={() => setSelectedYearFilter("ALL")} className="text-[10px] hover:text-red-600">✕</button>
                        </span>
                      )}
                      {searchQuery.trim() && (
                        <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-0.5 text-xs font-bold flex items-center gap-1">
                          <span>🔍 "{searchQuery}"</span>
                          <button onClick={() => setSearchQuery("")} className="text-[10px] hover:text-red-600">✕</button>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {filteredRequests.length > 0 ? (
                  <div className="space-y-4">
                    {filteredRequests.map((r) => (
                      <div key={r.id} className="rounded-3xl border border-sand bg-white p-6 shadow-sm space-y-4 transition hover:shadow-md">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sand pb-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <code className="font-mono text-xs font-bold text-ink/60 bg-ink/5 px-2 py-0.5 rounded">
                                {r.id}
                              </code>
                              <span className={"rounded-full px-3 py-0.5 text-xs font-black " + (
                                r.status === "CONFIRMED" ? "bg-mint/20 text-mint" :
                                r.status === "COMPLETED" ? "bg-lilac/20 text-lilac" :
                                r.status === "STUDENT_RATED" ? "bg-mint/20 text-mint" :
                                r.status === "DISPUTED" ? "bg-red-100 text-red-600" : "bg-sun/20 text-sun"
                              )}>
                                {r.statusLabel}
                              </span>
                              {r.faculty && (
                                <span className="rounded-full bg-lilac/25 text-purple-900 border border-lilac/40 px-2.5 py-0.5 text-xs font-black flex items-center gap-1">
                                  🏛️ {r.faculty} {r.university ? `(${r.university})` : ""}
                                </span>
                              )}
                              {r.academicYear && (
                                <span className="rounded-full bg-amber-500/15 text-amber-900 border border-amber-500/30 px-2.5 py-0.5 text-xs font-black flex items-center gap-1">
                                  🎓 {r.academicYear}
                                </span>
                              )}
                            </div>
                            <h3 className="text-lg font-black text-ink mt-1 flex flex-wrap items-center gap-2">
                              <span>
                                {r.subject && r.subject !== r.topic ? (
                                  <>
                                    {r.subject} — <span className="text-coral font-bold">{r.topic}</span>
                                  </>
                                ) : (
                                  <span className="text-coral font-bold">{r.subject || r.topic}</span>
                                )}
                              </span>
                            </h3>
                          </div>
                          <div className="text-left">
                            <div className="text-xs font-bold text-ink/40">الميزانية الأصلية</div>
                            <div className="text-lg font-black text-coral">{r.budget} ج.م</div>
                          </div>
                        </div>

                        <p className="text-xs text-ink/70 leading-relaxed">
                          {r.description}
                        </p>

                        {r.negotiations && r.negotiations.length > 0 && (
                          <div className="space-y-3 rounded-2xl border-2 border-coral/30 bg-coral/5 p-4">
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-black text-ink flex items-center gap-2">
                                <span>🤝</span>
                                <span>عروض التفاوض المقدمة من المدرسين ({r.negotiations.length})</span>
                              </div>
                              {r.negotiations.some(n => n.status === "PENDING") && (
                                <span className="rounded-full bg-coral px-2.5 py-0.5 text-[10px] font-black text-white animate-pulse">
                                  بانتظار ردك ⏳
                                </span>
                              )}
                            </div>

                            {r.negotiations.map((negotiation) => (
                              <div
                                key={negotiation.id}
                                className={
                                  "flex flex-col gap-3 rounded-2xl border p-4 transition md:flex-row md:items-center md:justify-between " +
                                  (negotiation.status === "PENDING"
                                    ? "border-coral bg-white shadow-sm"
                                    : negotiation.status === "ACCEPTED"
                                      ? "border-mint/40 bg-mint/5"
                                      : "border-sand bg-white/60 opacity-60")
                                }
                              >
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Link
                                      href={`/tutor/${negotiation.tutorId}`}
                                      target="_blank"
                                      className="group/tutor flex items-center gap-1.5 rounded-xl bg-sand/30 hover:bg-coral/15 px-2.5 py-1 transition"
                                      title="انقر لعرض بروفايل المدرس وتقييماته ومواده"
                                    >
                                      <span className="text-base">👨‍🏫</span>
                                      <span className="text-sm font-black text-ink group-hover/tutor:text-coral underline-offset-2 group-hover/tutor:underline">
                                        {negotiation.tutorName}
                                      </span>
                                      <span className="text-[10px] font-bold text-coral opacity-80">(عرض البروفايل ↗)</span>
                                    </Link>
                                    <span
                                      className={
                                        "rounded-full px-2 py-0.5 text-[10px] font-black " +
                                        (negotiation.status === "PENDING"
                                          ? negotiation.isDirectAgreement
                                            ? "bg-mint/20 text-mint"
                                            : "bg-amber-100 text-amber-700"
                                          : negotiation.status === "ACCEPTED"
                                            ? "bg-mint/20 text-mint"
                                            : "bg-red-100 text-red-600")
                                      }
                                    >
                                      {negotiation.status === "PENDING"
                                        ? negotiation.isDirectAgreement
                                          ? "موافق على السعر والميعاد المطلوب ✅"
                                          : "عرض تفاوض 🤝"
                                        : negotiation.status === "ACCEPTED"
                                          ? "تم قبول هذا العرض ✓"
                                          : "تم الرفض ✕"}
                                    </span>
                                  </div>
                                  <div className="text-xs text-ink/70 flex flex-wrap items-center gap-3 pt-1">
                                    <span>
                                      {negotiation.isDirectAgreement ? (
                                        <>السعر المتفق عليه: <strong className="text-mint text-sm font-black">{negotiation.proposedAmountEGP} ج.م</strong></>
                                      ) : (
                                        <>السعر المقترح: <strong className="text-coral text-sm font-black">{negotiation.proposedAmountEGP} ج.م</strong> <span className="text-ink/40 text-[11px] mr-1">(الميزانية: {r.budget} ج.م)</span></>
                                      )}
                                    </span>
                                    <span>•</span>
                                    <span>
                                      الموعد: <strong className="text-ink font-black">{negotiation.proposedTime}</strong>
                                    </span>
                                  </div>
                                </div>

                                {negotiation.status === "PENDING" && (
                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      onClick={() => handleRespondToNegotiation(r.id, negotiation.id, "ACCEPT")}
                                      className={
                                        "rounded-full px-4 py-2 text-xs font-black text-white hover:brightness-95 transition shadow-sm " +
                                        (negotiation.isDirectAgreement ? "bg-mint" : "bg-coral")
                                      }
                                    >
                                      {negotiation.isDirectAgreement ? "اختيار المدرس وتأكيد الحصة 🎯" : "قبول التفاوض وتأكيد الحجز ✓"}
                                    </button>
                                    <button
                                      onClick={() => handleRespondToNegotiation(r.id, negotiation.id, "REJECT")}
                                      className="rounded-full border border-sand px-3 py-2 text-xs font-bold text-ink/70 hover:bg-sand/40 transition"
                                    >
                                      رفض ✕
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Visual Progress Steps */}
                        <div className="py-2">
                          <div className="flex items-center justify-between text-[11px] font-bold text-ink/50 mb-1">
                            <span>1. نشر الطلب</span>
                            <span>2. ترشيح المدرسين</span>
                            <span>3. تأكيد الحجز</span>
                            <span>4. الشرح المباشر</span>
                            <span>5. التقييم والمكافأة</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-sand overflow-hidden">
                            <div
                              className="h-full bg-coral transition-all duration-500"
                              style={{
                                width:
                                  r.status === "DRAFT" ? "20%" :
                                  r.status === "MATCHING" ? "40%" :
                                  r.status === "CONFIRMED" ? "60%" :
                                  r.status === "IN_PROGRESS" ? "80%" : "100%",
                              }}
                            />
                          </div>
                        </div>

                        {/* Action Footers */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-sand/60">
                          <div className="text-xs text-ink/60">
                            {r.selectedTutor ? (
                              <span>المدرس المعتمد: <strong className="text-ink">{r.selectedTutor.name}</strong></span>
                            ) : (
                              <span>المدرس: <strong className="text-sun">جاري المطابقة</strong></span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {r.status === "COMPLETED" && (
                              <button
                                onClick={() => setRatingReq(r)}
                                className="rounded-full bg-sun px-4 py-1.5 text-xs font-black text-ink hover:brightness-95 transition shadow-sm"
                              >
                                ⭐ قيّم المدرس واكسب +20 نقطة
                              </button>
                            )}

                            {r.status !== "DISPUTED" && (
                              <button
                                onClick={() => setDisputeReq(r)}
                                className="rounded-full border border-sand text-ink/50 px-3 py-1 text-[11px] font-bold hover:text-red-500 hover:border-red-200 transition"
                              >
                                إبلاغ عن مشكلة
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-sand bg-white p-12 text-center shadow-sm space-y-3">
                    <div className="text-3xl">🔍</div>
                    <h3 className="text-base font-black text-ink">لا توجد طلبات مطابقة للفلاتر المحددة</h3>
                    <p className="text-xs text-ink/60 max-w-sm mx-auto">
                      جرب تغيير الكلية أو المادة أو مسح الفلاتر لعرض جميع طلباتك.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedFacultyFilter("ALL");
                        setSelectedSubjectFilter("ALL");
                        setSelectedYearFilter("ALL");
                        setSearchQuery("");
                      }}
                      className="rounded-full bg-coral px-5 py-2 text-xs font-black text-white hover:bg-coralDark shadow transition"
                    >
                      إعادة ضبط الفلاتر ↺
                    </button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ========================================================
              NAV: SCHEDULE (جدول مواعيد الحصص)
          ======================================================== */}
          {activeNav === "schedule" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-sand bg-white p-6 shadow-sm">
                <div>
                  <h1 className="text-2xl font-black text-ink">📅 جدول مواعيد حصصك</h1>
                  <p className="mt-1 text-sm text-ink/60">
                    جميع الجلسات المؤكدة والقادمة مرتبة بالتاريخ والوقت — تظهر الحصة الأونلاين فور فتحها من المدرس.
                  </p>
                </div>
                <button
                  onClick={() => setActiveNav("requests")}
                  className="rounded-full bg-coral px-5 py-2.5 text-xs font-black text-white hover:bg-coralDark transition shadow-md shadow-coral/20"
                >
                  + انشر زنقة جديدة
                </button>
              </div>

              {/* IN_PROGRESS live banner */}
              {requests.filter(r => r.status === "IN_PROGRESS" && r.mode === "ONLINE").map(req => (
                <div
                  key={req.id}
                  className="rounded-3xl border-2 border-red-500 bg-gradient-to-r from-red-500/10 via-red-400/5 to-white p-6 shadow-xl animate-pulse-slow space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-4 w-4">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
                        <span className="relative inline-flex h-4 w-4 rounded-full bg-red-600"></span>
                      </span>
                      <div>
                        <h2 className="text-lg font-black text-red-600">
                          🔴 الحصة مفتوحة الآن! المدرس بانتظارك في القاعة الافتراضية
                        </h2>
                        <p className="text-xs text-ink/60 mt-0.5">
                          {req.subject} — {req.topic} | الميعاد المتفق عليه: {req.preferredTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {req.selectedTutor?.meetingUrl ? (
                        <a
                          href={req.selectedTutor.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-2xl bg-red-600 px-6 py-3 text-sm font-black text-white hover:bg-red-700 transition shadow-lg shadow-red-600/30 flex items-center gap-2"
                        >
                          <Video className="h-4 w-4" />
                          دخول محاضرة Google Meet الآن 🎥
                        </a>
                      ) : (
                        <span className="rounded-2xl bg-amber-500/20 px-5 py-3 text-sm font-bold text-amber-900 flex items-center gap-2">
                          <Clock className="h-4 w-4 animate-spin text-amber-600" />
                          في انتظار فتح المدرس للقاعة...
                        </span>
                      )}
                      {req.selectedTutor?.meetingUrl && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(req.selectedTutor!.meetingUrl!);
                            triggerToast("📋 تم نسخ رابط Google Meet بنجاح!");
                          }}
                          className="rounded-2xl border border-red-200 bg-white px-4 py-3 text-xs font-black text-red-600 hover:bg-red-50"
                        >
                          نسخ الرابط 📋
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Confirmed & Completed sessions list */}
              {(() => {
                const sessionRequests = requests.filter(r =>
                  ["CONFIRMED", "TUTOR_SELECTED", "IN_PROGRESS", "COMPLETED", "STUDENT_RATED"].includes(r.status)
                );

                if (sessionRequests.length === 0) {
                  return (
                    <div className="rounded-3xl border border-dashed border-sand bg-cream p-12 text-center">
                      <div className="text-5xl mb-4">📭</div>
                      <h3 className="text-lg font-black text-ink/50">لا توجد حصص مجدولة حتى الآن</h3>
                      <p className="mt-2 text-xs text-ink/40">انشر طلبك واحجز حصتك القادمة لتظهر هنا مع التفاصيل الكاملة</p>
                      <button
                        onClick={() => setActiveNav("requests")}
                        className="mt-5 rounded-full bg-coral px-6 py-2.5 text-xs font-black text-white hover:bg-coralDark"
                      >
                        انشر زنقة الآن
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {sessionRequests
                      .sort((a, b) => a.preferredTime.localeCompare(b.preferredTime))
                      .map(req => {
                        const isLive = req.status === "IN_PROGRESS";
                        const isDone = req.status === "COMPLETED" || req.status === "STUDENT_RATED";
                        const isOnline = req.mode === "ONLINE";
                        const tutorName = req.selectedTutor?.name ?? req.negotiations?.find(n => n.status === "ACCEPTED")?.tutorName ?? "المدرس";

                        return (
                          <div
                            key={req.id}
                            className={`rounded-3xl border p-5 shadow-sm flex flex-wrap items-center justify-between gap-4 ${
                              isLive
                                ? "border-red-400 bg-red-50"
                                : isDone
                                ? "border-mint/30 bg-mint/5"
                                : "border-sand bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl shadow ${
                                isLive ? "bg-red-500 text-white" : isDone ? "bg-mint text-white" : "bg-mint/15 text-mint"
                              }`}>
                                {isLive ? "🔴" : isDone ? "✓" : isOnline ? "💻" : "🏫"}
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-black text-ink text-base">
                                    {req.subject} — {req.topic}
                                  </span>
                                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-black ${
                                    isLive ? "bg-red-500 text-white animate-pulse" :
                                    req.status === "COMPLETED" ? "bg-mint/20 text-mint" :
                                    req.status === "STUDENT_RATED" ? "bg-amber-100 text-amber-700" :
                                    req.status === "CONFIRMED" ? "bg-mint/15 text-mint" : "bg-lilac/15 text-indigo-600"
                                  }`}>
                                    {isLive ? "🔴 جارية الآن" :
                                     req.status === "COMPLETED" ? "🎉 مكتملة" :
                                     req.status === "STUDENT_RATED" ? "⭐ تم التقييم" :
                                     req.status === "CONFIRMED" ? "✅ مؤكدة" : "تم اختيار المدرس"}
                                  </span>
                                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                    isOnline ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                                  }`}>
                                    {isOnline ? "💻 أونلاين" : "🏫 حضوري"}
                                  </span>
                                </div>

                                <div className="text-xs text-ink/60 space-y-0.5">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    <span>الميعاد: {req.preferredTime}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span>المدرس: </span>
                                    <strong>{tutorName}</strong>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span>السعر المتفق: </span>
                                    <strong className="text-coral">{req.budget} ج.م</strong>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              {req.status === "COMPLETED" && (
                                <button
                                  onClick={() => setRatingReq(req)}
                                  className="rounded-2xl bg-amber-500 px-5 py-2.5 text-xs font-black text-white hover:bg-amber-600 transition shadow-sm flex items-center gap-1.5"
                                >
                                  ⭐ قيّم المدرس (+20 نقطة)
                                </button>
                              )}

                              {req.status === "STUDENT_RATED" && (
                                <span className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs font-bold text-amber-700 flex items-center gap-1.5">
                                  ⭐ تم تقييم الجلسة بنجاح
                                </span>
                              )}

                              {isOnline && (isLive || req.status === "CONFIRMED") && (
                                <>
                                  {req.selectedTutor?.meetingUrl ? (
                                    <a
                                      href={req.selectedTutor.meetingUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="rounded-2xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white hover:bg-emerald-700 transition shadow-md flex items-center gap-1.5"
                                    >
                                      <Video className="h-4 w-4" />
                                      دخول Google Meet 🎥
                                    </a>
                                  ) : (
                                    <span className="rounded-2xl bg-amber-100 px-5 py-2.5 text-xs font-bold text-amber-800 flex items-center gap-1.5">
                                      <Clock className="h-4 w-4 animate-spin text-amber-600" />
                                      في انتظار المدرس...
                                    </span>
                                  )}
                                  {req.selectedTutor?.meetingUrl && (
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(req.selectedTutor!.meetingUrl!);
                                        triggerToast("📋 تم نسخ رابط Google Meet بنجاح!");
                                      }}
                                      className="rounded-2xl border border-sand bg-white px-3 py-2.5 text-xs font-bold text-ink hover:bg-sand"
                                      title="نسخ رابط المحاضرة"
                                    >
                                      📋
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleStudentCompleteSession(req.id)}
                                    className="rounded-2xl border border-sand bg-white px-4 py-2.5 text-xs font-bold text-ink hover:bg-sand transition"
                                  >
                                    إنهاء واستلام الشرح ✓
                                  </button>
                                </>
                              )}
                              {isOnline && !isLive && req.status !== "CONFIRMED" && !isDone && (
                                <span className="rounded-2xl bg-ink/5 px-4 py-2.5 text-xs font-bold text-ink/50 flex items-center gap-2">
                                  <Clock className="h-3.5 w-3.5" />
                                  القاعة ستفتح عند تأكيد الموعد
                                </span>
                              )}
                              {!isOnline && !isDone && (
                                <span className="rounded-2xl bg-orange-50 border border-orange-200 px-4 py-2.5 text-xs font-bold text-orange-600 flex items-center gap-2">
                                  📍 احضر في الموعد المحدد
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ========================================================
              NAV: INVOICES (فواتيري 🧾)
          ======================================================== */}
          {activeNav === "invoices" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-black text-ink">🧾 فواتيري</h1>
                <p className="mt-1 text-sm text-ink/60">كل مدفوعاتك على المنصة — جلسات خاصة وورش عمل — مع إمكانية طباعة كل فاتورة.</p>
              </div>

              {/* Session Invoices */}
              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-black text-ink flex items-center gap-2">
                  <span className="text-xl">📚</span> فواتير الجلسات الخاصة
                </h2>
                {requests.filter(r => ["TUTOR_SELECTED","CONFIRMED","IN_PROGRESS","COMPLETED","STUDENT_RATED","DISPUTED"].includes(r.status)).length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-sand bg-cream p-6 text-center text-xs font-bold text-ink/40">
                    لا توجد جلسات مدفوعة حتى الآن
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests.filter(r => ["TUTOR_SELECTED","CONFIRMED","IN_PROGRESS","COMPLETED","STUDENT_RATED","DISPUTED"].includes(r.status)).map((req, idx) => {
                      const tutorName = req.selectedTutor?.name ?? req.negotiations?.find(n => n.status === "ACCEPTED")?.tutorName ?? "المدرس";
                      const invoiceNo = `SES-${req.id.slice(0,8).toUpperCase()}`;
                      return (
                        <div key={req.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-sand bg-cream/60 p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-ink/40 bg-ink/5 px-2 py-0.5 rounded">{invoiceNo}</span>
                              <span className="rounded-full bg-mint/15 px-2 py-0.5 text-[11px] font-black text-mint">✓ مدفوعة</span>
                            </div>
                            <div className="font-black text-ink">
                              {req.subject && req.subject !== req.topic ? `${req.subject} — ${req.topic}` : (req.subject || req.topic)}
                            </div>
                            <div className="text-xs text-ink/60">المدرس: {tutorName} | الميعاد: {req.preferredTime}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-left">
                              <div className="text-xl font-black text-coral">{req.budget} ج.م</div>
                              <div className="text-[11px] text-ink/50">إجمالي المدفوع</div>
                            </div>
                            <button
                              onClick={() => printInvoice({
                                invoiceNo,
                                type: "SESSION",
                                subject: req.subject && req.subject !== req.topic ? `${req.subject} — ${req.topic}` : (req.subject || req.topic),
                                studentName: "أنا",
                                tutorName,
                                amountEGP: req.budget,
                                date: req.preferredTime,
                                status: "مدفوعة",
                              })}
                              className="flex items-center gap-1.5 rounded-xl bg-ink text-white px-3 py-2 text-xs font-black hover:bg-ink/80 transition"
                            >
                              🖨️ طباعة
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Workshop Invoices */}
              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-black text-ink flex items-center gap-2">
                  <span className="text-xl">🎬</span> فواتير ورش العمل
                </h2>
                {workshopEnrollments.filter(e => e.workshop.type === "PAID").length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-sand bg-cream p-6 text-center text-xs font-bold text-ink/40">
                    لم تشترك في ورش مدفوعة حتى الآن
                  </div>
                ) : (
                  <div className="space-y-3">
                    {workshopEnrollments.filter(e => e.workshop.type === "PAID").map((e) => {
                      const invoiceNo = `WRK-${e.id.slice(0,8).toUpperCase()}`;
                      return (
                        <div key={e.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-sand bg-cream/60 p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-ink/40 bg-ink/5 px-2 py-0.5 rounded">{invoiceNo}</span>
                              <span className="rounded-full bg-mint/15 px-2 py-0.5 text-[11px] font-black text-mint">✓ مدفوعة</span>
                            </div>
                            <div className="font-black text-ink">{e.workshop.title}</div>
                            <div className="text-xs text-ink/60">
                              المدرس: {e.workshop.tutor?.fullName ?? "—"} | التاريخ: {new Date(e.createdAt).toLocaleDateString("ar-EG")}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-left">
                              <div className="text-xl font-black text-coral">{e.workshop.priceEGP ?? 0} ج.م</div>
                              <div className="text-[11px] text-ink/50">إجمالي المدفوع</div>
                            </div>
                            <button
                              onClick={() => printInvoice({
                                invoiceNo,
                                type: "WORKSHOP",
                                subject: e.workshop.title,
                                studentName: "أنا",
                                tutorName: e.workshop.tutor?.fullName,
                                amountEGP: e.workshop.priceEGP ?? 0,
                                date: new Date(e.createdAt).toLocaleDateString("ar-EG"),
                                status: "مدفوعة",
                              })}
                              className="flex items-center gap-1.5 rounded-xl bg-ink text-white px-3 py-2 text-xs font-black hover:bg-ink/80 transition"
                            >
                              🖨️ طباعة
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              NAV 4: REWARDS & POINTS STORE
          ======================================================== */}
          {activeNav === "rewards" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-sun/40 bg-gradient-to-br from-sun/20 via-cream to-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-black text-ink/60">متجر المكافآت الحصري</span>
                    <h1 className="text-3xl font-black text-ink mt-1">{points} نقطة متاحة</h1>
                    <p className="text-xs text-ink/60 mt-1">
                      كلما أكملت جلسات وقيّمت المدرسين، كلما حصلت على نقاط تستبدلها بخصومات وكورسات مجانية!
                    </p>
                  </div>
                  <div className="text-5xl">🎁</div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    title: "كوبون خصم 50 ج.م",
                    desc: "كوبون خصم فوري (50 ج.م) يطبق عند دفع أي حصة دراسية أو ورشة عمل.",
                    cost: 500,
                    type: "DISCOUNT_COUPON",
                    icon: "🎟️",
                    tag: "الأكثر طلباً",
                  },
                  {
                    title: "تذكرة ورشة عمل مجانية",
                    desc: "حضور أي ورشة عمل أونلاين ومراجعة نهائية مجاناً بالكامل.",
                    cost: 500,
                    type: "FREE_WORKSHOP",
                    icon: "📚",
                    tag: "موصى به",
                  },
                ].map((item, i) => (
                  <div key={i} className="rounded-3xl border border-sand bg-white p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl">{item.icon}</span>
                        <span className="rounded-full bg-sun/20 px-2.5 py-0.5 text-[11px] font-black text-ink">
                          {item.tag}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-ink mt-3">{item.title}</h3>
                      <p className="text-xs text-ink/60 mt-1 leading-relaxed">{item.desc}</p>
                    </div>

                    <div className="pt-3 border-t border-sand flex items-center justify-between">
                      <span className="text-sm font-black text-coral">{item.cost} نقطة</span>
                      <button
                        onClick={() => handleRedeemReward(item.cost, item.title, item.type)}
                        className="rounded-full bg-ink px-4 py-1.5 text-xs font-black text-cream hover:bg-coral transition shadow-sm active:scale-95"
                      >
                        استبدال الآن
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Active Redeemed Coupons & Workshop Tickets */}
              {redeemedCoupons.length > 0 && (
                <div className="rounded-3xl border-2 border-mint/40 bg-gradient-to-br from-mint/10 via-white to-white p-6 shadow-sm space-y-4 animate-in fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-black text-ink flex items-center gap-2">
                      <span>🎟️</span>
                      تذاكري وكوبوناتي المستبدلة الجاهزة للاستخدام ({redeemedCoupons.length})
                    </h3>
                    <span className="text-xs text-mint font-bold">جاهزة ومفعلة بحسابك ✓</span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {redeemedCoupons.map((c, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl border border-sand bg-cream/30 p-4 flex flex-col justify-between space-y-3 hover:border-mint transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-ink/50 block">
                              {c.type === "FREE_WORKSHOP"
                                ? "📚 تذكرة ورشة عمل"
                                : c.type === "FREE_QUIZ"
                                ? "📝 مراجعة كويز"
                                : "🎟️ كوبون خصم"}
                            </span>
                            <h4 className="text-sm font-black text-ink mt-0.5">{c.title || "مكافأة فك زنقة"}</h4>
                          </div>
                          <code className="font-mono text-xs font-black bg-white px-2.5 py-1 rounded-xl border border-sand text-coral select-all">
                            {c.code}
                          </code>
                        </div>

                        <div className="pt-2 border-t border-sand/60 flex items-center justify-between gap-2">
                          {c.type === "FREE_WORKSHOP" || c.code.startsWith("WS-FREE") ? (
                            <Link
                              href={`/workshops?coupon=${c.code}`}
                              className="flex-1 rounded-full bg-mint py-2 text-center text-xs font-black text-white hover:brightness-95 transition shadow-sm"
                            >
                              تصفح ورش العمل واستخدم التذكرة ↗
                            </Link>
                          ) : (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(c.code);
                                triggerToast("📋 تم نسخ كود الكوبون بنجاح!");
                              }}
                              className="flex-1 rounded-full bg-ink py-2 text-center text-xs font-black text-white hover:bg-coral transition"
                            >
                              نسخ الكود 📋
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Automatic Points Rules Card (قواعد النقاط والمكافآت التلقائية) */}
              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-black text-ink flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-sun" />
                  قواعد النقاط والمكافآت التلقائية
                </h3>

                <ul className="space-y-3 text-xs">
                  <li className="flex items-center justify-between rounded-2xl bg-cream/50 p-3.5 border border-sand/50">
                    <span className="font-bold text-ink/80">نقاط نشر أول طلب للطالب الجديد:</span>
                    <strong className="text-sm font-black text-coral">+100 نقطة</strong>
                  </li>
                  <li className="flex items-center justify-between rounded-2xl bg-cream/50 p-3.5 border border-sand/50">
                    <span className="font-bold text-ink/80">نقاط إتمام جلسة بنجاح:</span>
                    <strong className="text-sm font-black text-mint">+50 نقطة</strong>
                  </li>
                  <li className="flex items-center justify-between rounded-2xl bg-cream/50 p-3.5 border border-sand/50">
                    <span className="font-bold text-ink/80">نقاط كتابة تقييم صادق للمعلم:</span>
                    <strong className="text-sm font-black text-lilac">+20 نقطة</strong>
                  </li>
                </ul>

                <p className="text-xs text-ink/60 leading-relaxed font-semibold pt-1">
                  يتم استبدال كل 500 نقطة بكوبون خصم 50 ج.م على الجلسة القادمة أو ورشة عمل مجانية.
                </p>
              </div>
            </div>
          )}

        </section>
      </div>

      {/* ========================================================
          MODAL: RATE TUTOR & EARN POINTS
      ======================================================== */}
      {ratingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-sand bg-white p-6 shadow-2xl space-y-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sun/20 text-3xl">
              ⭐
            </div>
            <div>
              <h3 className="text-xl font-black text-ink">تقييم الجلسة مع {ratingReq.selectedTutor?.name}</h3>
              <p className="text-xs text-ink/60 mt-1">مادة: {ratingReq.subject}</p>
            </div>

            {/* Stars */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRatingStars(s)}
                  className="text-3xl transition hover:scale-110"
                >
                  <Star className={`h-8 w-8 ${s <= ratingStars ? "fill-sun text-sun" : "text-sand"}`} />
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="اكتب رأيك الصادق في أسلوب الشرح والتوضيح (اختياري)..."
              className="w-full rounded-2xl border border-sand p-3 text-xs outline-none focus:border-coral text-right"
            />

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setRatingReq(null)}
                className="rounded-full border border-sand px-5 py-2 text-xs font-bold text-ink/70"
              >
                إلغاء
              </button>
              <button
                onClick={handleSubmitReview}
                className="rounded-full bg-coral px-6 py-2 text-xs font-black text-white hover:bg-coralDark shadow-md shadow-coral/30"
              >
                إرسال التقييم واستلام 20 نقطة 🎁
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================
          MODAL: OPEN DISPUTE
      ======================================================== */}
      {disputeReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-sand bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-lg font-black text-ink">إبلاغ عن مشكلة بالجلسة</h3>
            </div>
            <p className="text-xs text-ink/60">
              يرجى كتابة المشكلة التي واجهتك (عدم حضور المدرس، انقطاع الاتصال، الخ) لفحصها من قبل الإدارة:
            </p>
            <textarea
              rows={3}
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="اكتب تفاصيل الشكوى..."
              className="w-full rounded-2xl border border-sand p-3 text-xs outline-none focus:border-red-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDisputeReq(null)}
                className="rounded-full border border-sand px-4 py-2 text-xs font-bold text-ink/70"
              >
                إلغاء
              </button>
              <button
                onClick={handleOpenDispute}
                className="rounded-full bg-red-500 px-5 py-2 text-xs font-black text-white hover:bg-red-600 shadow"
              >
                إرسال الشكوى للإدارة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal (Triggered on accepting a tutor offer) */}
      {paymentModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-sand bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-sand">
              <div>
                <span className="text-[11px] font-black text-coral">تأكيد حجز الجلسة والدفع</span>
                <h3 className="text-base font-black text-ink truncate">
                  {paymentModalReq.subject}
                </h3>
              </div>
              <button
                onClick={() => setPaymentModalReq(null)}
                className="rounded-full bg-sand/50 px-2.5 py-1 text-xs font-bold text-ink/60 hover:bg-sand"
              >
                ✕
              </button>
            </div>

            {paymentSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 text-3xl">
                  ⏳
                </div>
                <h4 className="text-lg font-black text-ink">تم إرسال إثبات الدفع!</h4>
                <p className="text-xs text-ink/60">
                  تم تسجيل طلب الدفع بنجاح. سيتم تفعيل الجلسة فور مراجعة وتأكيد إدارة المنصة للتحويل.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmPayment} className="mt-4 space-y-4">
                {/* Price Display with Coupon Breakdown */}
                {(() => {
                  const discountCoupons = redeemedCoupons.filter(c => c.type === "DISCOUNT_COUPON" || c.code.startsWith("FZ50"));
                  const discountVal = appliedSessionCoupon ? 50 : 0;
                  const finalAmountToPay = Math.max(0, paymentModalReq.amount - discountVal);

                  return (
                    <>
                      <div className="rounded-2xl bg-cream/70 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-ink/70">سعر الجلسة الأصلي:</span>
                          <span className={`text-sm font-bold ${appliedSessionCoupon ? "line-through text-ink/40" : "text-ink"}`}>
                            {paymentModalReq.amount} ج.م
                          </span>
                        </div>

                        {appliedSessionCoupon && (
                          <div className="flex items-center justify-between text-xs font-bold text-mint border-t border-sand/60 pt-1.5">
                            <span>خصم الكوبون ({appliedSessionCoupon}):</span>
                            <span>-50 ج.م ✓</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t border-sand/60 pt-2">
                          <span className="text-xs font-black text-ink">المبلغ المطلوب سداده:</span>
                          <span className="text-xl font-black text-coral">{finalAmountToPay} ج.م</span>
                        </div>
                      </div>

                      {/* Coupon Input & Quick Select */}
                      <div className="rounded-2xl border border-sand bg-white p-3 space-y-2">
                        <label className="block text-xs font-bold text-ink">
                          🎟️ هل لديك كوبون خصم 50 ج.م؟
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="مثال: FZ50-XXXXX"
                            value={sessionCouponInput}
                            onChange={(e) => setSessionCouponInput(e.target.value)}
                            className="flex-1 rounded-xl border border-sand p-2 text-xs font-mono uppercase text-center outline-none focus:border-coral"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!sessionCouponInput.trim()) {
                                triggerToast("يرجى كتابة كود الكوبون أولاً");
                                return;
                              }
                              setAppliedSessionCoupon(sessionCouponInput.trim().toUpperCase());
                              triggerToast("🎉 تم تطبيق كوبون الخصم (-50 ج.م) بنجاح!");
                            }}
                            className="rounded-xl bg-ink px-3 py-2 text-xs font-black text-white hover:bg-coral transition"
                          >
                            تطبيق
                          </button>
                          {appliedSessionCoupon && (
                            <button
                              type="button"
                              onClick={() => {
                                setAppliedSessionCoupon(null);
                                setSessionCouponInput("");
                                triggerToast("تمت إزالة الكوبون");
                              }}
                              className="rounded-xl border border-sand px-2.5 py-2 text-xs font-bold text-ink/60 hover:bg-sand"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {discountCoupons.length > 0 && !appliedSessionCoupon && (
                          <div className="pt-1">
                            <span className="text-[10px] text-ink/50 block mb-1">كوبوناتك المتاحة بحسابك:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {discountCoupons.map((c, i) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => {
                                    setSessionCouponInput(c.code);
                                    setAppliedSessionCoupon(c.code);
                                    triggerToast("🎉 تم تطبيق كود الخصم (-50 ج.م) بنجاح!");
                                  }}
                                  className="rounded-lg bg-mint/15 border border-mint/30 px-2 py-1 text-[11px] font-mono font-bold text-mint hover:bg-mint/25 transition"
                                >
                                  🎟️ {c.code}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}

                {/* Method selector */}
                <div>
                  <label className="block text-xs font-bold text-ink mb-2">اختر طريقة الدفع:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "vodafone", label: "فودافون كاش 📱" },
                      { id: "instapay", label: "إنستاباي ⚡" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`rounded-xl border p-2.5 text-xs font-bold transition ${
                          paymentMethod === m.id
                            ? "border-coral bg-coral/15 text-coral font-black"
                            : "border-sand bg-cream/30 text-ink/70 hover:bg-cream"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transfer Instructions */}
                {paymentMethod === "vodafone" ? (
                  <div className="rounded-2xl bg-orange-500/10 border border-orange-500/20 p-3.5 text-xs space-y-1.5">
                    <div className="font-bold text-orange-600">📱 حوّل المبلغ إلى رقم فودافون كاش:</div>
                    <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-orange-500/20">
                      <span className="font-mono text-base font-black text-ink tracking-widest">01020246369</span>
                      <span className="text-[10px] text-orange-600 font-bold">رقم المنصة الرسمي</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-purple-500/10 border border-purple-500/20 p-3.5 text-xs space-y-1.5">
                    <div className="font-bold text-purple-600">⚡ حوّل المبلغ عبر تطبيق إنستاباي إلى:</div>
                    <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-purple-500/20">
                      <span className="font-mono text-base font-black text-ink tracking-widest">01097321202</span>
                      <span className="text-[10px] text-purple-600 font-bold">حساب المنصة الرسمي</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">
                    {paymentMethod === "vodafone"
                      ? "رقم محفظة فودافون كاش التي حوّلت منها (للتأكيد):"
                      : "رقم الهاتف أو عنوان IPA الذي حوّلت منه (للتأكيد):"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={paymentMethod === "vodafone" ? "010xxxxxxxx" : "010xxxxxxxx أو username@instapay"}
                    value={paymentAccount}
                    onChange={(e) => setPaymentAccount(e.target.value)}
                    className="w-full rounded-2xl border border-sand bg-cream/40 p-3 text-xs font-semibold text-ink outline-none transition focus:border-coral"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmittingPayment}
                    className="flex-1 rounded-2xl bg-coral p-3 text-center text-xs font-black text-white hover:bg-coralDark transition shadow-md shadow-coral/25 disabled:opacity-50"
                  >
                    {isSubmittingPayment ? "جاري المعالجة..." : `تأكيد الدفع (${Math.max(0, paymentModalReq.amount - (appliedSessionCoupon ? 50 : 0))} ج.م) ✓`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentModalReq(null)}
                    className="rounded-2xl border border-sand px-4 py-3 text-xs font-bold text-ink/70"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

