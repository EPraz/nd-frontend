import type {
  CertificateDto,
  CertificateStatus,
} from "@/src/features/certificates/contracts/certificates.contract";
import { useMemo, useState } from "react";
import { useCertificatesByProject } from "./useCertificatesByProject";

export type CertificatesSortKey = "EXPIRY_ASC" | "EXPIRY_DESC" | "NAME_ASC";

export type CertificatesPageStats = {
  total: number;
  valid: number;
  expiringSoon: number;
  expired: number;
  pending: number;
  critical: number; // expired + expiringSoon
};

export type CertificatesPageData = {
  // raw
  raw: CertificateDto[];

  // computed
  stats: CertificatesPageStats;
  list: CertificateDto[];

  // UI state (MVP)
  filterStatus: CertificateStatus | "ALL";
  sort: CertificatesSortKey;

  // actions
  setFilterStatus: (v: CertificateStatus | "ALL") => void;
  setSort: (v: CertificatesSortKey) => void;

  // network
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

function safeTime(iso: string | null) {
  if (!iso) return Infinity;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? Infinity : t;
}

export function useCertificatesPageData(
  projectId: string,
): CertificatesPageData {
  const { certificates, loading, error, refresh } =
    useCertificatesByProject(projectId);

  // MVP state (después lo conectas a dropdowns)
  const [filterStatus, setFilterStatus] = useState<CertificateStatus | "ALL">(
    "ALL",
  );
  const [sort, setSort] = useState<CertificatesSortKey>("EXPIRY_ASC");

  const computed = useMemo(() => {
    const raw = certificates ?? [];

    // ---- stats
    let valid = 0;
    let expiringSoon = 0;
    let expired = 0;
    let pending = 0;

    for (const c of raw) {
      switch (c.status) {
        case "VALID":
          valid += 1;
          break;
        case "EXPIRING_SOON":
          expiringSoon += 1;
          break;
        case "EXPIRED":
          expired += 1;
          break;
        case "PENDING":
          pending += 1;
          break;
      }
    }

    const stats: CertificatesPageStats = {
      total: raw.length,
      valid,
      expiringSoon,
      expired,
      pending,
      critical: expired + expiringSoon,
    };

    // ---- filter
    const filtered =
      filterStatus === "ALL"
        ? raw
        : raw.filter((c) => c.status === filterStatus);

    // ---- sort
    const list = filtered.slice().sort((a, b) => {
      if (sort === "NAME_ASC") {
        return a.name.localeCompare(b.name);
      }

      const ta = safeTime(a.expiryDate);
      const tb = safeTime(b.expiryDate);

      if (sort === "EXPIRY_DESC") return tb - ta;
      return ta - tb; // EXPIRY_ASC default
    });

    return { raw, stats, list };
  }, [certificates, filterStatus, sort]);

  return {
    raw: computed.raw,
    stats: computed.stats,
    list: computed.list,

    filterStatus,
    sort,
    setFilterStatus,
    setSort,

    isLoading: loading,
    error,
    refetch: refresh,
  };
}
