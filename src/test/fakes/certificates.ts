import type { AssetDto } from "@/src/contracts/assets.contract";
import type {
  CertificateDto,
  CertificateIngestionDto,
  CertificateRequirementDto,
  CertificateTypeDto,
  ConfirmCertificateIngestionResultDto,
} from "@/src/features/certificates/contracts";

export function fakeVesselAsset(overrides: Partial<AssetDto> = {}): AssetDto {
  return {
    id: "vessel-one",
    projectId: "project-atlantic",
    type: "VESSEL",
    name: "MV Navigate One",
    imageUrl: null,
    imageFileName: null,
    status: "ACTIVE",
    isDeleted: false,
    deletedAt: null,
    deletedByUserId: null,
    deletedByUserName: null,
    createdAt: "2026-04-01T00:00:00.000Z",
    ...overrides,
  };
}

export function fakeCertificateType(
  overrides: Partial<CertificateTypeDto> = {},
): CertificateTypeDto {
  return {
    id: "type-iopp",
    code: "IOPP_CERT",
    name: "International Oil Pollution Prevention Certificate",
    description: "Statutory oil pollution prevention certificate.",
    category: "STATUTORY",
    authority: "Flag State",
    typicalValidityMonths: 60,
    aliases: ["IOPP", "Oil Pollution"],
    scope: "GLOBAL",
    companyId: null,
    ...overrides,
  };
}

export function fakeCertificate(
  overrides: Partial<CertificateDto> = {},
): CertificateDto {
  return {
    id: "certificate-1",
    assetId: "vessel-one",
    assetName: "MV Navigate One",
    certificateTypeId: "type-iopp",
    certificateCode: "IOPP_CERT",
    certificateName: "International Oil Pollution Prevention Certificate",
    number: "IOPP-2026-001",
    issuer: "Flag State",
    issueDate: "2026-01-10T00:00:00.000Z",
    expiryDate: "2031-01-10T00:00:00.000Z",
    status: "VALID",
    workflowStatus: "DRAFT",
    approvedAt: null,
    approvedByUserId: null,
    approvedByUserName: null,
    isDeleted: false,
    deletedAt: null,
    deletedByUserId: null,
    deletedByUserName: null,
    notes: "Manual fallback record",
    attachmentCount: 0,
    attachments: [],
    requirementStatus: "PROVIDED",
    createdAt: "2026-01-10T12:00:00.000Z",
    updatedAt: "2026-01-10T12:00:00.000Z",
    ...overrides,
  };
}

export function fakeCertificateIngestion(
  overrides: Partial<CertificateIngestionDto> = {},
): CertificateIngestionDto {
  return {
    id: "ingestion-1",
    assetId: "vessel-one",
    assetName: "MV Navigate One",
    sourceKind: "REQUIREMENT",
    sourceRequirementId: "requirement-1",
    linkedVesselCertificateId: null,
    certificateTypeId: "type-iopp",
    certificateCode: "IOPP_CERT",
    certificateName: "International Oil Pollution Prevention Certificate",
    status: "READY_FOR_REVIEW",
    fileName: "iopp-certificate.pdf",
    mimeType: "application/pdf",
    url: "/signed/certificates/iopp-certificate.pdf",
    checksum: null,
    extractionMethod: "PDF_TEXT",
    extractionConfidence: "HIGH",
    extractedTextPreview: "International Oil Pollution Prevention Certificate",
    extractionWarnings: [],
    candidateNumber: "IOPP-2026-001",
    candidateIssuer: "Flag State",
    candidateIssueDate: "2026-01-10T00:00:00.000Z",
    candidateExpiryDate: "2031-01-10T00:00:00.000Z",
    candidateNotes: "Candidate notes",
    uploadedByUserId: "user-1",
    confirmedByUserId: null,
    confirmedAt: null,
    createdAt: "2026-01-10T12:00:00.000Z",
    updatedAt: "2026-01-10T12:00:00.000Z",
    ...overrides,
  };
}

export function fakeCertificateRequirement(
  overrides: Partial<CertificateRequirementDto> = {},
): CertificateRequirementDto {
  return {
    id: "requirement-1",
    assetId: "vessel-one",
    assetName: "MV Navigate One",
    certificateTypeId: "type-iopp",
    certificateCode: "IOPP_CERT",
    certificateName: "International Oil Pollution Prevention Certificate",
    status: "MISSING",
    exemptedReason: null,
    notes: null,
    hasStructuredCertificate: false,
    structuredCertificateId: null,
    structuredCertificateWorkflowStatus: null,
    pendingIngestionId: null,
    pendingIngestionStatus: null,
    lastEvaluatedAt: null,
    createdAt: "2026-01-10T12:00:00.000Z",
    updatedAt: "2026-01-10T12:00:00.000Z",
    ...overrides,
  };
}

export function fakeConfirmCertificateIngestionResult(
  overrides: Partial<ConfirmCertificateIngestionResultDto> = {},
): ConfirmCertificateIngestionResultDto {
  return {
    ingestion: fakeCertificateIngestion({ status: "CONFIRMED" }),
    certificate: fakeCertificate({ id: "certificate-created" }),
    requirement: null,
    ...overrides,
  };
}
