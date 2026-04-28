import type { PaginationRequest } from "@/src/contracts/pagination.contract";
import { useCallback, useEffect, useState } from "react";
import { fetchCrewBulkUploadSessionRowsPage } from "../api/crewBulkUpload.api";
import type {
  CrewBulkUploadRowDto,
  CrewBulkUploadRowPageDto,
  CrewBulkUploadRowPageStatsDto,
} from "../contracts/crewBulkUpload.contract";

type CrewBulkUploadSessionRowsOptions = PaginationRequest & {
  sort?: string;
  search?: string;
  rowKind?: string;
  proposedAction?: string;
  commitStatus?: string;
  issueSeverity?: string;
};

export function useCrewBulkUploadSessionRows(
  projectId: string,
  sessionId: string,
  options: CrewBulkUploadSessionRowsOptions,
) {
  const page = options.page;
  const pageSize = options.pageSize;
  const sort = options.sort;
  const search = options.search;
  const rowKind = options.rowKind;
  const proposedAction = options.proposedAction;
  const commitStatus = options.commitStatus;
  const issueSeverity = options.issueSeverity;
  const [rows, setRows] = useState<CrewBulkUploadRowDto[]>([]);
  const [pagination, setPagination] = useState<CrewBulkUploadRowPageDto["meta"] | null>(
    null,
  );
  const [stats, setStats] = useState<CrewBulkUploadRowPageStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !sessionId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchCrewBulkUploadSessionRowsPage(projectId, sessionId, {
        page,
        pageSize,
        sort,
        search,
        rowKind,
        proposedAction,
        commitStatus,
        issueSeverity,
      });
      setRows(data.items);
      setPagination(data.meta);
      setStats(data.stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setRows([]);
      setPagination(null);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [
    projectId,
    sessionId,
    page,
    pageSize,
    sort,
    search,
    rowKind,
    proposedAction,
    commitStatus,
    issueSeverity,
  ]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { rows, pagination, stats, loading, error, refresh };
}
