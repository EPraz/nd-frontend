import { useProjectData } from "@/src/context";
import { useMemo } from "react";

export type VesselListRow = {
  assetId: string;
  assetName: string;
  totalCertificates: number;
  expired: number;
  expiringSoon: number;
  crewActive: number;
  status: "OK" | "WARNING" | "CRITICAL";
};

export function useVesselsListData() {
  const { certificates, crew, loading, error, refresh } = useProjectData();

  const data = useMemo<VesselListRow[]>(() => {
    const map = new Map<string, VesselListRow>();

    for (const c of certificates) {
      if (!map.has(c.assetId)) {
        map.set(c.assetId, {
          assetId: c.assetId,
          assetName: c.assetName,
          totalCertificates: 0,
          expired: 0,
          expiringSoon: 0,
          crewActive: 0,
          status: "OK",
        });
      }

      const row = map.get(c.assetId)!;

      row.totalCertificates += 1;

      if (c.status === "EXPIRED") row.expired += 1;
      if (c.status === "EXPIRING_SOON") row.expiringSoon += 1;
    }

    for (const member of crew) {
      const row = map.get(member.assetId);
      if (!row) continue;

      if (member.status === "ACTIVE") row.crewActive += 1;
    }

    for (const row of map.values()) {
      if (row.expired > 0) row.status = "CRITICAL";
      else if (row.expiringSoon > 0) row.status = "WARNING";
      else row.status = "OK";
    }

    return Array.from(map.values());
  }, [certificates, crew]);

  return {
    data,
    isLoading: loading.certificates || loading.crew,
    error: error.certificates ?? error.crew,
    refetch: refresh.all,
  };
}
