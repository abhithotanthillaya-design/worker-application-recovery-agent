"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence } from "motion/react";
import { AlertTriangle, CheckCircle2, FlaskConical, Info } from "lucide-react";
import SwipeToast from "./swipe-toast";

type Tone = "success" | "info" | "warn" | "sim";

interface ToastInput {
  title: string;
  description?: string;
  tone?: Tone;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

interface ToastItem extends ToastInput {
  id: number;
}

const ToastContext = createContext<{ push: (t: ToastInput) => void }>({ push: () => {} });

export const useToast = () => useContext(ToastContext);

const TONE: Record<Tone, { color: string; icon: ReactNode }> = {
  success: { color: "#4fd1a1", icon: <CheckCircle2 size={18} color="#4fd1a1" aria-hidden /> },
  info: { color: "#86b4ff", icon: <Info size={18} color="#86b4ff" aria-hidden /> },
  warn: { color: "#ff9f5a", icon: <AlertTriangle size={18} color="#ff9f5a" aria-hidden /> },
  sim: { color: "#f6b92b", icon: <FlaskConical size={18} color="#f6b92b" aria-hidden /> },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((t: ToastInput) => {
    setItems((s) => [...s.slice(-3), { ...t, id: Date.now() + Math.random() }]);
  }, []);

  const remove = useCallback((id: number) => setItems((s) => s.filter((x) => x.id !== id)), []);
  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-label="Notifications"
        className="pointer-events-none fixed right-4 top-4 z-[90] flex flex-col items-end gap-2.5 max-sm:left-4 max-sm:items-stretch"
      >
        <AnimatePresence initial={false}>
          {items.map((t) => {
            const tone = TONE[t.tone ?? "success"];
            return (
              <div key={t.id} className="pointer-events-auto max-sm:[&>div]:!w-full">
                <SwipeToast
                  inline
                  title={t.title}
                  description={t.description}
                  actionLabel={t.actionLabel}
                  onAction={t.onAction}
                  icon={tone.icon}
                  background="#172561"
                  color="#eef1fb"
                  fuseColor={tone.color}
                  duration={t.duration ?? 4200}
                  width={372}
                  radius={14}
                  onClose={() => remove(t.id)}
                />
              </div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
