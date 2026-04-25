import { useToast } from "@/src/context/ToastProvider";
import { useSessionContext } from "@/src/context/SessionProvider";
import { canUser } from "@/src/security/rolePermissions";
import { useCrewCertificatesProjectWorkspace } from "../hooks/useCrewCertificatesProjectWorkspace";
import { CrewCertificatesProjectHeaderActions } from "./CrewCertificatesProjectHeaderActions";

export function CrewCertificatesProjectTabHeaderActions({
  projectId,
}: {
  projectId: string;
}) {
  const { show } = useToast();
  const { session } = useSessionContext();
  const canGenerate = canUser(session, "OPERATIONAL_WRITE");
  const workspace = useCrewCertificatesProjectWorkspace(projectId);

  async function handleGenerate() {
    try {
      const result = await workspace.generateProject();
      await workspace.refreshAll();
      show(
        `Requirements refreshed for ${result.processedCrewMembers} crew member${result.processedCrewMembers === 1 ? "" : "s"}.`,
        "success",
      );
    } catch {
      show("Failed to refresh crew certificate requirements", "error");
    }
  }

  return (
    <CrewCertificatesProjectHeaderActions
      onRefresh={workspace.refreshAll}
      onGenerate={handleGenerate}
      loading={workspace.generating}
      canGenerate={canGenerate}
    />
  );
}
