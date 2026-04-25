import { RegistryHeaderActionButton } from "@/src/components/ui/registryWorkspace/RegistryHeaderActionButton";

type Props = {
  onRefresh: () => void;
  onGenerate: () => void;
  loading: boolean;
  canGenerate: boolean;
};

export function CrewCertificatesProjectHeaderActions({
  onRefresh,
  onGenerate,
  loading,
  canGenerate,
}: Props) {
  return (
    <>
      <RegistryHeaderActionButton
        variant="soft"
        iconName="refresh-outline"
        onPress={onRefresh}
      >
        Refresh
      </RegistryHeaderActionButton>

      {canGenerate ? (
        <RegistryHeaderActionButton
          variant="outline"
          onPress={onGenerate}
          loading={loading}
        >
          Refresh requirements
        </RegistryHeaderActionButton>
      ) : null}
    </>
  );
}
