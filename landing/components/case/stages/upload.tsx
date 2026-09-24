"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Plus, Wand2 } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { useCase } from "@/lib/case-store";
import { DOCUMENT_HINT, DOCUMENT_LABEL, REQUIRED_DOCUMENT_TYPES, UPLOAD_SLOTS } from "@/lib/labels";
import type { DocumentType } from "@/lib/types";
import { cn, formatBytes } from "@/lib/utils";
import { StageShell } from "./shell";

export function UploadStage() {
  const { file, busy, addFile, loadDemoDocuments, saveStatement, analyze } = useCase();
  const [active, setActive] = useState<DocumentType>("APPLICATION");
  const [already, setAlready] = useState(file?.userStatement.alreadySubmitted ?? false);
  const [note, setNote] = useState(file?.userStatement.note ?? "");
  if (!file) return null;

  const byType = (t: DocumentType) => file.documents.find((d) => d.documentType === t);
  const missing = REQUIRED_DOCUMENT_TYPES.filter((t) => !byType(t));
  const uploading = busy === "upload";

  async function onFiles(files: File[]) {
    const taken = new Set(file!.documents.map((d) => d.documentType));
    for (const f of files) {
      const type: DocumentType = !taken.has(active)
        ? active
        : (UPLOAD_SLOTS.find((t) => !taken.has(t)) ?? "OTHER");
      taken.add(type);
      await addFile(f, type);
    }
  }

  return (
    <StageShell
      title="Add the documents from your application"
      lead="Choose which document you are adding, then drop the file. The four marked documents are needed before the agent can compare them."
    >
      <div>
        <h2 className="sr-only">Document slots</h2>
        <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {UPLOAD_SLOTS.map((t) => {
            const doc = byType(t);
            const required = REQUIRED_DOCUMENT_TYPES.includes(t);
            const selected = active === t && !doc;
            return (
              <li key={t}>
                <button
                  type="button"
                  aria-pressed={selected}
                  disabled={!!doc}
                  onClick={() => setActive(t)}
                  className={cn(
                    "flex h-full w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-colors",
                    doc && "border-success/40 bg-success/8",
                    !doc && "hover:bg-white/[0.06]",
                    selected && "border-turmeric bg-turmeric/10",
                  )}
                >
                  <span className="mt-0.5 shrink-0">
                    {doc ? (
                      <CheckCircle2 size={18} className="text-success" aria-hidden />
                    ) : uploading && selected ? (
                      <Loader2 size={18} className="animate-spin text-info" aria-hidden />
                    ) : (
                      <Plus size={18} className={selected ? "text-turmeric" : "text-fg-subtle"} aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold">
                      {DOCUMENT_LABEL[t]}
                      {required && <span className="ml-1.5 text-xs font-normal text-fg-subtle">needed</span>}
                    </span>
                    <span className="mt-0.5 block text-[0.82rem] leading-snug text-fg-muted">
                      {doc ? (
                        <>
                          Uploaded · <span className="break-all">{doc.filename}</span> · {formatBytes(doc.sizeBytes)}
                        </>
                      ) : (
                        DOCUMENT_HINT[t]
                      )}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="panel-flat overflow-hidden">
        <FileUpload
          showList={false}
          disabled={uploading}
          title={`Add: ${DOCUMENT_LABEL[active]}`}
          hint="Drag and drop here, or click to choose. PDF, PNG or JPG, up to 10 MB."
          onChange={onFiles}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="btn btn-ghost" onClick={() => loadDemoDocuments()} disabled={uploading || missing.length === 0}>
          {uploading ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Wand2 size={16} aria-hidden />}
          Use the synthetic demo documents
        </button>
        <p className="text-sm text-fg-subtle">
          Prototype: whichever file you add, analysis reads the synthetic values for that document type.
        </p>
      </div>

      <fieldset className="panel-flat space-y-4 p-5">
        <legend className="px-2 font-display text-lg font-semibold">What do you already know?</legend>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={already}
            onChange={(e) => setAlready(e.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 accent-[#f6b92b]"
          />
          <span>I already submitted the bank document with my application.</span>
        </label>
        <div>
          <label htmlFor="note" className="mb-1.5 block text-sm text-fg-muted">
            Anything else the notice or the office told you (optional)
          </label>
          <textarea
            id="note"
            rows={2}
            maxLength={200}
            className="field"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="For example: the clerk said to come back with a corrected copy"
          />
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          className="btn btn-primary min-h-12 px-6"
          disabled={missing.length > 0 || uploading || busy === "analyze"}
          onClick={async () => {
            await saveStatement({ alreadySubmitted: already, note });
            await analyze();
          }}
        >
          {busy === "analyze" && <Loader2 size={18} className="animate-spin" aria-hidden />}
          Analyze documents
        </button>
        {missing.length > 0 && (
          <p className="text-sm text-fg-muted" aria-live="polite">
            Still needed: {missing.map((t) => DOCUMENT_LABEL[t].toLowerCase()).join(", ")}.
          </p>
        )}
      </div>
    </StageShell>
  );
}
