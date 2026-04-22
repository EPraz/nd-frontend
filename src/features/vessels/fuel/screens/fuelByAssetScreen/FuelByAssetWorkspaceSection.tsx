import { FuelQuickViewModal } from "@/src/features/fuel/core";
import { FuelTable } from "@/src/features/fuel/core/components";
import type { FuelDto } from "@/src/features/fuel/shared/contracts";
import { useMemo, useState } from "react";
import {
  filterFuelByEventType,
  type FuelEventFilter,
  type FuelSortOption,
  sortFuelLogs,
} from "./fuelByAssetWorkspace.helpers";
import { FuelByAssetTableActions } from "./FuelByAssetTableActions";

export function FuelByAssetWorkspaceSection({
  projectId,
  list,
  isLoading,
  error,
  onRetry,
}: {
  projectId: string;
  list: FuelDto[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const [selectedFuel, setSelectedFuel] = useState<FuelDto | null>(null);
  const [showEventMenu, setShowEventMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [filterEventType, setFilterEventType] = useState<FuelEventFilter>("ALL");
  const [sortBy, setSortBy] = useState<FuelSortOption>("DATE_DESC");

  const rows = useMemo(() => {
    return sortFuelLogs(
      filterFuelByEventType(list, filterEventType),
      sortBy,
    );
  }, [filterEventType, list, sortBy]);

  return (
    <>
      <FuelTable
        title="Vessel fuel log"
        subtitleRight={`${rows.length} events currently visible`}
        headerActions={
          <FuelByAssetTableActions
            filterEventType={filterEventType}
            sortBy={sortBy}
            showEventMenu={showEventMenu}
            showSortMenu={showSortMenu}
            onToggleEventMenu={() => setShowEventMenu((prev) => !prev)}
            onToggleSortMenu={() => setShowSortMenu((prev) => !prev)}
            onFilterChange={(value) => {
              setFilterEventType(value);
              setShowEventMenu(false);
            }}
            onSortChange={(value) => {
              setSortBy(value);
              setShowSortMenu(false);
            }}
          />
        }
        data={rows}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        showVesselColumn={false}
        selectedRowId={selectedFuel?.id ?? null}
        onRowPress={(row) => setSelectedFuel(row)}
      />

      {selectedFuel ? (
        <FuelQuickViewModal
          fuel={selectedFuel}
          projectId={projectId}
          onClose={() => setSelectedFuel(null)}
        />
      ) : null}
    </>
  );
}
