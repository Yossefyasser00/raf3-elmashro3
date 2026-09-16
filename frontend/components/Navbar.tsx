"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOut, Sparkles } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";

const NAV_LINKS: Array<{ label: string; href: string; active?: boolean }> = [
  { label: "الرئيسية", href: "/" },
  { label: "ورش العمل 🎬", href: "/workshops" },
  { label: "إزاي نشتغل؟", href: "/#how-it-works" },
  { label: "الأسئلة الشائعة", href: "/#faq" },
  { label: "من نحن", href: "/#about" },
];

export default function Navbar() {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardHref, setDashboardHref] = useState("/login");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("fz_token");
    const roles = JSON.parse(localStorage.getItem("fz_roles") ?? "[]") as string[];
    const storedName = localStorage.getItem("fz_full_name") ?? "";

    setIsLoggedIn(Boolean(token));
    setUserName(storedName.trim());
    setDashboardHref(
      roles.includes("ADMIN")
        ? "/dashboard/admin"
        : roles.includes("TUTOR")
          ? "/dashboard/tutor"
          : "/dashboard/student",
    );
  }, []);

  function handleLogout() {
    localStorage.removeItem("fz_token");
    localStorage.removeItem("fz_refresh");
    localStorage.removeItem("fz_roles");
    localStorage.removeItem("fz_full_name");
    window.location.href = "/login";
  }

  return (
    <header className="w-full border-b border-sand/60 bg-white/80 backdrop-blur-md sticky top-0 z-40 font-arabic">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 hover:scale-105 transition-transform group">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm overflow-hidden border border-sand">
            <img src="/logo.png" alt="Fok Zanka Logo" className="h-full w-full object-cover" />
          </div>
          <div className="leading-none hidden sm:block">
            <div className="text-xl font-black text-ink tracking-tight">فك زنقة</div>
            <div className="text-[12px] font-bold text-ink/60 mt-1">إحنا معاك لحد ما تفهم</div>
          </div>
        </Link>

        {/* Center links */}
        <ul className="hidden items-center gap-7 text-xs font-bold text-ink/70 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className={
                  link.active
                    ? "rounded-full bg-coral/10 px-3.5 py-1.5 text-coral font-black"
                    : "transition hover:text-coral"
                }
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link
            href="/requests/new"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-coral/10 border border-coral/30 px-4 py-2 text-xs font-black text-coral hover:bg-coral hover:text-white transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            انشر زنقتك
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                href={dashboardHref}
                className="rounded-full bg-mint px-5 py-2.5 text-xs font-black text-white transition hover:bg-mint/90 shadow-sm"
              >
                {userName ? `لوحتي • ${userName}` : "لوحتي"}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-4 py-2.5 text-xs font-black text-ink transition hover:border-red-300 hover:text-red-600"
              >
                <LogOut className="h-3.5 w-3.5" />
                تسجيل الخروج
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-ink px-5 py-2.5 text-xs font-black text-cream transition hover:bg-ink/90 shadow-sm"
            >
              تسجيل الدخول
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
