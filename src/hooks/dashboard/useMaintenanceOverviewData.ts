import { useProjectData } from "@/src/context";
import { useMemo } from "react";

export type MaintenanceOverviewData = {
  total: number;
  open: number;
  inProgress: number;
  done: number;
  overdue: number;
  nextDue?: {
    title: string;
    assetName: string;
    dueDate: string;
  };
};

export function useMaintenanceOverviewData() {
  const { maintenance, loading, error, refresh } = useProjectData();

  const data = useMemo<MaintenanceOverviewData>(() => {
    let open = 0;
    let inProgress = 0;
    let done = 0;
    let overdue = 0;

    const now = Date.now();

    const upcoming = maintenance
      .filter((m) => m.dueDate && m.status !== "DONE")
      .slice()
      .sort(
        (a, b) =>
          new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime(),
      );

    for (const m of maintenance) {
      if (m.status === "OPEN") open += 1;
      if (m.status === "IN_PROGRESS") inProgress += 1;
      if (m.status === "DONE") done += 1;

      if (
        m.dueDate &&
        m.status !== "DONE" &&
        new Date(m.dueDate).getTime() < now
      ) {
        overdue += 1;
      }
    }

    const next = upcoming[0];

    return {
      total: maintenance.length,
      open,
      inProgress,
      done,
      overdue,
      nextDue: next
        ? {
            title: next.title,
            assetName: next.asset.name,
            dueDate: next.dueDate!,
          }
        : undefined,
    };
  }, [maintenance]);

  return {
    data,
    isLoading: loading.maintenance,
    error: error.maintenance,
    refetch: refresh.maintenance,
  };
}
