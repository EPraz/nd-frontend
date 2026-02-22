import { Column, DataTable, TableLink, Text } from "@/src/components";
import { formatDate } from "@/src/helpers";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { CertificateDto } from "../../contracts";
import { CertificateStatusPill } from "./certificates.ui";

type Props = {
  title: string;
  subtitleRight?: string;

  data: CertificateDto[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;

  minWidth?: number;
  onRowPress?: (row: CertificateDto) => void;

  showVesselColumn?: boolean;
  sortByExpiry?: boolean;
  selectedRowId?: string | null;
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
          <TableLink
            tooltip="View certificate details"
            onPress={() =>
              router.push(
                `/projects/${projectId}/vessels/${r.assetId}/certificates/${r.id}`,
              )
            }
          >
            {r.name}
          </TableLink>
        ),
      },
    ];

    if (props.showVesselColumn) {
      cols.push({
        key: "vessel",
        header: "Vessel",
        flex: 2,
        render: (r) => (
          <TableLink
            tooltip="View certificate details"
            onPress={() =>
              router.push(`/projects/${projectId}/vessels/${r.assetId}`)
            }
          >
            {r.assetName ?? r.assetId}
          </TableLink>
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
  }, [props.showVesselColumn]);

  return (
    <DataTable<CertificateDto>
      title={props.title}
      subtitleRight={props.subtitleRight}
      data={rows}
      isLoading={props.isLoading}
      error={props.error}
      onRetry={props.onRetry}
      columns={columns}
      minWidth={props.minWidth ?? (props.showVesselColumn ? 860 : 720)}
      getRowId={(r) => r.id}
      onRowPress={props.onRowPress}
      emptyText="No certificates found."
      selectedRowId={props.selectedRowId ?? null}
    />
  );
}
