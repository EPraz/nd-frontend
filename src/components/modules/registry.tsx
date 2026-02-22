import type { AssetType } from "@/src/contracts/assets.contract";
import type { ProjectKind } from "@/src/contracts/projects.contract";
import type React from "react";
import { OverviewKpisModule } from "./overviewKpisModule";
import {
  AlertsFeedModule,
  CertificatesSummaryModule,
  CrewSummaryModule,
  ExpiringCertificatesModule,
  MaintenanceOverviewModule,
  ProjectHealthModule,
  VesselsListModule,
} from "./projectDashboard";

export type ModuleScope = "PROJECT" | "ASSET";

export type DashboardModule = {
  id: DashboardModuleId;
  label: string;
  scope: ModuleScope;
  supported: {
    projectKind: ProjectKind[];
    assetType?: AssetType[];
  };
  Component: React.ComponentType;
};

export type DashboardModuleId =
  | "certs_expiring"
  | "certs_summary"
  | "overview_kpis"
  | "vessels_list"
  | "alerts_feed"
  | "maintenance_overview"
  | "crew_summary"
  | "project_health";

export const MODULES: DashboardModule[] = [
  {
    id: "certs_expiring",
    label: "Expiring Certificates",
    scope: "PROJECT",
    supported: { projectKind: ["MARITIME"] },
    Component: ExpiringCertificatesModule,
  },
  {
    id: "certs_summary",
    label: "Certificates Summary",
    scope: "PROJECT",
    supported: { projectKind: ["MARITIME"] },
    Component: CertificatesSummaryModule,
  },
  {
    id: "overview_kpis",
    label: "Overview KPIs",
    scope: "PROJECT",
    supported: { projectKind: ["MARITIME"] },
    Component: OverviewKpisModule,
  },
  {
    id: "vessels_list",
    label: "Vessels List",
    scope: "PROJECT",
    supported: { projectKind: ["MARITIME"] },
    Component: VesselsListModule,
  },
  {
    id: "alerts_feed",
    label: "Alerts Feed",
    scope: "PROJECT",
    supported: { projectKind: ["MARITIME"] },
    Component: AlertsFeedModule,
  },
  {
    id: "maintenance_overview",
    label: "Maintenance Overview",
    scope: "PROJECT",
    supported: { projectKind: ["MARITIME"] },
    Component: MaintenanceOverviewModule,
  },
  {
    id: "crew_summary",
    label: "Crew Summary",
    scope: "PROJECT",
    supported: { projectKind: ["MARITIME"] },
    Component: CrewSummaryModule,
  },
  {
    id: "project_health",
    label: "Project Health",
    scope: "PROJECT",
    supported: { projectKind: ["MARITIME"] },
    Component: ProjectHealthModule,
  },
];

export function getModuleById(id: DashboardModuleId) {
  return MODULES.find((m) => m.id === id) ?? null;
}

export function isDashboardModuleId(id: string): id is DashboardModuleId {
  return MODULES.some((m) => m.id === id);
}

export function getAvailableModules(params: {
  scope: ModuleScope;
  projectKind: ProjectKind;
  assetType?: AssetType;
}) {
  const { scope, projectKind, assetType } = params;

  return MODULES.filter((m) => {
    if (m.scope !== scope) return false;
    if (!m.supported.projectKind.includes(projectKind)) return false;

    if (scope === "ASSET") {
      if (!assetType) return false;
      if (m.supported.assetType && !m.supported.assetType.includes(assetType))
        return false;
    }

    return true;
  });
}
