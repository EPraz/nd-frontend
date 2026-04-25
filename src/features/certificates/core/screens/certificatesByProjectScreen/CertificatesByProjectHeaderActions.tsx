import { RegistryHeaderActionButton } from "@/src/components/ui/registryWorkspace/RegistryHeaderActionButton";

type Props = {
  projectId: string;
  onRefresh: () => void;
  onOpenUpload: () => void;
  loading: boolean;
};

export function CertificatesByProjectHeaderActions({
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

