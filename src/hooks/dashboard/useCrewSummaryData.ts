import { useProjectData } from "@/src/context/ProjectDataProvider";
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
  const { vessels, crew, loading, error, refresh } = useProjectData();

  const data = useMemo<CrewSummaryData>(() => {
    let active = 0;
    let inactive = 0;

    const vesselMap = new Map<
      string,
      { assetName: string; activeCount: number }
    >();

    for (const vessel of vessels) {
      vesselMap.set(vessel.id, {
        assetName: vessel.name,
        activeCount: 0,
      });
    }

    for (const member of crew) {
      if (!vesselMap.has(member.assetId)) {
        vesselMap.set(member.assetId, {
          assetName: member.asset?.name ?? member.assetName ?? member.assetId,
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

    let vesselsWithoutActiveCrew = 0;

    for (const vessel of vesselMap.values()) {
      if (vessel.activeCount === 0) {
        vesselsWithoutActiveCrew += 1;
      }
    }

    const crewByVessel = Array.from(vesselMap.entries())
      .map(([assetId, value]) => ({
        assetId,
        assetName: value.assetName,
        activeCount: value.activeCount,
      }))
      .sort((a, b) => {
        if (a.activeCount !== b.activeCount) {
          return a.activeCount - b.activeCount;
        }
        return a.assetName.localeCompare(b.assetName);
      });

    return {
      total: crew.length,
      active,
      inactive,
      vesselsWithoutActiveCrew,
      crewByVessel,
    };
  }, [vessels, crew]);

  return {
    data,
    isLoading: loading.vessels || loading.crew,
    error: error.vessels ?? error.crew,
    refetch: refresh.all,
  };
}
