import {
  DataTable,
  type Column,
  type DataTableProps,
} from "@/src/components/ui/table/DataTable";
import { RegistryTablePill } from "@/src/components/ui/table/RegistryTablePill";
import { TableLink } from "@/src/components/ui/table/TableLink";
import { Text } from "@/src/components/ui/text/Text";
import { formatDate } from "@/src/helpers";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";
import type { CertificateDto } from "@/src/features/certificates/shared";
import {
  expiryDisplay,
  parentCertificateBlockingReason,
  sourceReferenceLabel,
} from "@/src/features/certificates/shared";
import {
  CertificateStatusPill,
  DocumentKindPill,
  ExpiryRequirementPill,
  RequirementStatusPill,
  WorkflowStatusPill,
} from "./certificates.ui";

type Props = {
  title: string;
  subtitleRight?: string;
  headerActions?: React.ReactNode;
  toolbarContent?: React.ReactNode;

  data: CertificateDto[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;

  minWidth?: number;
  onRowPress?: (row: CertificateDto) => void;

  showVesselColumn?: boolean;
  sortByExpiry?: boolean;
  selectedRowId?: string | null;
  pagination?: DataTableProps<CertificateDto>["pagination"];
};

export function CertificatesTable(props: Props) {
  const router = useRouter();
  const { projectId } = useLocalSearchParams();

  const rows = useMemo(() => {
    if (!props.sortByExpiry) return props.data;
    const arr = [...props.data];
    arr.sort((a, b) => {
      const da = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
      const db = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
      return da - db;
    });
    return arr;
  }, [props.data, props.sortByExpiry]);

  const columns = useMemo<Column<CertificateDto>[]>(() => {
    const cols: Column<CertificateDto>[] = [
      {
        key: "name",
        header: "Certificate",
        flex: 2,
        render: (r) => (
          <>
            <TableLink
              tooltip="View certificate details"
              onPress={() =>
                router.push(
                  `/projects/${projectId}/vessels/${r.assetId}/certificates/${r.id}`,
                )
              }
            >
              {r.certificateName}
            </TableLink>
            <Text className="mt-1 text-[11px] text-muted">
              {r.number
                ? `${r.certificateCode} - ${r.number}`
                : r.certificateCode}
            </Text>
            <View className="mt-2 flex-row flex-wrap gap-1.5">
              <DocumentKindPill kind={r.certificateDocumentKind} />
              <ExpiryRequirementPill
                requiresExpiry={r.certificateRequiresExpiry}
              />
              {r.parentCertificateId ? (
                <RegistryTablePill label="Child document" tone="info" />
              ) : null}
              {r.childCertificateCount > 0 ? (
                <RegistryTablePill
                  label={`${r.childCertificateCount} linked`}
                  tone="neutral"
                />
              ) : null}
            </View>
          </>
        ),
      },
    ];

    if (props.showVesselColumn) {
      cols.push({
        key: "vessel",
        header: "Vessel",
        flex: 2,
        render: (r) => (
          <>
            <TableLink
              tooltip="View certificate details"
              onPress={() =>
                router.push(`/projects/${projectId}/vessels/${r.assetId}`)
              }
            >
              {r.assetName ?? r.assetId}
            </TableLink>
            <Text className="mt-1 text-[11px] text-muted">
              {r.issuer ?? "Issuing body pending"}
            </Text>
          </>
        ),
      });
    }

    cols.push(
      {
        key: "status",
        header: "Status",
        flex: 1,
        render: (r) => <CertificateStatusPill status={r.status} />,
      },
      {
        key: "workflow",
        header: "Workflow",
        flex: 1,
        render: (r) => <WorkflowStatusPill status={r.workflowStatus} />,
      },
      {
        key: "requirement",
        header: "Requirement",
        flex: 1,
        render: (r) => {
          const parentBlockingReason = parentCertificateBlockingReason(r);

          return (
            <View className="min-w-0 gap-1.5">
              <RequirementStatusPill status={r.requirementStatus ?? null} />
              {parentBlockingReason ? (
                <>
                  <RegistryTablePill label="Parent blocked" tone="danger" />
                  <Text
                    className="text-[11px] leading-[15px] text-muted"
                    numberOfLines={2}
                  >
                    {parentBlockingReason}
                  </Text>
                </>
              ) : null}
            </View>
          );
        },
      },
      {
        key: "expiry",
        header: "Expiry",
        flex: 1,
        render: (r) => (
          <Text>
            {expiryDisplay(
              r.expiryDate,
              r.certificateRequiresExpiry,
              formatDate,
            )}
          </Text>
        ),
      },
      {
        key: "issuer",
        header: "Source / Issuer",
        flex: 1.4,
        render: (r) => (
          <>
            <Text>{r.issuer ?? "Issuer pending"}</Text>
            <Text className="mt-1 text-[11px] text-muted">
              {r.parentCertificateName
                ? `Child of ${r.parentCertificateName}`
                : sourceReferenceLabel({
                    convention: r.certificateConvention,
                    sourceReference: r.certificateSourceReference,
                    variantFlag: r.certificateVariantFlag,
                  })}
            </Text>
          </>
        ),
      },
    );

    return cols;
  }, [projectId, props.showVesselColumn, router]);

  return (
    <DataTable<CertificateDto>
      title={props.title}
      subtitleRight={props.subtitleRight}
      headerActions={props.headerActions}
      toolbarContent={props.toolbarContent}
      data={rows}
      isLoading={props.isLoading}
      error={props.error}
      onRetry={props.onRetry}
      columns={columns}
      minWidth={props.minWidth ?? (props.showVesselColumn ? 1080 : 920)}
      getRowId={(r) => r.id}
      onRowPress={props.onRowPress}
      emptyText="No certificates found."
      selectedRowId={props.selectedRowId ?? null}
      pagination={props.pagination}
    />
  );
}


