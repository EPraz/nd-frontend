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

  // ✅ selection support
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
        render: (r) => (
          <TableLink
            tooltip="View crew profile"
            onPress={() =>
              router.push(`/projects/${pid}/vessels/${r.assetId}/crew/${r.id}`)
            }
          >
            {r.fullName}
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
            tooltip="View crew profile"
            onPress={() => router.push(`/projects/${pid}/vessels/${r.assetId}`)}
          >
            {r.assetName ?? r.assetId}
          </TableLink>
        ),
      });
    }

    cols.push(
      {
        key: "rank",
        header: "Rank",
        flex: 1,
        render: (r) => <Text>{r.rank ?? "—"}</Text>,
      },
      {
        key: "status",
        header: "Status",
        flex: 1,
        render: (r) => <CrewStatusPill status={r.status} />,
      },
      {
        key: "nationality",
        header: "Nationality",
        flex: 1,
        render: (r) => <Text>{r.nationality ?? "—"}</Text>,
      },
      {
        key: "documentId",
        header: "Document",
        flex: 1,
        render: (r) => <Text>{r.documentId ?? "—"}</Text>,
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
      minWidth={props.minWidth ?? (props.showVesselColumn ? 980 : 820)}
      getRowId={(r) => r.id}
      onRowPress={props.onRowPress}
      emptyText="No crew members found."
      // ✅ IMPORTANT
      selectedRowId={props.selectedRowId ?? null}
    />
  );
}
