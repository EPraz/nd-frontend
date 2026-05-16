import type {
  RequirementStatus,
} from "@/src/features/certificates/shared/contracts/certificates.contract";

export type CertificatePresentationTone =
  | "accent"
  | "ok"
  | "warn"
  | "danger"
  | "info"
  | "neutral";

export function requirementStatusTone(
  status?: RequirementStatus | null,
): CertificatePresentationTone {
  switch (status) {
    case "REQUIRED":
      return "warn";
    case "MISSING":
    case "EXPIRED":
      return "danger";
    case "UNDER_REVIEW":
      return "accent";
    case "PROVIDED":
      return "ok";
    case "EXEMPT":
      return "neutral";
    default:
      return "info";
  }
}
