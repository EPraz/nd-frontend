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

export type CertificateDto = {
  id: string;
  assetId: string;
  assetName: string;
  certificateTypeId: string;
  certificateCode: string;
  certificateName: string;
  number: string | null;
  issuer: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  status: CertificateStatus;
  workflowStatus: CertificateWorkflowStatus;
  approvedAt: string | null;
  approvedByUserId: string | null;
  approvedByUserName: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedByUserId: string | null;
  deletedByUserName: string | null;
  notes: string | null;
  attachmentCount: number;
  attachments: CertificateAttachmentDto[];
  requirementStatus?: RequirementStatus | null;
  createdAt: string;
  updatedAt: string;
};

export type CertificateTypeDto = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: CertificateCategory;
  authority: string | null;
  typicalValidityMonths: number | null;
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
  status: RequirementStatus;
  exemptedReason: string | null;
  notes: string | null;
  hasStructuredCertificate: boolean;
  structuredCertificateId: string | null;
  structuredCertificateWorkflowStatus: CertificateWorkflowStatus | null;
  pendingIngestionId: string | null;
  pendingIngestionStatus: CertificateIngestionStatus | null;
  lastEvaluatedAt: string | null;
  createdAt: string;
  updatedAt: string;
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

export type CertificateExtractionMethod = "PDF_TEXT" | "MANUAL_REVIEW";
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

export type CreateCertificateInput = {
  certificateTypeId: string;
  number?: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  status?: CertificateStatus;
  workflowStatus?: CertificateWorkflowStatus;
  notes?: string;
  assetId: string;
};

export type UpdateCertificateInput = {
  assetId?: string;
  certificateTypeId?: string;
  number?: string | null;
  issuer?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  status?: CertificateStatus;
  workflowStatus?: CertificateWorkflowStatus;
  notes?: string | null;
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
  number?: string | null;
  issuer?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  notes?: string | null;
};

export type ConfirmCertificateIngestionResultDto = {
  ingestion: CertificateIngestionDto;
  certificate: CertificateDto;
  requirement: CertificateRequirementDto | null;
};
