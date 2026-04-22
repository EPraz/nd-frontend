import type { AssetDto } from "@/src/contracts/assets.contract";
import { useMemo, useState } from "react";
import { useVessels } from "./useVessels";

export type VesselsSortKey = "NAME_ASC";

export type VesselsPageStats = {
  total: number;

  withProfile: number;
  withIMO: number;
  withLicense: number;

  withFlag: number;
  missingFlag: number;
};

export type VesselsPageData = {
  raw: AssetDto[];
  stats: VesselsPageStats;
  list: AssetDto[];

  sort: VesselsSortKey;
  setSort: (v: VesselsSortKey) => void;

  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

export function useVesselsPageData(projectId: string): VesselsPageData {
  const { vessels, loading, error, refresh } = useVessels(projectId);

  const [sort, setSort] = useState<VesselsSortKey>("NAME_ASC");

  const computed = useMemo(() => {
    const rawAll = vessels ?? [];
    const raw = rawAll.filter((a) => a.type === "VESSEL");

    let withProfile = 0;
    let withIMO = 0;
    let withLicense = 0;

    let withFlag = 0;
    let missingFlag = 0;

    for (const a of raw) {
      if (a.vessel) {
        withProfile += 1;

        if (a.vessel.identifierType === "IMO" && a.vessel.imo) withIMO += 1;
        if (a.vessel.identifierType === "LICENSE" && a.vessel.licenseNumber)
          withLicense += 1;

        if (a.vessel.flag) withFlag += 1;
        else missingFlag += 1;
      } else {
        // sin perfil => cuenta como missing
        missingFlag += 1;
      }
    }

    const stats: VesselsPageStats = {
      total: raw.length,
      withProfile,
      withIMO,
      withLicense,
      withFlag,
      missingFlag,
    };

    const list = raw.slice().sort((a, b) => {
      if (sort === "NAME_ASC") return a.name.localeCompare(b.name);
      return 0;
    });

    return { raw, stats, list };
  }, [vessels, sort]);

  return {
    raw: computed.raw,
    stats: computed.stats,
    list: computed.list,

    sort,
    setSort,

    isLoading: loading,
    error,
    refetch: refresh,
  };
}
