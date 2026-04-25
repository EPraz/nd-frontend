import type { SessionResponse } from "@/src/api/auth.api";

export type UserRole = SessionResponse["role"];

export type SecurityAction =
  | "PROJECT_READ"
  | "PROJECT_CONFIGURE"
  | "USER_MANAGE"
  | "OPERATIONAL_WRITE"
  | "OPERATIONAL_SOFT_DELETE"
  | "DOCUMENT_UPLOAD"
  | "INGESTION_CONFIRM"
  | "CERTIFICATE_APPROVE"
  | "FILE_VIEW"
  | "AUDIT_VIEW";

const ROLE_PERMISSIONS: Record<UserRole, ReadonlySet<SecurityAction>> = {
  ADMIN: new Set([
    "PROJECT_READ",
    "PROJECT_CONFIGURE",
    "USER_MANAGE",
    "OPERATIONAL_WRITE",
    "OPERATIONAL_SOFT_DELETE",
    "DOCUMENT_UPLOAD",
    "INGESTION_CONFIRM",
    "CERTIFICATE_APPROVE",
    "FILE_VIEW",
    "AUDIT_VIEW",
  ]),
  OPS: new Set([
    "PROJECT_READ",
    "OPERATIONAL_WRITE",
    "DOCUMENT_UPLOAD",
    "INGESTION_CONFIRM",
    "FILE_VIEW",
    "AUDIT_VIEW",
  ]),
  VIEWER: new Set(["PROJECT_READ", "FILE_VIEW", "AUDIT_VIEW"]),
};

export function canRole(
  role: UserRole | null | undefined,
  action: SecurityAction,
): boolean {
  return role ? (ROLE_PERMISSIONS[role]?.has(action) ?? false) : false;
}

export function canUser(
  session: Pick<SessionResponse, "role"> | null | undefined,
  action: SecurityAction,
): boolean {
  return canRole(session?.role, action);
}

