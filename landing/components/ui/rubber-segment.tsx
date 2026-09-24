"use client";

/**
 * RubberSegment — React Bits API (items, defaultValue, onChange, trackColor, thumbColor, textColor,
 * activeTextColor, size, radius, inset, equalSlots, stretch, squash, speed, glide, draggable, preset, disabled).
 * A segmented control whose thumb stretches while it travels and squashes on landing. Keyboard: arrow keys.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue } from "motion/react";
import { cn } from "@/lib/utils";

export interface RubberSegmentProps {
  items: string[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string, index: number) => void;
  trackColor?: string;
  thumbColor?: string;
  textColor?: string;
  activeTextColor?: string;
  size?: "sm" | "md" | "lg";
  radius?: number;
  inset?: number;
  equalSlots?: boolean;
  stretch?: number;
  squash?: number;
  speed?: number;
  glide?: number;
  draggable?: boolean;
  preset?: "periods" | "default";
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  /** Optional per-item labels (visible text) when the item value is an id. */
  labels?: Record<string, string>;
}

const SIZES = {
  sm: "h-9 text-[0.85rem]",
  md: "h-11 text-[0.95rem]",
  lg: "h-12 text-base",
} as const;

export default function RubberSegment({
  items,
  defaultValue,
  value,
  onChange,
  trackColor = "#27272a",
  thumbColor = "#fafafa",
  textColor = "#fafafa",
  activeTextColor = "#18181b",
  size = "md",
  radius = 10,
  inset = 3,
  equalSlots = true,
  stretch = 100,
  squash = 3,
  speed = 1,
  glide = 75,
  draggable = true,
  disabled = false,
  ariaLabel = "Options",
  className,
  labels,
}: RubberSegmentProps) {
  const [internal, setInternal] = useState(() => Math.max(0, items.indexOf(defaultValue ?? items[0])));
  const controlled = value !== undefined;
  const index = controlled ? Math.max(0, items.indexOf(value)) : internal;

  const trackRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const rubberRef = useRef<HTMLDivElement>(null);
  const [slots, setSlots] = useState<{ left: number; width: number }[]>([]);
  const x = useMotionValue(0);
  const w = useMotionValue(0);
  const prevIndex = useRef(index);
  const firstPlacement = useRef(true);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const tr = track.getBoundingClientRect();
    setSlots(
      btnRefs.current.map((b) => {
        const r = b?.getBoundingClientRect();
        return r ? { left: r.left - tr.left, width: r.width } : { left: 0, width: 0 };
      }),
    );
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, [measure, items, size, equalSlots]);

  // Fonts can change widths after first paint.
  useEffect(() => {
    (document as Document & { fonts?: FontFaceSet }).fonts?.ready.then(measure);
  }, [measure]);

  const damping = Math.max(12, 30 - glide * 0.16);
  const stiffness = 320 * speed;

  useEffect(() => {
    const slot = slots[index];
    if (!slot || !slot.width) return;
    const target = slot.left;
    if (firstPlacement.current) {
      x.set(target);
      w.set(slot.width);
      firstPlacement.current = false;
      prevIndex.current = index;
      return;
    }
    const spring = { type: "spring" as const, stiffness, damping };
    const a = animate(x, target, spring);
    const b = animate(w, slot.width, spring);

    const travelled = Math.abs(index - prevIndex.current);
    if (rubberRef.current && travelled > 0) {
      const sx = 1 + Math.min(0.38, (stretch / 100) * 0.14 * travelled + 0.08);
      const sy = 1 - Math.min(0.2, (squash / 100) * 1.6);
      animate(
        rubberRef.current,
        { scaleX: [1, sx, 0.985, 1], scaleY: [1, sy, 1.02, 1] },
        { duration: 0.55 / speed, ease: "easeOut", times: [0, 0.35, 0.7, 1] },
      );
    }
    prevIndex.current = index;
    return () => {
      a.stop();
      b.stop();
    };
  }, [index, slots, x, w, stiffness, damping, stretch, squash, speed]);

  const commit = useCallback(
    (i: number) => {
      if (disabled || i === index || i < 0 || i >= items.length) return;
      if (!controlled) setInternal(i);
      onChange?.(items[i], i);
    },
    [disabled, index, items, controlled, onChange],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    let next = index;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % items.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (index - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    else return;
    e.preventDefault();
    commit(next);
    btnRefs.current[next]?.focus();
  };

  const first = slots[0]?.left ?? 0;
  const last = slots[slots.length - 1]?.left ?? 0;

  return (
    <div
      ref={trackRef}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled}
      onKeyDown={onKeyDown}
      className={cn(
        "relative inline-grid select-none items-stretch",
        SIZES[size],
        disabled && "opacity-50",
        className,
      )}
      style={{
        background: trackColor,
        borderRadius: radius,
        padding: inset,
        gridAutoFlow: "column",
        gridAutoColumns: equalSlots ? "1fr" : "auto",
      }}
    >
      <motion.div
        aria-hidden="true"
        drag={draggable && !disabled ? "x" : false}
        dragConstraints={{ left: first, right: last }}
        dragElastic={0.12}
        dragMomentum={false}
        onDragEnd={() => {
          const center = x.get() + w.get() / 2;
          let best = index;
          let bestDist = Infinity;
          slots.forEach((s, i) => {
            const d = Math.abs(s.left + s.width / 2 - center);
            if (d < bestDist) {
              best = i;
              bestDist = d;
            }
          });
          if (best === index) {
            const s = slots[index];
            if (s) animate(x, s.left, { type: "spring", stiffness, damping });
          } else commit(best);
        }}
        className={cn("absolute", draggable && !disabled && "cursor-grab active:cursor-grabbing")}
        style={{ x, width: w, top: inset, bottom: inset, left: 0, touchAction: "pan-y" }}
      >
        <div
          ref={rubberRef}
          className="h-full w-full shadow-[0_6px_16px_-8px_rgb(0_0_0/0.6)]"
          style={{ background: thumbColor, borderRadius: Math.max(0, radius - inset) }}
        />
      </motion.div>

      {items.map((item, i) => {
        const active = i === index;
        return (
          <button
            key={item}
            ref={(el) => {
              btnRefs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            disabled={disabled}
            onClick={() => commit(i)}
            className="relative z-10 flex items-center justify-center whitespace-nowrap px-4 font-semibold transition-colors duration-200"
            style={{ color: active ? activeTextColor : textColor, borderRadius: Math.max(0, radius - inset) }}
          >
            {labels?.[item] ?? item}
          </button>
        );
      })}
    </div>
  );
}
