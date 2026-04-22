import { RegistryHeaderActionButton } from "@/src/components/ui/registryWorkspace";
import { useCrewBulkUploadSessions } from "../hooks/useCrewBulkUploadSessions";

export function CrewBulkUploadTabHeaderActions({
  projectId,
}: {
  projectId: string;
}) {
  const { refresh } = useCrewBulkUploadSessions(projectId);

  return (
    <RegistryHeaderActionButton
      variant="soft"
      iconName="refresh-outline"
      onPress={refresh}
    >
      Refresh
    </RegistryHeaderActionButton>
  );
}
