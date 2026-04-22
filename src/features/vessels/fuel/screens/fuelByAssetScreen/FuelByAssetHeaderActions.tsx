import { RegistryHeaderActionButton } from "@/src/components/ui/registryWorkspace";
import { useRouter } from "expo-router";

export function FuelByAssetHeaderActions({
  projectId,
  assetId,
  onRefresh,
}: {
  projectId: string;
  assetId: string;
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
        onPress={() =>
          router.push(`/projects/${projectId}/vessels/${assetId}/fuel/new`)
        }
      >
        Add Fuel Log
      </RegistryHeaderActionButton>
    </>
  );
}
