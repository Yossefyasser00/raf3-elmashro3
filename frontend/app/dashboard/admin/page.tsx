"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  FileCheck2,
  FileWarning,
  Settings as SettingsIcon,
  Shield,
  LogOut,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  UserCheck,
  UserX,
  HelpCircle,
  ChevronDown,
  RefreshCw,
  Video,
  Sparkles,
  Brain,
  MapPin,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/theme/ThemeToggle";

interface InPersonLocation {
  id: string;
  name: string;
  address: string;
  details?: string;
  isActive: boolean;
}

interface TeacherApp {
  id: string;
  name: string;
  email: string;
  phone: string;
  university: string;
  faculty: string;
  experience: string;
  introVideoUrl?: string;
  preferredMode: "ONLINE" | "IN_PERSON" | "BOTH";
  status: "PENDING" | "UNDER_REVIEW" | "CHANGES_REQUESTED" | "ACCEPTED" | "REJECTED";
  statusLabel: string;
  submittedAt: string;
}

interface StudentReq {
  id: string;
  studentName: string;
  studentEmail: string;
  university: string;
  faculty: string;
  subject: string;
  topic: string;
  description: string;
  mode: "ONLINE" | "IN_PERSON";
  budget: number;
  urgency: "LOW" | "MEDIUM" | "HIGH" | "ASAP";
  status: "DRAFT" | "PUBLISHED" | "MATCHING" | "TUTOR_SELECTED" | "PAYMENT_PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "STUDENT_RATED" | "DISPUTED" | "CANCELLED";
  selectedTutor?: string;
  createdAt: string;
  paymentSenderAccount?: string | null;
  paymentMethodUsed?: string | null;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "STUDENT" | "TUTOR" | "ADMIN";
  isActive: boolean;
  joinedAt: string;
  collegeCardFileName?: string | null;
  tutorProfile?: {
    id: string;
    bio?: string;
    priceMinEGP?: number | null;
    priceMaxEGP?: number | null;
    teachingMode?: "ONLINE" | "IN_PERSON" | "BOTH";
    isFeaturedOnHome?: boolean;
  };
}

interface PayoutItem {
  id: string;
  tutorName: string;
  tutorEmail: string;
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
  status: "PENDING" | "APPROVED" | "REJECTED" | "PUBLISHED";
  isFeaturedOnHome: boolean;
  tutorName: string;
  tutorEmail: string;
  youtubeVideoId?: string;
  thumbnailUrl?: string;
}

const INITIAL_APPS: TeacherApp[] = [];
const INITIAL_REQUESTS: StudentReq[] = [];
const INITIAL_USERS: UserItem[] = [];

