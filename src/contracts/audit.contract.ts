export type AuditModuleKey =
  | "PROJECTS"
  | "VESSELS"
  | "CERTIFICATES"
  | "CREW"
  | "CREW_CERTIFICATES"
  | "MAINTENANCE"
  | "FUEL"
  | "ADMIN";

export type AuditEntityType =
  | "PROJECT"
  | "PROJECT_ACCESS"
  | "PROJECT_ENTITLEMENTS"
  | "ASSET"
  | "VESSEL_PROFILE"
  | "VESSEL_CERTIFICATE"
  | "CREW_MEMBER"
  | "CREW_CERTIFICATE"
  | "MAINTENANCE_TASK"
  | "FUEL_LOG";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "SOFT_DELETE"
  | "APPROVE"
  | "REJECT"
  | "CONFIRM"
  | "CONFIGURE"
  | "REFRESH"
  | "ATTACHMENT_REMOVE";

export type AuditEventDto = {
  id: string;
  projectId: string | null;
  assetId: string | null;
  assetName: string | null;
  moduleKey: AuditModuleKey;
  entityType: AuditEntityType;
  entityId: string;
  entityLabel: string | null;
  action: AuditAction;
  summary: string;
  actorUserId: string | null;
  actorUserName: string | null;
  metadata: unknown;
  createdAt: string;
};
