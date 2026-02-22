import { useMemo } from "react";
import type { CrewDto } from "../contracts";
import { useCrewByProject } from "./useCrewByProject";

export function useCrewPageData(projectId: string) {
  const { crew, loading, error, refresh } = useCrewByProject(projectId);

  const stats = useMemo(() => {
    const vesselSet = new Set<string>();
    let active = 0;
    let inactive = 0;

    for (const m of crew ?? []) {
      vesselSet.add(m.assetId);
      if (m.status === "ACTIVE") active += 1;
      else inactive += 1;
    }

    return {
      total: (crew ?? []).length,
      active,
      inactive,
      vesselsWithCrew: vesselSet.size,
    };
  }, [crew]);

  const list = useMemo<CrewDto[]>(() => {
    const rows = (crew ?? []).slice();

    // ACTIVE arriba, luego por nombre
    rows.sort((a, b) => {
      if (a.status !== b.status) return a.status === "ACTIVE" ? -1 : 1;
      return a.fullName.localeCompare(b.fullName);
    });

    return rows;
  }, [crew]);

  return {
    stats,
    list,
    isLoading: loading,
    error,
    refetch: refresh,
  };
}
