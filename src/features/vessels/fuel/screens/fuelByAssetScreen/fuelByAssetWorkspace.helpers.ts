import type { RegistrySummaryItem } from "@/src/components/ui/registryWorkspace";
import type {
  FuelDto,
  FuelEventType,
} from "@/src/features/fuel/shared/contracts";

export const FUEL_EVENT_OPTIONS = [
  "ALL",
  "BUNKERED",
  "CONSUMED",
  "TRANSFERRED",
  "ADJUSTMENT",
] as const;

export const FUEL_SORT_OPTIONS = [
  "DATE_DESC",
  "DATE_ASC",
  "QTY_DESC",
] as const;

export type FuelEventFilter =
  | "ALL"
  | FuelEventType;

export type FuelSortOption =
  (typeof FUEL_SORT_OPTIONS)[number];

export function getFuelByAssetSummaryItems(
  fuelLogs: FuelDto[],
): RegistrySummaryItem[] {
  let bunkered = 0;
  let consumed = 0;
  let critical = 0;

  let liters = 0;
  let metricTons = 0;

  for (const log of fuelLogs) {
    if (log.unit === "L") liters += 1;
    if (log.unit === "MT") metricTons += 1;

    if (!log.price || !log.location) critical += 1;
    if (log.eventType === "BUNKERED") bunkered += 1;
    if (log.eventType === "CONSUMED") consumed += 1;
  }

  const unit = metricTons > liters ? "MT" : "L";

  const toInt = (value: string) => Math.round(Number(value || "0") * 1000);
  const toStr = (value: number) =>
    (value / 1000).toFixed(3).replace(/\.?0+$/, "");

  let bunkeredQty = 0;
  let consumedQty = 0;

  for (const log of fuelLogs) {
    if (log.unit !== unit) continue;
    if (log.eventType === "BUNKERED") bunkeredQty += toInt(log.quantity);
    if (log.eventType === "CONSUMED") consumedQty += toInt(log.quantity);
  }

  return [
    {
      label: "Events in scope",
      value: String(fuelLogs.length),
      helper: "tracked on this vessel",
      tone: "accent",
    },
    {
      label: "Bunkered",
      value: String(bunkered),
      helper: `${toStr(bunkeredQty)} ${unit} total`,
      tone: "ok",
    },
    {
      label: "Consumed",
      value: String(consumed),
      helper: `${toStr(consumedQty)} ${unit} total`,
      tone: consumed > 0 ? "warn" : "ok",
    },
    {
      label: "Critical gaps",
      value: String(critical),
      helper: "missing price or location",
      tone: critical > 0 ? "danger" : "ok",
    },
  ];
}

export function filterFuelByEventType(
  fuelLogs: FuelDto[],
  filterEventType: FuelEventFilter,
) {
  return fuelLogs.filter((log) => {
    return filterEventType === "ALL" || log.eventType === filterEventType;
  });
}

export function sortFuelLogs(
  fuelLogs: FuelDto[],
  sortBy: FuelSortOption,
) {
  const rows = [...fuelLogs];

  rows.sort((a, b) => {
    if (sortBy === "QTY_DESC") {
      return Number(b.quantity) - Number(a.quantity);
    }

    const aDate = new Date(a.date).getTime();
    const bDate = new Date(b.date).getTime();

    if (sortBy === "DATE_ASC") {
      return aDate - bDate;
    }

    return bDate - aDate;
  });

  return rows;
}
