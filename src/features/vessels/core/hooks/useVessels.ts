import { fetchAssets, fetchAssetsPage } from "@/src/api/assets.api";
import type {
  AssetDto,
  AssetListStatsDto,
  AssetPageDto,
} from "@/src/contracts/assets.contract";
import { useCallback, useEffect, useState } from "react";

type VesselsPageOptions = {
  page: number;
  pageSize: number;
  sort?: string;
  search?: string;
  status?: string;
  profileState?: string;
  flag?: string;
};

export function useVessels(projectId: string, options?: VesselsPageOptions) {
  const page = options?.page;
  const pageSize = options?.pageSize;
  const sort = options?.sort;
  const search = options?.search;
  const status = options?.status;
  const profileState = options?.profileState;
  const flag = options?.flag;
  const [vessels, setVessels] = useState<AssetDto[]>([]);
  const [pagination, setPagination] = useState<AssetPageDto["meta"] | null>(
    null,
  );
  const [stats, setStats] = useState<AssetListStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      if (page !== undefined && pageSize !== undefined) {
        const data = await fetchAssetsPage(projectId, "VESSEL", {
          page,
          pageSize,
          sort,
          search,
          status,
          profileState,
          flag,
        });
        setVessels(data.items.filter((item) => !item.isDeleted));
        setPagination(data.meta);
        setStats(data.stats);
      } else {
        const data = await fetchAssets(projectId, "VESSEL");
        setVessels(data.filter((item) => !item.isDeleted));
        setPagination(null);
        setStats(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setVessels([]);
      setPagination(null);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, page, pageSize, sort, search, status, profileState, flag]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { vessels, pagination, stats, loading, error, refresh };
}
