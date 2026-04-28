import {
  DataTable,
  type Column,
  type DataTableProps,
} from "@/src/components/ui/table/DataTable";
import { TableLink } from "@/src/components/ui/table/TableLink";
import { Text } from "@/src/components/ui/text/Text";
import { formatDate } from "@/src/helpers";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import type { CertificateDto } from "@/src/features/certificates/shared";
import {
  CertificateStatusPill,
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
                ? `${r.certificateCode} • ${r.number}`
                : r.certificateCode}
            </Text>
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
        render: (r) => (
          <RequirementStatusPill status={r.requirementStatus ?? null} />
        ),
      },
      {
        key: "expiry",
        header: "Expiry",
        flex: 1,
        render: (r) => <Text>{formatDate(r.expiryDate)}</Text>,
      },
      {
        key: "issuer",
        header: "Issuer",
        flex: 1,
        render: (r) => <Text>{r.issuer ?? "—"}</Text>,
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


