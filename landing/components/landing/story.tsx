"use client";

import ScrollExpand from "@/components/ui/scroll-expand";
import ScrollReveal from "@/components/ui/scroll-reveal";

export function Story() {
  return (
    <>
      <div id="story" />
      <ScrollExpand
        src="/hero-case-file.svg"
        alt="A returned application, a bank passbook and a rejection notice on a desk. The applicant's name differs between the application and the passbook."
        title="Three documents. One name written two ways."
        scrollHint="Scroll to open the case file"
        useWindowScroll
        startWidth={44}
        startHeight={60}
        startRadius={26}
        endRadius={0}
        mediaZoom={1.35}
        scrollDistance={1.2}
        holdDistance={0.35}
        smoothing={0.1}
        overlayScrim={0.45}
        enabled
      >
        <h2 className="t-h2 text-fg">One case file, from first return to final outcome.</h2>
        <p className="t-lead mt-4 text-fg/80">
          Every document, every response and every attempt stays in the same place, so the next step is based on what
          already happened.
        </p>
      </ScrollExpand>

      <section aria-labelledby="problem" className="mx-auto max-w-5xl px-5 py-28 sm:px-8 sm:py-40">
        <h2 id="problem" className="sr-only">
          The problem
        </h2>
        <ScrollReveal baseOpacity={0.12} enableBlur baseRotation={2} blurStrength={5}>
          Finding a scheme is not the hard part. The hard part starts after the application is in: a notice that says a
          document needs correction, no word on which one, and no clear official step to take next.
        </ScrollReveal>
      </section>
    </>
  );
}
