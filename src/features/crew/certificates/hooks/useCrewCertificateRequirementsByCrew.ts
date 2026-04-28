import { useCallback, useEffect, useState } from "react";
import type { PaginationRequest } from "@/src/contracts/pagination.contract";
import {
  fetchCrewCertificateRequirementPageByCrew,
  fetchCrewCertificateRequirementsByCrew,
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
};

export function useCrewCertificateRequirementsByCrew(
  projectId: string,
  assetId: string,
  crewId: string,
  options?: CrewCertificateRequirementPageOptions,
) {
  const page = options?.page;
  const pageSize = options?.pageSize;
  const [requirements, setRequirements] = useState<CrewCertificateRequirementDto[]>([]);
  const [pagination, setPagination] = useState<
    CrewCertificateRequirementPageDto["meta"] | null
  >(null);
  const [stats, setStats] =
    useState<CrewCertificateRequirementListStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !assetId || !crewId) return;
    setLoading(true);
    setError(null);

    try {
      if (page !== undefined && pageSize !== undefined) {
        const data = await fetchCrewCertificateRequirementPageByCrew(
          projectId,
          assetId,
          crewId,
          {
            page,
            pageSize,
            sort: options?.sort,
            search: options?.search,
            status: options?.status,
          },
        );
        setRequirements(data.items);
        setPagination(data.meta);
        setStats(data.stats);
      } else {
        const data = await fetchCrewCertificateRequirementsByCrew(projectId, assetId, crewId);
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
  }, [projectId, assetId, crewId, page, pageSize, options?.sort, options?.search, options?.status]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { requirements, pagination, stats, loading, error, refresh };
}
