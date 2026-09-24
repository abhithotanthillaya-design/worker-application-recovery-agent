import { Workspace } from "@/components/case/workspace";

export default async function CasePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  return <Workspace caseId={caseId} />;
}
