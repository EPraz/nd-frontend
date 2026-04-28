import { useCallback, useEffect, useState } from "react";
import type { PaginationRequest } from "@/src/contracts/pagination.contract";
import {
  fetchCrewBulkUploadSessions,
  fetchCrewBulkUploadSessionsPage,
} from "../api/crewBulkUpload.api";
import type {
  CrewBulkUploadSessionListStatsDto,
  CrewBulkUploadSessionPageDto,
  CrewBulkUploadSessionSummaryDto,
} from "../contracts/crewBulkUpload.contract";

type CrewBulkUploadSessionsOptions = PaginationRequest & {
  sort?: string;
  search?: string;
  status?: string;
  defaultAssetId?: string;
  hasCriticalIssues?: string;
};

export function useCrewBulkUploadSessions(
  projectId: string,
  options?: CrewBulkUploadSessionsOptions,
) {
  const page = options?.page;
  const pageSize = options?.pageSize;
  const sort = options?.sort;
  const search = options?.search;
  const status = options?.status;
  const defaultAssetId = options?.defaultAssetId;
  const hasCriticalIssues = options?.hasCriticalIssues;
  const [sessions, setSessions] = useState<CrewBulkUploadSessionSummaryDto[]>([]);
  const [pagination, setPagination] = useState<
    CrewBulkUploadSessionPageDto["meta"] | null
  >(null);
  const [stats, setStats] =
    useState<CrewBulkUploadSessionListStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      if (page !== undefined && pageSize !== undefined) {
        const data = await fetchCrewBulkUploadSessionsPage(projectId, {
          page,
          pageSize,
          sort,
          search,
          status,
          defaultAssetId,
          hasCriticalIssues,
        });
        setSessions(data.items);
        setPagination(data.meta);
        setStats(data.stats);
      } else {
        const data = await fetchCrewBulkUploadSessions(projectId);
        setSessions(data);
        setPagination(null);
        setStats(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setSessions([]);
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
    search,
    status,
    defaultAssetId,
    hasCriticalIssues,
  ]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { sessions, pagination, stats, loading, error, refresh };
}
