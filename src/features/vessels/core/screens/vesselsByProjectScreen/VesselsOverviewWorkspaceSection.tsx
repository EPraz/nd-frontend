import { ToolbarSelect } from "@/src/components/ui/forms/ToolbarSelect";
import type { AssetDto } from "@/src/contracts/assets.contract";
import { useState } from "react";
import { VesselsTable } from "../../components/vesselTable/VesselsTable";
import VesselQuickViewModal from "../vesselQuickViewModal/VesselQuickViewModal";

type SortOption = "NAME_ASC" | "NAME_DESC";

type Props = {
  projectId: string;
  list: AssetDto[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
};

export function VesselsOverviewWorkspaceSection({
  projectId,
  list,
  isLoading,
  error,
  onRetry,
}: Props) {
  const [selectedVessel, setSelectedVessel] = useState<AssetDto | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("NAME_ASC");
  const [showSortMenu, setShowSortMenu] = useState(false);

  return (
    <>
      <VesselsTable
        projectId={projectId}
        title="Fleet registry"
        subtitleRight={`${list.length} vessels currently visible`}
        headerActions={
          <ToolbarSelect
            value={sortBy}
            options={["NAME_ASC", "NAME_DESC"]}
            open={showSortMenu}
            onToggle={() => setShowSortMenu((prev) => !prev)}
            onChange={(value) => {
              setSortBy(value);
              setShowSortMenu(false);
            }}
            renderLabel={(value) => (value === "NAME_DESC" ? "Z-A" : "A-Z")}
            triggerIconName="swap-vertical-outline"
            minWidth={112}
          />
        }
        data={list}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        sortBy={sortBy}
        selectedRowId={selectedVessel?.id ?? null}
        onRowPress={(row) => setSelectedVessel(row)}
      />

      {selectedVessel ? (
        <VesselQuickViewModal
          vessel={selectedVessel}
          onClose={() => setSelectedVessel(null)}
          projectId={projectId}
        />
      ) : null}
    </>
  );
}
