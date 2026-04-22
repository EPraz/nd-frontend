import { ToolbarSelect } from "@/src/components/ui/forms/ToolbarSelect";
import {
  RegistryHeaderActionButton,
  RegistrySegmentedTabs,
  RegistrySummaryStrip,
  RegistryWorkspaceHeader,
} from "@/src/components/ui/registryWorkspace";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { FuelTable } from "../../components";
import type { FuelDto, FuelEventType } from "../../../shared/contracts";
import { useFuelPageData } from "../../hooks";
import { FuelQuickViewModal } from "../fuelQuickViewModal";

const EVENT_OPTIONS = [
  "ALL",
  "BUNKERED",
  "CONSUMED",
  "TRANSFERRED",
  "ADJUSTMENT",
] as const;

const SORT_OPTIONS = ["DATE_DESC", "DATE_ASC", "QTY_DESC"] as const;

export default function FuelByProjectScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const pid = String(projectId);

  const page = useFuelPageData(pid);
  const [selectedFuel, setSelectedFuel] = useState<FuelDto | null>(null);
  const [showEventMenu, setShowEventMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const summaryItems = [
    {
      label: "Events in scope",
      value: String(page.stats.total),
      helper: "tracked in this project",
      tone: "accent" as const,
    },
    {
      label: "Bunkered",
      value: String(page.stats.bunkered),
      helper: `${page.stats.bunkeredQty} ${page.stats.unit} total`,
      tone: "ok" as const,
    },
    {
      label: "Consumed",
      value: String(page.stats.consumed),
      helper: `${page.stats.consumedQty} ${page.stats.unit} total`,
      tone: page.stats.consumed > 0 ? ("warn" as const) : ("ok" as const),
    },
    {
      label: "Critical gaps",
      value: String(page.stats.critical),
      helper: "missing price or location",
      tone: page.stats.critical > 0 ? ("danger" as const) : ("ok" as const),
    },
  ];

  return (
    <View className="gap-5 p-4 web:p-6">
      <View className="gap-4">
        <RegistryWorkspaceHeader
          title="Fuel"
          eyebrow="Project fuel registry"
          actions={
            <>
              <RegistryHeaderActionButton
                variant="soft"
                iconName="refresh-outline"
                onPress={page.refetch}
              >
                Refresh
              </RegistryHeaderActionButton>

              {/* <RegistryHeaderActionButton
                variant="default"
                iconName="add-outline"
                iconSize={15}
                onPress={() => router.push(`/projects/${pid}/fuel/new`)}
              >
                Add Fuel Log
              </RegistryHeaderActionButton> */}
            </>
          }
        />

        <RegistrySegmentedTabs
          tabs={[{ key: "overview", label: "Overview" }]}
          activeKey="overview"
          onChange={() => {}}
        />

        <RegistrySummaryStrip items={summaryItems} />
      </View>

      <FuelTable
        title="Fuel log"
        subtitleRight={`${page.list.length} events currently visible`}
        headerActions={
          <>
            <ToolbarSelect
              value={page.filterEventType}
              options={[...EVENT_OPTIONS]}
              open={showEventMenu}
              onToggle={() => setShowEventMenu((prev) => !prev)}
              onChange={(value) => {
                page.setFilterEventType(value as "ALL" | FuelEventType);
                setShowEventMenu(false);
              }}
              renderLabel={(value) =>
                value === "ALL"
                  ? "All events"
                  : value === "ADJUSTMENT"
                    ? "Adjustments"
                    : value.charAt(0) + value.slice(1).toLowerCase()
              }
              triggerIconName="filter-outline"
              minWidth={160}
            />

            <ToolbarSelect
              value={page.sort}
              options={[...SORT_OPTIONS]}
              open={showSortMenu}
              onToggle={() => setShowSortMenu((prev) => !prev)}
              onChange={(value) => {
                page.setSort(value);
                setShowSortMenu(false);
              }}
              renderLabel={(value) =>
                value === "DATE_DESC"
                  ? "Latest first"
                  : value === "DATE_ASC"
                    ? "Oldest first"
                    : "Qty high-low"
              }
              triggerIconName="swap-vertical-outline"
              minWidth={152}
            />
          </>
        }
        data={page.list}
        isLoading={page.isLoading}
        error={page.error}
        onRetry={page.refetch}
        showVesselColumn
        selectedRowId={selectedFuel?.id ?? null}
        onRowPress={(row) => setSelectedFuel(row)}
      />

      {selectedFuel ? (
        <FuelQuickViewModal
          fuel={selectedFuel}
          projectId={pid}
          onClose={() => setSelectedFuel(null)}
        />
      ) : null}
    </View>
  );
}
