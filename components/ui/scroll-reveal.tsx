"use client";

/** ScrollReveal — React Bits API (baseOpacity, enableBlur, baseRotation, blurStrength). GSAP ScrollTrigger, scrubbed. */

import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { registerGsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export interface ScrollRevealProps {
  children: ReactNode;
  baseOpacity?: number;
  enableBlur?: boolean;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  rotationEnd?: string;
  wordAnimationEnd?: string;
}

export default function ScrollReveal({
  children,
  baseOpacity = 0.1,
  enableBlur = true,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName,
  textClassName,
  rotationEnd = "bottom 55%",
  wordAnimationEnd = "bottom 50%",
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const splitText = useMemo(() => {
    const text = typeof children === "string" ? children : "";
    return text.split(/(\s+)/).map((word, i) =>
      /^\s+$/.test(word) ? (
        word
      ) : (
        <span className="word inline-block" key={i}>
          {word}
        </span>
      ),
    );
  }, [children]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || prefersReducedMotion()) return;
    const { gsap } = registerGsap();
    const ctx = gsap.context(() => {
      const words = el.querySelectorAll<HTMLElement>(".word");
      gsap.fromTo(
        el,
        { transformOrigin: "0% 50%", rotate: baseRotation },
        {
          ease: "none",
          rotate: 0,
          scrollTrigger: { trigger: el, start: "top bottom", end: rotationEnd, scrub: true },
        },
      );
      gsap.fromTo(
        words,
        { opacity: baseOpacity, willChange: "opacity" },
        {
          ease: "none",
          opacity: 1,
          stagger: 0.05,
          scrollTrigger: { trigger: el, start: "top 82%", end: wordAnimationEnd, scrub: true },
        },
      );
      if (enableBlur) {
        gsap.fromTo(
          words,
          { filter: `blur(${blurStrength}px)` },
          {
            ease: "none",
            filter: "blur(0px)",
            stagger: 0.05,
            scrollTrigger: { trigger: el, start: "top 82%", end: wordAnimationEnd, scrub: true },
          },
        );
      }
    }, el);
    return () => ctx.revert();
  }, [baseOpacity, baseRotation, blurStrength, enableBlur, rotationEnd, wordAnimationEnd]);

  return (
    <div ref={containerRef} className={cn("my-5", containerClassName)}>
      <p className={cn("text-[clamp(1.6rem,3.4vw,2.9rem)] font-semibold leading-[1.25]", textClassName)}>
        {splitText}
      </p>
    </div>
  );
}
