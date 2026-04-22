import { useCrewCertificatesProjectWorkspace } from "../hooks/useCrewCertificatesProjectWorkspace";
import { CrewCertificatesProjectWorkspaceContent } from "./CrewCertificatesProjectWorkspaceContent";

export function CrewCertificatesProjectWorkspaceSection({
  projectId,
}: {
  projectId: string;
}) {
  const workspace = useCrewCertificatesProjectWorkspace(projectId);

  return (
    <CrewCertificatesProjectWorkspaceContent
      projectId={projectId}
      workspace={workspace}
    />
  );
}
