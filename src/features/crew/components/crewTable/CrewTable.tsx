import { Column, DataTable, TableLink, Text } from "@/src/components";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { CrewDto } from "../../contracts";
import { CrewStatusPill } from "./crew.ui";

type Props = {
  title: string;
  subtitleRight?: string;
  data: CrewDto[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  minWidth?: number;
  onRowPress?: (row: CrewDto) => void;
  showVesselColumn?: boolean;
  sortByName?: boolean;
  selectedRowId?: string | null;
};

export function CrewTable(props: Props) {
  const router = useRouter();
  const { projectId } = useLocalSearchParams();
  const pid = String(projectId);

  const rows = useMemo(() => {
    const arr = [...props.data];

    if (props.sortByName ?? true) {
      arr.sort((a, b) => a.fullName.localeCompare(b.fullName));
    }

    return arr;
  }, [props.data, props.sortByName]);

  const columns = useMemo<Column<CrewDto>[]>(() => {
    const cols: Column<CrewDto>[] = [
      {
        key: "name",
        header: "Crew Member",
        flex: 2,
        render: (row) => (
          <TableLink
            tooltip="View crew profile"
            onPress={() =>
              router.push(`/projects/${pid}/vessels/${row.assetId}/crew/${row.id}`)
            }
          >
            {row.fullName}
          </TableLink>
        ),
      },
    ];

    if (props.showVesselColumn) {
      cols.push({
        key: "vessel",
        header: "Vessel",
        flex: 2,
        render: (row) => (
          <TableLink
            tooltip="Open vessel"
            onPress={() => router.push(`/projects/${pid}/vessels/${row.assetId}`)}
          >
            {row.assetName ?? row.assetId}
          </TableLink>
        ),
      });
    }

    cols.push(
      {
        key: "rank",
        header: "Rank",
        flex: 1.5,
        render: (row) => <Text>{row.rank ?? "-"}</Text>,
      },
      {
        key: "department",
        header: "Department",
        flex: 1,
        render: (row) => <Text>{row.department ?? "-"}</Text>,
      },
      {
        key: "status",
        header: "Status",
        flex: 1,
        render: (row) => (
          <CrewStatusPill
            status={row.status}
            inactiveReason={row.inactiveReason}
          />
        ),
      },
      {
        key: "medical",
        header: "Medical",
        flex: 1,
        render: (row) => (
          <Text>
            {row.medicalCertificateValid === null
              ? "Unknown"
              : row.medicalCertificateValid
                ? "Valid"
                : "Not valid"}
          </Text>
        ),
      },
    );

    return cols;
  }, [router, pid, props.showVesselColumn]);

  return (
    <DataTable<CrewDto>
      title={props.title}
      subtitleRight={props.subtitleRight}
      data={rows}
      isLoading={props.isLoading}
      error={props.error}
      onRetry={props.onRetry}
      columns={columns}
      minWidth={props.minWidth ?? (props.showVesselColumn ? 1080 : 900)}
      getRowId={(row) => row.id}
      onRowPress={props.onRowPress}
      emptyText="No crew members found."
      selectedRowId={props.selectedRowId ?? null}
    />
  );
}
