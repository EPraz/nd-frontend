import type { PaginationRequest } from "@/src/contracts/pagination.contract";
import {
  fetchCertificatePageByAsset,
  fetchCertificatesByAsset,
} from "@/src/features/certificates/shared/api/certificates.api";
import { useCallback, useEffect, useState } from "react";
import {
  CertificateDto,
  CertificateListStatsDto,
  CertificatePageDto,
} from "@/src/features/certificates/shared/contracts/certificates.contract";

type CertificateAssetPageOptions = PaginationRequest & {
  sort?: string;
  search?: string;
  status?: string;
  workflowStatus?: string;
  category?: string;
  dateWindow?: string;
  dateFrom?: string;
  dateTo?: string;
};

export function useCertificatesByAsset(
  projectId: string,
  assetId: string,
  options?: CertificateAssetPageOptions,
) {
  const page = options?.page;
  const pageSize = options?.pageSize;
  const sort = options?.sort;
  const [certificates, setCertificates] = useState<CertificateDto[]>([]);
  const [pagination, setPagination] = useState<CertificatePageDto["meta"] | null>(
    null,
  );
  const [stats, setStats] = useState<CertificateListStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId || !assetId) return;
    setLoading(true);
    setError(null);
    try {
      if (page !== undefined && pageSize !== undefined) {
        const data = await fetchCertificatePageByAsset(projectId, assetId, {
          page,
          pageSize,
          sort,
          search: options?.search,
          status: options?.status,
          workflowStatus: options?.workflowStatus,
          category: options?.category,
          dateWindow: options?.dateWindow,
          dateFrom: options?.dateFrom,
          dateTo: options?.dateTo,
        });
        setCertificates(data.items.filter((certificate) => !certificate.isDeleted));
        setPagination(data.meta);
        setStats(data.stats);
      } else {
        const data = await fetchCertificatesByAsset(projectId, assetId);
        setCertificates(data.filter((certificate) => !certificate.isDeleted));
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
    page,
    pageSize,
    sort,
    options?.search,
    options?.status,
    options?.workflowStatus,
    options?.category,
    options?.dateWindow,
    options?.dateFrom,
    options?.dateTo,
  ]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { certificates, pagination, stats, loading, error, refresh };
}

