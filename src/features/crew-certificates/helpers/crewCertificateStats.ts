import type {
  CrewCertificateDto,
  CrewCertificateRequirementDto,
} from "../contracts";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export type CrewCertificateOverviewStats = {
  totalRequirements: number;
  missingRequirements: number;
  underReviewRequirements: number;
  providedRequirements: number;
  expiredRequirements: number;
  exemptRequirements: number;
  uploadedRequirements: number;
  activeCertificates: number;
  expiringSoonCertificates: number;
};

function toValidDate(value: string | null | undefined): Date | null {
  if (!value) return null;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeStartOfDay(date: Date) {
  const clone = new Date(date);
  clone.setHours(0, 0, 0, 0);
  return clone.getTime();
}

function normalizeEndOfDay(date: Date) {
  const clone = new Date(date);
  clone.setHours(23, 59, 59, 999);
  return clone.getTime();
}

export function isExpiringWithinDays(
  expiryDate: string | null,
  days: number,
  referenceDate = new Date(),
) {
  const parsedExpiry = toValidDate(expiryDate);
  if (!parsedExpiry) return false;

  const windowStart = normalizeStartOfDay(referenceDate);
  const windowEnd = normalizeEndOfDay(
    new Date(referenceDate.getTime() + days * DAY_IN_MS),
  );

  const expiryTime = parsedExpiry.getTime();
  return expiryTime >= windowStart && expiryTime <= windowEnd;
}

export function summarizeCrewCertificateRequirements(
  requirements: CrewCertificateRequirementDto[],
): Pick<
  CrewCertificateOverviewStats,
  | "totalRequirements"
  | "missingRequirements"
  | "underReviewRequirements"
  | "providedRequirements"
  | "expiredRequirements"
  | "exemptRequirements"
  | "uploadedRequirements"
> {
  let missingRequirements = 0;
  let underReviewRequirements = 0;
  let providedRequirements = 0;
  let expiredRequirements = 0;
  let exemptRequirements = 0;
  let uploadedRequirements = 0;

  for (const requirement of requirements) {
    if (requirement.status === "MISSING") missingRequirements += 1;
    if (requirement.status === "UNDER_REVIEW") underReviewRequirements += 1;
    if (requirement.status === "PROVIDED") providedRequirements += 1;
    if (requirement.status === "EXPIRED") expiredRequirements += 1;
    if (requirement.status === "EXEMPT") exemptRequirements += 1;
    if (requirement.hasStructuredCertificate) uploadedRequirements += 1;
  }

  return {
    totalRequirements: requirements.length,
    missingRequirements,
    underReviewRequirements,
    providedRequirements,
    expiredRequirements,
    exemptRequirements,
    uploadedRequirements,
  };
}

export function summarizeCrewCertificates(
  certificates: CrewCertificateDto[],
  referenceDate = new Date(),
): Pick<
  CrewCertificateOverviewStats,
  "activeCertificates" | "expiringSoonCertificates"
> {
  let activeCertificates = 0;
  let expiringSoonCertificates = 0;

  for (const certificate of certificates) {
    if (certificate.status === "VALID" || certificate.status === "EXPIRING_SOON") {
      activeCertificates += 1;
    }

    if (
      (certificate.status === "VALID" || certificate.status === "EXPIRING_SOON") &&
      isExpiringWithinDays(certificate.expiryDate, 30, referenceDate)
    ) {
      expiringSoonCertificates += 1;
    }
  }

  return {
    activeCertificates,
    expiringSoonCertificates,
  };
}
