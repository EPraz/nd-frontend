export type ProjectSubmoduleEntitlementDto = {
  key: string;
  label: string;
  description: string | null;
  enabled: boolean;
};

export type ProjectModuleEntitlementDto = {
  key: string;
  label: string;
  description: string | null;
  enabled: boolean;
  submodules: ProjectSubmoduleEntitlementDto[];
};

export type ProjectModuleEntitlementsDto = {
  projectId: string;
  modules: ProjectModuleEntitlementDto[];
};

export type UpdateProjectSubmoduleEntitlementDto = {
  key: string;
  enabled: boolean;
};

export type UpdateProjectModuleEntitlementDto = {
  key: string;
  enabled: boolean;
  submodules: UpdateProjectSubmoduleEntitlementDto[];
};

export type UpdateProjectModuleEntitlementsDto = {
  modules: UpdateProjectModuleEntitlementDto[];
};
