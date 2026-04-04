export type CrewCertificateStatus =
  | "VALID"
  | "EXPIRED"
  | "EXPIRING_SOON"
  | "PENDING";

export type CrewCertificateWorkflowStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "ARCHIVED";

export type CrewRequirementStatus =
  | "REQUIRED"
  | "MISSING"
  | "UNDER_REVIEW"
  | "PROVIDED"
  | "EXPIRED"
  | "EXEMPT";

export type CrewCertificateIngestionSource = "REQUIREMENT" | "EXTRA";
export type CrewCertificateIngestionStatus =
  | "READY_FOR_REVIEW"
  | "CONFIRMED"
  | "CANCELLED";
export type CrewCertificateExtractionMethod = "PDF_TEXT" | "MANUAL_REVIEW";
export type CrewCertificateExtractionConfidence = "HIGH" | "MEDIUM" | "LOW";

export type CrewCertificateAttachmentDto = {
  id: string;
  fileName: string;
  mimeType: string;
  url: string;
  checksum: string | null;
  version: number;
  uploadedByUserId: string | null;
  uploadedAt: string;
};

export type CrewCertificateDto = {
  id: string;
  crewMemberId: string;
  crewMemberName: string;
  crewRank: string | null;
  assetId: string;
  assetName: string;
  certificateTypeId: string;
  certificateCode: string;
  certificateName: string;
  number: string | null;
  issuer: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  status: CrewCertificateStatus;
  workflowStatus: CrewCertificateWorkflowStatus;
  approvedAt: string | null;
  approvedByUserId: string | null;
  approvedByUserName: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedByUserId: string | null;
  deletedByUserName: string | null;
  notes: string | null;
  attachmentCount: number;
  attachments: CrewCertificateAttachmentDto[];
  requirementStatus?: CrewRequirementStatus | null;
  createdAt: string;
  updatedAt: string;
};

export type CrewCertificateRequirementDto = {
  id: string;
  crewMemberId: string;
  crewMemberName: string;
  crewRank: string | null;
  assetId: string;
  assetName: string;
  certificateTypeId: string;
  certificateCode: string;
  certificateName: string;
  status: CrewRequirementStatus;
  exemptedReason: string | null;
  notes: string | null;
  hasStructuredCertificate: boolean;
  structuredCertificateId: string | null;
  structuredCertificateWorkflowStatus: CrewCertificateWorkflowStatus | null;
  pendingIngestionId: string | null;
  pendingIngestionStatus: CrewCertificateIngestionStatus | null;
  lastEvaluatedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CrewCertificateIngestionDto = {
  id: string;
  crewMemberId: string;
  crewMemberName: string;
  crewRank: string | null;
  assetId: string;
  assetName: string;
  sourceKind: CrewCertificateIngestionSource;
  sourceRequirementId: string | null;
  linkedCrewCertificateId: string | null;
  certificateTypeId: string | null;
  certificateCode: string | null;
  certificateName: string | null;
  status: CrewCertificateIngestionStatus;
  fileName: string;
  mimeType: string;
  url: string;
  checksum: string | null;
  extractionMethod: CrewCertificateExtractionMethod;
  extractionConfidence: CrewCertificateExtractionConfidence;
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

export type CrewRequirementGenerationResult = {
  projectId: string;
  processedCrewMembers: number;
  applicableRules: number;
  generated: number;
  updated: number;
  provided: number;
  missing: number;
  underReview: number;
  expired: number;
  exempted: number;
  staleExempted: number;
  crewMemberIds: string[];
};

export type UploadableCrewDocument = {
  uri: string;
  name: string;
  mimeType: string;
  file?: unknown;
};

export type CreateCrewCertificateIngestionInput = {
  file: UploadableCrewDocument;
  notes?: string;
  certificateTypeId?: string;
};

export type ConfirmCrewCertificateIngestionInput = {
  certificateTypeId: string;
  number?: string | null;
  issuer?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  notes?: string | null;
};

export type ConfirmCrewCertificateIngestionResultDto = {
  ingestion: CrewCertificateIngestionDto;
  certificate: CrewCertificateDto;
  requirement: CrewCertificateRequirementDto | null;
};
