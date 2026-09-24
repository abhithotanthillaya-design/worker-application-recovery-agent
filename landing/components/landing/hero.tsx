"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { ArrowDown, FlaskConical } from "lucide-react";
import ParticleText from "@/components/ui/particle-text";
import { registerGsap, prefersReducedMotion } from "@/lib/gsap";

export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const revealed = useRef(false);

  const reveal = useCallback(() => {
    if (revealed.current || !copyRef.current) return;
    revealed.current = true;
    const { gsap } = registerGsap();
    const items = copyRef.current.querySelectorAll("[data-hero-item]");
    gsap.timeline().fromTo(
      items,
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.12 },
    );
  }, []);

  useEffect(() => {
    if (!copyRef.current) return;
    if (prefersReducedMotion()) {
      copyRef.current.querySelectorAll<HTMLElement>("[data-hero-item]").forEach((el) => (el.style.opacity = "1"));
      revealed.current = true;
      return;
    }
    const { gsap } = registerGsap();
    gsap.set(copyRef.current.querySelectorAll("[data-hero-item]"), { autoAlpha: 0 });
    const fallback = window.setTimeout(reveal, 3200);
    return () => window.clearTimeout(fallback);
  }, [reveal]);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero || prefersReducedMotion()) return;

    const { ScrollTrigger } = registerGsap();
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const trigger = ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: "bottom top",
      scrub: 0.8,
      onUpdate: (self) => {
        hero.style.setProperty("--hero-shift", `${self.progress * (isMobile ? 12 : 44)}%`);
      },
    });

    return () => trigger.kill();
  }, []);

  return (
    <section ref={heroRef} className="relative flex min-h-svh flex-col justify-center overflow-hidden px-5 pb-16 pt-28 sm:px-8">
      <div aria-hidden="true" className="hero-atmosphere pointer-events-none absolute inset-0" />
      <div aria-hidden="true" className="hero-noise pointer-events-none absolute inset-0" />
      <div className="relative mx-auto w-full max-w-6xl">
        <h1 className="sr-only">Rejected? Recover it.</h1>
        <div className="h-[clamp(240px,42svh,430px)] font-display">
          <ParticleText
            text={"Rejected?\nRecover it."}
            color="#eef1fb"
            highlightColor="#f6b92b"
            particleSize={2.3}
            density={4}
            fontSize="clamp(3.4rem, 12vw, 8.6rem)"
            fontWeight={700}
            fontFamily="inherit"
            scatter={220}
            gatherDuration={1700}
            stagger={520}
            pointerRepel={46}
            repelRadius={110}
            idleDrift={0.7}
            glow
            onGathered={reveal}
          />
        </div>

        <div ref={copyRef} className="mx-auto mt-6 max-w-2xl text-center">
          <p data-hero-item className="t-lead">
            You already applied and something went wrong. The agent rebuilds your case from your documents, shows what
            is confirmed and what is only a guess, and prepares the next official step. Nothing is sent until you
            approve.
          </p>
          <div data-hero-item className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={process.env.NEXT_PUBLIC_DEMO_URL || "http://localhost:5173"}
              className="btn btn-primary min-h-12 px-6 text-base"
            >
              Open the demo case
            </a>
            <a href="#story" className="btn btn-ghost min-h-12 px-6 text-base">
              See how a case is recovered
              <ArrowDown size={16} aria-hidden />
            </a>
          </div>
          <p data-hero-item className="mx-auto mt-7 inline-flex items-center gap-2 text-sm text-fg-subtle">
            <FlaskConical size={15} aria-hidden />
            Prototype for Karnataka construction workers. Synthetic data, simulated government actions.
          </p>
        </div>
      </div>
    </section>
  );
}
