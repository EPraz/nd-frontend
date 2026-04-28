import { useCallback, useEffect, useState } from "react";
import { fetchCrew, fetchCrewPage } from "../api/crew.api";
import type {
  CrewDto,
  CrewListStatsDto,
  CrewPageDto,
  CrewSortOption,
} from "../contracts";

type CrewPageOptions = {
  page: number;
  pageSize: number;
  sort?: CrewSortOption;
  search?: string;
  status?: string;
  department?: string;
  medicalState?: string;
  dateWindow?: string;
  dateFrom?: string;
  dateTo?: string;
};

export function useCrewByAsset(
  projectId: string,
  assetId: string,
  options?: CrewPageOptions,
) {
  const page = options?.page;
  const pageSize = options?.pageSize;
  const sort = options?.sort;
  const [crew, setCrew] = useState<CrewDto[]>([]);
  const [pagination, setPagination] = useState<CrewPageDto["meta"] | null>(
    null,
  );
  const [stats, setStats] = useState<CrewListStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !assetId) return;
    setLoading(true);
    setError(null);
    try {
      if (page !== undefined && pageSize !== undefined) {
        const data = await fetchCrewPage(projectId, assetId, {
          page,
          pageSize,
          sort,
          search: options?.search,
          status: options?.status,
          department: options?.department,
          medicalState: options?.medicalState,
          dateWindow: options?.dateWindow,
          dateFrom: options?.dateFrom,
          dateTo: options?.dateTo,
        });
        setCrew(data.items.filter((item) => !item.isDeleted));
        setPagination(data.meta);
        setStats(data.stats);
      } else {
        const data = await fetchCrew(projectId, assetId);
        setCrew(data.filter((item) => !item.isDeleted));
        setPagination(null);
        setStats(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setCrew([]);
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
    options?.status,
    options?.department,
    options?.medicalState,
    options?.dateWindow,
    options?.dateFrom,
    options?.dateTo,
  ]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { crew, pagination, stats, loading, error, refresh };
}
