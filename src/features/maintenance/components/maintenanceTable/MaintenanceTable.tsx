import { Column, DataTable, TableLink, Text } from "@/src/components";
import { formatDate } from "@/src/helpers";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import type { MaintenanceDto } from "../../contracts";
import {
  MaintenancePriorityPill,
  MaintenanceStatusPill,
} from "./maintenance.ui";

type Props = {
  title: string;
  subtitleRight?: string;

  data: MaintenanceDto[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;

  minWidth?: number;
  onRowPress?: (row: MaintenanceDto) => void;

  showVesselColumn?: boolean;
  sortByDueDate?: boolean;
  selectedRowId?: string | null;
};

function isOverdue(dueDate: string | null, status: MaintenanceDto["status"]) {
  if (!dueDate) return false;
  if (status === "DONE") return false;

  const t = new Date(dueDate).getTime();
  if (Number.isNaN(t)) return false;

  return t < Date.now();
}

export function MaintenanceTable(props: Props) {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const pid = String(projectId);

  const rows = useMemo(() => {
    if (!props.sortByDueDate) return props.data;

    const arr = [...props.data];
    arr.sort((a, b) => {
      const aOver = isOverdue(a.dueDate, a.status);
      const bOver = isOverdue(b.dueDate, b.status);

      if (aOver && !bOver) return -1;
      if (!aOver && bOver) return 1;

      const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;

      return da - db;
    });

    return arr;
  }, [props.data, props.sortByDueDate]);

  const columns = useMemo<Column<MaintenanceDto>[]>(() => {
    const cols: Column<MaintenanceDto>[] = [
      {
        key: "title",
        header: "Task",
        flex: 2,
        render: (r) => (
          <TableLink
            tooltip="View maintenance task"
            onPress={() =>
              router.push(
                `/projects/${pid}/vessels/${r.assetId}/maintenance/${r.id}`,
              )
            }
          >
            {r.title}
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
            tooltip="View maintenance task"
            onPress={() => router.push(`/projects/${pid}/vessels/${r.assetId}`)}
          >
            {r.asset?.name ?? r.assetId}
          </TableLink>
        ),
      });
    }

    cols.push(
      {
        key: "priority",
        header: "Priority",
        flex: 1,
        render: (r) => <MaintenancePriorityPill priority={r.priority} />,
      },
      {
        key: "status",
        header: "Status",
        flex: 1,
        render: (r) => (
          <MaintenanceStatusPill
            status={r.status}
            overdue={isOverdue(r.dueDate, r.status)}
          />
        ),
      },
      {
        key: "due",
        header: "Due Date",
        flex: 1,
        render: (r) => <Text>{formatDate(r.dueDate)}</Text>,
      },
    );

    return cols;
  }, [router, pid, props.showVesselColumn]);

  return (
    <DataTable<MaintenanceDto>
      title={props.title}
      subtitleRight={props.subtitleRight}
      data={rows}
      isLoading={props.isLoading}
      error={props.error}
      onRetry={props.onRetry}
      columns={columns}
      minWidth={props.minWidth ?? (props.showVesselColumn ? 900 : 760)}
      getRowId={(r) => r.id}
      onRowPress={props.onRowPress}
      emptyText="No maintenance tasks found."
      selectedRowId={props.selectedRowId ?? null}
    />
  );
}
