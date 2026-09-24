"use client";

/**
 * ParticleText — React Bits API (text, particleSize, density, color, highlightColor, scatter,
 * gatherDuration, stagger, pointerRepel, repelRadius, idleDrift, trigger, fontSize, fontWeight,
 * fontFamily, glow). Canvas implementation adapted for this project:
 *  - multi-line text via "\n"
 *  - text is shrunk to fit the frame
 *  - pauses when off-screen, renders statically under prefers-reduced-motion
 */

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface ParticleTextProps {
  text: string;
  particleSize?: number;
  density?: number;
  color?: string;
  highlightColor?: string;
  scatter?: number;
  gatherDuration?: number;
  stagger?: number;
  pointerRepel?: number;
  repelRadius?: number;
  idleDrift?: number;
  trigger?: "mount" | "view";
  fontSize?: string;
  fontWeight?: number;
  fontFamily?: string;
  glow?: boolean;
  onGathered?: () => void;
  className?: string;
}

interface Particle {
  tx: number;
  ty: number;
  sx: number;
  sy: number;
  delay: number;
  dx: number;
  dy: number;
  seed: number;
  hl: boolean;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export default function ParticleText({
  text,
  particleSize = 2.2,
  density = 4,
  color = "#f8fafc",
  highlightColor = "#8b5cf6",
  scatter = 190,
  gatherDuration = 1600,
  stagger = 420,
  pointerRepel = 42,
  repelRadius = 120,
  idleDrift = 0.8,
  trigger = "mount",
  fontSize = "clamp(3.5rem, 13vw, 9rem)",
  fontWeight = 800,
  fontFamily = "inherit",
  glow = false,
  onGathered,
  className,
}: ParticleTextProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onGatheredRef = useRef(onGathered);
  onGatheredRef.current = onGathered;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let particles: Particle[] = [];
    let w = 0;
    let h = 0;
    let startAt = 0;
    let started = trigger === "mount";
    let visible = true;
    let gatheredFired = false;
    let cancelled = false;
    const pointer = { x: -9999, y: -9999 };

    const resolveFontPx = () => {
      const probe = document.createElement("span");
      probe.style.cssText = `position:absolute;visibility:hidden;font-size:${fontSize};`;
      wrap.appendChild(probe);
      const px = parseFloat(getComputedStyle(probe).fontSize);
      probe.remove();
      return px || 96;
    };

    const build = () => {
      const rect = wrap.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const o = off.getContext("2d", { willReadFrequently: true });
      if (!o) return;
      const family = fontFamily === "inherit" ? getComputedStyle(wrap).fontFamily : fontFamily;
      const lines = text.split("\n");
      let px = resolveFontPx();
      const lineHeight = () => px * 1.0;
      const widest = () => {
        o.font = `${fontWeight} ${px}px ${family}`;
        return Math.max(...lines.map((l) => o.measureText(l).width));
      };
      while ((widest() > w * 0.94 || lineHeight() * lines.length > h * 0.94) && px > 16) px -= 2;

      o.font = `${fontWeight} ${px}px ${family}`;
      o.textAlign = "center";
      o.textBaseline = "middle";
      o.fillStyle = "#fff";
      lines.forEach((l, i) => o.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * lineHeight()));

      const data = o.getImageData(0, 0, w, h).data;
      const next: Particle[] = [];
      const step = Math.max(2, density);
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          if (data[(y * w + x) * 4 + 3] > 128) {
            const angle = Math.random() * Math.PI * 2;
            const dist = scatter * (0.35 + Math.random() * 0.65);
            next.push({
              tx: x,
              ty: y,
              sx: x + Math.cos(angle) * dist,
              sy: y + Math.sin(angle) * dist,
              delay: Math.random() * stagger,
              dx: 0,
              dy: 0,
              seed: Math.random() * 1000,
              hl: Math.random() < 0.09,
            });
          }
        }
      }
      particles = next;
    };

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const elapsed = started ? now - startAt : -1;
      let allDone = started;
      const repel2 = repelRadius * repelRadius;

      const pass = (hl: boolean) => {
        ctx.fillStyle = hl ? highlightColor : color;
        for (const p of particles) {
          if (p.hl !== hl) continue;
          let x: number;
          let y: number;
          if (reduce) {
            x = p.tx;
            y = p.ty;
          } else {
            const t = Math.min(1, Math.max(0, (elapsed - p.delay) / gatherDuration));
            if (t < 1) allDone = false;
            const e = easeOutCubic(t);
            x = p.sx + (p.tx - p.sx) * e;
            y = p.sy + (p.ty - p.sy) * e;
            if (elapsed < 0) {
              x = p.sx;
              y = p.sy;
            }
            if (t >= 1) {
              x += Math.sin(now * 0.0011 + p.seed) * idleDrift;
              y += Math.cos(now * 0.0009 + p.seed * 1.3) * idleDrift;
              const ddx = x - pointer.x;
              const ddy = y - pointer.y;
              const d2 = ddx * ddx + ddy * ddy;
              let tdx = 0;
              let tdy = 0;
              if (d2 < repel2 && d2 > 0.01) {
                const d = Math.sqrt(d2);
                const f = (1 - d / repelRadius) * pointerRepel;
                tdx = (ddx / d) * f;
                tdy = (ddy / d) * f;
              }
              p.dx += (tdx - p.dx) * 0.14;
              p.dy += (tdy - p.dy) * 0.14;
              x += p.dx;
              y += p.dy;
            }
          }
          ctx.fillRect(x - particleSize / 2, y - particleSize / 2, particleSize, particleSize);
        }
      };
      pass(false);
      pass(true);

      if (allDone && !gatheredFired) {
        gatheredFired = true;
        onGatheredRef.current?.();
      }
    };

    const loop = (now: number) => {
      if (cancelled) return;
      if (visible) draw(now);
      raf = requestAnimationFrame(loop);
    };

    const begin = () => {
      if (started && startAt) return;
      started = true;
      startAt = performance.now();
    };

    const init = () => {
      if (cancelled) return;
      build();
      if (reduce) {
        draw(performance.now());
        onGatheredRef.current?.();
        return;
      }
      if (trigger === "mount") begin();
      raf = requestAnimationFrame(loop);
    };

    const fontsReady = (document as Document & { fonts?: FontFaceSet }).fonts?.ready ?? Promise.resolve();
    fontsReady.then(init);

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (particles.length) {
          build();
          if (reduce) draw(performance.now());
        }
      }, 150);
    });
    ro.observe(wrap);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && trigger === "view" && !startAt) begin();
      },
      { threshold: 0.2 },
    );
    io.observe(wrap);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      ro.disconnect();
      io.disconnect();
    };
  }, [
    text,
    particleSize,
    density,
    color,
    highlightColor,
    scatter,
    gatherDuration,
    stagger,
    pointerRepel,
    repelRadius,
    idleDrift,
    trigger,
    fontSize,
    fontWeight,
    fontFamily,
  ]);

  return (
    <div ref={wrapRef} aria-hidden="true" className={cn("relative h-full w-full", className)}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={glow ? { filter: `drop-shadow(0 0 14px ${highlightColor}55)` } : undefined}
      />
    </div>
  );
}
