import type {
  ProjectModuleEntitlementDto,
  ProjectModuleEntitlementsDto,
} from "@/src/contracts/project-entitlements.contract";
import { resolveVesselSectionModuleKey } from "@/src/helpers/projectEntitlements";
import { PROJECT_MODULE_CATALOG } from "@/src/constants/projectModules";
import { useProjectModuleEntitlements } from "@/src/hooks/useProjectModuleEntitlements";
import React, { createContext, useContext, useMemo } from "react";

type ProjectEntitlementsContextValue = {
  entitlements: ProjectModuleEntitlementsDto | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  save: ReturnType<typeof useProjectModuleEntitlements>["save"];
  isModuleEnabled: (moduleKey: string) => boolean;
  isSubmoduleEnabled: (moduleKey: string, submoduleKey: string) => boolean;
};

const ProjectEntitlementsContext =
  createContext<ProjectEntitlementsContextValue | null>(null);

export function ProjectEntitlementsProvider({
  projectId,
  children,
}: {
  projectId: string;
  children: React.ReactNode;
}) {
  const state = useProjectModuleEntitlements(projectId);

  const value = useMemo<ProjectEntitlementsContextValue>(() => {
    const modules = state.data?.modules ?? [];

    const catalogByKey = new Map(PROJECT_MODULE_CATALOG.map((m) => [m.key, m]));

    const findModule = (moduleKey: string): ProjectModuleEntitlementDto | undefined =>
      modules.find((module) => module.key === moduleKey);

    const getModuleEnabled = (moduleKey: string) =>
      findModule(moduleKey)?.enabled ??
      catalogByKey.get(moduleKey)?.defaultEnabled ??
      true;

    return {
      entitlements: state.data,
      loading: state.loading,
      saving: state.saving,
      error: state.error,
      refresh: state.refresh,
      save: state.save,
      isModuleEnabled: getModuleEnabled,
      isSubmoduleEnabled: (moduleKey: string, submoduleKey: string) => {
        if (moduleKey === "vessels") {
          const inheritedModuleKey = resolveVesselSectionModuleKey(submoduleKey);
          if (inheritedModuleKey) {
            return getModuleEnabled(inheritedModuleKey);
          }
        }

        const module = findModule(moduleKey);
        const catalog = catalogByKey.get(moduleKey);

        if (!module) {
          return (
            catalog?.submodules.find((submodule) => submodule.key === submoduleKey)
              ?.defaultEnabled ?? true
          );
        }
        if (!module.enabled) return false;
        return (
          module.submodules.find((submodule) => submodule.key === submoduleKey)
            ?.enabled ??
          catalog?.submodules.find((submodule) => submodule.key === submoduleKey)
            ?.defaultEnabled ??
          true
        );
      },
    };
  }, [state.data, state.error, state.loading, state.refresh, state.save, state.saving]);

  return (
    <ProjectEntitlementsContext.Provider value={value}>
      {children}
    </ProjectEntitlementsContext.Provider>
  );
}

export function useProjectEntitlements() {
  const ctx = useContext(ProjectEntitlementsContext);
  if (!ctx) {
    throw new Error(
      "useProjectEntitlements must be used within ProjectEntitlementsProvider",
    );
  }
  return ctx;
}
