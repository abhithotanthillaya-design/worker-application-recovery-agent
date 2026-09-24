import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink-900/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-8 text-[0.92rem] text-fg-muted md:flex">
          <a href="#loop" className="hover:text-fg">How recovery works</a>
          <a href="#evidence" className="hover:text-fg">Evidence levels</a>
          <a href="#privacy" className="hover:text-fg">Data and privacy</a>
        </nav>
        <Link href="/start" className="btn btn-primary min-h-10 px-4">
          Open the demo case
        </Link>
      </div>
    </header>
  );
}
