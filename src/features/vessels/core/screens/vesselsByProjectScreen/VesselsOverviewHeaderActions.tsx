import { RegistryHeaderActionButton } from "@/src/components/ui/registryWorkspace";
import { useRouter } from "expo-router";

export function VesselsOverviewHeaderActions({
  projectId,
  onRefresh,
}: {
  projectId: string;
  onRefresh: () => void;
}) {
  const router = useRouter();

  return (
    <>
      <RegistryHeaderActionButton
        variant="soft"
        iconName="refresh-outline"
        onPress={onRefresh}
      >
        Refresh
      </RegistryHeaderActionButton>

      <RegistryHeaderActionButton
        variant="default"
        iconName="add-outline"
        iconSize={15}
        onPress={() => router.push(`/projects/${projectId}/vessels/new`)}
      >
        New Vessel
      </RegistryHeaderActionButton>
    </>
  );
}
