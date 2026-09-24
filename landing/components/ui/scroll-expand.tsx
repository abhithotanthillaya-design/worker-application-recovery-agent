"use client";

/**
 * ScrollExpand — React Bits API (src, alt, title, scrollHint, useWindowScroll, startWidth, startHeight,
 * startRadius, endRadius, mediaZoom, scrollDistance, holdDistance, smoothing, overlayScrim, enabled).
 * The frame opens as the page scrolls, holds, then releases. Driven by window scroll; styles are written
 * straight to the DOM in a rAF loop so scrolling never triggers React renders.
 */

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ScrollExpandProps {
  src: string;
  alt: string;
  title?: string;
  scrollHint?: string;
  useWindowScroll?: boolean;
  startWidth?: number;
  startHeight?: number;
  startRadius?: number;
  endRadius?: number;
  mediaZoom?: number;
  scrollDistance?: number;
  holdDistance?: number;
  smoothing?: number;
  overlayScrim?: number;
  enabled?: boolean;
  children?: ReactNode;
  className?: string;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const smooth = (t: number) => t * t * (3 - 2 * t);
const range = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));

export default function ScrollExpand({
  src,
  alt,
  title,
  scrollHint = "Scroll to open the case file",
  startWidth = 42,
  startHeight = 58,
  startRadius = 24,
  endRadius = 0,
  mediaZoom = 1.35,
  scrollDistance = 1.2,
  holdDistance = 0.35,
  smoothing = 0.1,
  overlayScrim = 0.45,
  enabled = true,
  children,
  className,
}: ScrollExpandProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isStatic = !enabled || reduce;
    let current = isStatic ? 1 : 0;
    let target = current;
    let raf = 0;

    const apply = (p: number) => {
      const e = smooth(p);
      const frame = frameRef.current;
      if (frame) {
        frame.style.width = `${lerp(startWidth, 100, e)}%`;
        frame.style.height = `${lerp(startHeight, 100, e)}%`;
        frame.style.borderRadius = `${lerp(startRadius, endRadius, e)}px`;
      }
      if (imgRef.current) imgRef.current.style.transform = `scale(${lerp(mediaZoom, 1, e)})`;
      if (scrimRef.current) scrimRef.current.style.opacity = String(overlayScrim * (1 - e * 0.35) + e * 0.15);
      if (titleRef.current) {
        const t = 1 - smooth(range(p, 0.35, 0.72));
        titleRef.current.style.opacity = String(t);
        titleRef.current.style.transform = `translateY(${(1 - t) * -24}px)`;
      }
      if (hintRef.current) hintRef.current.style.opacity = String(1 - smooth(range(p, 0, 0.12)));
      if (bodyRef.current) {
        const b = smooth(range(p, 0.72, 0.98));
        bodyRef.current.style.opacity = String(b);
        bodyRef.current.style.transform = `translateY(${(1 - b) * 28}px)`;
      }
    };

    const measure = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      target = isStatic ? 1 : clamp01(-rect.top / (scrollDistance * vh));
    };

    const tick = () => {
      current += (target - current) * smoothing;
      if (Math.abs(target - current) < 0.0006) current = target;
      apply(current);
      raf = current === target ? 0 : requestAnimationFrame(tick);
    };

    const kick = () => {
      measure();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    apply(current);
    kick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => {
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      cancelAnimationFrame(raf);
    };
  }, [enabled, startWidth, startHeight, startRadius, endRadius, mediaZoom, scrollDistance, smoothing, overlayScrim]);

  return (
    <section
      ref={sectionRef}
      aria-label={title}
      className={cn("relative", className)}
      style={{ height: `${(1 + scrollDistance + holdDistance) * 100}svh` }}
    >
      <div className="sticky top-0 flex h-svh w-full items-center justify-center overflow-hidden">
        <div
          ref={frameRef}
          className="relative overflow-hidden bg-ink-950 shadow-[0_40px_120px_-40px_rgb(0_0_0/0.8)]"
          style={{ width: `${startWidth}%`, height: `${startHeight}%`, borderRadius: startRadius }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover will-change-transform"
            style={{ transform: `scale(${mediaZoom})` }}
            draggable={false}
          />
          <div ref={scrimRef} className="absolute inset-0 bg-ink-950" style={{ opacity: overlayScrim }} />

          {title && (
            <div ref={titleRef} className="absolute inset-0 flex items-end p-6 sm:p-10">
              <p className="t-h3 max-w-[16ch] text-fg">{title}</p>
            </div>
          )}

          <div
            ref={bodyRef}
            className="absolute inset-0 flex items-end bg-gradient-to-t from-ink-950/92 via-ink-950/50 to-transparent p-6 opacity-0 sm:p-12 lg:p-20"
          >
            <div className="max-w-2xl">{children}</div>
          </div>
        </div>

        <div
          ref={hintRef}
          className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-sm text-fg-muted"
        >
          {scrollHint}
        </div>
      </div>
    </section>
  );
}
