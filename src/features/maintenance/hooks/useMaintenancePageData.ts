import { useMemo, useState } from "react";
import { MaintenanceDto, MaintenanceStatus } from "../contracts";
import { useMaintenanceByProject } from "./useMaintenanceByProject";

export type MaintenanceSortKey = "DUE_ASC" | "DUE_DESC" | "TITLE_ASC";

export type MaintenancePageStats = {
  total: number;
  open: number;
  inProgress: number;
  done: number;
  highPriorityOpen: number;
};

export type MaintenancePageData = {
  raw: MaintenanceDto[];
  stats: MaintenancePageStats;
  list: MaintenanceDto[];

  filterStatus: MaintenanceStatus | "ALL";
  sort: MaintenanceSortKey;

  setFilterStatus: (v: MaintenanceStatus | "ALL") => void;
  setSort: (v: MaintenanceSortKey) => void;

  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

function safeTime(iso: string | null) {
  if (!iso) return Infinity;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? Infinity : t;
}

export function useMaintenancePageData(projectId: string): MaintenancePageData {
  const { maintenance, loading, error, refresh } =
    useMaintenanceByProject(projectId);

  const [filterStatus, setFilterStatus] = useState<MaintenanceStatus | "ALL">(
    "ALL",
  );

  const [sort, setSort] = useState<MaintenanceSortKey>("DUE_ASC");

  const computed = useMemo(() => {
    const raw = maintenance ?? [];

    // ---- stats
    let open = 0;
    let inProgress = 0;
    let done = 0;
    let highPriorityOpen = 0;

    for (const m of raw) {
      if (m.status === "OPEN") {
        open += 1;
        if (m.priority === "HIGH") {
          highPriorityOpen += 1;
        }
      }

      if (m.status === "IN_PROGRESS") {
        inProgress += 1;
      }

      if (m.status === "DONE") {
        done += 1;
      }
    }

    const stats: MaintenancePageStats = {
      total: raw.length,
      open,
      inProgress,
      done,
      highPriorityOpen,
    };

    // ---- filter
    const filtered =
      filterStatus === "ALL"
        ? raw
        : raw.filter((m) => m.status === filterStatus);

    // ---- sort
    const list = filtered.slice().sort((a, b) => {
      if (sort === "TITLE_ASC") {
        return a.title.localeCompare(b.title);
      }

      const ta = safeTime(a.dueDate);
      const tb = safeTime(b.dueDate);

      if (sort === "DUE_DESC") return tb - ta;
      return ta - tb; // DUE_ASC default
    });

    return { raw, stats, list };
  }, [maintenance, filterStatus, sort]);

  return {
    raw: computed.raw,
    stats: computed.stats,
    list: computed.list,

    filterStatus,
    sort,
    setFilterStatus,
    setSort,

    isLoading: loading,
    error,
    refetch: refresh,
  };
}
