import { useCallback, useEffect, useState } from "react";
import type { PaginationRequest } from "@/src/contracts/pagination.contract";
import { fetchFuelLog, fetchFuelLogPage } from "../../shared/api/fuel.api";
import { FuelDto, FuelListStatsDto, FuelPageDto } from "../../shared/contracts";

type FuelAssetPageOptions = PaginationRequest & {
  sort?: string;
  search?: string;
  eventType?: string;
  fuelType?: string;
  dateWindow?: string;
  dateFrom?: string;
  dateTo?: string;
  hasCriticalGap?: string;
};

export function useFuelByAsset(
  projectId: string,
  assetId: string,
  options?: FuelAssetPageOptions,
) {
  const page = options?.page;
  const pageSize = options?.pageSize;
  const sort = options?.sort;
  const [fuelLogs, setFuelLogs] = useState<FuelDto[]>([]);
  const [pagination, setPagination] = useState<FuelPageDto["meta"] | null>(
    null,
  );
  const [stats, setStats] = useState<FuelListStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !assetId) return;
    setLoading(true);
    setError(null);
    try {
      if (page !== undefined && pageSize !== undefined) {
        const data = await fetchFuelLogPage(projectId, assetId, {
          page,
          pageSize,
          sort,
          search: options?.search,
          eventType: options?.eventType,
          fuelType: options?.fuelType,
          dateWindow: options?.dateWindow,
          dateFrom: options?.dateFrom,
          dateTo: options?.dateTo,
          hasCriticalGap: options?.hasCriticalGap,
        });
        setFuelLogs(data.items);
        setPagination(data.meta);
        setStats(data.stats);
      } else {
        const data = await fetchFuelLog(projectId, assetId);
        setFuelLogs(data);
        setPagination(null);
        setStats(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setFuelLogs([]);
      setPagination(null);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [
    projectId,
    assetId,
    page,
    pageSize,
    sort,
    options?.search,
    options?.eventType,
    options?.fuelType,
    options?.dateWindow,
    options?.dateFrom,
    options?.dateTo,
    options?.hasCriticalGap,
  ]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { fuelLogs, pagination, stats, loading, error, refresh };
}
