import {
  fetchCertificateRequirementPageByProject,
  fetchCertificateRequirementsByProject,
} from "@/src/features/certificates/shared/api/certificates.api";
import type { PaginationRequest } from "@/src/contracts/pagination.contract";
import {
  CertificateRequirementDto,
  CertificateRequirementListStatsDto,
  CertificateRequirementPageDto,
} from "@/src/features/certificates/shared";
import { useCallback, useEffect, useState } from "react";

type CertificateRequirementPageOptions = PaginationRequest & {
  sort?: string;
  search?: string;
  status?: string;
  assetId?: string;
  category?: string;
};

export function useCertificateRequirementsByProject(
  projectId: string,
  options?: CertificateRequirementPageOptions,
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
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      if (page !== undefined && pageSize !== undefined) {
        const data = await fetchCertificateRequirementPageByProject(projectId, {
          page,
          pageSize,
          sort,
          search: options?.search,
          status: options?.status,
          assetId: options?.assetId,
          category: options?.category,
        });
        setRequirements(data.items);
        setPagination(data.meta);
        setStats(data.stats);
      } else {
        const data = await fetchCertificateRequirementsByProject(projectId);
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
    page,
    pageSize,
    sort,
    options?.search,
    options?.status,
    options?.assetId,
    options?.category,
  ]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { requirements, pagination, stats, loading, error, refresh };
}

