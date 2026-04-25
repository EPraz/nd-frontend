import { RegistryHeaderActionButton } from "@/src/components/ui/registryWorkspace";

type Props = {
  projectId: string;
  assetId: string;
  onRefresh: () => void;
  onOpenUpload: () => void;
  loading: boolean;
};

export function AssetCertificatesHeaderActions({
  onRefresh,
  onOpenUpload,
  loading,
}: Props) {
  return (
    <>
      <RegistryHeaderActionButton
        variant="soft"
        iconName="refresh-outline"
        iconSide="right"
        onPress={onRefresh}
        loading={loading}
      >
        Refresh
      </RegistryHeaderActionButton>

      <RegistryHeaderActionButton
        variant="default"
        iconName="add-outline"
        iconSize={15}
        iconSide="right"
        onPress={onOpenUpload}
      >
        Add Certificate
      </RegistryHeaderActionButton>
    </>
  );
}
