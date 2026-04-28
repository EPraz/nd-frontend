import { useCallback, useEffect, useState } from "react";
import type { PaginationRequest } from "@/src/contracts/pagination.contract";
import {
  fetchCrewCertificatePageByCrew,
  fetchCrewCertificatesByCrew,
} from "../api/crewCertificates.api";
import type {
  CrewCertificateDto,
  CrewCertificateListStatsDto,
  CrewCertificatePageDto,
} from "../contracts";

type CrewCertificatePageOptions = PaginationRequest & {
  sort?: string;
  search?: string;
  status?: string;
  workflowStatus?: string;
  dateWindow?: string;
  dateFrom?: string;
  dateTo?: string;
};

export function useCrewCertificatesByCrew(
  projectId: string,
  assetId: string,
  crewId: string,
  options?: CrewCertificatePageOptions,
) {
  const page = options?.page;
  const pageSize = options?.pageSize;
  const [certificates, setCertificates] = useState<CrewCertificateDto[]>([]);
  const [pagination, setPagination] = useState<CrewCertificatePageDto["meta"] | null>(
    null,
  );
  const [stats, setStats] = useState<CrewCertificateListStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !assetId || !crewId) {
      setCertificates([]);
      setLoading(false);
      setError("Missing route parameters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (page !== undefined && pageSize !== undefined) {
        const data = await fetchCrewCertificatePageByCrew(projectId, assetId, crewId, {
          page,
          pageSize,
          sort: options?.sort,
          search: options?.search,
          status: options?.status,
          workflowStatus: options?.workflowStatus,
          dateWindow: options?.dateWindow,
          dateFrom: options?.dateFrom,
          dateTo: options?.dateTo,
        });
        setCertificates(data.items.filter((item) => !item.isDeleted));
        setPagination(data.meta);
        setStats(data.stats);
      } else {
        const data = await fetchCrewCertificatesByCrew(projectId, assetId, crewId);
        setCertificates(data.filter((item) => !item.isDeleted));
        setPagination(null);
        setStats(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setCertificates([]);
      setPagination(null);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [
    projectId,
    assetId,
    crewId,
    page,
    pageSize,
    options?.sort,
    options?.search,
    options?.status,
    options?.workflowStatus,
    options?.dateWindow,
    options?.dateFrom,
    options?.dateTo,
  ]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { certificates, pagination, stats, loading, error, refresh };
}
