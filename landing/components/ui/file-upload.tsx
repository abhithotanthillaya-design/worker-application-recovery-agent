"use client";

/**
 * FileUpload — Aceternity UI (ui.aceternity.com/components/file-upload).
 * Same structure and API (onChange(files)): grid-pattern drop area, floating upload card that lifts on hover,
 * file cards list. Native drag-and-drop instead of react-dropzone (no extra dependency).
 * Extras: accept, disabled, showList, title, hint.
 */

import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { UploadCloud } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";

const mainVariant = {
  initial: { x: 0, y: 0 },
  animate: { x: 20, y: -20, opacity: 0.9 },
};

const secondaryVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export interface FileUploadProps {
  onChange?: (files: File[]) => void;
  accept?: string;
  disabled?: boolean;
  showList?: boolean;
  title?: string;
  hint?: string;
  className?: string;
}

export function FileUpload({
  onChange,
  accept = ".pdf,.png,.jpg,.jpeg",
  disabled = false,
  showList = true,
  title = "Upload files",
  hint = "Drag and drop here, or click to choose. PDF, PNG or JPG, up to 10 MB each.",
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    if (!newFiles.length || disabled) return;
    if (showList) setFiles((prev) => [...prev, ...newFiles]);
    onChange?.(newFiles);
  };

  const handleClick = () => {
    if (!disabled) fileInputRef.current?.click();
  };

  return (
    <div className={cn("w-full", className)}>
      <motion.div
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) setDragActive(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFileChange(Array.from(e.dataTransfer.files));
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label={`${title}. ${hint}`}
        whileHover="animate"
        className={cn(
          "group/file relative block w-full cursor-pointer overflow-hidden rounded-[var(--radius-panel)] p-8 sm:p-10",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          tabIndex={-1}
          onChange={(e) => {
            handleFileChange(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
        <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent_85%)]">
          <GridPattern />
        </div>

        <div className="flex flex-col items-center justify-center">
          <p className="relative z-20 font-display text-lg font-semibold text-fg">{title}</p>
          <p className="relative z-20 mt-1.5 max-w-md text-center text-sm text-fg-muted">{hint}</p>

          <div className="relative mx-auto mt-8 w-full max-w-xl">
            {files.length > 0 &&
              files.map((file, idx) => (
                <motion.div
                  key={"file" + idx}
                  layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
                  className="relative z-40 mx-auto mt-3 flex w-full flex-col items-start justify-start overflow-hidden rounded-md bg-paper p-4 text-paper-ink shadow-sm md:h-24"
                >
                  <div className="flex w-full items-center justify-between gap-4">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="max-w-xs truncate font-medium"
                    >
                      {file.name}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="w-fit shrink-0 rounded-lg bg-paper-2 px-2 py-0.5 text-sm tabular"
                    >
                      {formatBytes(file.size)}
                    </motion.p>
                  </div>
                  <div className="mt-2 flex w-full flex-col items-start justify-between gap-2 text-sm text-paper-muted md:flex-row md:items-center">
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} layout className="rounded-md bg-paper-2 px-1.5 py-0.5">
                      {file.type || "unknown type"}
                    </motion.p>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} layout>
                      modified {new Date(file.lastModified).toLocaleDateString()}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            {!files.length && (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative z-40 mx-auto flex h-32 w-full max-w-[8rem] items-center justify-center rounded-md bg-paper shadow-[0px_10px_50px_rgba(0,0,0,0.35)] group-hover/file:shadow-2xl"
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-1 text-sm font-semibold text-paper-ink"
                  >
                    Drop it
                    <UploadCloud className="h-5 w-5" aria-hidden />
                  </motion.p>
                ) : (
                  <UploadCloud className="h-5 w-5 text-paper-muted" aria-hidden />
                )}
              </motion.div>
            )}
            {!files.length && (
              <motion.div
                variants={secondaryVariant}
                className="absolute inset-0 z-30 mx-auto flex h-32 w-full max-w-[8rem] items-center justify-center rounded-md border border-dashed border-turmeric bg-transparent opacity-0"
              />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex shrink-0 scale-105 flex-wrap items-center justify-center gap-x-px gap-y-px bg-transparent">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={cn(
                "flex h-10 w-10 shrink-0 rounded-[2px]",
                index % 2 === 0 ? "bg-white/[0.035]" : "bg-white/[0.015] shadow-[0px_0px_1px_2px_rgba(255,255,255,0.06)_inset]",
              )}
            />
          );
        }),
      )}
    </div>
  );
}
