import type { RegistrySummaryTone } from "@/src/components/ui/registryWorkspace";
import type {
  CrewCertificateExtractionConfidence,
  CrewCertificateExtractionMethod,
  CrewCertificateIngestionSource,
  CrewRequirementStatus,
} from "../contracts";

export function titleCaseToken(value: string): string {
  return value
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export function formatTaskDateTime(value?: string | null): string {
  if (!value) return "Not available";

  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function extractionMethodLabel(
  method: CrewCertificateExtractionMethod,
): string {
  switch (method) {
    case "OCR_TEXT":
      return "OCR text extraction";
    case "PDF_TEXT":
      return "PDF text extraction";
    case "MANUAL_REVIEW":
      return "Manual review";
    default:
      return titleCaseToken(method);
  }
}

export function ingestionSourceLabel(
  source: CrewCertificateIngestionSource,
): string {
  return source === "REQUIREMENT" ? "Requirement document" : "Supporting document";
}

export function confidenceLabel(
  confidence: CrewCertificateExtractionConfidence,
): string {
  return titleCaseToken(confidence);
}

export function confidenceTone(
  confidence: CrewCertificateExtractionConfidence,
): RegistrySummaryTone {
  switch (confidence) {
    case "HIGH":
      return "ok";
    case "MEDIUM":
      return "warn";
    case "LOW":
    default:
      return "danger";
  }
}

export function requirementStatusLabel(
  status?: CrewRequirementStatus | null,
): string {
  return status ? titleCaseToken(status) : "Unknown";
}

export function documentStateTone(hasDocument: boolean): RegistrySummaryTone {
  return hasDocument ? "ok" : "warn";
}
