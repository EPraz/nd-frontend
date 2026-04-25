import { RegistryHeaderActionButton } from "@/src/components/ui/registryWorkspace";

export function FuelByAssetHeaderActions({
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
