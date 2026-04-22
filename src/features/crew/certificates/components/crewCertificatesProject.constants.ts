import type { CrewRequirementStatus } from "../contracts";

export const CREW_CERTIFICATE_REQUIREMENT_FILTERS = [
  "ALL",
  "MISSING",
  "UNDER_REVIEW",
  "EXPIRED",
  "PROVIDED",
  "EXEMPT",
  "REQUIRED",
] as const;

export type CrewCertificateRequirementFilter =
  | "ALL"
  | CrewRequirementStatus;

export const CREW_CERTIFICATE_SORT_OPTIONS = [
  "PRIORITY",
  "CREW_ASC",
  "CREW_DESC",
  "CERT_ASC",
] as const;

export type CrewCertificateSortOption =
  (typeof CREW_CERTIFICATE_SORT_OPTIONS)[number];
