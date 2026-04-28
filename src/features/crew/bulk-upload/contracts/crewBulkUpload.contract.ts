import type { PaginatedResponseDto } from "@/src/contracts/pagination.contract";

export type CrewBulkUploadIssueSeverity = "CRITICAL" | "WARNING" | "INFO";

export type CrewBulkUploadIssueDto = {
  severity: CrewBulkUploadIssueSeverity;
  code: string;
  field: string | null;
  message: string;
};

export type CrewBulkUploadRowKind = "CREW" | "CERTIFICATE";
export type CrewBulkUploadRowAction = "CREATE" | "UPDATE" | "SKIP" | "REVIEW";
export type CrewBulkUploadRowCommitStatus = "PENDING" | "COMMITTED" | "SKIPPED";
export type CrewBulkUploadSessionStatus =
  | "READY_FOR_REVIEW"
  | "COMMITTED"
  | "DISCARDED";
export type CrewBulkUploadRequirementsRefreshStatus =
  | "PENDING"
  | "DONE"
  | "FAILED";

export type CrewBulkUploadSheetSummary = {
  sheetName: string;
  kind: "CREW" | "CERTIFICATE" | "UNKNOWN";
  parsedRows: number;
};

export type CrewBulkUploadCommitSummary = {
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  affectedCrewIds: string[];
  requirementsRefresh: CrewBulkUploadRequirementsRefreshStatus;
};

export type CrewBulkUploadRevisionSummary = {
  revisionNumber: number;
  sourceFileName: string;
  checksum: string | null;
  uploadedAt: string;
  uploadedByUserId: string | null;
  defaultAssetId: string | null;
  defaultAssetName: string | null;
  totalRows: number;
  crewRows: number;
  certificateRows: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
};

export type CrewBulkUploadAuditTrailEvent = {
  eventType: string;
  at: string;
  actorUserId: string | null;
  message: string;
  metadata: Record<string, unknown> | null;
};

export type CrewBulkUploadSessionMeta = {
  sheets?: CrewBulkUploadSheetSummary[];
  recognizedCrewSheet?: boolean;
  recognizedCertificateSheet?: boolean;
  previewOnlyKinds?: string[];
  duplicatePolicy?: {
    uniqueIdentityMatch?: string;
    ambiguousIdentityMatch?: string;
    workbookDuplicateIdentity?: string;
    weakIdentityNoMatch?: string;
    certificateRows?: string;
  };
  revisions?: CrewBulkUploadRevisionSummary[];
  commit?: CrewBulkUploadCommitSummary;
  auditTrail?: CrewBulkUploadAuditTrailEvent[];
};

export type CrewBulkUploadRowDto = {
  id: string;
  sheetName: string;
  rowNumber: number;
  rowKind: CrewBulkUploadRowKind;
  displayLabel: string | null;
  rawData: Record<string, unknown>;
  normalizedData: Record<string, unknown> | null;
  matchedAssetId: string | null;
  matchedAssetName: string | null;
  matchedCrewMemberId: string | null;
  matchedCrewMemberName: string | null;
  proposedAction: CrewBulkUploadRowAction;
  commitStatus: CrewBulkUploadRowCommitStatus;
  issues: CrewBulkUploadIssueDto[];
  committedCrewMemberId: string | null;
  committedCrewMemberName: string | null;
  committedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CrewBulkUploadSessionSummaryDto = {
  id: string;
  projectId: string;
  defaultAssetId: string | null;
  defaultAssetName: string | null;
  revisionNumber: number;
  status: CrewBulkUploadSessionStatus;
  sourceFileName: string;
  sourceMimeType: string;
  checksum: string | null;
  templateVersion: string | null;
  totalRows: number;
  crewRows: number;
  certificateRows: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  createdByUserId: string | null;
  committedByUserId: string | null;
  discardedByUserId: string | null;
  committedAt: string | null;
  discardedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CrewBulkUploadSessionListStatsDto = {
  total: number;
  readyForReview: number;
  committed: number;
  discarded: number;
  pendingCritical: number;
};

export type CrewBulkUploadSessionPageDto =
  PaginatedResponseDto<CrewBulkUploadSessionSummaryDto> & {
    stats: CrewBulkUploadSessionListStatsDto;
  };

export type CrewBulkUploadRowPageStatsDto = {
  total: number;
  critical: number;
  warning: number;
  info: number;
};

export type CrewBulkUploadRowPageDto =
  PaginatedResponseDto<CrewBulkUploadRowDto> & {
    stats: CrewBulkUploadRowPageStatsDto;
  };

export type CrewBulkUploadSessionDto = CrewBulkUploadSessionSummaryDto & {
  summary: CrewBulkUploadSessionMeta | null;
  rows: CrewBulkUploadRowDto[];
};

export type CreateCrewBulkUploadSessionInput = {
  defaultAssetId?: string;
  file: {
    uri: string;
    name: string;
    mimeType: string;
    file?: unknown;
  };
};
