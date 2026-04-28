import { CertificateRequirementsTable } from "@/src/features/certificates/requirements";
import type { CertificateRequirementDto } from "@/src/features/certificates/shared";
import type { DataTableProps } from "@/src/components/ui/table";
import type { ReactNode } from "react";

type Props = {
  data: CertificateRequirementDto[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onUpload: (row: CertificateRequirementDto) => void;
  canUpload: boolean;
  headerActions?: ReactNode;
  pagination?: DataTableProps<CertificateRequirementDto>["pagination"];
};

export function AssetCertificateRequirementsWorkspaceSection({
  data,
  isLoading,
  error,
  onRetry,
  onUpload,
  canUpload,
  headerActions,
  pagination,
}: Props) {
  return (
    <CertificateRequirementsTable
      title="Vessel Requirements"
      subtitleRight={`${data.length} rows after filtering`}
      headerActions={headerActions}
      toolbarContent={null}
      data={data}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      onUpload={onUpload}
      canUpload={canUpload}
      pagination={pagination}
    />
  );
}
