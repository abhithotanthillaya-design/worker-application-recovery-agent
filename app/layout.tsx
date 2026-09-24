import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CaseProvider } from "@/lib/case-store";
import { ToastProvider } from "@/components/ui/toast-host";

export const metadata: Metadata = {
  title: "Recovery Agent — get a stuck worker application moving again",
  description:
    "A case-recovery workspace for workers whose benefit application was rejected, returned or delayed. Prototype with synthetic data and simulated government actions.",
};

export const viewport: Viewport = {
  themeColor: "#0e1740",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=IBM+Plex+Mono:wght@400;500&family=Public+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only-focusable fixed left-4 top-4 z-[100] rounded-lg bg-turmeric px-4 py-2 font-semibold text-ink-950"
        >
          Skip to content
        </a>
        <ToastProvider>
          <CaseProvider>{children}</CaseProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
