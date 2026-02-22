export type ProjectKind = "MARITIME" | "STORE" | "BARBERSHOP" | "OTHER";
export type ProjectStatus = "ACTIVE" | "ARCHIVED";

export interface ProjectDto {
  id: string;
  name: string;
  companyId: string;
  status: ProjectStatus;
  kind: ProjectKind;
  createdAt: string;
}
