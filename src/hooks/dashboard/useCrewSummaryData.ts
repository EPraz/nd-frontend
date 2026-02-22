import { useProjectData } from "@/src/context";
import { useMemo } from "react";

export type CrewSummaryData = {
  total: number;
  active: number;
  inactive: number;
  vesselsWithoutActiveCrew: number;
  crewByVessel: {
    assetId: string;
    assetName: string;
    activeCount: number;
  }[];
};

export function useCrewSummaryData() {
  const { crew, certificates, loading, error, refresh } = useProjectData();

  const data = useMemo<CrewSummaryData>(() => {
    let active = 0;
    let inactive = 0;

    const vesselMap = new Map<
      string,
      { assetName: string; activeCount: number }
    >();

    for (const member of crew) {
      if (!vesselMap.has(member.assetId)) {
        vesselMap.set(member.assetId, {
          assetName: member.asset.name,
          activeCount: 0,
        });
      }

      if (member.status === "ACTIVE") {
        active += 1;
        vesselMap.get(member.assetId)!.activeCount += 1;
      } else {
        inactive += 1;
      }
    }

    // Detect vessels without active crew
    const vesselsFromCertificates = new Set(certificates.map((c) => c.assetId));

    let vesselsWithoutActiveCrew = 0;

    for (const vesselId of vesselsFromCertificates) {
      const vessel = vesselMap.get(vesselId);
      if (!vessel || vessel.activeCount === 0) {
        vesselsWithoutActiveCrew += 1;
      }
    }

    const crewByVessel = Array.from(vesselMap.entries())
      .map(([assetId, value]) => ({
        assetId,
        assetName: value.assetName,
        activeCount: value.activeCount,
      }))
      .sort((a, b) => b.activeCount - a.activeCount)
      .slice(0, 5);

    return {
      total: crew.length,
      active,
      inactive,
      vesselsWithoutActiveCrew,
      crewByVessel,
    };
  }, [crew, certificates]);

  return {
    data,
    isLoading: loading.crew,
    error: error.crew,
    refetch: refresh.crew,
  };
}
