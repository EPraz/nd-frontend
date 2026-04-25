import { RegistryHeaderActionButton } from "@/src/components/ui/registryWorkspace";
import { useSessionContext } from "@/src/context/SessionProvider";
import { canUser } from "@/src/security/rolePermissions";
import { useRouter } from "expo-router";

export function CrewOverviewHeaderActions({
  projectId,
  onRefresh,
}: {
  projectId: string;
  onRefresh: () => void;
}) {
  const router = useRouter();
  const { session } = useSessionContext();
  const canCreateCrew = canUser(session, "OPERATIONAL_WRITE");

  return (
    <>
      <RegistryHeaderActionButton
        variant="soft"
        iconName="refresh-outline"
        onPress={onRefresh}
      >
        Refresh
      </RegistryHeaderActionButton>

      {canCreateCrew ? (
        <RegistryHeaderActionButton
          variant="default"
          iconName="add-outline"
          iconSize={15}
          onPress={() => router.push(`/projects/${projectId}/crew/new`)}
        >
          New Crew
        </RegistryHeaderActionButton>
      ) : null}
    </>
  );
}
