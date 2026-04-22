import { RegistryTablePill } from "@/src/components/ui/table/RegistryTablePill";
import { FuelEventType, FuelType } from "../../../shared/contracts";

export function FuelEventPill({ type }: { type: FuelEventType }) {
  const label =
    type === "BUNKERED"
      ? "Bunkered"
      : type === "CONSUMED"
        ? "Consumed"
        : type === "TRANSFERRED"
          ? "Transferred"
          : "Adjustment";

  return (
    <RegistryTablePill
      label={label}
      tone={
        type === "BUNKERED"
          ? "ok"
          : type === "CONSUMED"
            ? "danger"
            : type === "TRANSFERRED"
              ? "accent"
              : "warn"
      }
    />
  );
}

export function FuelTypePill({ fuelType }: { fuelType: FuelType }) {
  return (
    <RegistryTablePill
      label={fuelType}
      tone={
        fuelType === "MGO"
          ? "accent"
          : fuelType === "VLSFO"
            ? "ok"
            : fuelType === "HSFO"
              ? "danger"
              : fuelType === "LNG"
                ? "warn"
                : "info"
      }
    />
  );
}

export function quantityTextClass(t: FuelEventType) {
  switch (t) {
    case "BUNKERED":
      return "text-success";
    case "CONSUMED":
      return "text-destructive";
    case "TRANSFERRED":
      return "text-warning";
    case "ADJUSTMENT":
      return "text-info";
    default:
      return "text-info";
  }
}
