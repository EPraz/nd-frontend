import type {
  CertificateStatus,
  RequirementStatus,
} from "@/src/features/certificates/shared";

export const ASSET_REQUIREMENT_FILTERS: ("ALL" | RequirementStatus)[] = [
  "ALL",
  "MISSING",
  "UNDER_REVIEW",
  "PROVIDED",
  "EXPIRED",
  "EXEMPT",
];

export const ASSET_RECORD_STATUS_FILTERS: ("ALL" | CertificateStatus)[] = [
  "ALL",
  "VALID",
  "EXPIRING_SOON",
  "EXPIRED",
  "PENDING",
];
