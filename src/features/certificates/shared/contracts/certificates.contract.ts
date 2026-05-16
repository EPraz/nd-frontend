import type { PaginatedResponseDto } from "@/src/contracts/pagination.contract";

export type CertificateStatus =
  | "VALID"
  | "EXPIRED"
  | "EXPIRING_SOON"
  | "PENDING";

export type CertificateWorkflowStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "ARCHIVED";

export type RequirementStatus =
  | "REQUIRED"
  | "MISSING"
  | "UNDER_REVIEW"
  | "PROVIDED"
  | "EXPIRED"
  | "EXEMPT";

export type CertificateCategory =
  | "STATUTORY"
  | "CLASS"
  | "FLAG"
  | "COMPANY"
  | "OTHER";

export type CertificateDocumentKind =
  | "CERTIFICATE"
  | "PLAN"
  | "RECORD_BOOK"
  | "BOOKLET"
  | "PERMIT_LICENSE"
  | "DECLARATION"
  | "SUPPLEMENT"
  | "ENDORSEMENT"
  | "TECHNICAL_FILE"
  | "OTHER";

export type CertificateDto = {
  id: string;
  assetId: string;
  assetName: string;
  certificateTypeId: string;
  certificateCode: string;
  certificateName: string;
  certificateDocumentKind: CertificateDocumentKind;
  certificateRequiresExpiry: boolean;
  certificateParentTypeId: string | null;
  certificateParentTypeCode: string | null;
  certificateParentTypeName: string | null;
  certificateVariantFlag: string | null;
  certificateConvention: string | null;
  certificateSourceReference: string | null;
  parentCertificateId: string | null;
  parentCertificateCode: string | null;
  parentCertificateName: string | null;
  parentCertificateNumber: string | null;
  parentCertificateStatus: CertificateStatus | null;
  parentCertificateWorkflowStatus: CertificateWorkflowStatus | null;
  parentCertificateIsDeleted: boolean | null;
  childCertificateCount: number;
  number: string | null;
  issuer: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  status: CertificateStatus;
  workflowStatus: CertificateWorkflowStatus;
  approvedAt: string | null;
  approvedByUserId: string | null;
  approvedByUserName: string | null;
  rejectedAt: string | null;
  rejectedByUserId: string | null;
  rejectedByUserName: string | null;
  rejectionReason: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedByUserId: string | null;
  deletedByUserName: string | null;
  notes: string | null;
  attachmentCount: number;
  attachments: CertificateAttachmentDto[];
  pendingReplacementIngestionId: string | null;
  requirementStatus?: RequirementStatus | null;
  createdAt: string;
  updatedAt: string;
};

export type CertificateListStatsDto = {
  total: number;
  valid: number;
  expiringSoon: number;
  expired: number;
  pending: number;
  draft: number;
  submitted: number;
  approved: number;
  rejected: number;
};

export type CertificatePageDto = PaginatedResponseDto<CertificateDto> & {
  stats: CertificateListStatsDto;
};

export type CertificateTypeDto = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: CertificateCategory;
  documentKind: CertificateDocumentKind;
  authority: string | null;
  typicalValidityMonths: number | null;
  requiresExpiry: boolean;
  parentTypeId: string | null;
  parentCode: string | null;
  parentName: string | null;
  variantFlag: string | null;
  convention: string | null;
  sourceReference: string | null;
  aliases: string[];
  scope: "GLOBAL" | "COMPANY";
  companyId: string | null;
};

export type CertificateRequirementDto = {
  id: string;
  assetId: string;
  assetName: string;
  certificateTypeId: string;
  certificateCode: string;
  certificateName: string;
  certificateDocumentKind: CertificateDocumentKind;
  certificateRequiresExpiry: boolean;
  certificateParentTypeId: string | null;
  certificateParentTypeCode: string | null;
  certificateParentTypeName: string | null;
  certificateVariantFlag: string | null;
  certificateConvention: string | null;
  certificateSourceReference: string | null;
  status: RequirementStatus;
  exemptedReason: string | null;
  notes: string | null;
  hasStructuredCertificate: boolean;
  structuredCertificateId: string | null;
  structuredCertificateWorkflowStatus: CertificateWorkflowStatus | null;
  structuredCertificateRejectionReason: string | null;
  structuredCertificateBlockingReason: string | null;
  pendingIngestionId: string | null;
  pendingIngestionStatus: CertificateIngestionStatus | null;
  lastEvaluatedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CertificateRequirementListStatsDto = {
  total: number;
  missing: number;
  underReview: number;
  provided: number;
  expired: number;
  exempt: number;
};

export type CertificateRequirementPageDto =
  PaginatedResponseDto<CertificateRequirementDto> & {
    stats: CertificateRequirementListStatsDto;
  };

export type CertificateAttachmentDto = {
  id: string;
  fileName: string;
  mimeType: string;
  url: string;
  checksum: string | null;
  version: number;
  uploadedByUserId: string | null;
  uploadedAt: string;
};

export type CertificateExtractionMethod = "PDF_TEXT" | "OCR_TEXT" | "MANUAL_REVIEW";
export type CertificateExtractionConfidence = "HIGH" | "MEDIUM" | "LOW";
export type CertificateIngestionSource = "REQUIREMENT" | "EXTRA";
export type CertificateIngestionStatus =
  | "READY_FOR_REVIEW"
  | "CONFIRMED"
  | "CANCELLED";

export type CertificateExtractionDto = {
  method: CertificateExtractionMethod;
  confidence: CertificateExtractionConfidence;
  needsReview: boolean;
  extractedTextPreview: string | null;
  number: string | null;
  issuer: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  warnings: string[];
};

export type GenerateRequirementsResult = {
  projectId: string;
  processedAssets: number;
  applicableRules: number;
  generated: number;
  updated: number;
  provided: number;
  missing: number;
  underReview: number;
  expired: number;
  exempted: number;
  staleExempted: number;
  assetIds: string[];
};

export type UploadableDocument = {
  uri: string;
  name: string;
  mimeType: string;
  file?: unknown;
};

export type CreateCertificateIngestionInput = {
  file: UploadableDocument;
  notes?: string;
  certificateTypeId?: string;
  replacementCertificateId?: string;
};

export type CertificateIngestionDto = {
  id: string;
  assetId: string;
  assetName: string;
  sourceKind: CertificateIngestionSource;
  sourceRequirementId: string | null;
  linkedVesselCertificateId: string | null;
  certificateTypeId: string | null;
  certificateCode: string | null;
  certificateName: string | null;
  status: CertificateIngestionStatus;
  fileName: string;
  mimeType: string;
  url: string;
  checksum: string | null;
  extractionMethod: CertificateExtractionMethod;
  extractionConfidence: CertificateExtractionConfidence;
  extractedTextPreview: string | null;
  extractionWarnings: string[];
  candidateNumber: string | null;
  candidateIssuer: string | null;
  candidateIssueDate: string | null;
  candidateExpiryDate: string | null;
  candidateNotes: string | null;
  uploadedByUserId: string | null;
  confirmedByUserId: string | null;
  confirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ConfirmCertificateIngestionInput = {
  certificateTypeId: string;
  parentCertificateId?: string | null;
  number?: string | null;
  issuer?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  notes?: string | null;
  acknowledgeRequirementMismatch?: boolean;
};

export type UpdateCertificateInput = {
  number?: string | null;
  issuer?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  notes?: string | null;
};

export type RejectCertificateInput = {
  reason: string;
};

export type ConfirmCertificateIngestionResultDto = {
  ingestion: CertificateIngestionDto;
  certificate: CertificateDto;
  requirement: CertificateRequirementDto | null;
};
