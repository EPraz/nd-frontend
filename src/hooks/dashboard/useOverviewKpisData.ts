import { useProjectData } from "@/src/context";
import { CertificateDto } from "@/src/features/certificates/contracts/certificates.contract";
import { useMemo } from "react";

export type OverviewKpisData = {
  totalVessels: number;
  certificates: {
    total: number;
    valid: number;
    expiringSoon: number;
    expired: number;
    pending: number;
  };
  crewActive: number;
  criticalAlerts: number;
  certificatesList: CertificateDto[]; // 👈 agregar esto
};

export function useOverviewKpisData() {
  const { certificates, crew, loading, error, refresh } = useProjectData();

  const data = useMemo<OverviewKpisData>(() => {
    const vesselSet = new Set<string>();
    let valid = 0;
    let expiringSoon = 0;
    let expired = 0;
    let pending = 0;

    for (const c of certificates) {
      vesselSet.add(c.assetId);

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

    const crewActive = crew.reduce(
      (acc, m) => acc + (m.status === "ACTIVE" ? 1 : 0),
      0,
    );

    return {
      totalVessels: vesselSet.size,
      certificates: {
        total: certificates.length,
        valid,
        expiringSoon,
        expired,
        pending,
      },
      crewActive,
      criticalAlerts: expired + expiringSoon,
      certificatesList: certificates
        .slice()
        .sort((a, b) => {
          const da = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
          const db = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
          return da - db;
        })
        .slice(0, 10),
    };
  }, [certificates, crew]);

  return {
    data,
    isLoading: loading.certificates || loading.crew, // MVP: depende de ambos
    error: error.certificates ?? error.crew,
    refetch: refresh.all,
  };
}
