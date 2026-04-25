import { RegistryHeaderActionButton } from "@/src/components/ui/registryWorkspace";

export function MaintenanceByAssetHeaderActions({
  onRefresh,
}: {
  onRefresh: () => void;
}) {
  return (
    <RegistryHeaderActionButton
      variant="soft"
      iconName="refresh-outline"
      onPress={onRefresh}
    >
      Refresh
    </RegistryHeaderActionButton>
  );
}
