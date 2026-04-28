import { useMemo } from "react";
import type { CrewDto, CrewListStatsDto, CrewSortOption } from "../contracts";
import { useCrewByProject } from "./useCrewByProject";

type CrewPageDataOptions = {
  page: number;
  pageSize: number;
  sort?: CrewSortOption;
  search?: string;
  status?: string;
  assetId?: string;
  department?: string;
  medicalState?: string;
  dateWindow?: string;
  dateFrom?: string;
  dateTo?: string;
};

export function useCrewPageData(
  projectId: string,
  options?: CrewPageDataOptions,
) {
  const { crew, pagination, stats, loading, error, refresh } = useCrewByProject(
    projectId,
    options,
  );

  const fallbackStats = useMemo<CrewListStatsDto>(() => {
    const vesselSet = new Set<string>();
    let active = 0;
    let inactive = 0;
    let vacationDueNext30Days = 0;
    let medicalAttention = 0;
    const now = Date.now();
    const in30Days = now + 30 * 24 * 60 * 60 * 1000;

    for (const m of crew ?? []) {
      vesselSet.add(m.assetId);
      if (m.status === "ACTIVE") active += 1;
      else inactive += 1;

      if (m.medicalCertificateValid !== true) {
        medicalAttention += 1;
      }

      if (!m.nextVacationDate) continue;

      const nextVacation = new Date(m.nextVacationDate).getTime();
      if (nextVacation >= now && nextVacation <= in30Days) {
        vacationDueNext30Days += 1;
      }
    }

    return {
      total: (crew ?? []).length,
      active,
      inactive,
      vesselsWithCrew: vesselSet.size,
      vacationDueNext30Days,
      medicalAttention,
    };
  }, [crew]);

  const list = useMemo<CrewDto[]>(() => (crew ?? []).slice(), [crew]);

  return {
    stats: stats ?? fallbackStats,
    pagination,
    list,
    isLoading: loading,
    error,
    refetch: refresh,
  };
}
