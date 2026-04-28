import { useCallback, useEffect, useState } from "react";
import type { PaginationRequest } from "@/src/contracts/pagination.contract";
import {
  fetchMaintenanceByProject,
  fetchMaintenancePageByProject,
} from "../../shared/api/maintenance.api";
import {
  MaintenanceDto,
  MaintenanceListStatsDto,
  MaintenancePageDto,
} from "../../shared/contracts";

type MaintenancePageOptions = PaginationRequest & {
  sort?: string;
  search?: string;
  status?: string;
  priority?: string;
  assetId?: string;
  dateWindow?: string;
  dateFrom?: string;
  dateTo?: string;
};

export function useMaintenanceByProject(
  projectId: string,
  options?: MaintenancePageOptions,
) {
  const page = options?.page;
  const pageSize = options?.pageSize;
  const sort = options?.sort;
  const [maintenance, setMaintenance] = useState<MaintenanceDto[]>([]);
  const [pagination, setPagination] = useState<MaintenancePageDto["meta"] | null>(
    null,
  );
  const [stats, setStats] = useState<MaintenanceListStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      if (page !== undefined && pageSize !== undefined) {
        const data = await fetchMaintenancePageByProject(projectId, {
          page,
          pageSize,
          sort,
          search: options?.search,
          status: options?.status,
          priority: options?.priority,
          assetId: options?.assetId,
          dateWindow: options?.dateWindow,
          dateFrom: options?.dateFrom,
          dateTo: options?.dateTo,
        });
        setMaintenance(data.items);
        setPagination(data.meta);
        setStats(data.stats);
      } else {
        const data = await fetchMaintenanceByProject(projectId);
        setMaintenance(data);
        setPagination(null);
        setStats(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setMaintenance([]);
      setPagination(null);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [
    projectId,
    page,
    pageSize,
    sort,
    options?.search,
    options?.status,
    options?.priority,
    options?.assetId,
    options?.dateWindow,
    options?.dateFrom,
    options?.dateTo,
  ]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { maintenance, pagination, stats, loading, error, refresh };
}
