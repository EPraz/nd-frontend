import { useMemo } from "react";
import type { PaginationRequest } from "@/src/contracts/pagination.contract";
import { MaintenanceDto, MaintenanceStatus } from "../../shared/contracts";
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
  pagination: ReturnType<typeof useMaintenanceByProject>["pagination"];

  filterStatus: MaintenanceStatus | "ALL";
  sort: MaintenanceSortKey;

  setFilterStatus: (v: MaintenanceStatus | "ALL") => void;
  setSort: (v: MaintenanceSortKey) => void;

  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

type MaintenancePageDataOptions = PaginationRequest & {
  sort?: MaintenanceSortKey;
  search?: string;
  status?: string;
  priority?: string;
  assetId?: string;
  dateWindow?: string;
  dateFrom?: string;
  dateTo?: string;
};

export function useMaintenancePageData(
  projectId: string,
  options?: MaintenancePageDataOptions,
): MaintenancePageData {
  const { maintenance, pagination, stats, loading, error, refresh } =
    useMaintenanceByProject(projectId, options);
  const filterStatus = (options?.status as MaintenanceStatus | undefined) ?? "ALL";
  const sort = options?.sort ?? "DUE_ASC";

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

    const list = raw.slice();

    return { raw, stats, list };
  }, [maintenance]);

  return {
    raw: computed.raw,
    stats: stats ?? computed.stats,
    list: computed.list,
    pagination,

    filterStatus,
    sort,
    setFilterStatus: (_value: MaintenanceStatus | "ALL") => undefined,
    setSort: (_value: MaintenanceSortKey) => undefined,

    isLoading: loading,
    error,
    refetch: refresh,
  };
}
