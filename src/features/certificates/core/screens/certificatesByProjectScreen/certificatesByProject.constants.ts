import type {
  CertificateStatus,
  RequirementStatus,
} from "@/src/features/certificates/shared";

export const REQUIREMENT_FILTERS: ("ALL" | RequirementStatus)[] = [
  "ALL",
  "MISSING",
  "UNDER_REVIEW",
  "PROVIDED",
  "EXPIRED",
  "EXEMPT",
];

export const RECORD_STATUS_FILTERS: ("ALL" | CertificateStatus)[] = [
  "ALL",
  "VALID",
  "EXPIRING_SOON",
  "EXPIRED",
  "PENDING",
];

export const CERTIFICATES_PROJECT_TABS = [
  {
    key: "overview" as const,
    label: "Overview",
  },
  {
    key: "requirements" as const,
    label: "Requirements",
  },
];


