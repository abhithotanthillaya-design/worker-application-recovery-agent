import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-7 w-7", className)} aria-hidden="true" fill="none">
      <path d="M8 3h11l6 6v20H8z" fill="#f4f6fb" />
      <path d="M19 3v6h6" fill="#cfd6ea" />
      <path
        d="M21.5 20.5a5.5 5.5 0 1 1-2-4.2"
        stroke="#0e1740"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="M22.6 12.6v3.9h-3.9" stroke="#f6b92b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 font-display text-[1.05rem] font-semibold tracking-tight", className)}>
      <LogoMark />
      <span>Recovery Agent</span>
    </Link>
  );
}
