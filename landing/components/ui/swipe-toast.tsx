"use client";

/**
 * SwipeToast — React Bits API (open, onClose, title, description, actionLabel, onAction, background, color,
 * fuseColor, width, radius, slideMs, settleBounce, swipeDistance, duration, fuse, pauseOnHover, closeButton,
 * inline). Slides in and settles, burns a fuse while it waits, swipes right to dismiss, pauses on hover/focus.
 * The timeout is a JS timer (not the fuse animation) so reduced-motion users still get auto-dismiss.
 */

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

export type SwipeToastCloseReason = "timeout" | "swipe" | "action" | "close";

export interface SwipeToastProps {
  open?: boolean;
  onClose?: (reason: SwipeToastCloseReason) => void;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  background?: string;
  color?: string;
  fuseColor?: string;
  width?: number;
  radius?: number;
  slideMs?: number;
  settleBounce?: number;
  swipeDistance?: number;
  duration?: number;
  fuse?: "top" | "bottom" | "none";
  pauseOnHover?: boolean;
  closeButton?: boolean;
  inline?: boolean;
  icon?: ReactNode;
}

export default function SwipeToast({
  open,
  onClose,
  title,
  description,
  actionLabel,
  onAction,
  background = "#27272a",
  color = "#f5f5f5",
  fuseColor = "#f5a524",
  width = 356,
  radius = 12,
  slideMs = 400,
  settleBounce = 0.2,
  swipeDistance = 40,
  duration = 4000,
  fuse = "bottom",
  pauseOnHover = true,
  closeButton = false,
  inline = false,
  icon,
}: SwipeToastProps) {
  const visible = open ?? true;
  const remaining = useRef(duration);
  const startedAt = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const fuseRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const close = useCallback((reason: SwipeToastCloseReason) => onCloseRef.current?.(reason), []);

  const start = useCallback(() => {
    startedAt.current = Date.now();
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => close("timeout"), Math.max(50, remaining.current));
    if (fuseRef.current) fuseRef.current.style.animationPlayState = "running";
  }, [close]);

  const pause = useCallback(() => {
    window.clearTimeout(timer.current);
    remaining.current -= Date.now() - startedAt.current;
    if (fuseRef.current) fuseRef.current.style.animationPlayState = "paused";
  }, []);

  useEffect(() => {
    if (!visible) return;
    remaining.current = duration;
    start();
    return () => window.clearTimeout(timer.current);
  }, [visible, duration, start]);

  const body = (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ x: width * 0.6, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: width * 0.7, opacity: 0, transition: { duration: 0.22, ease: "easeIn" } }}
      transition={{ type: "spring", duration: slideMs / 1000, bounce: settleBounce }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 0.7 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > swipeDistance) close("swipe");
      }}
      onMouseEnter={pauseOnHover ? pause : undefined}
      onMouseLeave={pauseOnHover ? start : undefined}
      onFocus={pauseOnHover ? pause : undefined}
      onBlur={pauseOnHover ? start : undefined}
      className="relative touch-pan-y select-none overflow-hidden border border-white/10 shadow-[0_18px_50px_-18px_rgb(0_0_0/0.8)]"
      style={{
        width: `min(${width}px, calc(100vw - 2rem))`,
        borderRadius: radius,
        background,
        color,
        position: inline ? "relative" : "fixed",
        top: inline ? undefined : 16,
        right: inline ? undefined : 16,
        zIndex: inline ? undefined : 90,
      }}
    >
      <div className="flex items-start gap-3 p-4">
        {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
        <div className="min-w-0 flex-1">
          <p className="text-[0.95rem] font-semibold leading-snug">{title}</p>
          {description && <p className="mt-0.5 text-sm leading-snug opacity-75">{description}</p>}
        </div>
        {actionLabel && (
          <button
            type="button"
            onClick={() => {
              onAction?.();
              close("action");
            }}
            className="shrink-0 rounded-md px-2 py-1 text-sm font-semibold underline-offset-4 hover:underline"
            style={{ color: fuseColor }}
          >
            {actionLabel}
          </button>
        )}
        {closeButton && (
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => close("close")}
            className="shrink-0 rounded-md p-1 opacity-70 hover:opacity-100"
          >
            <X size={16} />
          </button>
        )}
      </div>
      {fuse !== "none" && (
        <div
          ref={fuseRef}
          aria-hidden="true"
          className="absolute left-0 right-0 h-[3px] origin-left"
          style={{
            [fuse === "top" ? "top" : "bottom"]: 0,
            background: fuseColor,
            animation: `fuse-burn ${duration}ms linear forwards`,
          }}
        />
      )}
    </motion.div>
  );

  if (open === undefined) return body;
  return <AnimatePresence>{open && body}</AnimatePresence>;
}