// Shared print invoice function
function printInvoice(inv: any) {
  const w = window.open("", "_blank", "width=700,height=600");
  if (!w) return;
  w.document.write(`
    <!DOCTYPE html><html dir="rtl" lang="ar">
    <head><meta charset="UTF-8"><title>فاتورة ${inv.id}</title>
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
    <div class="title">إيصال مبيعات — ${inv.id}</div>
    <table>
      <tr><td>نوع الخدمة</td><td>${inv.type === "SESSION" ? "جلسة تدريسية خاصة" : "ورشة عمل"}</td></tr>
      <tr><td>البيان</td><td>${inv.subject}</td></tr>
      <tr><td>اسم الطالب</td><td>${inv.student?.fullName ?? "—"}</td></tr>
      <tr><td>اسم المدرس</td><td>${inv.tutor?.fullName ?? "—"}</td></tr>
      <tr><td>التاريخ</td><td>${new Date(inv.date).toLocaleDateString("ar-EG")}</td></tr>
      <tr><td>الحالة</td><td>${inv.status}</td></tr>
      <tr class="total-row"><td>المبلغ الإجمالي (من الطالب)</td><td>${inv.amountEGP} ج.م</td></tr>
      ${inv.platformCommissionEGP != null ? `<tr class="commission-row"><td>عمولة المنصة (20%)</td><td>- ${inv.platformCommissionEGP} ج.م</td></tr>` : ""}
      ${inv.tutorNetEGP != null ? `<tr class="net-row"><td>صافي المدرس</td><td>${inv.tutorNetEGP} ج.م</td></tr>` : ""}
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

  // 3. Extract subject if between [brackets] and not a location/faculty/uni tag
  if (!subject) {
    const bracketMatches = [...desc.matchAll(/\[([^\]]+)\]/g)];
    for (const match of bracketMatches) {
      const tag = match[1].trim();
      if (!tag.startsWith("مكان الحضور") && !tag.startsWith("الكلية:") && !tag.startsWith("الجامعة:")) {
        subject = tag;
        break;
      }
    }
  }

  // 4. Extract topic if between (parentheses)
  if (!topic) {
    const parenMatch = desc.match(/\(([^)]+)\)/);
    if (parenMatch) {
      topic = parenMatch[1].trim();
    }
  }

  // 5. If subject still not found, check known subject keywords
  if (!subject) {
    const lowerDesc = desc.toLowerCase();
    for (const sub of KNOWN_SUBJECTS) {
      if (sub.keywords.some((kw) => lowerDesc.includes(kw))) {
        subject = sub.name;
        break;
      }
    }
  }

  // 6. Clean remaining description
  const cleanDesc = desc
    .replace(/\[مكان الحضور المعتمد:[^\]]+\]/g, "")
    .replace(/\[الكلية:[^\]]+\]/g, "")
    .replace(/\[الجامعة:[^\]]+\]/g, "")
    .replace(/\[[^\]]+\]/g, "")
    .replace(/\([^)]+\)/g, "")
    .trim();

  // 7. Fallback for topic
  if (!topic) {
    if (cleanDesc) {
      const parts = cleanDesc.split(/[-–—،,\n]/).map((p: string) => p.trim()).filter(Boolean);
      topic = parts[0]?.slice(0, 45) || "موضوع الحصة";
    }
  }

  const finalTopic = topic || (cleanDesc ? cleanDesc.slice(0, 40) : "شرح ومراجعة");
  const finalSubject = subject || "";

  // 8. Infer faculty if missing or generic
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

  return {
    subject: finalSubject,
    topic: finalTopic,
    faculty,
    university,
    fullTitle: finalSubject && finalSubject !== finalTopic ? `${finalSubject} — ${finalTopic}` : (finalSubject || finalTopic),
  };
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "tutor-apps" | "requests" | "users" | "golden-tutors" | "disputes" | "settings" | "workshops" | "payouts" | "invoices">("overview");
  const [apps, setApps] = useState<TeacherApp[]>(INITIAL_APPS);
  const [requests, setRequests] = useState<StudentReq[]>(INITIAL_REQUESTS);
  const [users, setUsers] = useState<UserItem[]>(INITIAL_USERS);
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [workshops, setWorkshops] = useState<WorkshopItem[]>([]);
  const [workshopEnrollments, setWorkshopEnrollments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);

  // Filter states
  const [appFilter, setAppFilter] = useState<string>("ALL");
  const [reqStatusFilter, setReqStatusFilter] = useState<string>("ALL");
  const [reqSearch, setReqSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("ALL");

  // Modals & Inspect
  const [selectedApp, setSelectedApp] = useState<TeacherApp | null>(null);
  const [rejectionModalApp, setRejectionModalApp] = useState<TeacherApp | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedReq, setSelectedReq] = useState<StudentReq | null>(null);
  const [selectedCollegeCard, setSelectedCollegeCard] = useState<string | null>(null);
  const [workshopForm, setWorkshopForm] = useState({
    title: "",
    description: "",
    startsAt: "",
    endsAt: "",
    capacity: "",
    priceEGP: "",
    type: "FREE",
  });
  const [editingWorkshopId, setEditingWorkshopId] = useState<string | null>(null);
  const [newTutorForm, setNewTutorForm] = useState({
    userId: "",
    userSearch: "",
    fullName: "",
    bio: "",
    priceMinEGP: 150,
    priceMaxEGP: 400,
    teachingMode: "BOTH" as "ONLINE" | "IN_PERSON" | "BOTH",
    isFeaturedOnHome: true,
  });

  // Settings state
  const [commissionPct, setCommissionPct] = useState(20);
  const [inPersonSurcharge, setInPersonSurcharge] = useState(5);
  const [inPersonLocations, setInPersonLocations] = useState<InPersonLocation[]>([]);
  const [newLocForm, setNewLocForm] = useState({ name: "", address: "", details: "" });
  const [editingLocId, setEditingLocId] = useState<string | null>(null);
  const [editingLocForm, setEditingLocForm] = useState({ name: "", address: "", details: "" });
  const [isSavingLocations, setIsSavingLocations] = useState(false);
  // YouTube upload state
  const [uploadingWorkshopId, setUploadingWorkshopId] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadMessage, setUploadMessage] = useState<string>("");
  const [savedToast, setSavedToast] = useState<string | null>(null);

  async function handleSaveFinancialSettings() {
    const token = localStorage.getItem("fz_token");
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
    try {
      await Promise.all([
        fetch(`${apiBase}/api/v1/admin/settings`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ key: "COMMISSION_PERCENT", value: String(commissionPct) }),
        }),
        fetch(`${apiBase}/api/v1/admin/settings`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ key: "IN_PERSON_SURCHARGE_PCT", value: String(inPersonSurcharge) }),
        }),
      ]);
      triggerToast("✅ تم حفظ الإعدادات المالية وتطبيقها على كافة المعاملات");
    } catch {
      triggerToast("⚠️ تعذر حفظ الإعدادات المالية");
    }
  }

  async function saveLocationsToBackend(updatedLocations: InPersonLocation[]) {
    setIsSavingLocations(true);
    const token = localStorage.getItem("fz_token");
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
    try {
      const res = await fetch(`${apiBase}/api/v1/admin/settings/locations`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ locations: updatedLocations }),
      });
      if (res.ok) {
        setInPersonLocations(updatedLocations);
        triggerToast("✅ تم تحديث وحفظ أماكن الحضور المعتمدة بنجاح");
      } else {
        triggerToast("⚠️ تعذر حفظ أماكن الحضور");
      }
    } catch {
      triggerToast("⚠️ تعذر الاتصال بالسيرفر لحفظ الأماكن");
    } finally {
      setIsSavingLocations(false);
    }
  }

  function handleAddLocation(e: React.FormEvent) {
    e.preventDefault();
    if (!newLocForm.name.trim() || !newLocForm.address.trim()) {
      triggerToast("⚠️ يرجى إدخال اسم المكان والعنوان");
      return;
    }
    const newLoc: InPersonLocation = {
      id: `loc-${Date.now()}`,
      name: newLocForm.name.trim(),
      address: newLocForm.address.trim(),
      details: newLocForm.details.trim() || undefined,
      isActive: true,
    };
    const updated = [...inPersonLocations, newLoc];
    saveLocationsToBackend(updated);
    setNewLocForm({ name: "", address: "", details: "" });
  }

  function handleToggleLocation(id: string) {
    const updated = inPersonLocations.map((loc) =>
      loc.id === id ? { ...loc, isActive: !loc.isActive } : loc
    );
    saveLocationsToBackend(updated);
  }

  function handleDeleteLocation(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا المكان من القائمة المعتمدة؟")) return;
    const updated = inPersonLocations.filter((loc) => loc.id !== id);
    saveLocationsToBackend(updated);
  }

  function handleStartEditLocation(loc: InPersonLocation) {
    setEditingLocId(loc.id);
    setEditingLocForm({
      name: loc.name,
      address: loc.address,
      details: loc.details || "",
    });
  }

  function handleSaveEditLocation(id: string) {
    if (!editingLocForm.name.trim() || !editingLocForm.address.trim()) {
      triggerToast("⚠️ يرجى إدخال اسم المكان والعنوان");
      return;
    }
    const updated = inPersonLocations.map((loc) =>
      loc.id === id
        ? {
            ...loc,
            name: editingLocForm.name.trim(),
            address: editingLocForm.address.trim(),
            details: editingLocForm.details.trim() || undefined,
          }
        : loc
    );
    saveLocationsToBackend(updated);
    setEditingLocId(null);
  }

  function triggerToast(msg: string) {
    setSavedToast(msg);
    setTimeout(() => setSavedToast(null), 3000);
  }

  function handleLogout() {
    localStorage.removeItem("fz_token");
    localStorage.removeItem("fz_refresh");
    localStorage.removeItem("fz_roles");
    window.location.href = "/login";
  }

  async function uploadVideoToYoutube(workshopId: string) {
    if (!videoFile) {
      triggerToast("❌ يرجى اختيار ملف الفيديو أولاً");
      return;
    }
    const token = localStorage.getItem("fz_token");
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

    setUploadStatus("uploading");
    setUploadMessage("جاري الرفع إلى يوتيوب… قد يستغرق هذا بعض الوقت ⏳");

    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

      const response = await fetch(`${apiBase}/api/v1/workshops/${workshopId}/upload-video`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.message ?? "فشل رفع الفيديو");
      }

      const updated = await response.json();
      // Update workshop in list
      setWorkshops((current) =>
        current.map((w) =>
          w.id === workshopId
            ? { ...w, youtubeVideoId: updated.youtubeVideoId, thumbnailUrl: updated.thumbnailUrl }
            : w
        )
      );
      setUploadStatus("success");
      setUploadMessage(`✅ تم الرفع بنجاح! معرف الفيديو: ${updated.youtubeVideoId}`);
      setVideoFile(null);
      setThumbnailFile(null);
      setUploadingWorkshopId(null);
      triggerToast("🎬 تم رفع الفيديو إلى يوتيوب بنجاح!");
    } catch (err: any) {
      setUploadStatus("error");
      setUploadMessage(`❌ خطأ: ${err?.message ?? "حدث خطأ غير متوقع"}`);
    }
  }

  function isRenderableCollegeCard(value?: string | null) {
    return !!value && (
      value.startsWith("data:image/") ||
      value.startsWith("/") ||
      /^https?:\/\//.test(value)
    );
  }

  useEffect(() => {
    async function loadAdminData() {
      const token = localStorage.getItem("fz_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
      const headers = { Authorization: `Bearer ${token}` };
      const get = (path: string) =>
        fetch(`${apiBase}/api/v1/admin/${path}`, { headers }).then(async (response) => {
          if (!response.ok) throw new Error(`Admin request failed: ${path}`);
          return response.json();
        });

      try {
        const [applications, allRequests, allUsers, disputes, commission, payoutRequests, allWorkshops, invoicesData, enrollmentsData] = await Promise.all([
          get("tutor-applications"),
          get("requests"),
          get("users"),
          get("disputes"),
          get("settings/commission"),
          fetch(`${apiBase}/api/v1/payouts`, { headers }).then(async (response) => {
            if (!response.ok) throw new Error("Admin payouts request failed");
            return response.json();
          }),
          get("workshops"),
          get("invoices"),
          get("workshop-enrollments"),
        ]);

        setApps(applications.map((application: any): TeacherApp => ({
          id: application.id,
          name: application.user?.fullName ?? "مدرس بدون اسم",
          email: application.user?.email ?? "",
          phone: application.user?.phone ?? "",
          university: application.universityName ?? "غير محدد",
          faculty: application.facultyName ?? "غير محدد",
          experience: application.experienceSummary ?? "لم يضف خبرة بعد",
          introVideoUrl: application.introVideoUrl ?? undefined,
          preferredMode: application.preferredMode,
          status: application.status,
          statusLabel: application.status === "PENDING"
            ? "قيد المراجعة"
            : application.status === "UNDER_REVIEW"
              ? "تحت المراجعة"
              : application.status === "ACCEPTED"
                ? "مقبول ومعتمد"
                : application.status === "REJECTED"
                  ? "مرفوض"
                  : "يحتاج تعديلات",
          submittedAt: new Date(application.createdAt).toLocaleString("ar-EG"),
        })));

        setRequests(allRequests.map((request: any): StudentReq => {
          const { subject, topic, faculty, university } = extractRequestMetadata(request);
          return {
            id: request.id,
            studentName: request.student?.fullName ?? "طالب غير معروف",
            studentEmail: request.student?.email ?? "",
            university: university || request.university?.name || "غير محددة",
            faculty: faculty || request.faculty?.name || "غير محددة",
            subject,
            topic,
            description: request.description,
            mode: request.teachingMode,
            budget: request.budgetEGP ?? 0,
            urgency: request.urgency,
            status: request.status,
            selectedTutor: request.booking?.tutor?.user?.fullName,
            createdAt: new Date(request.createdAt).toLocaleString("ar-EG"),
            paymentSenderAccount: request.paymentSenderAccount ?? null,
            paymentMethodUsed: request.paymentMethodUsed ?? null,
          };
        }));

        setUsers(allUsers.map((user: any): UserItem => {
          const roles = user.roles?.map((item: any) => item.role) ?? [];
          const role = roles.includes("ADMIN") ? "ADMIN" : roles.includes("TUTOR") ? "TUTOR" : "STUDENT";
          return {
            id: user.id,
            name: user.fullName,
            email: user.email,
            phone: user.phone ?? "",
            role,
            isActive: user.isActive,
            joinedAt: new Date(user.createdAt).toLocaleString("ar-EG"),
            collegeCardFileName: user.studentProfile?.collegeCardFileName ?? null,
            tutorProfile: user.tutorProfile ? {
              id: user.tutorProfile.id,
              bio: user.tutorProfile.bio ?? "",
              priceMinEGP: user.tutorProfile.priceMinEGP ?? null,
              priceMaxEGP: user.tutorProfile.priceMaxEGP ?? null,
              teachingMode: user.tutorProfile.teachingMode,
              isFeaturedOnHome: user.tutorProfile.isFeaturedOnHome,
            } : undefined,
          };
        }));

        setPayouts(payoutRequests.map((payout: any): PayoutItem => ({
          id: payout.id,
          tutorName: payout.tutor?.fullName ?? "مدرس غير معروف",
          tutorEmail: payout.tutor?.email ?? "",
          amountEGP: payout.amountEGP,
          paymentMethod: payout.paymentMethod,
          accountDetails: payout.accountDetails,
          status: payout.status,
          createdAt: new Date(payout.createdAt).toLocaleString("ar-EG"),
        })));

        setWorkshops(allWorkshops.map((workshop: any): WorkshopItem => ({
          id: workshop.id,
          title: workshop.title,
          description: workshop.description ?? "",
          type: workshop.type,
          priceEGP: workshop.priceEGP ?? 0,
          startsAt: workshop.startsAt,
          endsAt: workshop.endsAt,
          capacity: workshop.capacity ?? 0,
          status: workshop.status,
          isFeaturedOnHome: workshop.isFeaturedOnHome,
          tutorName: workshop.tutor?.fullName ?? "غير معروف",
          tutorEmail: workshop.tutor?.email ?? "",
          youtubeVideoId: workshop.youtubeVideoId ?? undefined,
          thumbnailUrl: workshop.thumbnailUrl ?? undefined,
        })));

        if (enrollmentsData) {
          setWorkshopEnrollments(enrollmentsData);
        }

        if (invoicesData) {
          setInvoices(invoicesData.invoices ?? []);
          setTotalRevenue(invoicesData.totalRevenue ?? 0);
          setTotalCommission(invoicesData.totalCommission ?? 0);
        }

        setCommissionPct(commission.commissionPercent ?? 20);
        setInPersonSurcharge(commission.inPersonSurchargePct ?? 5);
        if (commission.locations && Array.isArray(commission.locations)) {
          setInPersonLocations(commission.locations);
        }
        if (disputes.length > 0) {
          setRequests((current) => {
            const disputeIds = new Set(disputes.map((item: any) => item.id));
            return current.map((request) => disputeIds.has(request.id)
              ? { ...request, status: "DISPUTED" }
              : request);
          });
        }
      } catch {
        triggerToast("تعذر تحميل بيانات الإدارة من السيرفر");
      }
    }

    loadAdminData();
  }, []);

  async function updatePayoutStatus(id: string, status: "APPROVED" | "REJECTED") {
    const token = localStorage.getItem("fz_token");
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/payouts/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      triggerToast("تعذر تحديث حالة الفاتورة");
      return;
    }

    setPayouts((current) => current.map((payout) => payout.id === id ? { ...payout, status } : payout));
    triggerToast(status === "APPROVED" ? "✅ تمت الموافقة على فاتورة المدرس" : "تم رفض فاتورة المدرس");
  }

  async function toggleFeaturedWorkshop(id: string, isFeaturedOnHome: boolean) {
    const token = localStorage.getItem("fz_token");
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/admin/workshops/${id}/feature`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ isFeatured: isFeaturedOnHome }),
    });

    if (!response.ok) {
      triggerToast("تعذر تحديث عرض الورشة في الصفحة الرئيسية");
      return;
    }

    setWorkshops((current) => current.map((item) => item.id === id ? { ...item, isFeaturedOnHome } : item));
    triggerToast(isFeaturedOnHome ? "✅ تم عرض الورشة على الصفحة الرئيسية" : "تم إلغاء عرض الورشة من الصفحة الرئيسية");
  }

  async function updateWorkshopStatus(id: string, status: WorkshopItem["status"]) {
    const token = localStorage.getItem("fz_token");
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/admin/workshops/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      triggerToast("تعذر تحديث حالة الورشة");
      return;
    }

    setWorkshops((current) => current.map((item) => item.id === id ? {
      ...item,
      status,
      isFeaturedOnHome: status === "APPROVED" || status === "PUBLISHED",
    } : item));
    triggerToast("✅ تم تحديث حالة الورشة");
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
      startsAt: workshop.startsAt.slice(0, 16),
      endsAt: workshop.endsAt.slice(0, 16),
      capacity: workshop.capacity?.toString() ?? "",
      priceEGP: workshop.priceEGP?.toString() ?? "",
      type: workshop.type,
    });
  }

  async function createWorkshop() {
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

    const endpoint = editingWorkshopId ? `/api/v1/workshops/${editingWorkshopId}` : `/api/v1/workshops`;
    const method = editingWorkshopId ? "PATCH" : "POST";

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}${endpoint}`, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      triggerToast(editingWorkshopId ? "تعذر تحديث الورشة" : "تعذر إنشاء الورشة");
      return;
    }

    const savedWorkshop = await response.json();

    setWorkshops((current) => {
      if (editingWorkshopId) {
        return current.map((item) => item.id === savedWorkshop.id ? {
          ...item,
          title: savedWorkshop.title,
          description: savedWorkshop.description ?? "",
          type: savedWorkshop.type,
          priceEGP: savedWorkshop.priceEGP ?? 0,
          startsAt: savedWorkshop.startsAt,
          endsAt: savedWorkshop.endsAt,
          capacity: savedWorkshop.capacity ?? 0,
          status: savedWorkshop.status,
        } : item);
      }

      return [{
        id: savedWorkshop.id,
        title: savedWorkshop.title,
        description: savedWorkshop.description ?? "",
        type: savedWorkshop.type,
        priceEGP: savedWorkshop.priceEGP ?? 0,
        startsAt: savedWorkshop.startsAt,
        endsAt: savedWorkshop.endsAt,
        capacity: savedWorkshop.capacity ?? 0,
        status: savedWorkshop.status,
        isFeaturedOnHome: savedWorkshop.isFeaturedOnHome,
        tutorName: "أنت",
        tutorEmail: "",
      }, ...current];
    });

    resetWorkshopForm();
    triggerToast(editingWorkshopId ? "✅ تم تحديث الورشة بنجاح" : "✅ تم إنشاء الورشة ووضعها في قائمة الانتظار");
  }

  async function saveUserInfo(userId: string, nextName: string, phone: string) {
    const token = localStorage.getItem("fz_token");
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/admin/users/${userId}/info`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ fullName: nextName, phone }),
    });

    if (!response.ok) {
      triggerToast("تعذر حفظ اسم المدرس");
      return;
    }

    setUsers((current) => current.map((user) => user.id === userId ? { ...user, name: nextName } : user));
    triggerToast("✅ تم تحديث اسم المدرس بنجاح");
  }

  async function updateTutorProfile(user: UserItem) {
    const token = localStorage.getItem("fz_token");
    const endpoint = user.tutorProfile
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/admin/tutors/${user.tutorProfile.id}/profile`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/admin/users/${user.id}/tutor-profile`;

    const response = await fetch(endpoint, {
      method: user.tutorProfile ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        fullName: user.name,
        bio: user.tutorProfile?.bio ?? "",
        priceMinEGP: user.tutorProfile?.priceMinEGP ?? 150,
        priceMaxEGP: user.tutorProfile?.priceMaxEGP ?? 400,
        teachingMode: user.tutorProfile?.teachingMode ?? "BOTH",
        isFeaturedOnHome: user.tutorProfile?.isFeaturedOnHome ?? false,
      }),
    });

    if (!response.ok) {
      triggerToast(user.tutorProfile ? "تعذر تحديث بيانات المدرس الذهبي" : "تعذر إنشاء ملف المدرس الذهبي");
      return;
    }

    const updatedTutor = await response.json();

    setUsers((current) => current.map((item) => item.id === user.id ? {
      ...item,
      name: updatedTutor.user?.fullName ?? item.name,
      role: item.role === "STUDENT" ? "TUTOR" : item.role,
      tutorProfile: {
        id: updatedTutor.id,
        bio: updatedTutor.bio ?? "",
        priceMinEGP: updatedTutor.priceMinEGP ?? null,
        priceMaxEGP: updatedTutor.priceMaxEGP ?? null,
        teachingMode: updatedTutor.teachingMode,
        isFeaturedOnHome: updatedTutor.isFeaturedOnHome,
      },
    } : item));

    triggerToast(user.tutorProfile ? "✅ تم تحديث بيانات المدرس الذهبي بنجاح" : "✅ تم إنشاء ملف المدرس الذهبي بنجاح");
  }

  async function deleteTutorProfile(user: UserItem) {
    if (!user.tutorProfile) {
      triggerToast("لا يوجد ملف مدرس ذهبي لحذفه");
      return;
    }

    const token = localStorage.getItem("fz_token");
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/admin/tutors/${user.tutorProfile.id}/profile`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      triggerToast("تعذر حذف المدرس الذهبي");
      return;
    }

    setUsers((current) => current.map((item) => item.id === user.id ? {
      ...item,
      tutorProfile: undefined,
    } : item));

    triggerToast("✅ تم حذف المدرس الذهبي من القائمة");
  }

  // Teacher application actions
  async function handleAcceptTeacher(appId: string) {
    const token = localStorage.getItem("fz_token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/admin/tutor-applications/${appId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "ACCEPTED" }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? "تعذر اعتماد المعلم");
      }

      setApps((prev) =>
        prev.map((a) =>
          a.id === appId
            ? { ...a, status: "ACCEPTED", statusLabel: "مقبول ومعتمد" }
            : a
        )
      );
      triggerToast(`✅ تم قبول المدرس وتفعيل حسابه ومنحه رول TUTOR بنجاح!`);
      setSelectedApp(null);
    } catch (err: any) {
      triggerToast(`⚠️ ${err.message || "حدث خطأ أثناء قبول المدرس"}`);
    }
  }

  async function handleRejectTeacher(appId: string, reason: string) {
    const token = localStorage.getItem("fz_token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/admin/tutor-applications/${appId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "REJECTED", adminNotes: reason }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? "تعذر رفض الطلب");
      }

      setApps((prev) =>
        prev.map((a) =>
          a.id === appId
            ? { ...a, status: "REJECTED", statusLabel: `مرفوض: ${reason || "عدم استيفاء الشروط"}` }
            : a
        )
      );
      triggerToast(`❌ تم رفض طلب الانضمام وتحديث الحالة.`);
      setRejectionModalApp(null);
      setRejectionReason("");
      setSelectedApp(null);
    } catch (err: any) {
      triggerToast(`⚠️ ${err.message || "حدث خطأ أثناء رفض الطلب"}`);
    }
  }

  async function handleRequestChanges(appId: string) {
    const token = localStorage.getItem("fz_token");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/admin/tutor-applications/${appId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "CHANGES_REQUESTED", adminNotes: "يرجى استكمال البيانات وإثبات الخبرة" }),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? "تعذر طلب التعديل");
      }

      setApps((prev) =>
        prev.map((a) =>
          a.id === appId
            ? { ...a, status: "CHANGES_REQUESTED", statusLabel: "مطلوب تعديلات وإثبات إضافي" }
            : a
        )
      );
      triggerToast(`⚠️ تم إرسال إشعار للمدرس لطلب تعديل وتوضيح مستندات الخبرة.`);
      setSelectedApp(null);
    } catch (err: any) {
      triggerToast(`⚠️ ${err.message || "حدث خطأ"}`);
    }
  }

  // Request status override
  function handleOverrideRequestStatus(reqId: string, newStatus: StudentReq["status"]) {
    setRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: newStatus } : r))
    );
    triggerToast(`🔄 تم تعديل حالة الطلب ${reqId} إلى ${newStatus}`);
    if (selectedReq?.id === reqId) {
      setSelectedReq((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  }

  // Session Payment Approvals
  async function handleApproveSessionPayment(requestId: string) {
    const token = localStorage.getItem("fz_token");
    if (!token) return;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
    try {
      const res = await fetch(`${apiBase}/api/v1/admin/requests/${requestId}/approve-payment`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("تعذر تأكيد الدفع");
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "CONFIRMED" } : r))
      );
      triggerToast("✅ تم تأكيد استلام الدفع وتفعيل الجلسة للطرفين بنجاح!");
    } catch (e: any) {
      triggerToast(e.message || "حدث خطأ");
    }
  }

  async function handleRejectSessionPayment(requestId: string) {
    const token = localStorage.getItem("fz_token");
    if (!token) return;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
    try {
      const res = await fetch(`${apiBase}/api/v1/admin/requests/${requestId}/reject-payment`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("تعذر رفض الدفع");
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "CANCELLED" } : r))
      );
      triggerToast("❌ تم رفض الدفع وإلغاء الطلب.");
    } catch (e: any) {
      triggerToast(e.message || "حدث خطأ");
    }
  }

  // Workshop Enrollment Approvals
  async function handleApproveWorkshopEnrollment(enrollmentId: string) {
    const token = localStorage.getItem("fz_token");
    if (!token) return;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
    try {
      const res = await fetch(`${apiBase}/api/v1/admin/workshop-enrollments/${enrollmentId}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("تعذر تفعيل الورشة");
      setWorkshopEnrollments((prev) =>
        prev.map((e) => (e.id === enrollmentId ? { ...e, status: "APPROVED" } : e))
      );
      triggerToast("✅ تم تأكيد الدفع وتفعيل الورشة للطالب بنجاح!");
    } catch (e: any) {
      triggerToast(e.message || "حدث خطأ");
    }
  }

  async function handleRejectWorkshopEnrollment(enrollmentId: string) {
    const token = localStorage.getItem("fz_token");
    if (!token) return;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
    try {
      const res = await fetch(`${apiBase}/api/v1/admin/workshop-enrollments/${enrollmentId}/reject`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("تعذر رفض الدفع");
      setWorkshopEnrollments((prev) =>
        prev.map((e) => (e.id === enrollmentId ? { ...e, status: "REJECTED" } : e))
      );
      triggerToast("❌ تم رفض اشتراك الطالب في الورشة.");
    } catch (e: any) {
      triggerToast(e.message || "حدث خطأ");
    }
  }

  // User actions
  function handleToggleUserActive(userId: string) {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u))
    );
    const u = users.find((x) => x.id === userId);
    triggerToast(
      u?.isActive
        ? `⛔ تم تجميد حساب المستخدم ${u.name}`
        : `✅ تم إعادة تنشيط حساب ${u?.name}`
    );
  }

  function handleChangeUserRole(userId: string, newRole: "STUDENT" | "TUTOR" | "ADMIN") {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    triggerToast(`👑 تم تغيير رول المستخدم إلى ${newRole}`);
  }

  // Dispute resolution
  function handleResolveDispute(reqId: string, resolution: "REFUND" | "PAY_TUTOR" | "SPLIT") {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === reqId
          ? { ...r, status: resolution === "REFUND" ? "CANCELLED" : "COMPLETED" }
          : r
      )
    );
    const labels = {
      REFUND: "تم رد المبلغ كاملاً لحساب الطالب وإلغاء الجلسة.",
      PAY_TUTOR: "تم تحويل المستحقات كاملة للمدرس وإغلاق النزاع.",
      SPLIT: "تمت التسوية بنسبة 50/50 بين الطرفين بنجاح.",
    };
    triggerToast(`⚖️ ${labels[resolution]}`);
  }

  // Filtered queries
  const filteredApps = apps.filter((a) => {
    if (appFilter === "ALL") return true;
    return a.status === appFilter;
  });

  const filteredRequests = requests.filter((r) => {
    const matchStatus = reqStatusFilter === "ALL" || r.status === reqStatusFilter;
    const matchSearch =
      !reqSearch ||
      r.subject.toLowerCase().includes(reqSearch.toLowerCase()) ||
      r.studentName.toLowerCase().includes(reqSearch.toLowerCase()) ||
      r.id.toLowerCase().includes(reqSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  const filteredUsers = users.filter((u) => {
    const matchRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
    const matchSearch =
      !userSearch ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch);
    return matchRole && matchSearch;
  });

  const disputedRequests = requests.filter((r) => r.status === "DISPUTED");

  return (
    <main className="min-h-screen bg-cream font-arabic text-ink">
      {/* Toast Notification */}
      {savedToast && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-2xl bg-ink px-5 py-3.5 text-sm font-bold text-cream shadow-2xl animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="h-5 w-5 text-sun" />
          <span>{savedToast}</span>
        </div>
      )}

      {selectedCollegeCard && isRenderableCollegeCard(selectedCollegeCard) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4"
          onClick={() => setSelectedCollegeCard(null)}
        >
          <div
            className="relative w-full max-w-3xl rounded-3xl border border-sand bg-white p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedCollegeCard(null)}
              className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-ink shadow-sm"
            >
              إغلاق
            </button>
            <img
              src={selectedCollegeCard}
              alt="كارنيه الكلية"
              className="max-h-[80vh] w-full rounded-2xl object-contain bg-cream"
            />
          </div>
        </div>
      )}

      {/* Top Demo Bar / Persona Switcher */}
      <header className="border-b border-sand bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-lilac to-indigo-700 text-xl text-white shadow-md">
                👑
              </div>
              <div>
                <span className="text-base font-black text-ink">فك زنقة</span>
                <span className="mr-2 rounded-md bg-lilac/15 px-2 py-0.5 text-[11px] font-black text-lilac">
                  بوابة الإدارة الشاملة (Admin Portal)
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
              <div className="mb-3 px-3 pt-2 text-xs font-bold text-ink/40">أقسام لوحة التحكم</div>
              <nav className="space-y-1">
                {[
                  { id: "overview", label: "نظرة عامة وإحصائيات", icon: LayoutDashboard, count: null },
                                    { id: "tutor-apps", label: "طلبات المدرسين (قبول/رفض)", icon: FileCheck2, count: apps.filter(a => a.status === "PENDING" || a.status === "UNDER_REVIEW").length },
                  { id: "requests", label: "كل طلبات الطلاب", icon: Search, count: requests.length },
                  { id: "users", label: "إدارة وصلاحيات المستخدمين", icon: Users, count: users.length },
                  { id: "golden-tutors", label: "إدارة المدرسين الذهبيين", icon: Sparkles, count: null },
                  { id: "disputes", label: "النزاعات والشكاوى", icon: FileWarning, count: disputedRequests.length },
                  { id: "workshops", label: "إدارة ورش العمل", icon: Video, count: null },
                  { id: "payouts", label: "فواتير المدرسين (السحب)", icon: DollarSign, count: null },
                  { id: "invoices", label: "الفواتير 🧾", icon: DollarSign, count: invoices.length },
                  { id: "settings", label: "إعدادات المنصة والعمولة", icon: SettingsIcon, count: null },

                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={
                      "flex w-full items-center justify-between rounded-2xl px-3.5 py-3 text-right text-sm font-bold transition " +
                      (activeTab === item.id
                        ? "bg-lilac text-white shadow-md shadow-lilac/30"
                        : "text-ink/70 hover:bg-ink/5")
                    }
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.count !== null && item.count > 0 && (
                      <span
                        className={
                          "rounded-full px-2 py-0.5 text-[11px] font-black " +
                          (activeTab === item.id ? "bg-white/20 text-white" : "bg-coral text-white")
                        }
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="rounded-3xl border border-mint/30 bg-mint/10 p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-mint" />
                <div>
                  <div className="text-xs font-black text-mint">صلاحيات كاملة مفعلة</div>
                  <div className="text-[11px] text-ink/60">أدمن المنصة · Super Admin</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 space-y-6">
          {/* ========================================================
              TAB 1: OVERVIEW & STATS
          ======================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-sand bg-white p-6 shadow-sm">
                <div>
                  <span className="rounded-full bg-lilac/15 px-3 py-1 text-xs font-black text-lilac">
                    لوحة المراقبة الحية 🚀
                  </span>
                  <h1 className="mt-2 text-2xl font-black text-ink">مرحباً بك في غرفة عمليات فك زنقة</h1>
                  <p className="mt-1 text-sm text-ink/60">
                    متابعة شاملة لطلبات انضمام المدرسين، طلبات الطلاب المفتوحة، النزاعات والعمليات المالية.
                  </p>
                </div>
                <button
                  onClick={() => triggerToast("تم تحديث البيانات لحظياً!")}
                  className="inline-flex items-center gap-2 rounded-full border border-sand bg-cream px-4 py-2.5 text-xs font-bold text-ink transition hover:bg-sand"
                >
                  <RefreshCw className="h-4 w-4" />
                  تحديث فوري
                </button>
              </div>

              {/* Stat Tiles */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  { label: "طلبات مدرسين بانتظار القرار", value: apps.filter(a => a.status === "PENDING" || a.status === "UNDER_REVIEW").length, icon: FileCheck2, color: "from-sun to-orange-500", onClick: () => setActiveTab("tutor-apps") },
                  { label: "طلبات طلاب نشطة حالياً", value: requests.filter(r => r.status !== "COMPLETED" && r.status !== "CANCELLED").length, icon: TrendingUp, color: "from-coral to-coralDark", onClick: () => setActiveTab("requests") },
                  { label: "إجمالي المستخدمين المسجلين", value: users.length, icon: Users, color: "from-lilac to-indigo-700", onClick: () => setActiveTab("users") },
                  { label: "نزاعات تحتاج تدخلك", value: disputedRequests.length, icon: AlertTriangle, color: "from-red-500 to-red-700", onClick: () => setActiveTab("disputes") },
                ].map((s, i) => (
                  <div
                    key={i}
                    onClick={s.onClick}
                    className="cursor-pointer rounded-3xl border border-sand bg-white p-5 shadow-sm transition hover:shadow-md hover:border-lilac/40"
                  >
                    <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} text-white shadow-md`}>
                      <s.icon className="h-5 w-5" />
                    </div>
                    <div className="text-3xl font-black text-ink">{s.value}</div>
                    <div className="mt-1 text-xs font-bold text-ink/60">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick Actions Grid */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Applications Card */}
                <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-black text-ink">📬 أحدث طلبات المدرسين</h2>
                    <button onClick={() => setActiveTab("tutor-apps")} className="text-xs font-bold text-lilac hover:underline">
                      عرض الكل ({apps.length}) ←
                    </button>
                  </div>
                  <div className="space-y-3">
                    {apps.slice(0, 3).map((app) => (
                      <div key={app.id} className="flex items-center justify-between rounded-2xl border border-sand/60 bg-cream/30 p-3.5">
                        <div>
                          <div className="font-bold text-ink">{app.name}</div>
                          <div className="text-xs text-ink/50">{app.faculty}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={"rounded-full px-2.5 py-1 text-[11px] font-black " + (
                            app.status === "ACCEPTED" ? "bg-mint/20 text-mint" :
                            app.status === "REJECTED" ? "bg-red-100 text-red-600" :
                            app.status === "CHANGES_REQUESTED" ? "bg-coral/20 text-coral" : "bg-sun/20 text-sun"
                          )}>
                            {app.statusLabel}
                          </span>
                          <button
                            onClick={() => { setSelectedApp(app); setActiveTab("tutor-apps"); }}
                            className="rounded-full bg-ink/5 p-2 text-ink hover:bg-lilac/10 hover:text-lilac"
                            title="فحص الطلب"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Open Student Requests Card */}
                <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-black text-ink">🚨 أحدث طلبات الطلاب (الزنقات)</h2>
                    <button onClick={() => setActiveTab("requests")} className="text-xs font-bold text-coral hover:underline">
                      عرض الكل ({requests.length}) ←
                    </button>
                  </div>
                  <div className="space-y-3">
                    {requests.slice(0, 3).map((req) => (
                      <div key={req.id} className="flex items-center justify-between rounded-2xl border border-sand/60 bg-cream/30 p-3.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-ink">{req.subject}</span>
                            {req.urgency === "ASAP" && (
                              <span className="rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-black text-white">عاجل 🚨</span>
                            )}
                          </div>
                          <div className="text-xs text-ink/50">{req.studentName} · {req.budget} ج.م</div>
                        </div>
                        <button
                          onClick={() => { setSelectedReq(req); setActiveTab("requests"); }}
                          className="rounded-full bg-ink/5 px-3 py-1.5 text-xs font-bold text-ink/70 hover:bg-coral/10 hover:text-coral"
                        >
                          إدارة الطلب
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: TEACHER APPLICATIONS (ACCEPT / REJECT)
          ======================================================== */}
          {activeTab === "tutor-apps" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-sand bg-white p-6 shadow-sm">
                <div>
                  <h1 className="text-2xl font-black text-ink">👨‍🏫 مراجعة واعتماد طلبات المدرسين</h1>
                  <p className="text-sm text-ink/60">
                    يمكنك قبول المعلم، رفض الطلب مع توضيح السبب، أو طلب مستندات وفيديو شرح إضافي.
                  </p>
                </div>
                {/* Filter tabs */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "ALL", label: "الكل" },
                    { id: "PENDING", label: "معلقة" },
                    { id: "UNDER_REVIEW", label: "تحت المراجعة" },
                    { id: "ACCEPTED", label: "مقبولة" },
                    { id: "CHANGES_REQUESTED", label: "مطلوب تعديل" },
                    { id: "REJECTED", label: "مرفوضة" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setAppFilter(f.id)}
                      className={
                        "rounded-full px-3.5 py-1.5 text-xs font-bold transition " +
                        (appFilter === f.id
                          ? "bg-lilac text-white shadow-sm"
                          : "border border-sand bg-white text-ink/70 hover:bg-cream")
                      }
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Applications Table */}
              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-sand text-right text-xs font-black text-ink/50">
                      <th className="py-3 pr-2">المعرف</th>
                      <th className="py-3 pr-2">المدرس والمعلومات</th>
                      <th className="py-3 pr-2">الجامعة والكلية</th>
                      <th className="py-3 pr-2">الخبرة ونمط التدريس</th>
                      <th className="py-3 pr-2">الحالة</th>
                      <th className="py-3 pl-2 text-center">الإجراءات والقرار</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApps.map((app) => (
                      <tr key={app.id} className="border-b border-sand/60 last:border-0 hover:bg-cream/20 transition">
                        <td className="py-3.5 pr-2 font-mono text-xs font-bold text-ink/50">{app.id}</td>
                        <td className="py-3.5 pr-2">
                          <div className="font-bold text-ink">{app.name}</div>
                          <div className="text-[11px] text-ink/50">{app.email} · {app.phone}</div>
                        </td>
                        <td className="py-3.5 pr-2 text-ink/80 text-xs">
                          <div className="font-bold">{app.university}</div>
                          <div className="text-ink/60">{app.faculty}</div>
                        </td>
                        <td className="py-3.5 pr-2 max-w-xs text-xs text-ink/70">
                          <div className="truncate font-semibold">{app.experience}</div>
                          <span className="inline-block mt-1 rounded bg-ink/5 px-2 py-0.5 text-[10px] font-bold text-ink/60">
                            {app.preferredMode === "ONLINE" ? "💻 أونلاين فقط" : app.preferredMode === "IN_PERSON" ? "🏫 حضوري فقط" : "🔄 أونلاين وحضوري"}
                          </span>
                        </td>
                        <td className="py-3.5 pr-2">
                          <span
                            className={
                              "inline-flex rounded-full px-3 py-1 text-xs font-black " +
                              (app.status === "ACCEPTED"
                                ? "bg-mint/20 text-mint"
                                : app.status === "REJECTED"
                                ? "bg-red-100 text-red-600"
                                : app.status === "CHANGES_REQUESTED"
                                ? "bg-coral/20 text-coral"
                                : "bg-sun/25 text-orange-700")
                            }
                          >
                            {app.statusLabel}
                          </span>
                        </td>
                        <td className="py-3.5 pl-2">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Inspect */}
                            <button
                              onClick={() => setSelectedApp(app)}
                              className="flex items-center gap-1 rounded-xl bg-ink/5 px-2.5 py-1.5 text-xs font-bold text-ink/70 hover:bg-lilac/15 hover:text-lilac transition"
                              title="معاينة الملف الكامل"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              فحص
                            </button>

                            {/* Accept Button */}
                            {app.status !== "ACCEPTED" && (
                              <button
                                onClick={() => handleAcceptTeacher(app.id)}
                                className="flex items-center gap-1 rounded-xl bg-mint/15 px-2.5 py-1.5 text-xs font-black text-mint hover:bg-mint hover:text-white transition"
                                title="قبول ومنح رول TUTOR"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                قبول
                              </button>
                            )}

                            {/* Reject Button */}
                            {app.status !== "REJECTED" && (
                              <button
                                onClick={() => setRejectionModalApp(app)}
                                className="flex items-center gap-1 rounded-xl bg-red-50 px-2.5 py-1.5 text-xs font-black text-red-600 hover:bg-red-500 hover:text-white transition"
                                title="رفض الطلب"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                رفض
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: ALL STUDENT REQUESTS (SHOWED & MANAGEABLE)
          ======================================================== */}
          {activeTab === "requests" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-sand bg-white p-6 shadow-sm">
                <div>
                  <h1 className="text-2xl font-black text-ink">📋 جميع طلبات واستغاثات الطلاب</h1>
                  <p className="text-sm text-ink/60">
                    متابعة حية لجميع الطلبات على مستوى كل الجامعات والتخصصات وإمكانية التدخل المباشر.
                  </p>
                </div>
                {/* Search Bar */}
                <div className="relative min-w-[260px]">
                  <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
                  <input
                    type="text"
                    placeholder="ابحث بالمادة، الطالب، أو الكود..."
                    value={reqSearch}
                    onChange={(e) => setReqSearch(e.target.value)}
                    className="w-full rounded-full border border-sand bg-cream/40 py-2.5 pr-10 pl-4 text-xs font-semibold outline-none focus:border-lilac"
                  />
                </div>
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "ALL", label: "جميع الطلبات" },
                  { id: "PAYMENT_PENDING", label: "⏳ في انتظار تأكيد الدفع" },
                  { id: "MATCHING", label: "🔄 جاري المطابقة" },
                  { id: "CONFIRMED", label: "✅ مؤكدة" },
                  { id: "IN_PROGRESS", label: "⏳ قيد التنفيذ" },
                  { id: "COMPLETED", label: "🎉 مكتملة" },
                  { id: "DISPUTED", label: "⚠️ في نزاع" },
                  { id: "CANCELLED", label: "❌ ملغاة" },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setReqStatusFilter(st.id)}
                    className={
                      "rounded-full px-4 py-2 text-xs font-bold transition " +
                      (reqStatusFilter === st.id
                        ? "bg-coral text-white shadow-sm"
                        : "border border-sand bg-white text-ink/70 hover:bg-cream")
                    }
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Requests List */}
              <div className="space-y-3">
                {filteredRequests.map((r) => (
                  <div
                    key={r.id}
                    className={`rounded-3xl border p-5 shadow-sm transition ${
                      r.status === "PAYMENT_PENDING"
                        ? "border-amber-400 bg-amber-50/40 hover:border-amber-500"
                        : "border-sand bg-white hover:border-lilac/50"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-[280px]">
                        <div className="flex flex-wrap items-center gap-2">
                          <code className="rounded-lg bg-ink/5 px-2.5 py-1 font-mono text-xs font-bold text-ink">
                            {r.id}
                          </code>
                          <span className="text-xs font-bold text-ink/40">{r.createdAt}</span>
                          <span
                            className={
                              "rounded-full px-3 py-0.5 text-xs font-black " +
                              (r.urgency === "ASAP"
                                ? "bg-red-500 text-white"
                                : r.urgency === "HIGH"
                                ? "bg-orange-500 text-white"
                                : "bg-sun/20 text-sun")
                            }
                          >
                            أولوية: {r.urgency}
                          </span>
                          <span
                            className={
                              "rounded-full px-3 py-0.5 text-xs font-black " +
                              (r.status === "PAYMENT_PENDING"
                                ? "bg-amber-500 text-white animate-pulse"
                                : r.status === "COMPLETED"
                                ? "bg-mint/20 text-mint"
                                : r.status === "DISPUTED"
                                ? "bg-red-100 text-red-600"
                                : r.status === "CONFIRMED"
                                ? "bg-lilac/20 text-lilac"
                                : "bg-sun/20 text-sun")
                            }
                          >
                            حالة: {r.status === "PAYMENT_PENDING" ? "⏳ بانتظار تأكيد الإدارة للدفع" : r.status}
                          </span>
                        </div>

                        <h3 className="text-lg font-black text-ink">
                          {r.subject} · <span className="text-coral font-bold">{r.topic}</span>
                        </h3>
                        <p className="text-xs text-ink/70 leading-relaxed max-w-3xl">
                          {r.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-ink/60">
                          <span>🎓 الطالب: <strong className="text-ink">{r.studentName}</strong> ({r.university} — {r.faculty})</span>
                          {r.selectedTutor && (
                            <span>👨‍🏫 المدرس المختار: <strong className="text-mint">{r.selectedTutor}</strong></span>
                          )}
                          <span>💵 الميزانية: <strong className="text-ink">{r.budget} ج.م</strong></span>
                          <span>📍 النمط: <strong>{r.mode === "ONLINE" ? "أونلاين" : "حضوري"}</strong></span>
                        </div>

                        {/* Admin Action Box for PAYMENT_PENDING */}
                        {r.status === "PAYMENT_PENDING" && (
                          <div className="mt-3 rounded-2xl border border-amber-300 bg-amber-100/60 p-3.5 text-amber-900 flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <div className="text-xs font-black flex items-center gap-1.5">
                                <span>💳</span>
                                <span>قام الطالب بتحويل المبلغ وبانتظار تأكيد استلام الدفع لتفعيل الجلسة للطرفين.</span>
                              </div>
                              <div className="text-[11px] opacity-80 mt-0.5">
                                بعد الموافقة، سيتمكن المدرس من بدء الغرفة الافتراضية ودخول الطالب فوراً.
                              </div>
                              {(r.paymentSenderAccount || r.paymentMethodUsed) && (
                                <div className="mt-2 text-xs font-bold text-amber-800 bg-amber-200/50 p-2 rounded-xl inline-block border border-amber-300/50">
                                  تم التحويل من: <span className="font-mono tracking-widest">{r.paymentSenderAccount || 'غير محدد'}</span> 
                                  {" "}({r.paymentMethodUsed === 'vodafone' ? 'فودافون كاش' : r.paymentMethodUsed === 'instapay' ? 'إنستاباي' : r.paymentMethodUsed || 'غير محدد'})
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApproveSessionPayment(r.id)}
                                className="rounded-xl bg-green-600 px-4 py-1.5 text-xs font-black text-white hover:bg-green-700 transition shadow-sm"
                              >
                                ✓ تأكيد استلام الدفع وتفعيل الجلسة
                              </button>
                              <button
                                onClick={() => handleRejectSessionPayment(r.id)}
                                className="rounded-xl border border-red-300 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                              >
                                ✕ رفض الدفع
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Admin Override Controls */}
                      <div className="flex flex-col gap-2 shrink-0">
                        <div className="text-[11px] font-bold text-ink/40">تعديل الحالة يدوياً:</div>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => handleOverrideRequestStatus(r.id, "CONFIRMED")}
                            className="rounded-xl border border-sand bg-cream/50 px-3 py-1.5 text-xs font-bold text-lilac hover:bg-lilac hover:text-white transition"
                          >
                            تأكيد الطلب
                          </button>
                          <button
                            onClick={() => handleOverrideRequestStatus(r.id, "COMPLETED")}
                            className="rounded-xl border border-sand bg-cream/50 px-3 py-1.5 text-xs font-bold text-mint hover:bg-mint hover:text-white transition"
                          >
                            إكمال الجلسة
                          </button>
                          <button
                            onClick={() => handleOverrideRequestStatus(r.id, "CANCELLED")}
                            className="rounded-xl border border-sand bg-cream/50 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-500 hover:text-white transition"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 4: USERS & PERMISSIONS MANAGEMENT
          ======================================================== */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-sand bg-white p-6 shadow-sm">
                <div>
                  <h1 className="text-2xl font-black text-ink">👥 إدارة المستخدمين والصلاحيات</h1>
                  <p className="text-sm text-ink/60">
                    التحكم في أدوار الحسابات (طالب / مدرس / أدمن) وتجميد أو إعادة تنشيط المستخدمين.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="بحث بالاسم أو البريد..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="rounded-full border border-sand bg-cream/40 py-2 px-4 text-xs font-semibold outline-none focus:border-lilac"
                  />
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="rounded-full border border-sand bg-white py-2 px-3 text-xs font-bold text-ink outline-none"
                  >
                    <option value="ALL">كل الأدوار</option>
                    <option value="STUDENT">طلاب</option>
                    <option value="TUTOR">مدرسين</option>
                    <option value="ADMIN">أدمن</option>
                  </select>
                </div>
              </div>

              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-sand text-right text-xs font-black text-ink/50">
                      <th className="py-3 pr-2">المستخدم</th>
                      <th className="py-3 pr-2">الرول الحالي</th>
                      <th className="py-3 pr-2">كارنيه الكلية</th>
                      <th className="py-3 pr-2">تاريخ الانضمام</th>
                      <th className="py-3 pr-2">الحالة</th>
                      <th className="py-3 pl-2 text-center">تغيير الصلاحيات والحساب</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="border-b border-sand/60 last:border-0 hover:bg-cream/20">
                        <td className="py-3.5 pr-2">
                          <input
                            value={u.name}
                            onChange={(e) => setUsers((current) => current.map((user) => user.id === u.id ? { ...user, name: e.target.value } : user))}
                            className="w-full rounded-xl border border-sand bg-cream/40 px-2.5 py-1.5 text-xs font-bold text-ink outline-none focus:border-lilac"
                          />
                          <div className="mt-1 text-[11px] text-ink/50">{u.email} · {u.phone}</div>
                        </td>
                        <td className="py-3.5 pr-2">
                          <span
                            className={
                              "rounded-full px-3 py-1 text-xs font-black " +
                              (u.role === "ADMIN"
                                ? "bg-lilac text-white"
                                : u.role === "TUTOR"
                                ? "bg-mint/20 text-mint"
                                : "bg-coral/20 text-coral")
                            }
                          >
                            {u.role === "ADMIN" ? "👑 أدمن" : u.role === "TUTOR" ? "👨‍🏫 مدرس" : "🎓 طالب"}
                          </span>
                        </td>
                        <td className="py-3.5 pr-2 text-xs text-ink/70">
                          {u.collegeCardFileName ? (
                            isRenderableCollegeCard(u.collegeCardFileName) ? (
                              <button
                                type="button"
                                onClick={() => setSelectedCollegeCard(u.collegeCardFileName ?? null)}
                                className="rounded-full bg-lilac/10 px-3 py-1.5 text-[11px] font-black text-lilac transition hover:bg-lilac hover:text-white"
                              >
                                فتح الصورة
                              </button>
                            ) : (
                              <span className="inline-flex rounded-full bg-cream px-2.5 py-1 text-[11px] font-black text-ink/70">
                                {u.collegeCardFileName}
                              </span>
                            )
                          ) : (
                            <span className="text-ink/40">غير موجود</span>
                          )}
                        </td>
                        <td className="py-3.5 pr-2 text-xs text-ink/60">{u.joinedAt}</td>
                        <td className="py-3.5 pr-2">
                          <span
                            className={
                              "rounded-full px-2.5 py-1 text-[11px] font-black " +
                              (u.isActive ? "bg-mint/15 text-mint" : "bg-red-100 text-red-600")
                            }
                          >
                            {u.isActive ? "نشط" : "مجمد"}
                          </span>
                        </td>
                        <td className="py-3.5 pl-2">
                          <div className="flex items-center justify-center gap-2">
                            {/* Role Switcher */}
                            <select
                              value={u.role}
                              onChange={(e) => handleChangeUserRole(u.id, e.target.value as any)}
                              className="rounded-xl border border-sand bg-cream/40 px-2.5 py-1 text-xs font-bold text-ink outline-none"
                            >
                              <option value="STUDENT">طالب (Student)</option>
                              <option value="TUTOR">مدرس (Tutor)</option>
                              <option value="ADMIN">أدمن (Admin)</option>
                            </select>

                            <button
                              onClick={() => saveUserInfo(u.id, u.name, u.phone)}
                              className="rounded-xl bg-lilac px-3 py-1 text-xs font-bold text-white hover:bg-indigo-700"
                            >
                              حفظ الاسم
                            </button>

                            {/* Freeze/Active Toggle */}
                            <button
                              onClick={() => handleToggleUserActive(u.id)}
                              className={
                                "rounded-xl px-3 py-1 text-xs font-bold transition " +
                                (u.isActive
                                  ? "bg-red-50 text-red-600 hover:bg-red-500 hover:text-white"
                                  : "bg-mint/15 text-mint hover:bg-mint hover:text-white")
                              }
                            >
                              {u.isActive ? "تجميد الحساب" : "تنشيط"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-ink">👑 إدارة المدرسين الذهبيين</h2>
                    <p className="text-sm text-ink/60">يمكنك تعديل الاسم، السيرة، الأسعار، وآلية التدريس للمدرسين المعروضين في الصفحة الرئيسية.</p>
                  </div>
                </div>

                </div>
            </div>
          )}

          {/* ========================================================
              TAB 5: DISPUTES & CLAIMS
          ======================================================== */}
          {activeTab === "golden-tutors" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-black text-ink">👑 إدارة المدرسين الذهبيين</h1>
                <p className="mt-1 text-sm text-ink/60">
                  أضف مدرسًا ذهبيًا جديدًا أو عدّل بيانات المدرسين المعروضين في الصفحة الرئيسية.
                </p>
              </div>

              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-ink">إدارة المدرسين الذهبيين</h2>
                    <p className="text-sm text-ink/60">استخدم هذه الصفحة لإدارة اسم المستخدم، السعر، المادة/الوصف، ووضع العرض في الصفحة الرئيسية.</p>
                  </div>
                </div>

                {users.filter((user) => user.role === "TUTOR" && user.tutorProfile).length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-sand bg-cream/20 p-6 text-center text-sm text-ink/60">
                    لا يوجد مدرس ذهبي حالياً في النظام. يمكنك إضافة مدرس جديد من النموذج التالي.
                  </div>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {users.filter((user) => user.role === "TUTOR" && user.tutorProfile).map((user) => (
                      <div key={user.id} className="rounded-2xl border border-sand bg-cream/20 p-4">
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <input
                            value={user.name}
                            onChange={(e) => setUsers((current) => current.map((item) => item.id === user.id ? { ...item, name: e.target.value } : item))}
                            className="w-full rounded-xl border border-sand bg-white px-3 py-2 text-sm font-bold text-ink outline-none focus:border-lilac"
                          />
                          <label className="flex items-center gap-2 rounded-xl border border-sand bg-white px-2.5 py-2 text-[11px] font-black text-ink">
                            <input
                              type="checkbox"
                              checked={user.tutorProfile?.isFeaturedOnHome ?? false}
                              onChange={(e) => setUsers((current) => current.map((item) => item.id === user.id ? {
                                ...item,
                                tutorProfile: item.tutorProfile ? { ...item.tutorProfile, isFeaturedOnHome: e.target.checked } : item.tutorProfile,
                              } : item))}
                              className="h-4 w-4 text-lilac"
                            />
                            إظهار في الرئيسية
                          </label>
                        </div>

                        <textarea
                          value={user.tutorProfile?.bio ?? ""}
                          onChange={(e) => setUsers((current) => current.map((item) => item.id === user.id ? {
                            ...item,
                            tutorProfile: item.tutorProfile ? { ...item.tutorProfile, bio: e.target.value } : item.tutorProfile,
                          } : item))}
                          rows={3}
                          placeholder="السيرة أو الوصف"
                          className="w-full rounded-xl border border-sand bg-white px-3 py-2 text-xs text-ink outline-none focus:border-lilac"
                        />

                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                          <input
                            type="number"
                            value={user.tutorProfile?.priceMinEGP ?? 0}
                            onChange={(e) => setUsers((current) => current.map((item) => item.id === user.id ? {
                              ...item,
                              tutorProfile: item.tutorProfile ? { ...item.tutorProfile, priceMinEGP: Number(e.target.value) } : item.tutorProfile,
                            } : item))}
                            placeholder="الحد الأدنى"
                            className="rounded-xl border border-sand bg-white px-3 py-2 text-xs font-bold text-ink outline-none focus:border-lilac"
                          />
                          <input
                            type="number"
                            value={user.tutorProfile?.priceMaxEGP ?? 0}
                            onChange={(e) => setUsers((current) => current.map((item) => item.id === user.id ? {
                              ...item,
                              tutorProfile: item.tutorProfile ? { ...item.tutorProfile, priceMaxEGP: Number(e.target.value) } : item.tutorProfile,
                            } : item))}
                            placeholder="الحد الأقصى"
                            className="rounded-xl border border-sand bg-white px-3 py-2 text-xs font-bold text-ink outline-none focus:border-lilac"
                          />
                          <select
                            value={user.tutorProfile?.teachingMode ?? "BOTH"}
                            onChange={(e) => setUsers((current) => current.map((item) => item.id === user.id ? {
                              ...item,
                              tutorProfile: item.tutorProfile ? { ...item.tutorProfile, teachingMode: e.target.value as any } : item.tutorProfile,
                            } : item))}
                            className="rounded-xl border border-sand bg-white px-3 py-2 text-xs font-bold text-ink outline-none focus:border-lilac"
                          >
                            <option value="ONLINE">أونلاين</option>
                            <option value="IN_PERSON">حضوري</option>
                            <option value="BOTH">أونلاين + حضوري</option>
                          </select>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-ink/50">{user.email}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => deleteTutorProfile(user)}
                              className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-black text-red-600 hover:bg-red-100"
                            >
                              حذف المدرس
                            </button>
                            <button
                              onClick={() => updateTutorProfile(user)}
                              className="rounded-full bg-lilac px-4 py-2 text-xs font-black text-white hover:bg-indigo-700"
                            >
                              حفظ بيانات المدرس
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-5 rounded-2xl border border-lilac/30 bg-lilac/5 p-4 text-sm text-ink/70">
                  <div className="mb-2 font-black text-ink">إضافة مدرس ذهبي جديد</div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-[11px] font-black text-ink/60">
                      اسم المستخدم
                      <input
                        type="text"
                        value={newTutorForm.userSearch}
                        placeholder="اكتب اسم المستخدم أو البريد"
                        className="mt-1 w-full rounded-xl border border-sand bg-white px-3 py-2 text-xs font-bold text-ink outline-none focus:border-lilac"
                        onChange={(e) => setNewTutorForm((current) => ({ ...current, userSearch: e.target.value, userId: "" }))}
                      />
                    </label>
                    <label className="text-[11px] font-black text-ink/60">
                      اسم المدرس
                      <input
                        type="text"
                        value={newTutorForm.fullName}
                        placeholder="اسم المدرس"
                        className="mt-1 w-full rounded-xl border border-sand bg-white px-3 py-2 text-xs font-bold text-ink outline-none focus:border-lilac"
                        onChange={(e) => setNewTutorForm((current) => ({ ...current, fullName: e.target.value }))}
                      />
                    </label>
                    <label className="text-[11px] font-black text-ink/60">
                      السعر الأدنى
                      <input
                        type="number"
                        value={newTutorForm.priceMinEGP}
                        placeholder="السعر الأدنى"
                        className="mt-1 w-full rounded-xl border border-sand bg-white px-3 py-2 text-xs font-bold text-ink outline-none focus:border-lilac"
                        onChange={(e) => setNewTutorForm((current) => ({ ...current, priceMinEGP: Number(e.target.value) || 150 }))}
                      />
                    </label>
                    <label className="text-[11px] font-black text-ink/60">
                      السعر الأعلى
                      <input
                        type="number"
                        value={newTutorForm.priceMaxEGP}
                        placeholder="السعر الأعلى"
                        className="mt-1 w-full rounded-xl border border-sand bg-white px-3 py-2 text-xs font-bold text-ink outline-none focus:border-lilac"
                        onChange={(e) => setNewTutorForm((current) => ({ ...current, priceMaxEGP: Number(e.target.value) || 400 }))}
                      />
                    </label>
                    <label className="text-[11px] font-black text-ink/60">
                      طريقة التدريس
                      <select
                        className="mt-1 w-full rounded-xl border border-sand bg-white px-3 py-2 text-xs font-bold text-ink outline-none focus:border-lilac"
                        value={newTutorForm.teachingMode}
                        onChange={(e) => setNewTutorForm((current) => ({ ...current, teachingMode: e.target.value as any }))}
                      >
                        <option value="BOTH">أونلاين + حضوري</option>
                        <option value="ONLINE">أونلاين</option>
                        <option value="IN_PERSON">حضوري</option>
                      </select>
                    </label>
                    <label className="flex items-center justify-center gap-2 rounded-xl border border-sand bg-white px-3 py-2 text-[11px] font-black text-ink">
                      <input
                        type="checkbox"
                        checked={newTutorForm.isFeaturedOnHome}
                        onChange={(e) => setNewTutorForm((current) => ({ ...current, isFeaturedOnHome: e.target.checked }))}
                      />
                      إظهار في الرئيسية
                    </label>
                  </div>
                  <label className="mt-3 block text-[11px] font-black text-ink/60">
                    السيرة أو الوصف
                    <textarea
                      value={newTutorForm.bio}
                      placeholder="السيرة أو الوصف"
                      rows={3}
                      className="mt-1 w-full rounded-xl border border-sand bg-white px-3 py-2 text-xs text-ink outline-none focus:border-lilac"
                      onChange={(e) => setNewTutorForm((current) => ({ ...current, bio: e.target.value }))}
                    />
                  </label>
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={async () => {
                        const typedUser = newTutorForm.userSearch.trim();
                        if (!typedUser || !newTutorForm.fullName) {
                          triggerToast("اكتب اسم المستخدم واسم المدرس أولاً");
                          return;
                        }

                        const matchedUser = users.find((user) => {
                          const normalizedInput = typedUser.toLowerCase();
                          return user.role !== "ADMIN" && (
                            user.name.toLowerCase() === normalizedInput ||
                            user.email.toLowerCase() === normalizedInput ||
                            user.name.toLowerCase().includes(normalizedInput) ||
                            user.email.toLowerCase().includes(normalizedInput)
                          );
                        });

                        if (!matchedUser) {
                          triggerToast("لم يتم العثور على مستخدم مطابق، تأكد من كتابة الاسم أو البريد الصحيح");
                          return;
                        }

                        const token = localStorage.getItem("fz_token");
                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/admin/users/${matchedUser.id}/tutor-profile`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                          body: JSON.stringify({
                            fullName: newTutorForm.fullName,
                            bio: newTutorForm.bio,
                            priceMinEGP: newTutorForm.priceMinEGP,
                            priceMaxEGP: newTutorForm.priceMaxEGP,
                            teachingMode: newTutorForm.teachingMode,
                            isFeaturedOnHome: newTutorForm.isFeaturedOnHome,
                          }),
                        });

                        if (!response.ok) {
                          triggerToast("تعذر إنشاء ملف المدرس الذهبي");
                          return;
                        }

                        const created = await response.json();
                        setUsers((current) => current.map((item) => item.id === matchedUser.id ? {
                          ...item,
                          role: "TUTOR",
                          name: newTutorForm.fullName,
                          tutorProfile: {
                            id: created.id,
                            bio: created.bio ?? "",
                            priceMinEGP: created.priceMinEGP ?? null,
                            priceMaxEGP: created.priceMaxEGP ?? null,
                            teachingMode: created.teachingMode,
                            isFeaturedOnHome: created.isFeaturedOnHome,
                          },
                        } : item));
                        setNewTutorForm({ userId: "", userSearch: "", fullName: "", bio: "", priceMinEGP: 150, priceMaxEGP: 400, teachingMode: "BOTH", isFeaturedOnHome: true });
                        triggerToast("✅ تم إنشاء ملف المدرس الذهبي بنجاح");
                      }}
                      className="rounded-full bg-lilac px-4 py-2 text-xs font-black text-white hover:bg-indigo-700"
                    >
                      إنشاء مدرس ذهبي
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "disputes" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-red-200 bg-gradient-to-br from-red-50 via-cream to-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-2xl text-red-600">
                    <FileWarning className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-ink">⚠️ مركز فض النزاعات وحماية الحقوق</h1>
                    <p className="text-sm text-ink/60">
                      مراجعة الجلسات التي أبلغ عنها أحد الطرفين واتخاذ القرار النهائي (رد للطالب / صرف للمدرس / تسوية مشتركة).
                    </p>
                  </div>
                </div>
              </div>

              {disputedRequests.length === 0 ? (
                <div className="rounded-3xl border border-sand bg-white p-12 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-mint mb-3" />
                  <h3 className="text-lg font-black text-ink">لا توجد أي نزاعات مفتوحة حالياً!</h3>
                  <p className="text-sm text-ink/50">جميع الجلسات والمدفوعات تسير بسلاسة تامة.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {disputedRequests.map((d) => (
                    <div key={d.id} className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sand pb-4">
                        <div>
                          <span className="rounded-lg bg-red-100 px-2.5 py-1 font-mono text-xs font-bold text-red-700">
                            نزاع: {d.id}
                          </span>
                          <h3 className="mt-2 text-lg font-black text-ink">{d.subject} — {d.topic}</h3>
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-ink/40">قيمة المعاملة المعلقة</div>
                          <div className="text-xl font-black text-coral">{d.budget} ج.م</div>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 text-xs bg-cream/40 p-4 rounded-2xl">
                        <div>
                          <strong className="block text-ink font-bold mb-1">بيانات الطالب المشتكي:</strong>
                          <p>{d.studentName} ({d.studentEmail})</p>
                          <p className="mt-2 text-ink/70"><strong>الشكوى:</strong> {d.description}</p>
                        </div>
                        <div>
                          <strong className="block text-ink font-bold mb-1">المدرس المعني:</strong>
                          <p>{d.selectedTutor ?? "غير محدد"}</p>
                          <p className="mt-2 text-ink/70"><strong>النمط:</strong> {d.mode === "ONLINE" ? "أونلاين" : "حضوري"}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                        <span className="text-xs font-bold text-ink/50">اختر قرار الإدارة النهائي:</span>
                        <button
                          onClick={() => handleResolveDispute(d.id, "REFUND")}
                          className="rounded-full bg-red-500 px-5 py-2 text-xs font-black text-white hover:bg-red-600 transition shadow"
                        >
                          رد كامل المبلغ للطالب 💸
                        </button>
                        <button
                          onClick={() => handleResolveDispute(d.id, "PAY_TUTOR")}
                          className="rounded-full bg-mint px-5 py-2 text-xs font-black text-white hover:bg-green-600 transition shadow"
                        >
                          صرف كامل المبلغ للمدرس ✅
                        </button>
                        <button
                          onClick={() => handleResolveDispute(d.id, "SPLIT")}
                          className="rounded-full bg-lilac px-5 py-2 text-xs font-black text-white hover:bg-indigo-700 transition shadow"
                        >
                          تسوية بنسبة 50/50 ⚖️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "workshops" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-black text-ink">🎤 إدارة ورش العمل والصفحة الرئيسية</h1>
                <p className="mt-1 text-sm text-ink/60">
                  أضف ورشاً جديدة، حدّد حالة اعتمادها، وعرضها أو إخفائها من قسم الورش والصفحة الرئيسية.
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
                <div className="mt-4 flex justify-end gap-3">
                  {editingWorkshopId && (
                    <button
                      onClick={resetWorkshopForm}
                      className="rounded-full border border-sand px-6 py-2.5 text-xs font-black text-ink/70"
                    >
                      إلغاء التعديل
                    </button>
                  )}
                  <button
                    onClick={createWorkshop}
                    className="rounded-full bg-ink px-6 py-2.5 text-xs font-black text-cream hover:bg-ink/90"
                  >
                    {editingWorkshopId ? "تحديث الورشة" : "إنشاء الورشة"}
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-black text-ink">قائمة الورش الحالية</h2>
                <div className="space-y-4">
                  {workshops.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-sand bg-cream/30 p-6 text-center text-sm font-bold text-ink/50">
                      لا توجد ورش حالياً.
                    </div>
                  ) : (
                    workshops.map((workshop) => (
                      <div key={workshop.id} className="rounded-2xl border border-sand bg-cream/20 p-4">
                        <div className="flex flex-wrap items-start gap-4">
                          {/* Thumbnail preview */}
                          {workshop.thumbnailUrl ? (
                            <img
                              src={workshop.thumbnailUrl}
                              alt="thumbnail"
                              className="h-20 w-36 rounded-xl object-cover border border-sand shrink-0"
                            />
                          ) : (
                            <div className="flex h-20 w-36 shrink-0 items-center justify-center rounded-xl border border-dashed border-sand bg-cream/50 text-[10px] text-ink/40 font-bold">
                              لا توجد صورة
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <h3 className="text-lg font-black text-ink">{workshop.title}</h3>
                                <p className="mt-1 text-xs text-ink/60">{workshop.tutorName} · {workshop.tutorEmail || "بدون بريد"}</p>
                                {workshop.youtubeVideoId && (
                                  <a
                                    href={`https://www.youtube.com/watch?v=${workshop.youtubeVideoId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-red-500 hover:underline"
                                  >
                                    🎬 مشاهدة على يوتيوب (خاص)
                                  </a>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  onClick={() => toggleFeaturedWorkshop(workshop.id, !workshop.isFeaturedOnHome)}
                                  className={
                                    "rounded-full px-3 py-1.5 text-[11px] font-black " +
                                    (workshop.isFeaturedOnHome
                                      ? "bg-mint/15 text-mint"
                                      : "bg-ink/5 text-ink/70")
                                  }
                                >
                                  {workshop.isFeaturedOnHome ? "إخفاء من الرئيسية" : "عرض في الرئيسية"}
                                </button>
                                <button
                                  onClick={() => startEditWorkshop(workshop)}
                                  className="rounded-full bg-coral/10 px-3 py-1.5 text-[11px] font-black text-coral"
                                >
                                  تعديل
                                </button>
                                <button
                                  onClick={() => {
                                    setUploadingWorkshopId(uploadingWorkshopId === workshop.id ? null : workshop.id);
                                    setUploadStatus("idle");
                                    setUploadMessage("");
                                    setVideoFile(null);
                                    setThumbnailFile(null);
                                  }}
                                  className="rounded-full bg-red-500/10 px-3 py-1.5 text-[11px] font-black text-red-600"
                                >
                                  🎬 {workshop.youtubeVideoId ? "تحديث الفيديو" : "رفع على يوتيوب"}
                                </button>
                                <select
                                  value={workshop.status}
                                  onChange={(e) => updateWorkshopStatus(workshop.id, e.target.value as WorkshopItem["status"])}
                                  className="rounded-xl border border-sand bg-white px-2.5 py-1.5 text-xs font-bold text-ink outline-none"
                                >
                                  <option value="PENDING">معلقة</option>
                                  <option value="APPROVED">موافقة</option>
                                  <option value="REJECTED">مرفوضة</option>
                                  <option value="PUBLISHED">منشورة</option>
                                </select>
                              </div>
                            </div>
                            <p className="mt-3 text-sm text-ink/70">{workshop.description || "لا يوجد وصف"}</p>
                            <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-ink/60">
                              <span>النوع: {workshop.type === "FREE" ? "مجانية" : `مدفوعة (${workshop.priceEGP ?? 0} ج.م)`}</span>
                              <span>البدء: {new Date(workshop.startsAt).toLocaleString("ar-EG")}</span>
                              <span>النهاية: {new Date(workshop.endsAt).toLocaleString("ar-EG")}</span>
                              <span>السعة: {workshop.capacity || "غير محددة"}</span>
                            </div>
                          </div>
                        </div>

                        {/* YouTube Upload Panel */}
                        {uploadingWorkshopId === workshop.id && (
                          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50/50 p-4 space-y-3">
                            <h4 className="text-sm font-black text-red-700 flex items-center gap-2">
                              🎬 رفع فيديو الورشة إلى يوتيوب (خاص)
                            </h4>

                            <div className="grid gap-3 md:grid-cols-2">
                              {/* Video file */}
                              <div>
                                <label className="mb-1 block text-[11px] font-bold text-ink/70">
                                  🎥 ملف الفيديو <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                                  className="block w-full rounded-xl border border-sand bg-white px-3 py-2 text-xs text-ink file:mr-2 file:rounded-lg file:border-0 file:bg-red-100 file:px-3 file:py-1 file:text-xs file:font-bold file:text-red-700 outline-none"
                                />
                                {videoFile && (
                                  <p className="mt-1 text-[10px] text-ink/50 truncate">{videoFile.name}</p>
                                )}
                              </div>

                              {/* Thumbnail file */}
                              <div>
                                <label className="mb-1 block text-[11px] font-bold text-ink/70">
                                  🖼️ الصورة المصغّرة (thumbnail) — اختياري
                                </label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => setThumbnailFile(e.target.files?.[0] ?? null)}
                                  className="block w-full rounded-xl border border-sand bg-white px-3 py-2 text-xs text-ink file:mr-2 file:rounded-lg file:border-0 file:bg-red-100 file:px-3 file:py-1 file:text-xs file:font-bold file:text-red-700 outline-none"
                                />
                                {thumbnailFile && (
                                  <p className="mt-1 text-[10px] text-ink/50 truncate">{thumbnailFile.name}</p>
                                )}
                              </div>
                            </div>

                            {/* Upload status message */}
                            {uploadMessage && (
                              <div className={
                                "rounded-xl px-4 py-2.5 text-xs font-semibold " +
                                (uploadStatus === "success" ? "bg-green-100 text-green-700" :
                                 uploadStatus === "error" ? "bg-red-100 text-red-700" :
                                 "bg-yellow-100 text-yellow-700")
                              }>
                                {uploadStatus === "uploading" && (
                                  <span className="mr-2 inline-block animate-spin">⏳</span>
                                )}
                                {uploadMessage}
                              </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3">
                              <button
                                onClick={() => uploadVideoToYoutube(workshop.id)}
                                disabled={uploadStatus === "uploading" || !videoFile}
                                className="rounded-full bg-red-600 px-5 py-2 text-xs font-black text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {uploadStatus === "uploading" ? "جاري الرفع…" : "🚀 ارفع على يوتيوب"}
                              </button>
                              <button
                                onClick={() => { setUploadingWorkshopId(null); setUploadStatus("idle"); setUploadMessage(""); }}
                                className="rounded-full border border-sand px-5 py-2 text-xs font-black text-ink/70"
                              >
                                إلغاء
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Workshop Enrollments / Payments Section */}
              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-black text-ink">🎟️ اشتراكات ورش العمل وتأكيد مدفوعات الطلاب</h2>
                    <p className="text-xs text-ink/60">
                      مراجعة وتفعيل اشتراكات الطلاب في الورش المدفوعة بعد التأكد من استلام الحوالة (فودافون كاش / انستاباي).
                    </p>
                  </div>
                  {workshopEnrollments.filter((e) => e.status === "PENDING").length > 0 && (
                    <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-black text-white animate-pulse">
                      ⏳ {workshopEnrollments.filter((e) => e.status === "PENDING").length} اشتراكات بانتظار التأكيد
                    </span>
                  )}
                </div>

                {workshopEnrollments.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-sand bg-cream/30 p-8 text-center text-xs font-bold text-ink/50">
                    لا توجد اشتراكات مسجلة في ورش العمل حتى الآن.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-sand text-right text-xs font-black text-ink/50">
                          <th className="py-3 pr-2">الورشة</th>
                          <th className="py-3 pr-2">الطالب المشترك</th>
                          <th className="py-3 pr-2">النوع / القيمة</th>
                          <th className="py-3 pr-2">تاريخ الاشتراك</th>
                          <th className="py-3 pr-2">الحالة</th>
                          <th className="py-3 pl-2 text-center">إجراء الإدارة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workshopEnrollments.map((en) => (
                          <tr key={en.id} className="border-b border-sand/60 last:border-0 hover:bg-cream/20">
                            <td className="py-3.5 pr-2 font-bold text-ink">
                              {en.workshop?.title ?? "ورشة غير معروفة"}
                            </td>
                            <td className="py-3.5 pr-2">
                              <div className="font-bold text-ink">{en.user?.fullName ?? "طالب"}</div>
                              <div className="text-[11px] text-ink/50">{en.user?.email} · {en.user?.phone || "بدون هاتف"}</div>
                            </td>
                            <td className="py-3.5 pr-2">
                              {en.workshop?.type === "PAID" ? (
                                <span className="font-black text-coral">{en.workshop?.priceEGP ?? 0} ج.م (مدفوعة)</span>
                              ) : (
                                <span className="font-bold text-mint">مجانية</span>
                              )}
                            </td>
                            <td className="py-3.5 pr-2 text-xs text-ink/60">
                              {new Date(en.createdAt).toLocaleString("ar-EG")}
                            </td>
                            <td className="py-3.5 pr-2">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-black ${
                                  en.status === "APPROVED"
                                    ? "bg-mint/20 text-mint"
                                    : en.status === "REJECTED"
                                    ? "bg-red-100 text-red-600"
                                    : "bg-amber-100 text-amber-800 animate-pulse"
                                }`}
                              >
                                {en.status === "APPROVED"
                                  ? "✅ مفعّل ومعتمد"
                                  : en.status === "REJECTED"
                                  ? "❌ مرفوض"
                                  : "⏳ بانتظار تأكيد الدفع"}
                              </span>
                            </td>
                            <td className="py-3.5 pl-2 text-center">
                              {en.status === "PENDING" ? (
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleApproveWorkshopEnrollment(en.id)}
                                    className="rounded-xl bg-green-600 px-3 py-1.5 text-xs font-black text-white hover:bg-green-700 shadow-sm transition"
                                  >
                                    ✓ تفعيل الورشة
                                  </button>
                                  <button
                                    onClick={() => handleRejectWorkshopEnrollment(en.id)}
                                    className="rounded-xl border border-red-300 bg-white px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                                  >
                                    ✕ رفض
                                  </button>
                                </div>
                              ) : en.status === "APPROVED" ? (
                                <button
                                  onClick={() => handleRejectWorkshopEnrollment(en.id)}
                                  className="text-xs text-ink/40 hover:text-red-500 underline"
                                >
                                  إلغاء التفعيل
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleApproveWorkshopEnrollment(en.id)}
                                  className="text-xs text-lilac hover:underline"
                                >
                                  إعادة التفعيل
                                </button>
                              )}
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

          {activeTab === "payouts" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-black text-ink">💸 فواتير المدرسين (السحب)</h1>
                <p className="mt-1 text-sm text-ink/60">راجع طلبات سحب الأرباح ووافق عليها أو ارفضها.</p>
              </div>

              {payouts.length === 0 ? (
                <div className="rounded-3xl border border-sand bg-white p-10 text-center text-sm font-bold text-ink/50">
                  لا توجد فواتير سحب حتى الآن.
                </div>
              ) : (
                <div className="space-y-4">
                  {payouts.map((payout) => (
                    <div key={payout.id} className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-black text-ink">{payout.tutorName}</h2>
                          <p className="text-xs text-ink/50">{payout.tutorEmail} · {payout.createdAt}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${
                          payout.status === "PENDING" ? "bg-sun/20 text-orange-700" :
                          payout.status === "APPROVED" || payout.status === "PAID" ? "bg-mint/15 text-mint" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {payout.status === "PENDING" ? "بانتظار المراجعة" : payout.status === "APPROVED" ? "تمت الموافقة" : payout.status === "PAID" ? "تم الصرف" : "مرفوضة"}
                        </span>
                      </div>

                      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
                        <div className="rounded-2xl bg-cream p-4">
                          <div className="text-xs text-ink/50">المبلغ</div>
                          <div className="mt-1 text-xl font-black text-mint">{payout.amountEGP} ج.م</div>
                        </div>
                        <div className="rounded-2xl bg-cream p-4">
                          <div className="text-xs text-ink/50">طريقة التحويل</div>
                          <div className="mt-1 font-black text-ink">{payout.paymentMethod}</div>
                        </div>
                        <div className="rounded-2xl bg-cream p-4">
                          <div className="text-xs text-ink/50">بيانات الحساب</div>
                          <div className="mt-1 break-all font-black text-ink">{payout.accountDetails}</div>
                        </div>
                      </div>

                      {payout.status === "PENDING" && (
                        <div className="mt-5 flex flex-wrap gap-2 border-t border-sand pt-4">
                          <button onClick={() => updatePayoutStatus(payout.id, "APPROVED")} className="rounded-full bg-mint px-5 py-2 text-xs font-black text-white hover:bg-green-700">
                            الموافقة على السحب ✓
                          </button>
                          <button onClick={() => updatePayoutStatus(payout.id, "REJECTED")} className="rounded-full bg-red-600 px-5 py-2 text-xs font-black text-white hover:bg-red-700">
                            رفض الفاتورة ✕
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB: INVOICES (الفواتير والمبيعات)
          ======================================================== */}
          {activeTab === "invoices" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-black text-ink">🧾 الفواتير والمبيعات</h1>
                <p className="text-sm text-ink/60 mt-1">سجل شامل لجميع الإيرادات المحققة على المنصة وعمولات فك زنقة.</p>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-3xl bg-mint/10 border border-mint/20 p-6">
                  <div className="text-xs font-bold text-ink/60">إجمالي المبيعات (الطالب)</div>
                  <div className="text-3xl font-black text-ink mt-2">{totalRevenue} ج.م</div>
                </div>
                <div className="rounded-3xl bg-coral/10 border border-coral/20 p-6">
                  <div className="text-xs font-bold text-ink/60">صافي إيرادات المنصة (العمولة)</div>
                  <div className="text-3xl font-black text-coral mt-2">{totalCommission} ج.م</div>
                </div>
              </div>

              {/* Invoices List */}
              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
                {invoices.length === 0 ? (
                  <div className="text-center py-10 text-ink/40 font-bold text-sm">لا توجد فواتير مدفوعة حتى الآن</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-sand text-right text-xs font-bold text-ink/50">
                          <th className="pb-3 pr-2">رقم الفاتورة</th>
                          <th className="pb-3">الخدمة</th>
                          <th className="pb-3">الطالب</th>
                          <th className="pb-3">المدرس</th>
                          <th className="pb-3">المبلغ</th>
                          <th className="pb-3">العمولة</th>
                          <th className="pb-3">رقم المحفظة / المرسل</th>
                          <th className="pb-3">الإجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sand text-ink">
                        {invoices.map(inv => (
                          <tr key={inv.id} className="group hover:bg-cream/50 transition">
                            <td className="py-3 pr-2 font-mono text-xs">{inv.id}</td>
                            <td className="py-3 font-bold">{inv.type === "SESSION" ? "جلسة خاصة" : "ورشة عمل"}<br/><span className="text-[10px] text-ink/60">{inv.subject}</span></td>
                            <td className="py-3">{inv.student?.fullName ?? "—"}</td>
                            <td className="py-3">{inv.tutor?.fullName ?? "—"}</td>
                            <td className="py-3 font-black text-coral">{inv.amountEGP} ج.م</td>
                            <td className="py-3 font-black text-mint">{inv.platformCommissionEGP} ج.م</td>
                            <td className="py-3 font-mono text-[11px] text-ink/70">
                              {inv.paymentSenderAccount ? (
                                <div>
                                  <div>{inv.paymentSenderAccount}</div>
                                  <div className="text-[9px] font-sans font-bold text-amber-600 mt-0.5">
                                    {inv.paymentMethodUsed === 'vodafone' ? 'فودافون كاش' : inv.paymentMethodUsed === 'instapay' ? 'إنستاباي' : inv.paymentMethodUsed}
                                  </div>
                                </div>
                              ) : "—"}
                            </td>
                            <td className="py-3">
                              <button
                                onClick={() => printInvoice(inv)}
                                className="rounded-lg bg-ink/5 hover:bg-ink hover:text-white px-3 py-1.5 text-xs font-bold transition"
                              >
                                طباعة
                              </button>
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
              TAB 6: PLATFORM SETTINGS & COMMISSION
          ======================================================== */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-black text-ink">⚙️ إعدادات المنصة وعمولة الأرباح</h1>
                <p className="text-sm text-ink/60">
                  تعديل نسب العمولة، أسعار الجلسات، وقواعد نظام النقاط والمكافآت التلقائية.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-black text-ink flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-coral" />
                    النسب المالية والعمولات
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      نسبة عمولة المنصة (%)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={commissionPct}
                        onChange={(e) => setCommissionPct(Number(e.target.value))}
                        className="w-28 rounded-2xl border border-sand p-3 text-lg font-black text-coral outline-none focus:border-coral"
                      />
                      <span className="text-xs text-ink/50">
                        تُخصم من إجمالي قيمة الجلسة ويحصل المعلم على الباقي تلقائياً.
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      رسوم الجلسات الحضورية الإضافية (%)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={inPersonSurcharge}
                        onChange={(e) => setInPersonSurcharge(Number(e.target.value))}
                        className="w-28 rounded-2xl border border-sand p-3 text-lg font-black text-sun outline-none focus:border-sun"
                      />
                      <span className="text-xs text-ink/50">
                        تُضاف لتغطية تكلفة الانتقال والأماكن.
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveFinancialSettings}
                    className="mt-4 rounded-full bg-ink px-6 py-2.5 text-xs font-black text-cream hover:bg-ink/90"
                  >
                    حفظ التغييرات المالية
                  </button>
                </div>

                <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-black text-ink flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-sun" />
                    قواعد النقاط والمكافآت التلقائية
                  </h3>

                  <ul className="space-y-3 text-xs">
                    <li className="flex items-center justify-between rounded-2xl bg-cream/50 p-3">
                      <span>نقاط نشر أول طلب للطالب الجديد:</span>
                      <strong className="text-sm font-black text-coral">+100 نقطة</strong>
                    </li>
                    <li className="flex items-center justify-between rounded-2xl bg-cream/50 p-3">
                      <span>نقاط إتمام جلسة بنجاح:</span>
                      <strong className="text-sm font-black text-mint">+50 نقطة</strong>
                    </li>
                    <li className="flex items-center justify-between rounded-2xl bg-cream/50 p-3">
                      <span>نقاط كتابة تقييم صادق للمعلم:</span>
                      <strong className="text-sm font-black text-lilac">+20 نقطة</strong>
                    </li>
                  </ul>

                  <p className="text-xs text-ink/50 leading-relaxed">
                    يتم استبدال كل 500 نقطة بكوبون خصم 50 ج.م على الجلسة القادمة أو ورشة عمل مجانية.
                  </p>
                </div>
              </div>

              {/* ========================================================
                  IN-PERSON LOCATIONS / VENUES MANAGER
              ======================================================== */}
              <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand pb-4">
                  <div>
                    <h2 className="text-lg font-black text-ink flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-coral" />
                      إدارة أماكن الحضور المعتمدة ومساحات العمل (Study Spaces & Venues)
                    </h2>
                    <p className="text-xs text-ink/60 mt-1">
                      الأماكن المحددة هنا فقط هي التي ستظهر تلقائياً للطلاب عند اختيار التدريس "حضوري" في طلب زنقة جديد.
                    </p>
                  </div>
                  <span className="rounded-full bg-sand/60 px-3.5 py-1 text-xs font-bold text-ink/80 self-start sm:self-auto">
                    {inPersonLocations.filter(l => l.isActive).length} مكان معتمد نشط
                  </span>
                </div>

                {/* Add New Location Form */}
                <form onSubmit={handleAddLocation} className="rounded-2xl border border-sand/70 bg-cream/30 p-4 space-y-3">
                  <div className="text-xs font-black text-ink flex items-center gap-1.5">
                    <Plus className="h-4 w-4 text-coral" />
                    إضافة مكان حضور / مساحة عمل جديدة:
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-[11px] font-bold text-ink/70 mb-1">اسم المكان أو المساحة *</label>
                      <input
                        type="text"
                        placeholder="مثال: مساحة عمل كروان (حي الجامعة)"
                        value={newLocForm.name}
                        onChange={(e) => setNewLocForm({ ...newLocForm, name: e.target.value })}
                        className="w-full rounded-xl border border-sand bg-white p-2.5 text-xs font-bold text-ink outline-none focus:border-coral"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-ink/70 mb-1">العنوان / المنطقة *</label>
                      <input
                        type="text"
                        placeholder="مثال: شارع جيهان، أمام بوابة الجامعة"
                        value={newLocForm.address}
                        onChange={(e) => setNewLocForm({ ...newLocForm, address: e.target.value })}
                        className="w-full rounded-xl border border-sand bg-white p-2.5 text-xs font-bold text-ink outline-none focus:border-coral"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-ink/70 mb-1">ملاحظات أو تجهيزات المكان</label>
                      <input
                        type="text"
                        placeholder="مثال: قاعات مكيفة، شاشات وواي فاي"
                        value={newLocForm.details}
                        onChange={(e) => setNewLocForm({ ...newLocForm, details: e.target.value })}
                        className="w-full rounded-xl border border-sand bg-white p-2.5 text-xs font-bold text-ink outline-none focus:border-coral"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isSavingLocations}
                      className="inline-flex items-center gap-2 rounded-xl bg-coral px-5 py-2 text-xs font-black text-white hover:bg-coralDark transition shadow-sm disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                      إضافة المكان واعتماده
                    </button>
                  </div>
                </form>

                {/* Locations List */}
                <div className="space-y-3">
                  <div className="text-xs font-black text-ink/60">قائمة الأماكن المعتمدة الحالية:</div>
                  {inPersonLocations.length === 0 ? (
                    <div className="text-center py-8 text-xs font-bold text-ink/40">لا توجد أماكن حضور مسجلة حالياً</div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {inPersonLocations.map((loc) => {
                        const isEditing = editingLocId === loc.id;
                        return (
                          <div
                            key={loc.id}
                            className={`rounded-2xl border p-4 transition ${
                              loc.isActive
                                ? "border-sand bg-white shadow-sm"
                                : "border-sand/40 bg-sand/20 opacity-70"
                            }`}
                          >
                            {isEditing ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={editingLocForm.name}
                                  onChange={(e) => setEditingLocForm({ ...editingLocForm, name: e.target.value })}
                                  className="w-full rounded-lg border border-coral p-2 text-xs font-bold text-ink"
                                  placeholder="اسم المكان"
                                />
                                <input
                                  type="text"
                                  value={editingLocForm.address}
                                  onChange={(e) => setEditingLocForm({ ...editingLocForm, address: e.target.value })}
                                  className="w-full rounded-lg border border-sand p-2 text-xs text-ink"
                                  placeholder="العنوان"
                                />
                                <input
                                  type="text"
                                  value={editingLocForm.details}
                                  onChange={(e) => setEditingLocForm({ ...editingLocForm, details: e.target.value })}
                                  className="w-full rounded-lg border border-sand p-2 text-xs text-ink"
                                  placeholder="الملاحظات"
                                />
                                <div className="flex gap-2 justify-end pt-1">
                                  <button
                                    onClick={() => handleSaveEditLocation(loc.id)}
                                    className="rounded-lg bg-mint px-3 py-1.5 text-xs font-bold text-white hover:brightness-95"
                                  >
                                    حفظ التعديل ✓
                                  </button>
                                  <button
                                    onClick={() => setEditingLocId(null)}
                                    className="rounded-lg bg-ink/10 px-3 py-1.5 text-xs font-bold text-ink hover:bg-ink/20"
                                  >
                                    إلغاء
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="font-bold text-xs text-ink flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4 text-coral shrink-0" />
                                    <span>{loc.name}</span>
                                  </div>
                                  <span
                                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black shrink-0 ${
                                      loc.isActive
                                        ? "bg-mint/15 text-mint"
                                        : "bg-ink/10 text-ink/60"
                                    }`}
                                  >
                                    {loc.isActive ? "معتمد ونشط" : "معطل"}
                                  </span>
                                </div>
                                <div className="text-[11px] text-ink/70 pr-5">
                                  📍 <strong>العنوان:</strong> {loc.address}
                                </div>
                                {loc.details && (
                                  <div className="text-[11px] text-ink/50 pr-5">
                                    💡 <strong>تجهيزات:</strong> {loc.details}
                                  </div>
                                )}
                                <div className="flex items-center justify-between pt-2 border-t border-sand/50">
                                  <button
                                    onClick={() => handleToggleLocation(loc.id)}
                                    className={`text-[11px] font-bold ${
                                      loc.isActive
                                        ? "text-amber-600 hover:underline"
                                        : "text-mint hover:underline"
                                    }`}
                                  >
                                    {loc.isActive ? "تعطيل المكان مؤقتاً" : "تفعيل واعتماد المكان"}
                                  </button>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleStartEditLocation(loc)}
                                      className="rounded-lg p-1 text-ink/60 hover:bg-sand hover:text-ink transition"
                                      title="تعديل المكان"
                                    >
                                      <Edit3 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteLocation(loc.id)}
                                      className="rounded-lg p-1 text-coral/70 hover:bg-coral/10 hover:text-coral transition"
                                      title="حذف المكان"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}


        </section>
      </div>

      {/* ========================================================
          MODAL: INSPECT TEACHER APPLICATION (DETAILS & VIDEO)
      ======================================================== */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-sand bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-sand pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint/15 text-2xl text-mint">
                  👨‍🏫
                </div>
                <div>
                  <h3 className="text-xl font-black text-ink">{selectedApp.name}</h3>
                  <p className="text-xs text-ink/50">{selectedApp.email} · {selectedApp.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="rounded-full bg-ink/5 p-2 text-ink/60 hover:bg-ink/10"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="rounded-2xl bg-cream/50 p-3.5 space-y-1">
                <span className="font-bold text-ink/50">الجامعة والكلية:</span>
                <p className="text-sm font-black text-ink">{selectedApp.university}</p>
                <p className="text-ink/70 font-semibold">{selectedApp.faculty}</p>
              </div>
              <div className="rounded-2xl bg-cream/50 p-3.5 space-y-1">
                <span className="font-bold text-ink/50">طريقة التدريس المفضلة:</span>
                <p className="text-sm font-black text-lilac">
                  {selectedApp.preferredMode === "ONLINE" ? "💻 أونلاين فقط" : selectedApp.preferredMode === "IN_PERSON" ? "🏫 حضوري فقط" : "🔄 أونلاين وحضوري"}
                </p>
                <p className="text-ink/50">تاريخ التقديم: {selectedApp.submittedAt}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-sand/80 bg-cream/30 p-4 space-y-2">
              <span className="text-xs font-black text-ink">ملخص الخبرة الأكاديمية والتجربة:</span>
              <p className="text-sm text-ink/80 leading-relaxed font-semibold">
                {selectedApp.experience}
              </p>
            </div>

            {selectedApp.introVideoUrl && (
              <div className="rounded-2xl border border-lilac/30 bg-lilac/5 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Video className="h-6 w-6 text-lilac" />
                  <div>
                    <div className="text-xs font-black text-ink">فيديو التعريف والشرح التجريبي</div>
                    <div className="text-[11px] text-ink/50 truncate max-w-xs">{selectedApp.introVideoUrl}</div>
                  </div>
                </div>
                <a
                  href={selectedApp.introVideoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-lilac px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  مشاهدة الفيديو ↗
                </a>
              </div>
            )}

            {/* Decision Footer */}
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-sand pt-4">
              <button
                onClick={() => handleRequestChanges(selectedApp.id)}
                className="rounded-full border border-coral text-coral px-4 py-2 text-xs font-bold hover:bg-coral/10"
              >
                طلب تعديلات ومستندات ⚠️
              </button>
              <button
                onClick={() => {
                  setRejectionModalApp(selectedApp);
                  setSelectedApp(null);
                }}
                className="rounded-full bg-red-50 text-red-600 px-5 py-2 text-xs font-black hover:bg-red-500 hover:text-white"
              >
                رفض الطلب ✕
              </button>
              <button
                onClick={() => handleAcceptTeacher(selectedApp.id)}
                className="rounded-full bg-mint text-white px-6 py-2 text-xs font-black hover:brightness-95 shadow-md shadow-mint/20"
              >
                اعتماد وقبول المعلم فوراً ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: REJECTION REASON DIALOG
      ======================================================== */}
      {rejectionModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-sand bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-ink">تأكيد رفض طلب {rejectionModalApp.name}</h3>
            <p className="text-xs text-ink/60">
              يرجى كتابة سبب الرفض لتوضيحه للمتقدم في الإشعار والبريد الإلكتروني:
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="مثال: لم يتم استيفاء سنوات الخبرة المطلوبة أو التخصص غير مطابق لاحتياجات المنصة الحالية."
              className="w-full rounded-2xl border border-sand p-3 text-xs outline-none focus:border-red-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectionModalApp(null)}
                className="rounded-full border border-sand px-4 py-2 text-xs font-bold text-ink/70 hover:bg-cream"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleRejectTeacher(rejectionModalApp.id, rejectionReason)}
                className="rounded-full bg-red-500 px-5 py-2 text-xs font-black text-white hover:bg-red-600 shadow"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
