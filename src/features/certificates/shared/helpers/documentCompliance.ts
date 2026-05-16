import type { RegistrySummaryTone } from "@/src/components/ui/registryWorkspace";
import { humanizeTechnicalLabel } from "@/src/helpers";
import type {
  CertificateDocumentKind,
  CertificateDto,
  CertificateTypeDto,
} from "../contracts";

type ParentAwareCertificateType = Pick<
  CertificateTypeDto,
  "documentKind" | "parentTypeId"
>;
type ParentBlockingCertificate = Pick<
  CertificateDto,
  | "certificateDocumentKind"
  | "certificateParentTypeId"
  | "parentCertificateId"
  | "parentCertificateName"
  | "parentCertificateStatus"
  | "parentCertificateWorkflowStatus"
  | "parentCertificateIsDeleted"
>;

const ELIGIBLE_PARENT_WORKFLOW_STATUSES = new Set<CertificateDto["workflowStatus"]>([
  "SUBMITTED",
  "APPROVED",
]);
const ELIGIBLE_PARENT_STATUSES = new Set<CertificateDto["status"]>([
  "VALID",
  "EXPIRING_SOON",
]);

export function documentKindLabel(kind: CertificateDocumentKind): string {
  switch (kind) {
    case "CERTIFICATE":
      return "Certificate";
    case "PLAN":
      return "Plan";
    case "RECORD_BOOK":
      return "Record book";
    case "BOOKLET":
      return "Booklet";
    case "PERMIT_LICENSE":
      return "Permit / license";
    case "DECLARATION":
      return "Declaration";
    case "SUPPLEMENT":
      return "Supplement";
    case "ENDORSEMENT":
      return "Endorsement";
    case "TECHNICAL_FILE":
      return "Technical file";
    case "OTHER":
      return "Other document";
    default:
      return "Document";
  }
}

export function documentKindTone(kind: CertificateDocumentKind): RegistrySummaryTone {
  switch (kind) {
    case "CERTIFICATE":
      return "accent";
    case "SUPPLEMENT":
    case "ENDORSEMENT":
      return "info";
    case "PLAN":
    case "BOOKLET":
    case "RECORD_BOOK":
    case "TECHNICAL_FILE":
      return "neutral";
    case "PERMIT_LICENSE":
    case "DECLARATION":
      return "warn";
    case "OTHER":
    default:
      return "neutral";
  }
}

export function isChildDocumentKind(kind: CertificateDocumentKind): boolean {
  return kind === "SUPPLEMENT" || kind === "ENDORSEMENT";
}

export function requiresParentCertificate(
  type?: ParentAwareCertificateType | null,
): boolean {
  return Boolean(
    type && (type.parentTypeId || isChildDocumentKind(type.documentKind)),
  );
}

export function isParentTypeConfigurationMissing(
  type?: ParentAwareCertificateType | null,
): boolean {
  return Boolean(type && isChildDocumentKind(type.documentKind) && !type.parentTypeId);
}

export function isEligibleParentCertificate(
  certificate: Pick<
    CertificateDto,
    "certificateDocumentKind" | "workflowStatus" | "status"
  >,
): boolean {
  return (
    !isChildDocumentKind(certificate.certificateDocumentKind) &&
    ELIGIBLE_PARENT_WORKFLOW_STATUSES.has(certificate.workflowStatus) &&
    ELIGIBLE_PARENT_STATUSES.has(certificate.status)
  );
}

function isCurrentParentStatus(status: CertificateDto["parentCertificateStatus"]) {
  return status === "VALID" || status === "EXPIRING_SOON";
}

export function parentCertificateStatusSummary(
  certificate: ParentBlockingCertificate,
): string | null {
  if (!certificate.parentCertificateId) return null;
  const workflow = certificate.parentCertificateWorkflowStatus
    ? humanizeTechnicalLabel(certificate.parentCertificateWorkflowStatus)
    : "Unknown workflow";
  const status = certificate.parentCertificateStatus
    ? humanizeTechnicalLabel(certificate.parentCertificateStatus)
    : "Unknown status";

  return `${workflow} / ${status}`;
}

export function parentCertificateBlockingReason(
  certificate: ParentBlockingCertificate,
): string | null {
  const expectsParent = requiresParentCertificate({
    documentKind: certificate.certificateDocumentKind,
    parentTypeId: certificate.certificateParentTypeId,
  });

  if (!expectsParent) return null;

  if (
    !certificate.parentCertificateId ||
    (!certificate.parentCertificateName &&
      !certificate.parentCertificateWorkflowStatus &&
      !certificate.parentCertificateStatus)
  ) {
    return "Principal document is missing or no longer linked.";
  }

  if (certificate.parentCertificateIsDeleted) {
    return "Principal document is no longer active.";
  }

  if (certificate.parentCertificateWorkflowStatus !== "APPROVED") {
    return "Principal document must be approved before this child document can satisfy compliance.";
  }

  if (!isCurrentParentStatus(certificate.parentCertificateStatus)) {
    return "Principal document must be valid or expiring soon before this child document can satisfy compliance.";
  }

  return null;
}

export function parentCertificateOptionsForType(
  certificates: CertificateDto[],
  type?: ParentAwareCertificateType | null,
): CertificateDto[] {
  if (!requiresParentCertificate(type)) return [];
  if (isParentTypeConfigurationMissing(type)) return [];

  return certificates.filter((certificate) => {
    if (!isEligibleParentCertificate(certificate)) {
      return false;
    }
    if (!type?.parentTypeId) return true;
    return certificate.certificateTypeId === type.parentTypeId;
  });
}

export function hasIneligibleParentCertificateCandidates(
  certificates: CertificateDto[],
  type?: ParentAwareCertificateType | null,
): boolean {
  if (!requiresParentCertificate(type)) return false;
  if (isParentTypeConfigurationMissing(type)) return false;

  const candidates = certificates.filter((certificate) => {
    if (isChildDocumentKind(certificate.certificateDocumentKind)) {
      return false;
    }
    if (!type?.parentTypeId) return true;
    return certificate.certificateTypeId === type.parentTypeId;
  });

  return (
    candidates.length > 0 &&
    candidates.every((certificate) => !isEligibleParentCertificate(certificate))
  );
}

export function expiryDisplay(
  expiryDate: string | null,
  requiresExpiry: boolean,
  formatDate: (value: string | null) => string,
): string {
  if (!requiresExpiry) return "No expiry required";
  return formatDate(expiryDate);
}

export function sourceReferenceLabel(args: {
  convention?: string | null;
  sourceReference?: string | null;
  variantFlag?: string | null;
}): string {
  const parts = [args.convention, args.sourceReference, args.variantFlag]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));

  return parts.length > 0 ? parts.join(" - ") : "Source pending";
}
