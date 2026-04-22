import type { RegistrySegmentedTab } from "@/src/components/ui/registryWorkspace";

export type VesselWorkspaceTab = "overview";

export const VESSEL_WORKSPACE_TABS: RegistrySegmentedTab<VesselWorkspaceTab>[] =
  [{ key: "overview", label: "Overview" }];
