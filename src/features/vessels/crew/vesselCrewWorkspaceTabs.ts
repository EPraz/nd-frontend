import type { RegistrySegmentedTab } from "@/src/components/ui/registryWorkspace";

export type VesselCrewWorkspaceTab = "overview" | "certificates";

export const VESSEL_CREW_WORKSPACE_TABS: RegistrySegmentedTab<VesselCrewWorkspaceTab>[] =
  [
    { key: "overview", label: "Overview" },
    { key: "certificates", label: "Certificates" },
  ];

export function normalizeVesselCrewWorkspaceTab(
  value: string | null | undefined,
): VesselCrewWorkspaceTab {
  return value === "certificates" ? "certificates" : "overview";
}
