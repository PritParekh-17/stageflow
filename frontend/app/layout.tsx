import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StageFlow — Smart Anchor & Stage Flow Management System",
  description:
    "Real-time event operations and stage-control platform for anchors, event organizers, coordinators, and backstage teams. Bit N Build '26 (PS-5).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-500 selection:text-white`}
      >
        <ToastProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
