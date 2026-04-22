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
import { MaintenanceTable } from "../../components";
import { useMaintenancePageData } from "../../hooks";
import { MaintenanceStatus, MaintenanceDto } from "../../../shared/contracts";
import { MaintenanceQuickViewModal } from "../maintenanceQuickViewModal";

const STATUS_OPTIONS = [
  "ALL",
  "OPEN",
  "IN_PROGRESS",
  "DONE",
  "OVERDUE",
] as const;

const SORT_OPTIONS = ["DUE_ASC", "DUE_DESC", "TITLE_ASC"] as const;

export default function MaintenanceByProjectScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const pid = String(projectId);

  const page = useMaintenancePageData(pid);
  const [selectedTask, setSelectedTask] = useState<MaintenanceDto | null>(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const summaryItems = [
    {
      label: "Tasks in scope",
      value: String(page.stats.total),
      helper: "tracked in this project",
      tone: "accent" as const,
    },
    {
      label: "Open",
      value: String(page.stats.open),
      helper:
        page.stats.highPriorityOpen > 0
          ? `${page.stats.highPriorityOpen} high priority`
          : "pending action",
      tone: page.stats.open > 0 ? ("danger" as const) : ("ok" as const),
    },
    {
      label: "In progress",
      value: String(page.stats.inProgress),
      helper: "currently being worked",
      tone: page.stats.inProgress > 0 ? ("warn" as const) : ("ok" as const),
    },
    {
      label: "Completed",
      value: String(page.stats.done),
      helper: "finished tasks",
      tone: "ok" as const,
    },
  ];

  return (
    <View className="gap-5 p-4 web:p-6">
      <View className="gap-4">
        <RegistryWorkspaceHeader
          title="Maintenance"
          eyebrow="Project maintenance registry"
          actions={
            <RegistryHeaderActionButton
              variant="soft"
              iconName="refresh-outline"
              onPress={page.refetch}
            >
              Refresh
            </RegistryHeaderActionButton>
          }
        />

        <RegistrySegmentedTabs
          tabs={[{ key: "overview", label: "Overview" }]}
          activeKey="overview"
          onChange={() => {}}
        />

        <RegistrySummaryStrip items={summaryItems} />
      </View>

      <MaintenanceTable
        title="Task queue"
        subtitleRight={`${page.list.length} tasks currently visible`}
        headerActions={
          <>
            <ToolbarSelect
              value={page.filterStatus}
              options={[...STATUS_OPTIONS]}
              open={showStatusMenu}
              onToggle={() => setShowStatusMenu((prev) => !prev)}
              onChange={(value) => {
                page.setFilterStatus(value as "ALL" | MaintenanceStatus);
                setShowStatusMenu(false);
              }}
              renderLabel={(value) =>
                value === "ALL"
                  ? "All status"
                  : value === "IN_PROGRESS"
                    ? "In progress"
                    : value
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
                value === "DUE_ASC"
                  ? "Next due"
                  : value === "DUE_DESC"
                    ? "Latest due"
                    : "Title A-Z"
              }
              triggerIconName="swap-vertical-outline"
              minWidth={148}
            />
          </>
        }
        data={page.list}
        isLoading={page.isLoading}
        error={page.error}
        onRetry={page.refetch}
        showVesselColumn
        selectedRowId={selectedTask?.id ?? null}
        onRowPress={(row) => setSelectedTask(row)}
      />

      {selectedTask ? (
        <MaintenanceQuickViewModal
          task={selectedTask}
          projectId={pid}
          onClose={() => setSelectedTask(null)}
        />
      ) : null}
    </View>
  );
}
