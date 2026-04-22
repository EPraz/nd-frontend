import { ToolbarSelect } from "@/src/components/ui/forms/ToolbarSelect";
import { useState } from "react";
import { CrewTable } from "../../components/crewTable/CrewTable";
import type { CrewDto } from "../../contracts";
import CrewQuickViewModal from "../crewQuickViewModal/CrewQuickViewModal";

const SORT_OPTIONS = ["ACTIVE_FIRST", "NAME_ASC", "NAME_DESC"] as const;

type SortOption = (typeof SORT_OPTIONS)[number];

type Props = {
  projectId: string;
  list: CrewDto[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
};

export function CrewOverviewWorkspaceSection({
  projectId,
  list,
  isLoading,
  error,
  onRetry,
}: Props) {
  const [selectedCrew, setSelectedCrew] = useState<CrewDto | null>(null);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("ACTIVE_FIRST");

  return (
    <>
      <CrewTable
        title="Crew roster"
        subtitleRight={`${list.length} crew currently visible`}
        headerActions={
          <ToolbarSelect
            value={sortBy}
            options={[...SORT_OPTIONS]}
            open={showSortMenu}
            onToggle={() => setShowSortMenu((prev) => !prev)}
            onChange={(value) => {
              setSortBy(value);
              setShowSortMenu(false);
            }}
            renderLabel={(value) =>
              value === "ACTIVE_FIRST"
                ? "Active first"
                : value === "NAME_ASC"
                  ? "A-Z"
                  : "Z-A"
            }
            triggerIconName="swap-vertical-outline"
            minWidth={146}
          />
        }
        data={list}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        showVesselColumn
        selectedRowId={selectedCrew?.id ?? null}
        onRowPress={(row) => setSelectedCrew(row)}
        sortBy={sortBy}
      />

      {selectedCrew ? (
        <CrewQuickViewModal
          crew={selectedCrew}
          projectId={projectId}
          onClose={() => setSelectedCrew(null)}
        />
      ) : null}
    </>
  );
}
