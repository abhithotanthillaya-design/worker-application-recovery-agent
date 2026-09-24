"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { useCase } from "@/lib/case-store";
import { DEMO_WORKER, SCHEMES, STATES } from "@/lib/mock-data";
import { SimBadge } from "@/components/case/badges";

export default function StartPage() {
  const router = useRouter();
  const { createCase, busy } = useCase();
  const [name, setName] = useState("");
  const [state, setState] = useState(STATES[0]);
  const [scheme, setScheme] = useState(SCHEMES[0]);
  const [touched, setTouched] = useState(false);
  const invalid = touched && !name.trim();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!name.trim()) return;
    const id = await createCase({ workerName: name, scheme, state });
    if (id) router.push(`/case/${id}`);
  }

  return (
    <div className="min-h-svh bg-[radial-gradient(60%_50%_at_20%_0%,rgb(44_64_148/0.5),transparent_70%)]">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <Link href="/" className="btn btn-quiet min-h-10 text-sm">
          <ArrowLeft size={15} aria-hidden /> Back to overview
        </Link>
      </header>

      <main id="main" className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1fr_0.85fr] lg:pt-16">
        <section aria-labelledby="start-title">
          <h1 id="start-title" className="t-display max-w-[14ch] !text-[clamp(2.2rem,4.6vw,3.6rem)]">
            Start recovery
          </h1>
          <p className="t-lead mt-4 max-w-lg">
            Tell us whose application got stuck. Next you will add the documents you have.
          </p>

          <form onSubmit={submit} noValidate className="panel mt-9 max-w-xl space-y-6 p-6 sm:p-8">
            <div>
              <label htmlFor="worker" className="mb-2 block text-sm font-semibold">
                Worker name
              </label>
              <input
                id="worker"
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="Name as written on the application"
                autoComplete="off"
                aria-invalid={invalid}
                aria-describedby={invalid ? "worker-err" : undefined}
              />
              {invalid && (
                <p id="worker-err" className="mt-2 text-sm text-kumkum">
                  Enter the worker&apos;s name to create the case.
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  setName(DEMO_WORKER.workerName);
                  setTouched(true);
                }}
                className="mt-2.5 text-sm font-semibold text-turmeric underline-offset-4 hover:underline"
              >
                Use the demo worker
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="state" className="mb-2 block text-sm font-semibold">
                  State
                </label>
                <select id="state" className="field" value={state} onChange={(e) => setState(e.target.value)}>
                  {STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="scheme" className="mb-2 block text-sm font-semibold">
                  Benefit
                </label>
                <select id="scheme" className="field" value={scheme} onChange={(e) => setScheme(e.target.value)}>
                  {SCHEMES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-sm text-fg-subtle">The prototype covers one state and one benefit.</p>

            <button type="submit" className="btn btn-primary min-h-12 w-full sm:w-auto" disabled={busy === "create"}>
              {busy === "create" && <Loader2 size={18} className="animate-spin" aria-hidden />}
              {busy === "create" ? "Creating case" : "Create case"}
            </button>
          </form>
        </section>

        <aside aria-label="What happens next" className="lg:pt-24">
          <div className="panel-flat p-6 sm:p-8">
            <h2 className="t-h3">What happens next</h2>
            <ol className="mt-6 space-y-5">
              {[
                ["Add your documents", "The application, the notice, an identity proof and a bank document."],
                ["The agent reads them", "It compares them and labels what is confirmed, reported, suspected or unknown."],
                ["You review a plan", "Nothing is submitted without your approval."],
                ["The case is tracked", "If the problem returns, the agent prepares a handover for a person."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/25 text-sm font-bold tabular">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{t}</p>
                    <p className="mt-0.5 text-[0.95rem] text-fg-muted">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-7 border-t pt-5">
              <SimBadge>Prototype</SimBadge>
              <p className="mt-2.5 text-sm text-fg-muted">
                Synthetic data. Government submissions and responses are simulated and always labeled.
              </p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
