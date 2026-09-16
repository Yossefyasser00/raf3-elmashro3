"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={theme === "dark" ? "التحويل للوضع الفاتح" : "التحويل للوضع المظلم"}
      className="relative flex items-center justify-center p-2 rounded-xl border border-sand dark:border-slate-700 bg-white dark:bg-slate-800 text-ink dark:text-amber-400 hover:bg-cream dark:hover:bg-slate-700 transition shadow-sm"
      aria-label="Toggle Dark Mode"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 animate-in spin-in-90 duration-300" />
      )}
    </button>
  );
}
