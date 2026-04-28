import { useCallback, useEffect, useState } from "react";
import type { PaginationRequest } from "@/src/contracts/pagination.contract";
import {
  fetchCrewCertificateRequirementPageByProject,
  fetchCrewCertificateRequirementsByProject,
} from "../api/crewCertificates.api";
import type {
  CrewCertificateRequirementDto,
  CrewCertificateRequirementListStatsDto,
  CrewCertificateRequirementPageDto,
} from "../contracts";

type CrewCertificateRequirementPageOptions = PaginationRequest & {
  sort?: string;
  search?: string;
  status?: string;
  assetId?: string;
  crewState?: string;
};

export function useCrewCertificateRequirementsByProject(
  projectId: string,
  options?: CrewCertificateRequirementPageOptions,
) {
  const page = options?.page;
  const pageSize = options?.pageSize;
  const sort = options?.sort;
  const search = options?.search;
  const status = options?.status;
  const assetId = options?.assetId;
  const crewState = options?.crewState;
  const [requirements, setRequirements] = useState<CrewCertificateRequirementDto[]>([]);
  const [pagination, setPagination] = useState<
    CrewCertificateRequirementPageDto["meta"] | null
  >(null);
  const [stats, setStats] =
    useState<CrewCertificateRequirementListStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);

    try {
      if (page !== undefined && pageSize !== undefined) {
        const data = await fetchCrewCertificateRequirementPageByProject(
          projectId,
          {
            page,
            pageSize,
            sort,
            search,
            status,
            assetId,
            crewState,
          },
        );
        setRequirements(data.items);
        setPagination(data.meta);
        setStats(data.stats);
      } else {
        const data = await fetchCrewCertificateRequirementsByProject(projectId);
        setRequirements(data);
        setPagination(null);
        setStats(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setRequirements([]);
      setPagination(null);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, page, pageSize, sort, search, status, assetId, crewState]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { requirements, pagination, stats, loading, error, refresh };
}
