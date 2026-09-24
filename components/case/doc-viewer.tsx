"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useCase } from "@/lib/case-store";
import { Dialog } from "@/components/ui/dialog";
import { DocumentPaper, MaskedId } from "./document-paper";
import { DOCUMENT_LABEL } from "@/lib/labels";

const Ctx = createContext<{ open: (documentId: string) => void }>({ open: () => {} });
export const useDocViewer = () => useContext(Ctx);

export function DocViewerProvider({ children }: { children: ReactNode }) {
  const { file } = useCase();
  const [docId, setDocId] = useState<string | null>(null);
  const open = useCallback((id: string) => setDocId(id), []);
  const close = useCallback(() => setDocId(null), []);
  const doc = file?.documents.find((d) => d.documentId === docId);
  const hasNameIssue = !!file?.blockers.some((b) => b.id === "ISSUE-001");
  const mark = doc && hasNameIssue && (doc.documentType === "APPLICATION" || doc.documentType === "BANK");
  const idField = doc?.documentType === "IDENTITY" ? doc.fields.find((f) => f.field === "idNumber") : undefined;

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      <Dialog open={!!doc} onClose={close} title={doc ? DOCUMENT_LABEL[doc.documentType] : "Document"} tone="paper" className="max-w-xl bg-transparent shadow-none">
        {doc && (
          <div className="p-3 sm:p-4">
            <DocumentPaper doc={doc} markField={mark ? "name" : undefined} className="!shadow-none" />
            {mark && (
              <p className="mx-2 mt-3 text-sm text-paper-muted">
                <span className="mark-mismatch">Underlined</span> text is the name that differs between the application
                and the bank document.
              </p>
            )}
            {idField && (
              <div className="mx-2 mt-4">
                <p className="mb-2 text-sm text-paper-muted">Identity numbers stay masked. Hover to see the protected view.</p>
                <MaskedId value={idField.value} />
              </div>
            )}
          </div>
        )}
      </Dialog>
    </Ctx.Provider>
  );
}
