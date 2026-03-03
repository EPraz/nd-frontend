import { useProjectData } from "@/src/context";
import { MaintenanceStatus } from "@/src/features/maintenance";
import { useMemo } from "react";

export type MaintenanceUpcomingRow = {
  id: string;
  title: string;
  assetId: string;
  assetName: string;
  dueDate: string; // siempre presente
  status: Exclude<MaintenanceStatus, "DONE"> | "OVERDUE";
};

export type MaintenanceOverviewData = {
  total: number;
  open: number;
  inProgress: number;
  done: number;
  overdue: number;

  nextDue?: {
    id: string;
    title: string;
    assetId: string;
    assetName: string;
    dueDate: string;
    status: MaintenanceUpcomingRow["status"];
  };

  /** lista para UI (cards/list/scroll) */
  upcoming: MaintenanceUpcomingRow[];
};

function rankStatus(s: MaintenanceUpcomingRow["status"]) {
  // menor = más importante
  if (s === "OVERDUE") return 0;
  if (s === "IN_PROGRESS") return 1;
  return 2; // OPEN
}

export function useMaintenanceOverviewData() {
  const { maintenance, loading, error, refresh } = useProjectData();

  const data = useMemo<MaintenanceOverviewData>(() => {
    let open = 0;
    let inProgress = 0;
    let done = 0;
    let overdue = 0;

    const now = Date.now();

    // KPIs + upcoming base
    const upcomingRaw: MaintenanceUpcomingRow[] = [];

    for (const m of maintenance) {
      if (m.status === "OPEN") open += 1;
      if (m.status === "IN_PROGRESS") inProgress += 1;
      if (m.status === "DONE") done += 1;

      if (!m.dueDate) continue;
      if (m.status === "DONE") continue;

      const dueTs = new Date(m.dueDate).getTime();
      const isOverdue = dueTs < now;

      if (isOverdue) overdue += 1;

      upcomingRaw.push({
        id: m.id,
        title: m.title,
        assetId: m.assetId,
        assetName: m.asset?.name ?? "Unknown asset",
        dueDate: m.dueDate,
        status: isOverdue ? "OVERDUE" : m.status, // OPEN | IN_PROGRESS
      });
    }

    const upcoming = upcomingRaw.slice().sort((a, b) => {
      // 1) prioridad por status
      const ra = rankStatus(a.status);
      const rb = rankStatus(b.status);
      if (ra !== rb) return ra - rb;

      // 2) por fecha (asc)
      const da = new Date(a.dueDate).getTime();
      const db = new Date(b.dueDate).getTime();
      if (da !== db) return da - db;

      // 3) estable
      return a.title.localeCompare(b.title);
    });

    const next = upcoming[0];

    return {
      total: maintenance.length,
      open,
      inProgress,
      done,
      overdue,
      nextDue: next
        ? {
            id: next.id,
            title: next.title,
            assetId: next.assetId,
            assetName: next.assetName,
            dueDate: next.dueDate,
            status: next.status,
          }
        : undefined,
      upcoming,
    };
  }, [maintenance]);

  return {
    data,
    isLoading: loading.maintenance,
    error: error.maintenance,
    refetch: refresh.maintenance,
  };
}
