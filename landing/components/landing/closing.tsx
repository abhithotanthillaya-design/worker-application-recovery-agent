import Link from "next/link";
import { EyeOff, FlaskConical, Lock } from "lucide-react";
import { EvervaultCard, Icon } from "@/components/ui/evervault-card";
import { Logo } from "@/components/brand/logo";

export function Privacy() {
  return (
    <section id="privacy" aria-labelledby="privacy-title" className="border-t bg-ink-950/50">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <h2 id="privacy-title" className="t-h2 max-w-[18ch]">
            Sensitive papers, kept to what the case needs
          </h2>
          <ul className="mt-8 space-y-6">
            {[
              [Lock, "Minimal identity data", "Identity numbers are masked on screen and are not needed to compare names."],
              [EyeOff, "No silent submissions", "The agent prepares. You approve. Only then does anything move."],
              [FlaskConical, "Demo data only", "This prototype uses synthetic people and documents, and every government response is simulated and labeled."],
            ].map(([I, t, d]) => {
              const Ic = I as typeof Lock;
              return (
                <li key={t as string} className="flex gap-4">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/20 text-turmeric">
                    <Ic size={18} aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold">{t as string}</h3>
                    <p className="mt-1 max-w-lg text-fg-muted">{d as string}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-sm border border-white/15 p-4">
          <Icon className="absolute -left-3 -top-3 h-6 w-6 text-fg" />
          <Icon className="absolute -bottom-3 -left-3 h-6 w-6 text-fg" />
          <Icon className="absolute -right-3 -top-3 h-6 w-6 text-fg" />
          <Icon className="absolute -bottom-3 -right-3 h-6 w-6 text-fg" />
          <EvervaultCard text="Masked" />
          <p className="mt-4 text-sm text-fg-muted">Move your pointer over the card to see what protected data looks like.</p>
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="mx-auto max-w-4xl px-5 py-28 text-center sm:px-8 sm:py-36">
      <h2 className="t-display">Follow one case from return to outcome</h2>
      <p className="t-lead mx-auto mt-5 max-w-xl">
        Load the demo worker, upload four synthetic documents and watch the agent recover the case. Or watch it fail
        and escalate.
      </p>
      <Link href="/start" className="btn btn-primary mt-9 min-h-14 px-8 text-lg">
        Open the demo case
      </Link>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-10 text-sm text-fg-subtle sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Logo className="text-fg" />
        <p className="max-w-xl">
          Hackathon prototype. Not connected to any government portal. Nothing here is a real submission, decision or
          eligibility check.
        </p>
      </div>
    </footer>
  );
}
