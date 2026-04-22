import { useProjectData } from "@/src/context/ProjectDataProvider";
import { CertificateDto } from "@/src/features/certificates/shared/contracts/certificates.contract";
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
  const { vessels, certificates, crew, loading, error, refresh } =
    useProjectData();

  const data = useMemo<OverviewKpisData>(() => {
    let valid = 0;
    let expiringSoon = 0;
    let expired = 0;
    let pending = 0;

    for (const c of certificates) {
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
      totalVessels: vessels.length,
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
  }, [certificates, crew, vessels]);

  return {
    data,
    isLoading: loading.vessels || loading.certificates || loading.crew,
    error: error.vessels ?? error.certificates ?? error.crew,
    refetch: refresh.all,
  };
}
