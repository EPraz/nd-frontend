import { RegistryHeaderActionButton } from "@/src/components/ui/registryWorkspace";
import { ENABLE_MANUAL_CERTIFICATE_CREATE } from "@/src/features/certificates/shared/config";
import { useRouter } from "expo-router";

type Props = {
  projectId: string;
  assetId: string;
  onRefresh: () => void;
  onOpenUpload: () => void;
  loading: boolean;
};

export function AssetCertificatesHeaderActions({
  projectId,
  assetId,
  onRefresh,
  onOpenUpload,
  loading,
}: Props) {
  const router = useRouter();

  return (
    <>
      <RegistryHeaderActionButton
        variant="soft"
        iconName="refresh-outline"
        onPress={onRefresh}
        loading={loading}
      >
        Refresh
      </RegistryHeaderActionButton>

      <RegistryHeaderActionButton
        variant="default"
        iconName="add-outline"
        iconSize={15}
        onPress={onOpenUpload}
      >
        Add Certificate
      </RegistryHeaderActionButton>

      {ENABLE_MANUAL_CERTIFICATE_CREATE ? (
        <RegistryHeaderActionButton
          variant="outline"
          onPress={() =>
            router.push(`/projects/${projectId}/vessels/${assetId}/certificates/new`)
          }
        >
          Manual entry
        </RegistryHeaderActionButton>
      ) : null}
    </>
  );
}
