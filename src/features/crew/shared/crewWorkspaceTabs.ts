import type { RegistrySegmentedTab } from "@/src/components/ui/registryWorkspace";

export type CrewWorkspaceTab = "overview" | "certificates" | "bulk-upload";

export const CREW_WORKSPACE_TABS: RegistrySegmentedTab<CrewWorkspaceTab>[] = [
  { key: "overview", label: "Overview" },
  { key: "certificates", label: "Certificates" },
  { key: "bulk-upload", label: "Bulk Upload" },
];

export function normalizeCrewWorkspaceTab(
  value?: string,
): CrewWorkspaceTab {
  if (value === "certificates") return "certificates";
  if (value === "bulk-upload") return "bulk-upload";
  return "overview";
}
