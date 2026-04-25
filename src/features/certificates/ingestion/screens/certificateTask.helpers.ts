import type { RegistrySummaryTone } from "@/src/components/ui/registryWorkspace";
import type {
  CertificateExtractionConfidence,
  CertificateExtractionMethod,
  CertificateIngestionSource,
  RequirementStatus,
} from "@/src/features/certificates/shared";

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
  method: CertificateExtractionMethod,
): string {
  switch (method) {
    case "PDF_TEXT":
      return "PDF text extraction";
    case "MANUAL_REVIEW":
      return "Manual review";
    default:
      return titleCaseToken(method);
  }
}

export function ingestionSourceLabel(
  source: CertificateIngestionSource,
): string {
  return source === "REQUIREMENT" ? "Requirement document" : "Supporting document";
}

export function confidenceLabel(
  confidence: CertificateExtractionConfidence,
): string {
  return titleCaseToken(confidence);
}

export function confidenceTone(
  confidence: CertificateExtractionConfidence,
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
  status?: RequirementStatus | null,
): string {
  return status ? titleCaseToken(status) : "Unknown";
}

export function requirementTone(
  status?: RequirementStatus | null,
): RegistrySummaryTone {
  switch (status) {
    case "MISSING":
      return "warn";
    case "UNDER_REVIEW":
      return "accent";
    case "PROVIDED":
      return "ok";
    case "EXPIRED":
      return "danger";
    case "EXEMPT":
      return "neutral";
    case "REQUIRED":
    default:
      return "info";
  }
}

export function documentStateTone(hasDocument: boolean): RegistrySummaryTone {
  return hasDocument ? "ok" : "warn";
}
