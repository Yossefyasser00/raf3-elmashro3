import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "700", "900"],
  display: "swap",
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "فك زنقة — إحنا معاك لحد ما تفهم",
  description: "اكتب مشكلتك في أي مادة، واحنا نوصلك بأفضل مدرس يفهمك فيها.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

import { ThemeProvider } from "@/components/theme/ThemeProvider";
import PwaInstallPrompt from "@/components/pwa/PwaInstallPrompt";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body className="bg-cream dark:bg-[#0B0F19] text-ink dark:text-slate-100 font-arabic antialiased transition-colors duration-300">
        <ThemeProvider>
          {children}
          <PwaInstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
