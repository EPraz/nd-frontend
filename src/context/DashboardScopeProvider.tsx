import type { AssetType } from "@/src/contracts/assets.contract";
import type { ProjectKind } from "@/src/contracts/projects.contract";
import React, { createContext, useContext } from "react";

export type DashboardContext =
  | { scope: "PROJECT"; projectId: string; projectKind: ProjectKind }
  | {
      scope: "ASSET";
      projectId: string;
      projectKind: ProjectKind;
      assetId: string;
      assetType: AssetType;
    };

const DashboardScopeContext = createContext<DashboardContext | null>(null);

export function DashboardScopeProvider({
  value,
  children,
}: {
  value: DashboardContext;
  children: React.ReactNode;
}) {
  return (
    <DashboardScopeContext.Provider value={value}>
      {children}
    </DashboardScopeContext.Provider>
  );
}

export function useDashboardScope() {
  const ctx = useContext(DashboardScopeContext);
  if (!ctx)
    throw new Error(
      "useDashboardScope must be used within DashboardScopeProvider",
    );
  return ctx;
}
