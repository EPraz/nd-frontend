import type { PaginationRequest } from "@/src/contracts/pagination.contract";
import { useCallback, useEffect, useState } from "react";
import {
  fetchCrewCertificateRequirementPageByAsset,
  fetchCrewCertificateRequirementsByAsset,
} from "../api/crewCertificates.api";
import type {
  CrewCertificateRequirementDto,
  CrewCertificateRequirementListStatsDto,
  CrewCertificateRequirementPageDto,
} from "../contracts";

type CrewCertificateRequirementAssetPageOptions = PaginationRequest & {
  sort?: string;
  search?: string;
  status?: string;
  crewState?: string;
};

export function useCrewCertificateRequirementsByAsset(
  projectId: string,
  assetId: string,
  options?: CrewCertificateRequirementAssetPageOptions,
) {
  const page = options?.page;
  const pageSize = options?.pageSize;
  const sort = options?.sort;
  const search = options?.search;
  const status = options?.status;
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
    if (!projectId || !assetId) return;
    setLoading(true);
    setError(null);

    try {
      if (page !== undefined && pageSize !== undefined) {
        const data = await fetchCrewCertificateRequirementPageByAsset(
          projectId,
          assetId,
          {
            page,
            pageSize,
            sort,
            search,
            status,
            crewState,
          },
        );
        setRequirements(data.items);
        setPagination(data.meta);
        setStats(data.stats);
      } else {
        const data = await fetchCrewCertificateRequirementsByAsset(projectId, assetId);
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
  }, [projectId, assetId, page, pageSize, sort, search, status, crewState]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { requirements, pagination, stats, loading, error, refresh };
}
