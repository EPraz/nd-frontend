import type { PaginationRequest } from "@/src/contracts/pagination.contract";
import {
  fetchCertificateRequirementPageByAsset,
  fetchCertificateRequirementsByAsset,
} from "@/src/features/certificates/shared/api/certificates.api";
import {
  CertificateRequirementDto,
  CertificateRequirementListStatsDto,
  CertificateRequirementPageDto,
} from "@/src/features/certificates/shared";
import { useCallback, useEffect, useState } from "react";

type CertificateRequirementAssetPageOptions = PaginationRequest & {
  sort?: string;
  search?: string;
  status?: string;
  category?: string;
};

export function useCertificateRequirementsByAsset(
  projectId: string,
  assetId: string,
  options?: CertificateRequirementAssetPageOptions,
) {
  const page = options?.page;
  const pageSize = options?.pageSize;
  const sort = options?.sort;
  const [requirements, setRequirements] = useState<CertificateRequirementDto[]>(
    [],
  );
  const [pagination, setPagination] = useState<
    CertificateRequirementPageDto["meta"] | null
  >(null);
  const [stats, setStats] =
    useState<CertificateRequirementListStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !assetId) {
      setRequirements([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (page !== undefined && pageSize !== undefined) {
        const data = await fetchCertificateRequirementPageByAsset(
          projectId,
          assetId,
          {
            page,
            pageSize,
            sort,
            search: options?.search,
            status: options?.status,
            category: options?.category,
          },
        );
        setRequirements(data.items);
        setPagination(data.meta);
        setStats(data.stats);
      } else {
        const data = await fetchCertificateRequirementsByAsset(projectId, assetId);
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
  }, [
    projectId,
    assetId,
    page,
    pageSize,
    sort,
    options?.search,
    options?.status,
    options?.category,
  ]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { requirements, pagination, stats, loading, error, refresh };
}

