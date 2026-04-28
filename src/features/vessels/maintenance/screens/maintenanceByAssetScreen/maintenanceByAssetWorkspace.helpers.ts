import type { RegistrySummaryItem } from "@/src/components/ui/registryWorkspace";
import type {
  MaintenanceDto,
  MaintenanceListStatsDto,
  MaintenanceStatus,
} from "@/src/features/maintenance/shared/contracts";

export const MAINTENANCE_STATUS_OPTIONS = [
  "ALL",
  "OPEN",
  "IN_PROGRESS",
  "DONE",
  "OVERDUE",
] as const;

export const MAINTENANCE_SORT_OPTIONS = [
  "DUE_ASC",
  "DUE_DESC",
  "TITLE_ASC",
] as const;

export type MaintenanceStatusFilter =
  | "ALL"
  | MaintenanceStatus;

export type MaintenanceSortOption =
  (typeof MAINTENANCE_SORT_OPTIONS)[number];

function isOverdue(
  dueDate: string | null,
  status: MaintenanceDto["status"],
) {
  if (!dueDate || status === "DONE") return false;

  const time = new Date(dueDate).getTime();
  if (Number.isNaN(time)) return false;

  return time < Date.now();
}

export function getMaintenanceByAssetSummaryItems(
  maintenance: MaintenanceDto[],
  stats?: MaintenanceListStatsDto | null,
): RegistrySummaryItem[] {
  const open =
    stats?.open ?? maintenance.filter((task) => task.status === "OPEN").length;
  const inProgress = stats?.inProgress ?? maintenance.filter(
    (task) => task.status === "IN_PROGRESS",
  ).length;
  const done =
    stats?.done ?? maintenance.filter((task) => task.status === "DONE").length;
  const highPriorityOpen = stats?.highPriorityOpen ?? maintenance.filter(
    (task) => task.status === "OPEN" && task.priority === "HIGH",
  ).length;

  return [
    {
      label: "Tasks in scope",
      value: String(stats?.total ?? maintenance.length),
      helper: "tracked on this vessel",
      tone: "accent",
    },
    {
      label: "Open",
      value: String(open),
      helper:
        highPriorityOpen > 0
          ? `${highPriorityOpen} high priority`
          : "pending action",
      tone: open > 0 ? "danger" : "ok",
    },
    {
      label: "In progress",
      value: String(inProgress),
      helper: "currently being worked",
      tone: inProgress > 0 ? "warn" : "ok",
    },
    {
      label: "Completed",
      value: String(done),
      helper: "finished tasks",
      tone: "ok",
    },
  ];
}

export function filterMaintenanceByStatus(
  maintenance: MaintenanceDto[],
  filterStatus: MaintenanceStatusFilter,
) {
  return maintenance.filter((task) => {
    if (filterStatus === "ALL") return true;
    if (filterStatus === "OVERDUE") {
      return isOverdue(task.dueDate, task.status);
    }
    return task.status === filterStatus;
  });
}

export function sortMaintenance(
  maintenance: MaintenanceDto[],
  sortBy: MaintenanceSortOption,
) {
  const rows = [...maintenance];

  rows.sort((a, b) => {
    if (sortBy === "TITLE_ASC") {
      return a.title.localeCompare(b.title);
    }

    const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
    const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;

    if (sortBy === "DUE_DESC") {
      return bDue - aDue;
    }

    const aOverdue = isOverdue(a.dueDate, a.status);
    const bOverdue = isOverdue(b.dueDate, b.status);

    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    return aDue - bDue;
  });

  return rows;
}
