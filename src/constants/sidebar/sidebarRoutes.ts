// sidebarRoutes.ts
import type { ProjectKind } from "@/src/contracts/projects.contract";
import type { Href } from "expo-router";
import type { SidebarKey } from "./sidebarKey";

export const sidebarRoutes = (
  projectId: string,
  kind: ProjectKind,
): Partial<Record<SidebarKey, Href>> => {
  const base = `/projects/${projectId}`;

  const common: Partial<Record<SidebarKey, Href>> = {
    dashboard: `${base}/dashboard`,
    settings: `${base}/settings`,
    help: `${base}/help`,
  };

  if (kind === "MARITIME") {
    return {
      ...common,
      vessels: `${base}/vessels`,
      certificates: `${base}/certificates`,
      crew: `${base}/crew`,
      maintenance: `${base}/maintenance`,
      fuel: `${base}/fuel`,
    };
  }

  if (kind === "STORE") {
    return {
      ...common,
      products: `${base}/products`,
      orders: `${base}/orders`,
    };
  }

  if (kind === "BARBERSHOP") {
    return {
      ...common,
      appointments: `${base}/appointments`,
      staff: `${base}/staff`,
    };
  }

  return common;
};
