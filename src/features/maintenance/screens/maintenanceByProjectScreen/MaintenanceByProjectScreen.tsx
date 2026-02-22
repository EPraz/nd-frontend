import { PageHeader, StatCard } from "@/src/components";
import { useMaintenancePageData } from "@/src/hooks";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { MaintenanceTable } from "../../components";
import { MaintenanceDto } from "../../contracts";
import { MaintenanceQuickViewModal } from "../maintenanceQuickViewModal";

export default function MaintenanceByProjectScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const pid = String(projectId);

  const page = useMaintenancePageData(pid);
  const [selectedTask, setSelectedTask] = useState<MaintenanceDto | null>(null);

  return (
    <View className="gap-6 p-4 web:p-6">
      <PageHeader
        title="Maintenance"
        subTitle="Track and manage maintenance tasks across vessels."
        onRefresh={page.refetch}
      />

      <View className="gap-2 xl:gap-5 flex flex-row flex-wrap items-center justify-start xl:justify-between">
        <StatCard
          iconName="construct-outline"
          iconLib="ion"
          title="Total Tasks"
          value={String(page.stats.total)}
          suffix="in this project"
          badgeValue={String(page.stats.highPriorityOpen)}
          badgeColor={page.stats.highPriorityOpen > 0 ? "fail" : "success"}
          badgeLabel="high priority open"
        />
        <StatCard
          iconName="alert-circle-outline"
          iconLib="ion"
          title="Open"
          value={String(page.stats.open)}
          suffix="pending action"
          badgeValue={page.stats.open > 0 ? "ACTIVE" : "OK"}
          badgeColor={page.stats.open > 0 ? "fail" : "success"}
          badgeLabel="status"
        />
        <StatCard
          iconName="time-outline"
          iconLib="ion"
          title="In Progress"
          value={String(page.stats.inProgress)}
          suffix="currently ongoing"
          badgeValue={page.stats.inProgress > 0 ? "WORKING" : "OK"}
          badgeColor="success"
          badgeLabel="status"
        />
        <StatCard
          iconName="checkmark-circle-outline"
          iconLib="ion"
          title="Completed"
          value={String(page.stats.done)}
          suffix="finished tasks"
          badgeValue={String(page.stats.done)}
          badgeColor="success"
          badgeLabel="done"
        />
      </View>

      <View className="flex-1">
        <MaintenanceTable
          title="Maintenance Tasks"
          subtitleRight="Sorted by due date"
          data={page.list}
          isLoading={page.isLoading}
          error={page.error}
          onRetry={page.refetch}
          showVesselColumn
          sortByDueDate
          selectedRowId={selectedTask?.id ?? null}
          onRowPress={(row) => setSelectedTask(row)}
        />

        {selectedTask && (
          <MaintenanceQuickViewModal
            task={selectedTask}
            projectId={pid}
            onClose={() => setSelectedTask(null)}
          />
        )}
      </View>
    </View>
  );
}
