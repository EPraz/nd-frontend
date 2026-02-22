import { useMemo, useState } from "react";
import { FuelDto, FuelEventType, FuelType, FuelUnit } from "../contracts";
import { useFuelByProject } from "./useFuelByProject";

export type FuelSortKey = "DATE_DESC" | "DATE_ASC" | "QTY_DESC";

export type FuelTypeSummary = {
  unit: FuelUnit;
  bunkeredQty: string;
  consumedQty: string;
  netQty: string;
  events: number;
};

export type FuelPageStats = {
  total: number;

  bunkered: number;
  consumed: number;
  transferred: number;
  adjustments: number;

  unit: FuelUnit;
  bunkeredQty: string;
  consumedQty: string;

  critical: number; // missing price OR missing location
};

export type FuelPageData = {
  raw: FuelDto[];

  stats: FuelPageStats;
  list: FuelDto[];

  // ✅ upgrades
  balancesByVessel: Record<string, { unit: FuelUnit; net: string }>;
  summaryByFuelType: Record<FuelType, FuelTypeSummary>;

  filterEventType: FuelEventType | "ALL";
  sort: FuelSortKey;

  setFilterEventType: (v: FuelEventType | "ALL") => void;
  setSort: (v: FuelSortKey) => void;

  isLoading: boolean;
  error: string | null;
  refetch: () => void;
};

function safeTime(iso: string | null | undefined) {
  if (!iso) return -Infinity;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? -Infinity : t;
}

// MVP: suma/resta decimal string sin floats
function addDecimalString(a: string, b: string) {
  const toInt = (s: string) => Math.round(Number(s || "0") * 1000);
  const sum = toInt(a) + toInt(b);
  return (sum / 1000).toFixed(3).replace(/\.?0+$/, "");
}

function subDecimalString(a: string, b: string) {
  const toInt = (s: string) => Math.round(Number(s || "0") * 1000);
  const diff = toInt(a) - toInt(b);
  return (diff / 1000).toFixed(3).replace(/\.?0+$/, "");
}

export function useFuelPageData(projectId: string): FuelPageData {
  const { fuelLogs, loading, error, refresh } = useFuelByProject(projectId);

  const [filterEventType, setFilterEventType] = useState<FuelEventType | "ALL">(
    "ALL",
  );
  const [sort, setSort] = useState<FuelSortKey>("DATE_DESC");

  const computed = useMemo(() => {
    const raw = fuelLogs ?? [];

    // ---- counts + critical + unit dominance
    let bunkered = 0;
    let consumed = 0;
    let transferred = 0;
    let adjustments = 0;
    let critical = 0;

    let lCount = 0;
    let mtCount = 0;

    for (const f of raw) {
      if (f.unit === "L") lCount += 1;
      if (f.unit === "MT") mtCount += 1;

      if (!f.price || !f.location) critical += 1;

      switch (f.eventType) {
        case "BUNKERED":
          bunkered += 1;
          break;
        case "CONSUMED":
          consumed += 1;
          break;
        case "TRANSFERRED":
          transferred += 1;
          break;
        case "ADJUSTMENT":
          adjustments += 1;
          break;
      }
    }

    const unit: FuelUnit = mtCount > lCount ? "MT" : "L";

    // ---- totals + net by vessel + summary by fuel type (unit dominante)
    let bunkeredQty = "0";
    let consumedQty = "0";

    const balancesByVessel: Record<string, { unit: FuelUnit; net: string }> =
      {};

    const summaryByFuelType: Record<FuelType, FuelTypeSummary> = {
      MGO: { unit, bunkeredQty: "0", consumedQty: "0", netQty: "0", events: 0 },
      VLSFO: {
        unit,
        bunkeredQty: "0",
        consumedQty: "0",
        netQty: "0",
        events: 0,
      },
      HSFO: {
        unit,
        bunkeredQty: "0",
        consumedQty: "0",
        netQty: "0",
        events: 0,
      },
      LNG: { unit, bunkeredQty: "0", consumedQty: "0", netQty: "0", events: 0 },
      OTHER: {
        unit,
        bunkeredQty: "0",
        consumedQty: "0",
        netQty: "0",
        events: 0,
      },
    };

    for (const f of raw) {
      if (f.unit !== unit) continue;

      // global totals
      if (f.eventType === "BUNKERED")
        bunkeredQty = addDecimalString(bunkeredQty, f.quantity);
      if (f.eventType === "CONSUMED")
        consumedQty = addDecimalString(consumedQty, f.quantity);

      // net by vessel (BUNKERED - CONSUMED)
      if (!balancesByVessel[f.assetId]) {
        balancesByVessel[f.assetId] = { unit, net: "0" };
      }
      if (f.eventType === "BUNKERED") {
        balancesByVessel[f.assetId].net = addDecimalString(
          balancesByVessel[f.assetId].net,
          f.quantity,
        );
      }
      if (f.eventType === "CONSUMED") {
        balancesByVessel[f.assetId].net = subDecimalString(
          balancesByVessel[f.assetId].net,
          f.quantity,
        );
      }

      // summary by fuelType
      const s = summaryByFuelType[f.fuelType];
      s.events += 1;

      if (f.eventType === "BUNKERED") {
        s.bunkeredQty = addDecimalString(s.bunkeredQty, f.quantity);
        s.netQty = addDecimalString(s.netQty, f.quantity);
      }
      if (f.eventType === "CONSUMED") {
        s.consumedQty = addDecimalString(s.consumedQty, f.quantity);
        s.netQty = subDecimalString(s.netQty, f.quantity);
      }
    }

    const stats: FuelPageStats = {
      total: raw.length,
      bunkered,
      consumed,
      transferred,
      adjustments,
      unit,
      bunkeredQty,
      consumedQty,
      critical,
    };

    // ---- filter
    const filtered =
      filterEventType === "ALL"
        ? raw
        : raw.filter((f) => f.eventType === filterEventType);

    // ---- sort
    const list = filtered.slice().sort((a, b) => {
      if (sort === "QTY_DESC") {
        const qa = Number(a.quantity || "0");
        const qb = Number(b.quantity || "0");
        return qb - qa;
      }

      const ta = safeTime(a.date);
      const tb = safeTime(b.date);

      if (sort === "DATE_ASC") return ta - tb;
      return tb - ta;
    });

    return { raw, stats, list, balancesByVessel, summaryByFuelType };
  }, [fuelLogs, filterEventType, sort]);

  return {
    raw: computed.raw,
    stats: computed.stats,
    list: computed.list,
    balancesByVessel: computed.balancesByVessel,
    summaryByFuelType: computed.summaryByFuelType,

    filterEventType,
    sort,
    setFilterEventType,
    setSort,

    isLoading: loading,
    error,
    refetch: refresh,
  };
}
