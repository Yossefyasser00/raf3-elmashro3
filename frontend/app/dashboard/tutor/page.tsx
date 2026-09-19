"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  Star,
  Wallet,
  LogOut,
  CheckCircle2,
  Eye,
  Video,
  Clock,
  Send,
  Sparkles,
  ArrowUpRight,
  Sliders,
  Filter,
  Search,
  GraduationCap,
  BookOpen,
  DollarSign,
  UserCheck,
  Building,
  Check,
  CreditCard,
  Phone,
  Brain,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/theme/ThemeToggle";

interface LeadItem {
  id: string;
  subject: string;
  topic: string;
  student: string;
  university: string;
  faculty: string;
  academicYear?: string;
  mode: "ONLINE" | "IN_PERSON";
  budget: number;
  urgency: "LOW" | "MEDIUM" | "HIGH" | "ASAP";
  postedAt: string;
  preferredTime?: string;
  description: string;
  status: "OPEN" | "ACCEPTED" | "PASSED";
  myResponse?: {
    id: string;
    proposedAmountEGP: number;
    proposedTime: string;
    status: string;
    isDirect: boolean;
  } | null;
}

interface BookingItem {
  id: string;
  requestId: string;
  date: string;
  student: string;
  phone: string;
  subject: string;
  mode: "ONLINE" | "IN_PERSON";
  price: number;
  status: "مؤكدة" | "في انتظار الدفع" | "مكتملة";
  meetUrl?: string;
}

interface PayoutRequestItem {
  id: string;
  amountEGP: number;
  paymentMethod: string;
  accountDetails: string;
  status: "PENDING" | "APPROVED" | "PAID" | "REJECTED";
  createdAt: string;
}

interface WorkshopItem {
  id: string;
  title: string;
  description: string;
  type: "FREE" | "PAID";
  priceEGP?: number;
  startsAt: string;
  endsAt: string;
  capacity?: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PUBLISHED" | "CANCELLED";
}

const INITIAL_LEADS: LeadItem[] = [];
const INITIAL_BOOKINGS: BookingItem[] = [];
const INITIAL_WORKSHOPS: WorkshopItem[] = [];

