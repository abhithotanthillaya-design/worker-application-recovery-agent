import type { DocumentRecord } from "@/lib/types";
import { DOCUMENT_LABEL } from "@/lib/labels";
import { cn } from "@/lib/utils";
import { EvervaultCard } from "@/components/ui/evervault-card";

const HEADER: Record<string, string> = {
  APPLICATION: "Application acknowledgement",
  BANK: "Bank passbook: first page",
  IDENTITY: "Identity document",
  REJECTION_NOTICE: "Notice of return",
  CERTIFICATE: "Certificate",
  OTHER: "Supporting document",
};

/** Renders an uploaded document as paper. `mark` highlights the field involved in a mismatch. */
export function DocumentPaper({
  doc,
  markField,
  compact = false,
  className,
}: {
  doc: DocumentRecord;
  markField?: string;
  compact?: boolean;
  className?: string;
}) {
  const isNotice = doc.documentType === "REJECTION_NOTICE";
  const isBank = doc.documentType === "BANK";
  return (
    <article
      className={cn("paper relative overflow-hidden", compact ? "text-[0.8rem]" : "text-[0.95rem]", className)}
      aria-label={`${DOCUMENT_LABEL[doc.documentType]} preview`}
    >
      <header className={cn("px-5 py-3.5", isBank ? "bg-ink-700 text-paper" : "bg-paper-ink text-paper")}>
        <p className="font-display text-[1.05em] font-semibold">{HEADER[doc.documentType]}</p>
        <p className="mt-0.5 text-[0.8em] opacity-70">
          {doc.filename} · {doc.documentId}
        </p>
      </header>
      <dl className="grid gap-x-5 gap-y-3.5 px-5 py-5 sm:grid-cols-2">
        {doc.fields.map((f) => (
          <div key={f.field} className={f.field === "reason" ? "sm:col-span-2" : undefined}>
            <dt className="text-[0.78em] text-paper-muted">{f.label}</dt>
            <dd className="mt-0.5 font-medium text-paper-ink">
              <span className={cn(markField === f.field && "mark-mismatch")}>{f.value}</span>
            </dd>
          </div>
        ))}
      </dl>
      {isNotice && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-6 right-5 -rotate-[9deg] rounded-md border-[3px] border-kumkum-deep px-3 py-1 font-display text-xl font-extrabold tracking-wide text-kumkum-deep opacity-85"
        >
          RETURNED
        </div>
      )}
      <footer className="border-t border-paper-line px-5 py-2.5 text-[0.75em] text-paper-muted">
        Synthetic demo document. Not issued by any government body.
      </footer>
    </article>
  );
}

/** Masked identity value that reveals the "encrypted" field on hover (Aceternity EvervaultCard). */
export function MaskedId({ value }: { value: string }) {
  return (
    <div className="mx-auto w-full max-w-[15rem]" title="Identity numbers stay masked in this prototype">
      <EvervaultCard text={value.slice(-4)} />
    </div>
  );
}
