import type { RegistrySegmentedTab } from "@/src/components/ui/registryWorkspace";

export type AssetCertificatesWorkspaceTab = "overview" | "requirements";

export const ASSET_CERTIFICATES_WORKSPACE_TABS: RegistrySegmentedTab<AssetCertificatesWorkspaceTab>[] =
  [
    { key: "overview", label: "Overview" },
    { key: "requirements", label: "Requirements" },
  ];

export function normalizeAssetCertificatesWorkspaceTab(
  value?: string,
): AssetCertificatesWorkspaceTab {
  return value === "requirements" ? "requirements" : "overview";
}