// Shared print invoice function
function printInvoice(inv: {
  invoiceNo: string;
  type: string;
  subject: string;
  studentName: string;
  tutorName?: string;
  amountEGP: number;
  commission?: number;
  netEGP?: number;
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
      .commission-row td { color: #dc2626; }
      .net-row td { font-weight: 900; font-size: 16px; background: #f0fdf4; color: #16a34a; }
      .footer { margin-top: 32px; text-align: center; font-size: 12px; color: #888; }
    </style>
    </head><body>
    <div class="header">
      <div class="logo">⚡ فك زنقة</div>
      <div class="badge">✓ مسددة للمدرس</div>
    </div>
    <div class="title">إيصال مبيعات — ${inv.invoiceNo}</div>
    <table>
      <tr><td>نوع الخدمة</td><td>${inv.type === "SESSION" ? "جلسة تدريسية خاصة" : "ورشة عمل"}</td></tr>
      <tr><td>المادة / الورشة</td><td>${inv.subject}</td></tr>
      <tr><td>اسم الطالب</td><td>${inv.studentName}</td></tr>
      <tr><td>التاريخ</td><td>${inv.date}</td></tr>
      <tr><td>الحالة</td><td>${inv.status}</td></tr>
      <tr class="total-row"><td>المبلغ الإجمالي (من الطالب)</td><td>${inv.amountEGP} ج.م</td></tr>
      ${inv.commission != null ? `<tr class="commission-row"><td>عمولة المنصة (20%)</td><td>- ${inv.commission} ج.م</td></tr>` : ""}
      ${inv.netEGP != null ? `<tr class="net-row"><td>صافي الإيرادات (لك)</td><td>${inv.netEGP} ج.م</td></tr>` : ""}
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

export default function TutorDashboardPage() {

  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "leads" | "bookings" | "reviews" | "earnings" | "workshops" | "profile" | "invoices">("overview");
  const [leads, setLeads] = useState<LeadItem[]>(INITIAL_LEADS);
  const [bookings, setBookings] = useState<BookingItem[]>(INITIAL_BOOKINGS);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequestItem[]>([]);
  const [workshops, setWorkshops] = useState<WorkshopItem[]>(INITIAL_WORKSHOPS);
  const [workshopEnrollments, setWorkshopEnrollments] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [tutorRatingAvg, setTutorRatingAvg] = useState<number>(5.0);

  // Filter state for SOS Leads (Radar)
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState("ALL");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("ALL");
  const [selectedYearFilter, setSelectedYearFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Earnings
  const [clearedEarnings, setClearedEarnings] = useState(0);
  const [pendingEarnings, setPendingEarnings] = useState(0);

  // Modals
  const [acceptModalLead, setAcceptModalLead] = useState<LeadItem | null>(null);
  const [negotiationLead, setNegotiationLead] = useState<LeadItem | null>(null);
  const [negotiationAmount, setNegotiationAmount] = useState(0);
  const [negotiationTime, setNegotiationTime] = useState("");
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<"vodafone" | "instapay" | "bank">("instapay");
  const [payoutAccount, setPayoutAccount] = useState("");
  const [payoutAmount, setPayoutAmount] = useState(2000);

  const [workshopForm, setWorkshopForm] = useState({
    title: "",
    description: "",
    startsAt: "",
    endsAt: "",
    capacity: "",
    priceEGP: "",
    type: "FREE" as "FREE" | "PAID",
  });
  const [editingWorkshopId, setEditingWorkshopId] = useState<string | null>(null);

  // Profile & Subjects Freelance State
  const [tutorProfileId, setTutorProfileId] = useState<string | null>(null);
  const [tutorFullName, setTutorFullName] = useState<string>("");
  const [tutorBio, setTutorBio] = useState<string>("");
  const [tutorPriceMin, setTutorPriceMin] = useState<number>(200);
  const [tutorPriceMax, setTutorPriceMax] = useState<number>(450);
  const [tutorTeachingMode, setTutorTeachingMode] = useState<"ONLINE" | "IN_PERSON" | "BOTH">("BOTH");
  const [mySubjects, setMySubjects] = useState<string[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [tutorIsVerified, setTutorIsVerified] = useState<boolean>(true);

  // Host Meet Modal State
  const [startMeetModalBooking, setStartMeetModalBooking] = useState<BookingItem | null>(null);
  const [inputMeetUrl, setInputMeetUrl] = useState<string>("");
  const [isStartingMeet, setIsStartingMeet] = useState(false);

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

  async function loadDashboardData() {
    const token = localStorage.getItem("fz_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const [leadsResponse, bookingsResponse, payoutsResponse, workshopsResponse, enrollmentsResponse, reviewsResponse] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/tutors/leads`,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/tutors/bookings`,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/payouts/my`,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/workshops/my`,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/workshops/tutor-enrollments`,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/tutors/reviews`,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
      ]);

      if (leadsResponse.status === 401 || leadsResponse.status === 403) {
        localStorage.removeItem("fz_token");
        window.location.href = "/login";
        return;
      }

      if (!leadsResponse.ok) throw new Error("Failed to load tutor leads");

      const leadsData = await leadsResponse.json();
      setLeads(leadsData.map((request: any): LeadItem => {
        const myNeg = (request.negotiations ?? [])[0] ?? null;
        const { subject, topic, faculty, university, academicYear } = extractRequestMetadata(request);
        return {
          id: request.id,
          subject,
          topic,
          student: request.student?.fullName ?? "طالب",
          university: university || request.university?.name || "جامعة غير محددة",
          faculty: faculty || request.faculty?.name || "كلية غير محددة",
          academicYear,
          mode: request.teachingMode,
          budget: request.budgetEGP ?? 0,
          urgency: request.urgency ?? "MEDIUM",
          postedAt: new Date(request.createdAt).toLocaleString("ar-EG"),
          preferredTime: request.preferredAt ? new Date(request.preferredAt).toLocaleString("ar-EG") : "موعد مرن / حسب الاتفاق",
          description: (request.description || "").replace(/\[(?:الكلية|الجامعة|السنة الدراسية|الفرقة|السنة|مكان الحضور المعتمد):[^\]]*\]\s*/g, "").replace(/\[([^\]]+)\]\s*/g, "").replace(/\(([^)]*)\)\s*/, "").trim(),
          status: request.status === "PUBLISHED" || request.status === "MATCHING" ? "OPEN" : "PASSED",
          myResponse: myNeg ? {
            id: myNeg.id,
            proposedAmountEGP: myNeg.proposedAmountEGP,
            proposedTime: myNeg.proposedTime,
            status: myNeg.status,
            isDirect: myNeg.proposedAmountEGP === (request.budgetEGP ?? 0),
          } : null,
        };
      }));

      if (bookingsResponse.status === 401 || bookingsResponse.status === 403) {
        localStorage.removeItem("fz_token");
        window.location.href = "/login";
        return;
      }

      if (!bookingsResponse.ok) throw new Error("Failed to load tutor bookings");

      const bookingsData = await bookingsResponse.json();
      setBookings(
        bookingsData.map((booking: any): BookingItem => {
          const reqStatus = booking.request?.status;
          let statusText: "مؤكدة" | "في انتظار الدفع" | "مكتملة" = "مؤكدة";
          if (reqStatus === "COMPLETED" || reqStatus === "STUDENT_RATED") {
            statusText = "مكتملة";
          } else if (reqStatus === "PAYMENT_PENDING") {
            statusText = "في انتظار الدفع";
          }
          const { fullTitle } = extractRequestMetadata(booking.request);
          return {
            id: booking.id,
            requestId: booking.request?.id ?? booking.id,
            date: booking.startsAt ? new Date(booking.startsAt).toLocaleString("ar-EG") : "غير محددة",
            student: booking.request?.student?.fullName ?? "طالب",
            phone: booking.request?.student?.phone ?? "",
            subject: fullTitle,
            mode: booking.teachingMode,
            price: booking.priceEGP ?? 0,
            status: statusText,
            meetUrl: booking.tutor?.meetingUrl ?? booking.meetUrl ?? undefined,
          };
        }),
      );

      if (payoutsResponse.status === 401 || payoutsResponse.status === 403) {
        localStorage.removeItem("fz_token");
        window.location.href = "/login";
        return;
      }

      if (!payoutsResponse.ok) throw new Error("Failed to load payout requests");

      const payoutData = await payoutsResponse.json();
      setPayoutRequests(
        payoutData.map((payout: any): PayoutRequestItem => ({
          id: payout.id,
          amountEGP: payout.amountEGP,
          paymentMethod: payout.paymentMethod,
          accountDetails: payout.accountDetails,
          status: payout.status,
          createdAt: new Date(payout.createdAt).toLocaleString("ar-EG"),
        })),
      );

      if (workshopsResponse.status === 401 || workshopsResponse.status === 403) {
        localStorage.removeItem("fz_token");
        window.location.href = "/login";
        return;
      }

      if (workshopsResponse.ok) {
        const workshopsData = await workshopsResponse.json();
        setWorkshops(
          workshopsData.map((workshop: any): WorkshopItem => ({
            id: workshop.id,
            title: workshop.title,
            description: workshop.description ?? "",
            type: workshop.type,
            priceEGP: workshop.priceEGP ?? undefined,
            startsAt: workshop.startsAt,
            endsAt: workshop.endsAt,
            capacity: workshop.capacity ?? undefined,
            status: workshop.status,
          })),
        );
      }

      if (enrollmentsResponse.ok) {
        const enrollData = await enrollmentsResponse.json();
        setWorkshopEnrollments(enrollData);
      }

      if (reviewsResponse.ok) {
        const revData = await reviewsResponse.json();
        setReviews(revData);
      }

      // Load Profile & Subjects
      const profileResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/tutors/me/profile`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (profileResponse.ok) {
        const { profile, allSubjects } = await profileResponse.json();
        setTutorProfileId(profile.id);
        setTutorFullName(profile.user?.fullName || "");
        setTutorBio(profile.bio || "");
        setTutorPriceMin(profile.priceMinEGP || 200);
        setTutorPriceMax(profile.priceMaxEGP || 450);
        setTutorTeachingMode(profile.teachingMode || "BOTH");
        setTutorRatingAvg(profile.ratingAvg || 5.0);
        setTutorIsVerified(Boolean(profile.isVerified));
        const userSubs = profile.subjects?.map((s: any) => s.subject?.name).filter(Boolean) || [];
        setMySubjects(userSubs);
        setAvailableSubjects(allSubjects?.map((s: any) => s.name).filter(Boolean) || []);
      }
    } catch {
      triggerToast("تعذر تحميل بيانات اللوحة من السيرفر");
    }
  }

  function handleAddSubject(subjectName: string) {
    const trimmed = subjectName.trim();
    if (!trimmed) return;
    if (mySubjects.includes(trimmed)) {
      triggerToast("المادة مضافة بالفعل في قائمتك");
      return;
    }
    setMySubjects((prev) => [...prev, trimmed]);
    setNewSubjectName("");
  }

  function handleRemoveSubject(subjectName: string) {
    setMySubjects((prev) => prev.filter((s) => s !== subjectName));
  }

  async function handleSaveProfile() {
    const token = localStorage.getItem("fz_token");
    if (!token) return;

    setIsSavingProfile(true);
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

    try {
      // 1. Update basic profile info
      const profileRes = await fetch(`${apiBase}/api/v1/tutors/me/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bio: tutorBio,
          priceMinEGP: tutorPriceMin,
          priceMaxEGP: tutorPriceMax,
          teachingMode: tutorTeachingMode,
        }),
      });

      // 2. Update subjects
      const subjectsRes = await fetch(`${apiBase}/api/v1/tutors/me/subjects`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subjects: mySubjects }),
      });

      if (profileRes.ok && subjectsRes.ok) {
        triggerToast("✅ تم حفظ وتحديث بيانات البروفايل والمواد بنجاح!");
      } else {
        triggerToast("⚠️ حدث خطأ أثناء الحفظ، يرجى المحاولة مرة أخرى");
      }
    } catch {
      triggerToast("تعذر الاتصال بالسيرفر لحفظ التعديلات");
    } finally {
      setIsSavingProfile(false);
    }
  }

  useEffect(() => {
    loadDashboardData();

    const intervalId = setInterval(() => {
      loadDashboardData();
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

  // Accept Lead Directly (Same price & time requested by student)
  async function handleConfirmAcceptLead(leadToAccept?: LeadItem) {
    const targetLead = leadToAccept ?? acceptModalLead;
    if (!targetLead) return;

    const token = localStorage.getItem("fz_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/requests/${targetLead.id}/negotiate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            proposedAmountEGP: targetLead.budget,
            proposedTime: targetLead.preferredTime || "في الموعد المحدد من الطالب",
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message ?? "تعذر تسجيل الموافقة على الطلب");
      }

      triggerToast(`🎉 تم إرسال موافقتك على الحصة بنجاح! ستظهر موافقتك للطالب لاختيارك وتأكيد الحجز.`);
      setAcceptModalLead(null);
      loadDashboardData();
    } catch (err: any) {
      triggerToast(err.message || "حدث خطأ أثناء إرسال الموافقة");
    }
  }

  async function handleNegotiationSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!negotiationLead) return;

    const token = localStorage.getItem("fz_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/requests/${negotiationLead.id}/negotiate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            proposedAmountEGP: Number(negotiationAmount),
            proposedTime: negotiationTime,
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message ?? "تعذر إرسال عرض التفاوض");
      }

      triggerToast("🤝 تم إرسال عرض التفاوض إلى الطالب بنجاح");
      setNegotiationLead(null);
      setNegotiationAmount(0);
      setNegotiationTime("");
      loadDashboardData();
    } catch (error: any) {
      triggerToast(error.message || "تعذر إرسال عرض التفاوض");
    }
  }

  // Complete Booking (Call backend to persist status & credit earnings)
  async function handleCompleteBooking(bookingId: string) {
    const b = bookings.find((x) => x.id === bookingId);
    if (!b) return;

    const token = localStorage.getItem("fz_token");
    if (!token) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/requests/${b.requestId}/complete`,
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
        throw new Error(data?.message ?? "تعذر إنهاء الجلسة");
      }

      setBookings((prev) =>
        prev.map((item) => (item.id === bookingId ? { ...item, status: "مكتملة" } : item))
      );
      const earned = Math.round(b.price * 0.8);
      setClearedEarnings((c) => c + earned);
      triggerToast("✅ تم إنهاء الجلسة بنجاح وتوثيقها كمكتملة وإيداع أرباحك الصافية في محفظتك!");
      loadDashboardData();
    } catch (err: any) {
      triggerToast(`⚠️ ${err.message || "حدث خطأ أثناء إنهاء الجلسة"}`);
    }
  }

  // Open Host Modal to start Google Meet
  function handleOpenHostMeetModal(booking: BookingItem) {
    setStartMeetModalBooking(booking);
    setInputMeetUrl(booking.meetUrl || "");
  }

  // Confirm Start Session as Host
  async function handleConfirmStartMeetSession(e: React.FormEvent) {
    e.preventDefault();
    if (!startMeetModalBooking) return;
    const cleanUrl = inputMeetUrl.trim();
    if (!cleanUrl || !cleanUrl.startsWith("http")) {
      triggerToast("⚠️ يرجى لصق رابط Google Meet صحيح يبدأ بـ https://");
      return;
    }

    setIsStartingMeet(true);
    const token = localStorage.getItem("fz_token");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/requests/${startMeetModalBooking.requestId}/start`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ meetingUrl: cleanUrl }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "تعذر بدء الجلسة");
      }

      setBookings((prev) =>
        prev.map((b) =>
          b.id === startMeetModalBooking.id
            ? { ...b, meetUrl: cleanUrl }
            : b
        )
      );

      triggerToast("🚀 تم بدء الجلسة بنجاح وتوجيه الطالب لنفس رابط المحاضرة!");
      setStartMeetModalBooking(null);
      loadDashboardData();
    } catch (err: any) {
      triggerToast(`⚠️ ${err.message || "حدث خطأ أثناء بدء الجلسة"}`);
    } finally {
      setIsStartingMeet(false);
    }
  }

  // Submit Payout
  async function handlePayoutSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (payoutAmount > clearedEarnings) {
      triggerToast("⚠️ المبلغ المطلوب أكبر من رصيدك المتاح للسحب.");
      return;
    }

    const token = localStorage.getItem("fz_token");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/payouts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amountEGP: payoutAmount,
            method: payoutMethod,
            accountDetails: payoutAccount,
          }),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message ?? "Payout request failed");
      }

      const payoutsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/payouts/my`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (payoutsResponse.ok) {
        const payoutData = await payoutsResponse.json();
        setPayoutRequests(
          payoutData.map((payout: any): PayoutRequestItem => ({
            id: payout.id,
            amountEGP: payout.amountEGP,
            paymentMethod: payout.paymentMethod,
            accountDetails: payout.accountDetails,
            status: payout.status,
            createdAt: new Date(payout.createdAt).toLocaleString("ar-EG"),
          })),
        );
      }

      triggerToast(`💸 تم إرسال طلب سحب ${payoutAmount} ج.م للأدمن للمراجعة.`);
      setPayoutModalOpen(false);
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : "تعذر إرسال طلب السحب");
    }
  }

  function resetWorkshopForm() {
    setWorkshopForm({
      title: "",
      description: "",
      startsAt: "",
      endsAt: "",
      capacity: "",
      priceEGP: "",
      type: "FREE",
    });
    setEditingWorkshopId(null);
  }

  function startEditWorkshop(workshop: WorkshopItem) {
    setEditingWorkshopId(workshop.id);
    setWorkshopForm({
      title: workshop.title,
      description: workshop.description,
      startsAt: new Date(workshop.startsAt).toISOString().slice(0, 16),
      endsAt: new Date(workshop.endsAt).toISOString().slice(0, 16),
      capacity: workshop.capacity?.toString() ?? "",
      priceEGP: workshop.priceEGP?.toString() ?? "",
      type: workshop.type,
    });
    setActiveTab("workshops");
  }

  async function handleWorkshopSubmit(e?: React.FormEvent) {
    e?.preventDefault();

    const token = localStorage.getItem("fz_token");
    const payload = {
      title: workshopForm.title,
      description: workshopForm.description,
      startsAt: workshopForm.startsAt,
      endsAt: workshopForm.endsAt,
      capacity: workshopForm.capacity ? Number(workshopForm.capacity) : undefined,
      priceEGP: workshopForm.type === "PAID" ? Number(workshopForm.priceEGP || 0) : undefined,
      type: workshopForm.type,
    };

    if (!payload.title || !payload.startsAt || !payload.endsAt) {
      triggerToast("أكمل عنوان وموعد الورشة أولاً");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/workshops${editingWorkshopId ? `/${editingWorkshopId}` : ""}`,
        {
          method: editingWorkshopId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message ?? "تعذر حفظ الورشة");
      }

      const savedWorkshop = await response.json();
      setWorkshops((current) => {
        if (editingWorkshopId) {
          return current.map((item) => item.id === savedWorkshop.id ? {
            ...item,
            title: savedWorkshop.title,
            description: savedWorkshop.description ?? "",
            type: savedWorkshop.type,
            priceEGP: savedWorkshop.priceEGP ?? undefined,
            startsAt: savedWorkshop.startsAt,
            endsAt: savedWorkshop.endsAt,
            capacity: savedWorkshop.capacity ?? undefined,
            status: savedWorkshop.status,
          } : item);
        }

        return [{
          id: savedWorkshop.id,
          title: savedWorkshop.title,
          description: savedWorkshop.description ?? "",
          type: savedWorkshop.type,
          priceEGP: savedWorkshop.priceEGP ?? undefined,
          startsAt: savedWorkshop.startsAt,
          endsAt: savedWorkshop.endsAt,
          capacity: savedWorkshop.capacity ?? undefined,
          status: savedWorkshop.status,
        }, ...current];
      });

      resetWorkshopForm();
      triggerToast(editingWorkshopId ? "✅ تم تحديث الورشة بنجاح" : "✅ تم إنشاء الورشة بنجاح");
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : "تعذر حفظ الورشة");
    }
  }

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
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-mint to-green-600 text-xl text-white shadow-md">
                👨‍🏫
              </div>
              <div>
                <span className="text-base font-black text-ink">فك زنقة</span>
                <span className="mr-2 rounded-md bg-mint/15 px-2 py-0.5 text-[11px] font-black text-mint">
                  بوابة المعلم (Tutor Portal)
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => window.location.href = "/"}
              className="rounded-xl bg-ink px-3 py-1.5 text-xs font-bold text-cream transition hover:bg-ink/90"
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
              <div className="mb-3 px-3 pt-2 text-xs font-bold text-ink/40">حساب المدرس</div>
              <nav className="space-y-1">
                {[
                  { id: "overview", label: "نظرة عامة والجدول", icon: LayoutDashboard },
                  
                  { id: "leads", label: "رادار الطلبات الجديدة", icon: Briefcase, count: leads.filter(l => l.status === "OPEN").length },
                  { id: "bookings", label: "المواعيد والحجوزات", icon: Calendar, count: bookings.filter(b => b.status === "مؤكدة").length },
                  { id: "earnings", label: "المحفظة والأرباح", icon: Wallet, badge: `${clearedEarnings} ج.م` },
                  { id: "invoices", label: "فواتير إيراداتي", icon: FileText, count: bookings.length + workshopEnrollments.length },
                  { id: "reviews", label: "تقييمات الطلاب", icon: Star, badge: `${tutorRatingAvg ? tutorRatingAvg.toFixed(1) : "5.0"} ⭐` },
                  { id: "workshops", label: "إدارة ورش العمل", icon: Video, count: workshops.length },
                  { id: "profile", label: "الملف والتسعير والتواجد", icon: Sliders },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={
                      "flex w-full items-center justify-between rounded-2xl px-3.5 py-3 text-right text-sm font-bold transition " +
                      (activeTab === item.id
                        ? "bg-mint text-white shadow-md shadow-mint/30"
                        : "text-ink/70 hover:bg-ink/5")
                    }
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.count && (
                      <span
                        className={
                          "rounded-full px-2 py-0.5 text-[11px] font-black " +
                          (activeTab === item.id ? "bg-white/20 text-white" : "bg-coral text-white")
                        }
                      >
                        {item.count}
                      </span>
                    )}
                    {item.badge && (
                      <span className="rounded-full bg-mint/20 px-2 py-0.5 text-[11px] font-black text-ink">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Verified Badge Widget */}
            <div className="rounded-3xl border border-mint/30 bg-mint/10 p-4">
              <div className="flex items-center gap-2 font-black text-mint text-xs">
                <CheckCircle2 className="h-4 w-4" />
                حساب معتمد وموثق (Verified)
              </div>
              <p className="mt-1 text-[11px] text-ink/60">
                أنت مؤهل لاستقبال طلبات الطلاب الأونلاين والحضوري بعمولة مخفضة 20%.
              </p>
            </div>
          </div>
        </aside>

        {/* Content Body */}
        <section className="flex-1 space-y-6">
          {/* ========================================================
              TAB 1: OVERVIEW
          ======================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {!tutorIsVerified && (
                <div className="rounded-3xl border-2 border-amber-400 bg-amber-50 p-6 text-amber-950 shadow-sm flex items-center gap-4 animate-pulse-slow">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white text-3xl shadow">
                    ⏳
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-amber-950">
                      حسابك قيد المراجعة والاعتماد من قبل إدارة المنصة (PENDING)
                    </h3>
                    <p className="text-xs text-amber-800 font-medium">
                      تم استلام طلبك بنجاح وجاري مراجعته من قبل المشرفين. ستتمكن من استقبال طلبات الطلاب والتفاوض وبدء الحصص فور موافقة الإدارة على حسابك.
                    </p>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-sand bg-white p-6 shadow-sm">
                <div>
                  <span className="rounded-full bg-mint/15 px-3 py-1 text-xs font-black text-mint">
                    أهلاً بك {tutorFullName ? `د. ${tutorFullName}` : "أيها المدرس المتميز"} 👋
                  </span>
                  <h1 className="mt-2 text-2xl font-black text-ink">لوحة إدارة جلساتك وأرباحك</h1>
                  <p className="mt-1 text-sm text-ink/60">
                    لديك {leads.filter(l => l.status === "OPEN").length} فرص جديدة متاحة للتدريس اليوم، و{bookings.filter(b => b.status === "مؤكدة").length} جلسات مؤكدة.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {tutorProfileId && (
                    <Link
                      href={`/tutor/${tutorProfileId}`}
                      target="_blank"
                      className="rounded-full border border-sand bg-cream/70 px-5 py-3 text-xs font-black text-ink hover:bg-cream transition flex items-center gap-1.5"
                    >
                      <span>بروفايلي العام</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  )}
                  <button
                    onClick={() => setActiveTab("leads")}
                    className="rounded-full bg-mint px-6 py-3 text-sm font-black text-white hover:brightness-95 shadow-lg shadow-mint/25 transition"
                  >
                    استكشاف الطلبات الجديدة 🎯
                  </button>
                </div>
              </div>

              {/* Taught Subjects Card (المواد التي تدرسها) */}
              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📚</span>
                    <div>
                      <h2 className="text-base font-black text-ink">المواد التدريسية المعتمدة في حسابك</h2>
                      <p className="text-xs text-ink/50">هذه المواد تظهر للطلاب في بروفايلك العام وفي مطابقة الطلبات الفورية</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className="rounded-full bg-cream border border-sand px-4 py-1.5 text-xs font-black text-ink hover:bg-sand/40 transition"
                  >
                    ⚙️ إدارة وتعديل موادي
                  </button>
                </div>

                {mySubjects.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {mySubjects.map((subject) => (
                      <span
                        key={subject}
                        className="inline-flex items-center gap-1.5 rounded-2xl border border-mint/40 bg-mint/10 px-3.5 py-1.5 text-xs font-black text-ink"
                      >
                        <span className="h-2 w-2 rounded-full bg-mint" />
                        {subject}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-coral/40 bg-coral/5 p-4 text-center">
                    <p className="text-xs font-bold text-coral">
                      ⚠️ لم تقم بإضافة مواد تدريسية بعد!
                    </p>
                    <p className="mt-1 text-[11px] text-ink/60">
                      أضف موادك الآن لتتمكن من استقبال طلبات الطلاب والظهور في البحث.
                    </p>
                    <button
                      onClick={() => setActiveTab("profile")}
                      className="mt-3 rounded-full bg-coral px-5 py-1.5 text-xs font-black text-white hover:bg-coralDark shadow"
                    >
                      + أضف موادك التدريسية الآن
                    </button>
                  </div>
                )}
              </div>

              {/* Stat Tiles */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: "أرباحك المتاحة للسحب", value: `${clearedEarnings} ج.م`, icon: "💰", color: "from-mint to-green-600", onClick: () => setActiveTab("earnings") },
                  { label: "جلسات محجوزة قادمة", value: bookings.filter(b => b.status === "مؤكدة").length, icon: "📅", color: "from-lilac to-indigo-600", onClick: () => setActiveTab("bookings") },
                  { label: "التقييم العام للطلاب", value: "4.8 / 5", icon: "⭐", color: "from-sun to-orange-500", onClick: () => setActiveTab("reviews") },
                  { label: "طالب تم مساعدتهم", value: "95 طالب", icon: "🎓", color: "from-coral to-coralDark", onClick: () => {} },
                ].map((s, i) => (
                  <div
                    key={i}
                    onClick={s.onClick}
                    className="cursor-pointer rounded-3xl border border-sand bg-white p-5 shadow-sm transition hover:shadow-md hover:border-mint/50"
                  >
                    <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-md text-lg`}>
                      {s.icon}
                    </div>
                    <div className="text-2xl font-black text-ink">{s.value}</div>
                    <div className="mt-1 text-xs font-bold text-ink/60">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Next Upcoming Session */}
              {bookings.filter(b => b.status === "مؤكدة").slice(0, 1).map((b) => (
                <div key={b.id} className="rounded-3xl border border-mint/40 bg-gradient-to-br from-mint/15 to-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint text-white text-2xl shadow">
                        <Video className="h-7 w-7" />
                      </div>
                      <div>
                        <span className="rounded-full bg-mint/20 px-2.5 py-0.5 text-[11px] font-black text-mint">
                          جلستك القادمة: {b.date}
                        </span>
                        <h3 className="text-lg font-black text-ink mt-1">{b.subject} — مع الطالب: {b.student}</h3>
                        <p className="text-xs text-ink/60">القيمة: {b.price} ج.م · الهاتف: {b.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleCompleteBooking(b.id)}
                        className="rounded-full border border-sand bg-white px-4 py-2 text-xs font-bold text-ink hover:bg-sand"
                      >
                        إنهاء واحتساب الأرباح ✓
                      </button>
                      {b.mode === "ONLINE" ? (
                        b.meetUrl ? (
                          <a
                            href={b.meetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full bg-emerald-600 px-6 py-2 text-xs font-black text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                          >
                            دخول المحاضرة (Host) 🎥
                          </a>
                        ) : (
                          <button
                            onClick={() => handleOpenHostMeetModal(b)}
                            className="rounded-full bg-mint px-6 py-2 text-xs font-black text-white hover:brightness-95 shadow-md shadow-mint/20"
                          >
                            بدء الجلسة كـ Host 🎥
                          </button>
                        )
                      ) : (
                        <span className="rounded-full bg-ink/10 px-4 py-2 text-xs font-bold text-ink/60">
                          🏫 حصة حضورية
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ========================================================
              TAB 2: LEADS & OPPORTUNITIES RADAR
          ======================================================== */}
          {activeTab === "leads" && (() => {
            const availableFaculties = Array.from(new Set(leads.map(l => l.faculty).filter(Boolean)));
            const availableSubjects = Array.from(new Set(leads.map(l => l.subject).filter(Boolean)));
            const availableYears = Array.from(new Set(leads.map(l => l.academicYear).filter(Boolean)));

            const filteredLeads = leads.filter((l) => {
              if (selectedFacultyFilter !== "ALL" && l.faculty !== selectedFacultyFilter) return false;
              if (selectedSubjectFilter !== "ALL" && l.subject !== selectedSubjectFilter) return false;
              if (selectedYearFilter !== "ALL" && l.academicYear !== selectedYearFilter) return false;
              if (searchQuery.trim()) {
                const q = searchQuery.trim().toLowerCase();
                const match = `${l.subject} ${l.topic} ${l.faculty} ${l.academicYear} ${l.description} ${l.student} ${l.university}`.toLowerCase();
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
                    <h1 className="text-2xl font-black text-ink">🔎 رادار طلبات واستغاثات الطلاب</h1>
                    <p className="text-sm text-ink/60">
                      استكشف جميع الاستغاثات والطلبات المنشورة للطلاب، وفلترها بسهولة حسب الكلية، المادة، أو السنة الدراسية.
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
                      <span>فلترة الاستغاثات</span>
                      {activeFiltersCount > 0 && (
                        <span className="rounded-full bg-white text-coral px-2 py-0.5 text-[11px] font-black">
                          {activeFiltersCount}
                        </span>
                      )}
                    </button>
                    <span className="rounded-full bg-coral/10 px-3.5 py-1.5 text-xs font-black text-coral">
                      {filteredLeads.filter(l => l.status === "OPEN").length} من أصل {leads.filter(l => l.status === "OPEN").length} متاحة
                    </span>
                  </div>
                </div>

                {/* Filter Panel (الكلية • المادة • السنة الدراسية) */}
                <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sand/60 pb-3">
                    <div className="flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-coral" />
                      <h3 className="text-sm font-black text-ink">تصفية وبحث الاستغاثات الأكاديمية</h3>
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
                        <span>بحث بالكلمات / الشابتر</span>
                      </label>
                      <input
                        type="text"
                        placeholder="ابحث عن شابتر أو كلمة..."
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

                {/* Leads List */}
                {filteredLeads.length > 0 ? (
                  <div className="space-y-4">
                    {filteredLeads.map((l) => (
                      <div key={l.id} className="rounded-3xl border border-sand bg-white p-6 shadow-sm space-y-4 transition hover:shadow-md">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="space-y-1.5 flex-1 min-w-[280px]">
                            <div className="flex flex-wrap items-center gap-2">
                              <code className="font-mono text-xs font-bold text-ink/60 bg-ink/5 px-2 py-0.5 rounded">
                                {l.id}
                              </code>
                              <span className="text-xs font-bold text-ink/40">{l.postedAt}</span>
                              <span className={"rounded-full px-2.5 py-0.5 text-xs font-black " + (
                                l.urgency === "ASAP" ? "bg-red-500 text-white" :
                                l.urgency === "HIGH" ? "bg-orange-500 text-white" : "bg-sun/20 text-sun"
                              )}>
                                {l.urgency === "ASAP" ? "عاجل جداً 🚨" : `أولوية: ${l.urgency}`}
                              </span>
                              <span className="rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-bold text-ink/70">
                                {l.mode === "ONLINE" ? "💻 أونلاين" : "🏫 حضوري"}
                              </span>
                              {l.faculty && (
                                <span className="rounded-full bg-lilac/25 text-purple-900 border border-lilac/40 px-2.5 py-0.5 text-xs font-black flex items-center gap-1">
                                  🏛️ {l.faculty} {l.university ? `(${l.university})` : ""}
                                </span>
                              )}
                              {l.academicYear && (
                                <span className="rounded-full bg-amber-500/15 text-amber-900 border border-amber-500/30 px-2.5 py-0.5 text-xs font-black flex items-center gap-1">
                                  🎓 {l.academicYear}
                                </span>
                              )}
                              <span className="rounded-full bg-mint/15 px-3 py-0.5 text-xs font-black text-mint flex items-center gap-1">
                                ⏰ ميعاد الحصة: {l.preferredTime}
                              </span>
                            </div>

                            <h3 className="text-lg font-black text-ink flex flex-wrap items-center gap-2">
                              <span>
                                {l.subject && l.subject !== l.topic ? (
                                  <>
                                    {l.subject} — <span className="text-coral font-bold">{l.topic}</span>
                                  </>
                                ) : (
                                  <span className="text-coral font-bold">{l.subject || l.topic}</span>
                                )}
                              </span>
                            </h3>
                            <p className="text-xs text-ink/70 leading-relaxed max-w-2xl">
                              {l.description}
                            </p>
                            <div className="text-xs text-ink/60 font-semibold pt-1">
                              الطالب: <strong>{l.student}</strong>
                            </div>
                          </div>

                          <div className="text-left space-y-2 shrink-0 min-w-[220px]">
                            <div className="text-xs font-bold text-ink/40">سعر الطالب المعروض</div>
                            <div className="text-2xl font-black text-mint">{l.budget} ج.م</div>
                            <div className="text-[11px] text-ink/40">صافي ربحك: {Math.round(l.budget * 0.8)} ج.م (بعد عمولة %20)</div>

                            {l.myResponse ? (
                              <div className="rounded-2xl border border-sand bg-cream/50 p-3 text-right space-y-1 text-xs">
                                <div className="flex items-center gap-1 font-black text-ink">
                                  {l.myResponse.isDirect ? (
                                    <span className="text-mint">✅ أرسلت موافقة بالسعر المطلوب</span>
                                  ) : (
                                    <span className="text-coral">🤝 أرسلت عرض تفاوض: {l.myResponse.proposedAmountEGP} ج.م</span>
                                  )}
                                </div>
                                <p className="text-[11px] text-ink/60">
                                  بانتظار مراجعة وتأكيد الطالب ⏳
                                </p>
                                <button
                                  onClick={() => {
                                    setNegotiationLead(l);
                                    setNegotiationAmount(l.myResponse?.proposedAmountEGP ?? l.budget);
                                    setNegotiationTime(l.myResponse?.proposedTime ?? l.preferredTime ?? "");
                                  }}
                                  className="text-[11px] font-bold text-coral underline hover:text-coralDark mt-1 block"
                                >
                                  تعديل عرض التفاوض ✍️
                                </button>
                              </div>
                            ) : !tutorIsVerified ? (
                              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-right text-xs font-bold text-amber-800 shadow-sm">
                                🔒 حسابك قيد مراجعة واعتماد الإدارة — ستتمكن من الرد وقبول الحصص فور اعتماد حسابك.
                              </div>
                            ) : l.status === "OPEN" ? (
                              <div className="space-y-2 pt-1">
                                <button
                                  onClick={() => setAcceptModalLead(l)}
                                  className="w-full rounded-full bg-mint px-5 py-2.5 text-xs font-black text-white hover:brightness-95 transition shadow-md shadow-mint/25"
                                >
                                  موافقة على الحصة (بنفس السعر والميعاد) ✓
                                </button>
                                <button
                                  onClick={() => {
                                    setNegotiationLead(l);
                                    setNegotiationAmount(l.budget);
                                    setNegotiationTime(l.preferredTime ?? "غداً 05:00 م");
                                  }}
                                  className="w-full rounded-full border border-coral text-coral bg-white px-5 py-2 text-xs font-black hover:bg-coral/10 transition shadow-sm"
                                >
                                  تفاوض (تعديل السعر أو الميعاد) 🤝
                                </button>
                              </div>
                            ) : (
                              <span className="inline-block rounded-full bg-mint/15 px-4 py-1.5 text-xs font-black text-mint">
                                تم إنهاء الطلب ✓
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-sand bg-white p-12 text-center shadow-sm space-y-3">
                    <div className="text-3xl">🔍</div>
                    <h3 className="text-base font-black text-ink">لا توجد استغاثات مطابقة للفلاتر المحددة</h3>
                    <p className="text-xs text-ink/60 max-w-sm mx-auto">
                      جرب تغيير الكلية أو المادة أو مسح الفلاتر لعرض جميع الاستغاثات المتاحة.
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
              TAB 3: BOOKINGS & SCHEDULE
          ======================================================== */}
          {activeTab === "bookings" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-sand bg-white p-6 shadow-sm">
                <div>
                  <h1 className="text-2xl font-black text-ink">📅 جدول المواعيد والحجوزات المؤكدة</h1>
                  <p className="text-sm text-ink/60">
                    روابط القاعات المباشرة وبيانات الطلاب والتواصل السريع.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b.id} className="rounded-3xl border border-sand bg-white p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lilac/15 text-lilac text-xl">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-ink text-base">{b.date}</span>
                          <span className={"rounded-full px-2.5 py-0.5 text-[11px] font-black " + (
                            b.status === "مؤكدة" ? "bg-mint/15 text-mint" :
                            b.status === "مكتملة" ? "bg-lilac/15 text-lilac" : "bg-sun/20 text-sun"
                          )}>
                            {b.status}
                          </span>
                        </div>
                        <div className="text-xs text-ink/60 mt-0.5">
                          مع الطالب: <strong>{b.student}</strong> ({b.phone}) — مادة: {b.subject}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-left font-black text-sm text-coral pl-2">
                        {b.price} ج.م
                      </div>
                      {b.status === "مؤكدة" && (
                        <>
                          <button
                            onClick={() => handleCompleteBooking(b.id)}
                            className="rounded-full border border-sand bg-white px-3.5 py-2 text-xs font-bold text-ink hover:bg-sand transition"
                          >
                            إنهاء الجلسة ✓
                          </button>
                          {b.mode === "ONLINE" ? (
                            <div className="flex items-center gap-2">
                              {b.meetUrl ? (
                                <>
                                  <a
                                    href={b.meetUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="rounded-full bg-emerald-600 px-5 py-2 text-xs font-black text-white hover:bg-emerald-700 transition shadow-sm flex items-center gap-1.5"
                                  >
                                    <span>دخول المحاضرة (Host) 🎥</span>
                                  </a>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(b.meetUrl!);
                                      triggerToast("📋 تم نسخ رابط Google Meet بنجاح!");
                                    }}
                                    className="rounded-full border border-sand bg-white px-3 py-2 text-xs font-bold text-ink/70 hover:bg-sand"
                                    title="نسخ رابط المحاضرة"
                                  >
                                    📋
                                  </button>
                                  <button
                                    onClick={() => handleOpenHostMeetModal(b)}
                                    className="rounded-full border border-sand bg-white px-3 py-2 text-xs font-bold text-ink/50 hover:text-ink"
                                    title="تغيير أو تحديث الرابط"
                                  >
                                    ⚙️
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleOpenHostMeetModal(b)}
                                  className="rounded-full bg-emerald-600 px-5 py-2 text-xs font-black text-white hover:bg-emerald-700 transition shadow-sm flex items-center gap-1.5 animate-pulse-slow"
                                >
                                  <span>بدء الجلسة كـ Host (Google Meet) 🎥</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="rounded-full bg-ink/10 px-3.5 py-2 text-xs font-bold text-ink/60">
                              🏫 حضوري
                            </span>
                          )}
                        </>
                      )}
                      {b.status === "مكتملة" && (
                        <button
                          onClick={() => {
                            const commission = Math.round(b.price * 0.2);
                            const net = b.price - commission;
                            printInvoice({
                              invoiceNo: `INV-${b.id.slice(0, 8).toUpperCase()}`,
                              type: "SESSION",
                              subject: b.subject,
                              studentName: b.student,
                              amountEGP: b.price,
                              commission,
                              netEGP: net,
                              date: b.date,
                              status: "مكتملة ومسددة",
                            });
                          }}
                          className="rounded-full bg-sand/60 px-4 py-2 text-xs font-bold text-ink hover:bg-sand transition flex items-center gap-1.5"
                        >
                          🖨️ الفاتورة
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 4: EARNINGS & PAYOUTS
          ======================================================== */}
          {activeTab === "earnings" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-mint/40 bg-gradient-to-br from-mint/20 via-cream to-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-ink/60">محفظة المعلم المالية</span>
                    <h1 className="text-4xl font-black text-ink mt-1">{clearedEarnings} ج.م</h1>
                    <p className="text-xs text-ink/60 mt-1">
                      رصيد متاح للسحب الفوري عبر إنستاباي أو فودافون كاش أو حساب بنكي.
                    </p>
                  </div>
                  <button
                    onClick={() => setPayoutModalOpen(true)}
                    className="rounded-full bg-mint px-7 py-3 text-sm font-black text-white hover:brightness-95 shadow-lg shadow-mint/25 transition"
                  >
                    طلب سحب الأرباح الآن 💸
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-sand bg-white p-5 shadow-sm">
                  <span className="text-xs font-bold text-ink/50">إجمالي الأرباح المحصلة</span>
                  <div className="text-2xl font-black text-mint mt-1">{clearedEarnings + 2300} ج.م</div>
                  <p className="text-[11px] text-ink/40 mt-1">عن 127 جلسة ناجحة</p>
                </div>
                <div className="rounded-3xl border border-sand bg-white p-5 shadow-sm">
                  <span className="text-xs font-bold text-ink/50">في انتظار التحصيل</span>
                  <div className="text-2xl font-black text-sun mt-1">{pendingEarnings} ج.م</div>
                  <p className="text-[11px] text-ink/40 mt-1">جلسات مجدولة قيد الإتمام</p>
                </div>
                <div className="rounded-3xl border border-sand bg-white p-5 shadow-sm">
                  <span className="text-xs font-bold text-ink/50">عمولة المنصة المقتطعة</span>
                  <div className="text-2xl font-black text-coral mt-1">%20</div>
                  <p className="text-[11px] text-ink/40 mt-1">ثابتة تشمل حماية الدفع والدعم</p>
                </div>
              </div>

              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black text-ink">جدول طلبات السحب</h2>
                    <p className="text-xs text-ink/60">يظهر لك حالة كل طلب سحب مع التاريخ ونتيجة قرار الأدمن.</p>
                  </div>
                </div>

                {payoutRequests.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-sand bg-cream p-6 text-center text-sm font-bold text-ink/50">
                    لا توجد طلبات سحب حتى الآن.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-y-2 text-right">
                      <thead>
                        <tr className="text-[11px] font-black text-ink/50">
                          <th className="px-2 py-1">التاريخ</th>
                          <th className="px-2 py-1">المبلغ</th>
                          <th className="px-2 py-1">طريقة الدفع</th>
                          <th className="px-2 py-1">بيانات الحساب</th>
                          <th className="px-2 py-1">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payoutRequests.map((payout) => (
                          <tr key={payout.id} className="rounded-2xl bg-cream text-sm">
                            <td className="rounded-r-2xl px-3 py-3 text-ink/70">{payout.createdAt}</td>
                            <td className="px-3 py-3 font-black text-mint">{payout.amountEGP} ج.م</td>
                            <td className="px-3 py-3 text-ink/70">{payout.paymentMethod}</td>
                            <td className="px-3 py-3 text-ink/70">{payout.accountDetails || "—"}</td>
                            <td className="rounded-l-2xl px-3 py-3">
                              <span className={
                                "inline-flex rounded-full px-2.5 py-1 text-[11px] font-black " +
                                (payout.status === "PENDING"
                                  ? "bg-sun/20 text-orange-700"
                                  : payout.status === "APPROVED" || payout.status === "PAID"
                                    ? "bg-mint/15 text-mint"
                                    : "bg-red-100 text-red-700")
                              }>
                                {payout.status === "PENDING"
                                  ? "معلق"
                                  : payout.status === "APPROVED"
                                    ? "موافق"
                                    : payout.status === "PAID"
                                      ? "تم الصرف"
                                      : "مرفوض"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB: INVOICES (فواتير إيراداتي)
          ======================================================== */}
          {activeTab === "invoices" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-black text-ink">🧾 فواتير إيراداتي</h1>
                <p className="mt-1 text-sm text-ink/60">
                  سجل بجميع الإيرادات المحققة من الجلسات الخاصة وورش العمل بعد خصم عمولة المنصة. يمكنك طباعة الفواتير كإثبات دخل.
                </p>
              </div>

              {/* Sessions Invoices */}
              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-black text-ink flex items-center gap-2">
                  <span className="text-xl">📚</span> إيرادات الجلسات الخاصة
                </h2>
                {bookings.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-sand bg-cream p-6 text-center text-xs font-bold text-ink/40">
                    لا توجد جلسات محجوزة حتى الآن
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((booking) => {
                      const invoiceNo = `SES-${booking.id.slice(0, 8).toUpperCase()}`;
                      const commission = Math.round(booking.price * 0.2);
                      const net = booking.price - commission;
                      return (
                        <div key={booking.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-sand bg-cream/60 p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-ink/40 bg-ink/5 px-2 py-0.5 rounded">{invoiceNo}</span>
                              <span className="rounded-full bg-mint/15 px-2 py-0.5 text-[11px] font-black text-mint">
                                {booking.status === "مكتملة" ? "✓ مكتملة ومسددة" : "✓ مؤكدة ومحجوزة"}
                              </span>
                            </div>
                            <div className="font-black text-ink">{booking.subject}</div>
                            <div className="text-xs text-ink/60">الطالب: {booking.student} | {booking.date}</div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-left">
                              <div className="text-xl font-black text-mint">{net} ج.م</div>
                              <div className="text-[11px] text-ink/50">الصافي بعد خصم {commission} ج.م عمولة (20%)</div>
                            </div>
                            <button
                              onClick={() => printInvoice({
                                invoiceNo,
                                type: "SESSION",
                                subject: booking.subject,
                                studentName: booking.student,
                                amountEGP: booking.price,
                                commission,
                                netEGP: net,
                                date: booking.date,
                                status: booking.status === "مكتملة" ? "مكتملة ومسددة" : "مؤكدة ومحجوزة",
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

              {/* Workshop Enrollments Invoices */}
              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm space-y-4">
                <h2 className="text-lg font-black text-ink flex items-center gap-2">
                  <span className="text-xl">🎬</span> إيرادات ورش العمل
                </h2>
                {workshopEnrollments.filter(e => e.workshop.priceEGP != null && e.workshop.priceEGP > 0).length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-sand bg-cream p-6 text-center text-xs font-bold text-ink/40">
                    لا توجد إيرادات مسجلة لورش العمل
                  </div>
                ) : (
                  <div className="space-y-3">
                    {workshopEnrollments.filter(e => e.workshop.priceEGP != null && e.workshop.priceEGP > 0).map((enrollment) => {
                      const invoiceNo = `WRK-${enrollment.id.slice(0, 8).toUpperCase()}`;
                      const price = enrollment.workshop.priceEGP;
                      const commission = Math.round(price * 0.2);
                      const net = price - commission;
                      return (
                        <div key={enrollment.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-sand bg-cream/60 p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-ink/40 bg-ink/5 px-2 py-0.5 rounded">{invoiceNo}</span>
                              <span className="rounded-full bg-mint/15 px-2 py-0.5 text-[11px] font-black text-mint">✓ مدفوعة</span>
                            </div>
                            <div className="font-black text-ink">{enrollment.workshop.title}</div>
                            <div className="text-xs text-ink/60">الطالب: {enrollment.user?.fullName ?? "—"} | {new Date(enrollment.createdAt).toLocaleDateString("ar-EG")}</div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-left">
                              <div className="text-xl font-black text-mint">{net} ج.م</div>
                              <div className="text-[11px] text-ink/50">الصافي بعد خصم {commission} ج.م عمولة</div>
                            </div>
                            <button
                              onClick={() => printInvoice({
                                invoiceNo,
                                type: "WORKSHOP",
                                subject: enrollment.workshop.title,
                                studentName: enrollment.user?.fullName ?? "—",
                                amountEGP: price,
                                commission,
                                netEGP: net,
                                date: new Date(enrollment.createdAt).toLocaleDateString("ar-EG"),
                                status: "مدفوعة ومسددة",
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
              TAB 5: REVIEWS & TESTIMONIALS
          ======================================================== */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-ink">⭐ تقييمات الطلاب ورأيهم في الشرح</h1>
                    <p className="text-sm text-ink/60">
                      بناءً على {reviews.length} تقييم حقيقي معتمد من الطلاب بعد الجلسات.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl bg-sun/20 px-4 py-2">
                    <Star className="h-6 w-6 fill-sun text-sun" />
                    <span className="text-2xl font-black text-ink">
                      {tutorRatingAvg ? tutorRatingAvg.toFixed(1) : "5.0"}
                    </span>
                    <span className="text-xs text-ink/50">من 5</span>
                  </div>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-sand bg-cream p-12 text-center">
                  <div className="text-5xl mb-4">🌟</div>
                  <h3 className="text-lg font-black text-ink/60">لا توجد تقييمات مسجلة حتى الآن</h3>
                  <p className="mt-2 text-xs text-ink/40">
                    ستظهر تقييمات وآراء الطلاب هنا فور إنهائك للجلسات وقيام الطلاب بكتابة تقييماتهم.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  {reviews.map((r) => (
                    <div key={r.id} className="rounded-3xl border border-sand bg-white p-5 space-y-3 shadow-sm flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-sand/50 flex items-center justify-center font-bold text-xs text-ink/70">
                              {(r.author?.fullName || "ط").charAt(0)}
                            </div>
                            <span className="font-black text-ink text-sm">{r.author?.fullName || "طالب"}</span>
                          </div>
                          <span className="text-sun font-black text-xs">{"★".repeat(r.overallRating || 5)}</span>
                        </div>
                        <p className="text-xs text-ink/70 leading-relaxed font-semibold">
                          “{r.comment || "تقييم ممتاز بدون تعليق إضافي."}”
                        </p>
                      </div>
                      <div className="pt-2 border-t border-sand/40 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-coral">
                          {r.booking?.request?.subject?.name ?? r.booking?.request?.topic?.name ?? "جلسة خاصة"}
                        </span>
                        <span className="text-ink/40">
                          {new Date(r.createdAt).toLocaleDateString("ar-EG")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB 6: WORKSHOP MANAGEMENT
          ======================================================== */}
          {activeTab === "workshops" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-black text-ink">🎤 إدارة ورش العمل</h1>
                <p className="mt-1 text-sm text-ink/60">
                  أضف ورشة جديدة أو عدّل تفاصيل الورش الحالية الخاصة بك، مع متابعة حالة الموافقة من الإدارة.
                </p>
              </div>

              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-black text-ink">
                  {editingWorkshopId ? "تعديل الورشة الحالية" : "إضافة ورشة جديدة"}
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    value={workshopForm.title}
                    onChange={(e) => setWorkshopForm((current) => ({ ...current, title: e.target.value }))}
                    placeholder="عنوان الورشة"
                    className="rounded-2xl border border-sand bg-cream/40 px-4 py-3 text-sm font-semibold outline-none focus:border-lilac"
                  />
                  <select
                    value={workshopForm.type}
                    onChange={(e) => setWorkshopForm((current) => ({ ...current, type: e.target.value as "FREE" | "PAID" }))}
                    className="rounded-2xl border border-sand bg-cream/40 px-4 py-3 text-sm font-semibold outline-none focus:border-lilac"
                  >
                    <option value="FREE">مجانية</option>
                    <option value="PAID">مدفوعة</option>
                  </select>
                  <input
                    type="datetime-local"
                    value={workshopForm.startsAt}
                    onChange={(e) => setWorkshopForm((current) => ({ ...current, startsAt: e.target.value }))}
                    className="rounded-2xl border border-sand bg-cream/40 px-4 py-3 text-sm font-semibold outline-none focus:border-lilac"
                  />
                  <input
                    type="datetime-local"
                    value={workshopForm.endsAt}
                    onChange={(e) => setWorkshopForm((current) => ({ ...current, endsAt: e.target.value }))}
                    className="rounded-2xl border border-sand bg-cream/40 px-4 py-3 text-sm font-semibold outline-none focus:border-lilac"
                  />
                  <input
                    type="number"
                    min="1"
                    value={workshopForm.capacity}
                    onChange={(e) => setWorkshopForm((current) => ({ ...current, capacity: e.target.value }))}
                    placeholder="السعة"
                    className="rounded-2xl border border-sand bg-cream/40 px-4 py-3 text-sm font-semibold outline-none focus:border-lilac"
                  />
                  {workshopForm.type === "PAID" && (
                    <input
                      type="number"
                      min="0"
                      value={workshopForm.priceEGP}
                      onChange={(e) => setWorkshopForm((current) => ({ ...current, priceEGP: e.target.value }))}
                      placeholder="سعر الورشة (ج.م)"
                      className="rounded-2xl border border-sand bg-cream/40 px-4 py-3 text-sm font-semibold outline-none focus:border-lilac"
                    />
                  )}
                </div>
                <textarea
                  value={workshopForm.description}
                  onChange={(e) => setWorkshopForm((current) => ({ ...current, description: e.target.value }))}
                  placeholder="وصف الورشة"
                  rows={4}
                  className="mt-4 w-full rounded-2xl border border-sand bg-cream/40 px-4 py-3 text-sm font-semibold outline-none focus:border-lilac"
                />
                <div className="mt-4 flex flex-wrap justify-end gap-3">
                  {editingWorkshopId && (
                    <button
                      onClick={resetWorkshopForm}
                      className="rounded-full border border-sand px-6 py-2.5 text-xs font-black text-ink/70"
                    >
                      إلغاء التعديل
                    </button>
                  )}
                  <button
                    onClick={() => handleWorkshopSubmit()}
                    className="rounded-full bg-ink px-6 py-2.5 text-xs font-black text-cream hover:bg-ink/90"
                  >
                    {editingWorkshopId ? "تحديث الورشة" : "إضافة الورشة"}
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-black text-ink">ورشاك الحالية</h2>
                <div className="space-y-4">
                  {workshops.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-sand bg-cream/30 p-6 text-center text-sm font-bold text-ink/50">
                      لا توجد ورش حالياً لك.
                    </div>
                  ) : (
                    workshops.map((workshop) => (
                      <div key={workshop.id} className="rounded-2xl border border-sand bg-cream/20 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-black text-ink">{workshop.title}</h3>
                            <p className="mt-1 text-xs text-ink/60">
                              {workshop.type === "FREE" ? "مجانية" : `مدفوعة (${workshop.priceEGP ?? 0} ج.م)`}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={
                              "rounded-full px-2.5 py-1 text-[11px] font-black " +
                              (workshop.status === "PENDING"
                                ? "bg-sun/20 text-orange-700"
                                : workshop.status === "APPROVED" || workshop.status === "PUBLISHED"
                                  ? "bg-mint/15 text-mint"
                                  : workshop.status === "REJECTED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-lilac/15 text-lilac")
                            }>
                              {workshop.status === "PENDING"
                                ? "قيد المراجعة"
                                : workshop.status === "APPROVED"
                                  ? "موافقة"
                                  : workshop.status === "REJECTED"
                                    ? "مرفوضة"
                                    : workshop.status === "PUBLISHED"
                                      ? "منشورة"
                                      : "ملغاة"}
                            </span>
                            <button
                              onClick={() => startEditWorkshop(workshop)}
                              className="rounded-full bg-mint/15 px-3 py-1.5 text-[11px] font-black text-mint"
                            >
                              تعديل
                            </button>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-ink/70">{workshop.description || "لا يوجد وصف"}</p>
                        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-ink/60">
                          <span>البدء: {new Date(workshop.startsAt).toLocaleString("ar-EG")}</span>
                          <span>النهاية: {new Date(workshop.endsAt).toLocaleString("ar-EG")}</span>
                          <span>السعة: {workshop.capacity || "غير محددة"}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 7: PROFILE & PRICING CONFIG (FREELANCE STYLE)
          ======================================================== */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Header & Preview Link */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-sand bg-white p-6 shadow-sm">
                <div>
                  <h1 className="text-2xl font-black text-ink">⚙️ إعدادات البروفايل والتسعير والمواد</h1>
                  <p className="mt-1 text-sm text-ink/60">
                    خصص ملفك الأكاديمي، حدد أسعارك والمواد التي تتقن تدريسها لتظهر للطلاب في عمليات البحث.
                  </p>
                </div>
                {tutorProfileId && (
                  <Link
                    href={`/tutor/${tutorProfileId}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 rounded-full bg-coral/15 px-5 py-2.5 text-xs font-black text-coral hover:bg-coral/25 transition shadow-sm"
                  >
                    <span>معاينة البروفايل العام كما يراه الطلاب 👁️</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                )}
              </div>

              {/* Bio & Intro */}
              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm space-y-4">
                <h2 className="text-base font-black text-ink flex items-center gap-2">
                  <span>✍️</span>
                  النبذة التعريفية وسيرتك الأكاديمية (Bio)
                </h2>
                <p className="text-xs text-ink/60">
                  اكتب نبذة جذابة توضح أسلوبك في الشرح، الجامعات التي درّست لطلابها، وكيف تساعد الطالب على اجتياز الامتحانات بسهولة.
                </p>
                <textarea
                  rows={4}
                  value={tutorBio}
                  onChange={(e) => setTutorBio(e.target.value)}
                  placeholder="مثال: مهندس ومدرس جامعي بخبرة 5 سنوات في شرح مواد الهندسة والعلوم. أعتمد على حل نماذج الامتحانات وتلخيص القوانين المعقدة بطريقة مبسطة..."
                  className="w-full rounded-2xl border border-sand bg-cream/40 p-4 text-xs font-semibold text-ink outline-none transition focus:border-mint focus:bg-white"
                />
              </div>

              {/* Pricing & Teaching Mode */}
              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm space-y-5">
                <h2 className="text-base font-black text-ink flex items-center gap-2">
                  <span>💰</span>
                  التسعير ونظام التدريس
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      الحد الأدنى لسعر الجلسة (ج.م)
                    </label>
                    <input
                      type="number"
                      min={50}
                      value={tutorPriceMin}
                      onChange={(e) => setTutorPriceMin(Number(e.target.value))}
                      className="w-full rounded-2xl border border-sand bg-cream/40 p-3.5 text-sm font-black text-mint outline-none focus:border-mint focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      الحد الأقصى لسعر الجلسة (ج.م)
                    </label>
                    <input
                      type="number"
                      min={tutorPriceMin}
                      value={tutorPriceMax}
                      onChange={(e) => setTutorPriceMax(Number(e.target.value))}
                      className="w-full rounded-2xl border border-sand bg-cream/40 p-3.5 text-sm font-black text-mint outline-none focus:border-mint focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-2">طريقة التدريس المفضلة</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: "BOTH", label: "💻🏫 أونلاين وحضوري معاً", desc: "أقصى عدد من الطلبات" },
                      { id: "ONLINE", label: "💻 أونلاين فقط", desc: "جلسات تفاعلية عبر زووم والمنصة" },
                      { id: "IN_PERSON", label: "🏫 حضوري فقط", desc: "لقاءات في أماكن معتمدة" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setTutorTeachingMode(mode.id as any)}
                        className={`rounded-2xl border p-3.5 text-right transition ${
                          tutorTeachingMode === mode.id
                            ? "border-mint bg-mint/15 shadow-sm"
                            : "border-sand bg-cream/30 hover:bg-cream"
                        }`}
                      >
                        <div className="text-xs font-black text-ink">{mode.label}</div>
                        <div className="text-[10px] text-ink/50 mt-0.5">{mode.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subjects & Skills Manager (المواد التي تدرسها) */}
              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-black text-ink flex items-center gap-2">
                      <span>📚</span>
                      المواد والمجالات التدريسية ({mySubjects.length})
                    </h2>
                    <p className="mt-0.5 text-xs text-ink/50">
                      أضف أو احذف المواد التي تقدم شروحات فيها
                    </p>
                  </div>
                </div>

                {/* Active Subjects Chips */}
                <div>
                  <label className="block text-[11px] font-bold text-ink/60 mb-2">
                    المواد المفعلة حالياً في بروفايلك:
                  </label>
                  {mySubjects.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {mySubjects.map((sub) => (
                        <span
                          key={sub}
                          className="inline-flex items-center gap-2 rounded-2xl border border-mint/40 bg-mint/15 px-3.5 py-1.5 text-xs font-black text-ink shadow-sm"
                        >
                          <span>{sub}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubject(sub)}
                            className="flex h-4 w-4 items-center justify-center rounded-full bg-ink/10 text-ink/70 hover:bg-coral hover:text-white transition text-[10px]"
                            title="حذف المادة"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-sand bg-cream/30 p-4 text-center text-xs font-bold text-ink/50">
                      لم تختر أي مادة بعد. اكتب اسم المادة أدناه واضغط إضافة.
                    </div>
                  )}
                </div>

                {/* Add Custom Subject Input */}
                <div className="border-t border-sand pt-4">
                  <label className="block text-xs font-bold text-ink mb-1.5">
                    إضافة مادة جديدة:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSubject(newSubjectName);
                        }
                      }}
                      placeholder="مثال: كيمياء عضوية، ديناميكا حرارية، بايثون، ذكاء اصطناعي..."
                      className="flex-1 rounded-2xl border border-sand bg-cream/40 px-4 py-2.5 text-xs font-semibold text-ink outline-none transition focus:border-mint focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddSubject(newSubjectName)}
                      className="rounded-2xl bg-ink px-5 py-2.5 text-xs font-black text-cream hover:bg-ink/90 transition shadow"
                    >
                      + إضافة مادة
                    </button>
                  </div>
                </div>

                {/* Quick Add Suggestions */}
                {availableSubjects.length > 0 && (
                  <div className="border-t border-sand pt-4">
                    <label className="block text-[11px] font-bold text-ink/50 mb-2">
                      أو اختر سريعاً من المواد الشائعة:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {availableSubjects
                        .filter((s) => !mySubjects.includes(s))
                        .slice(0, 10)
                        .map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleAddSubject(s)}
                            className="rounded-xl border border-sand bg-cream/40 px-3 py-1 text-[11px] font-bold text-ink/70 hover:border-mint hover:bg-mint/10 hover:text-ink transition"
                          >
                            + {s}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSavingProfile}
                  onClick={handleSaveProfile}
                  className="rounded-full bg-mint px-8 py-3 text-xs font-black text-white hover:brightness-95 shadow-lg shadow-mint/25 disabled:opacity-50 transition transform active:scale-95 flex items-center gap-2"
                >
                  {isSavingProfile ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>جاري حفظ التعديلات...</span>
                    </>
                  ) : (
                    <span>حفظ جميع التعديلات ✓</span>
                  )}
                </button>
              </div>
            </div>
          )}

          
        </section>
      </div>

      {/* ========================================================
          MODAL: NEGOTIATION REQUEST
      ======================================================== */}
      {negotiationLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-sand bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4">
              <div>
                <div className="text-xs font-black text-coral">تفاوض مع الطالب</div>
                <h3 className="text-xl font-black text-ink">{negotiationLead.subject} — {negotiationLead.topic}</h3>
              </div>
              <button
                onClick={() => setNegotiationLead(null)}
                className="rounded-full bg-sand px-2 py-1 text-xs font-black text-ink/60"
              >
                إغلاق
              </button>
            </div>

            <form onSubmit={handleNegotiationSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-black text-ink/70">السعر المقترح (ج.م)</label>
                <input
                  type="number"
                  value={negotiationAmount}
                  onChange={(e) => setNegotiationAmount(Number(e.target.value))}
                  className="w-full rounded-2xl border border-sand p-3 text-sm outline-none focus:border-coral"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black text-ink/70">الموعد المقترح</label>
                <input
                  type="text"
                  value={negotiationTime}
                  onChange={(e) => setNegotiationTime(e.target.value)}
                  placeholder="مثال: غداً 06:00 م"
                  className="w-full rounded-2xl border border-sand p-3 text-sm outline-none focus:border-coral"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setNegotiationLead(null)}
                  className="rounded-full border border-sand px-5 py-2 text-xs font-bold text-ink/70"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-coral px-6 py-2 text-xs font-black text-white hover:bg-coralDark"
                >
                  إرسال العرض للطالب 🤝
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ACCEPT LEAD CONFIRMATION
      ======================================================== */}
      {acceptModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-sand bg-white p-6 shadow-2xl space-y-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-coral/15 text-3xl">
              🎯
            </div>
            <div>
              <h3 className="text-xl font-black text-ink">الموافقة على طلب {acceptModalLead.student}</h3>
              <p className="text-xs text-ink/60 mt-1">{acceptModalLead.subject} — {acceptModalLead.topic}</p>
            </div>

            <div className="rounded-2xl bg-cream/50 p-4 text-xs space-y-2 text-right">
              <div className="flex justify-between items-center pb-2 border-b border-sand/60">
                <span className="text-ink/60 font-bold">⏰ ميعاد الحصة المطلوب:</span>
                <strong className="text-ink font-black">{acceptModalLead.preferredTime}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/60">سعر الطالب المعروض:</span>
                <strong className="text-ink font-black">{acceptModalLead.budget} ج.م</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink/60">عمولة المنصة (%20):</span>
                <strong className="text-coral">-{Math.round(acceptModalLead.budget * 0.2)} ج.م</strong>
              </div>
              <div className="flex justify-between border-t border-sand pt-1.5 text-sm">
                <span className="font-bold text-ink">صافي ربحك:</span>
                <strong className="text-mint font-black">{Math.round(acceptModalLead.budget * 0.8)} ج.م</strong>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setAcceptModalLead(null)}
                className="rounded-full border border-sand px-5 py-2 text-xs font-bold text-ink/70"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => handleConfirmAcceptLead(acceptModalLead)}
                className="rounded-full bg-mint px-6 py-2.5 text-xs font-black text-white hover:brightness-95 shadow-md shadow-mint/25"
              >
                إرسال الموافقة للطالب فوراً ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: PAYOUT WITHDRAWAL
      ======================================================== */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4 animate-in fade-in">
          <form onSubmit={handlePayoutSubmit} className="w-full max-w-md rounded-3xl border border-sand bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-ink">طلب سحب الأرباح</h3>
            <p className="text-xs text-ink/60">الرصيد المتاح للسحب: {clearedEarnings} ج.م</p>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">المبلغ المطلوب سحبه (ج.م)</label>
              <input
                type="number"
                min={100}
                max={clearedEarnings}
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(Number(e.target.value))}
                className="w-full rounded-2xl border border-sand p-3 text-base font-black text-mint outline-none focus:border-mint"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">طريقة التحويل المفضلة</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "instapay", label: "إنستاباي" },
                  { id: "vodafone", label: "فودافون كاش" },
                  { id: "bank", label: "حساب بنكي" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPayoutMethod(m.id as any)}
                    className={
                      "rounded-xl border p-2 text-xs font-bold transition " +
                      (payoutMethod === m.id
                        ? "border-mint bg-mint/15 text-mint font-black"
                        : "border-sand text-ink/70 hover:bg-cream")
                    }
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                {payoutMethod === "instapay" ? "عنوان الدفع اللحظي (IPA) أو رقم إنستاباي" : payoutMethod === "vodafone" ? "رقم محفظة فودافون كاش" : "رقم الحساب البنكي / IBAN"}
              </label>
              <input
                type="text"
                required
                placeholder={payoutMethod === "instapay" ? "username@instapay" : "010xxxxxxxx"}
                value={payoutAccount}
                onChange={(e) => setPayoutAccount(e.target.value)}
                className="w-full rounded-2xl border border-sand p-3 text-xs outline-none focus:border-mint"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPayoutModalOpen(false)}
                className="rounded-full border border-sand px-4 py-2 text-xs font-bold text-ink/70"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="rounded-full bg-mint px-6 py-2 text-xs font-black text-white hover:brightness-95 shadow"
              >
                تأكيد التحويل الآن 💸
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================
          MODAL: START GOOGLE MEET AS HOST
      ======================================================== */}
      {startMeetModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-sand bg-white p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-sand pb-3">
              <div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                  🎥 بدء الجلسة كـ Host
                </span>
                <h3 className="mt-1 text-lg font-black text-ink">
                  {startMeetModalBooking.subject} — مع الطالب {startMeetModalBooking.student}
                </h3>
              </div>
              <button
                onClick={() => setStartMeetModalBooking(null)}
                className="rounded-full bg-sand px-3 py-1 text-xs font-black text-ink/60 hover:bg-sand/80"
              >
                ✕ إغلاق
              </button>
            </div>

            <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-4 space-y-2">
              <div className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                <span>⚡ خطوات بدء المحاضرة ومشاركة الطالب:</span>
              </div>
              <ol className="text-xs text-ink/70 space-y-1.5 list-decimal list-inside pr-1">
                <li>اضغط على الزر الأزرق أدناه لفتح غرفة جديدة على Google Meet كـ Host.</li>
                <li>انسخ رابط الغرفة والصقه في الخانة أدناه واضغط تأكيد.</li>
                <li>سيظهر نفس الرابط للطالب فوراً ليدخل معك في نفس الغرفة بالضبط!</li>
              </ol>
            </div>

            <form onSubmit={handleConfirmStartMeetSession} className="space-y-4">
              <div>
                <a
                  href="https://meet.google.com/new"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white p-3.5 text-xs font-black transition shadow-md shadow-blue-600/20"
                >
                  <Video className="h-4 w-4" />
                  <span>1️⃣ اضغط هنا لفتح وإنشاء غرفة Google Meet جديدة ↗</span>
                </a>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  2️⃣ الصق رابط Google Meet الخاص بالغرفة هنا:
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://meet.google.com/xxx-yyyy-zzz"
                  value={inputMeetUrl}
                  onChange={(e) => setInputMeetUrl(e.target.value)}
                  className="w-full rounded-2xl border border-sand bg-cream/40 p-3.5 text-sm font-semibold text-ink outline-none transition focus:border-emerald-500 focus:bg-white"
                  dir="ltr"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-sand">
                <button
                  type="button"
                  onClick={() => setStartMeetModalBooking(null)}
                  className="rounded-full border border-sand px-5 py-2.5 text-xs font-bold text-ink/70 hover:bg-sand"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isStartingMeet || !inputMeetUrl.trim()}
                  className="rounded-full bg-emerald-600 px-7 py-2.5 text-xs font-black text-white hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isStartingMeet ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>جارٍ التفعيل ودعوة الطالب...</span>
                    </>
                  ) : (
                    <span>تأكيد وبدء الجلسة ودخول الطالب 🚀</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
