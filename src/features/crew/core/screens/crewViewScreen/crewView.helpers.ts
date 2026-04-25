import type { RegistrySummaryTone } from "@/src/components/ui/registryWorkspace";
import type { CrewDto } from "../../contracts";

export function formatDate(value?: string | null, fallback = "Not set"): string {
  return value ? value.slice(0, 10) : fallback;
}

export function humanizeCrewValue(
  value?: string | null,
  fallback = "Not set",
): string {
  if (!value) return fallback;

  return value
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function formatMedicalState(value: boolean | null): string {
  if (value === true) return "Valid";
  if (value === false) return "Needs attention";
  return "Unknown";
}

export function medicalTone(value: boolean | null): RegistrySummaryTone {
  if (value === true) return "ok";
  if (value === false) return "danger";
  return "info";
}

export function statusTone(crew: CrewDto): RegistrySummaryTone {
  if (crew.status === "ACTIVE") return "ok";
  if (crew.inactiveReason === "INJURED") return "warn";
  if (crew.inactiveReason === "VACATION") return "info";
  return "neutral";
}

export function familiarizationLabel(crew: CrewDto): string {
  return crew.familiarizationChecklistCompleted ? "Completed" : "Pending";
}

export function familiarizationTone(crew: CrewDto): RegistrySummaryTone {
  return crew.familiarizationChecklistCompleted ? "ok" : "warn";
}

export function formatYears(
  value: number | null | undefined,
  fallback = "Not set",
): string {
  if (value === null || value === undefined) return fallback;
  return `${value} ${value === 1 ? "year" : "years"}`;
}

export function formatMonths(
  value: number | null | undefined,
  fallback = "Not set",
): string {
  if (value === null || value === undefined) return fallback;
  return `${value} ${value === 1 ? "month" : "months"}`;
}

export function crewIdentityLine(crew: CrewDto): string {
  return [crew.rank ?? "Crew member", humanizeCrewValue(crew.department)]
    .filter(Boolean)
    .join(" | ");
}
