import type { UserRole } from "@/src/contracts/admin.contract";
import type { ProjectKind } from "@/src/contracts/projects.contract";

export const PROJECT_KIND_OPTIONS: ProjectKind[] = ["MARITIME"];

export const USER_ROLE_OPTIONS: UserRole[] = ["ADMIN", "OPS", "VIEWER"];

export const KIND_LABEL: Record<ProjectKind, string> = {
  MARITIME: "Maritime",
  STORE: "Store",
  BARBERSHOP: "Barbershop",
  OTHER: "Other",
};

export const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: "Admin",
  OPS: "Ops",
  VIEWER: "Viewer",
};

export function formatAdminDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleDateString();
}
