import { CertificatesTable } from "@/src/features/certificates/core";
import type { CertificateDto } from "@/src/features/certificates/shared";
import type { ReactNode } from "react";
import { View } from "react-native";

type Props = {
  data: CertificateDto[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  headerActions?: ReactNode;
};

export function AssetCertificatesOverviewWorkspaceSection({
  data,
  isLoading,
  error,
  onRetry,
  headerActions,
}: Props) {
  return (
    <View className="flex-1">
      <CertificatesTable
        title="Vessel Records"
        subtitleRight={`${data.length} rows after filtering`}
        headerActions={headerActions}
        toolbarContent={null}
        data={data}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        showVesselColumn={false}
        sortByExpiry
      />
    </View>
  );
}
