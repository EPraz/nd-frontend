import { MaintenanceTable, PageHeader, StatCard, Text } from "@/src/components";
import { useMaintenanceByAsset } from "@/src/hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, View } from "react-native";

export default function MaintenanceByAssetScreen() {
  const router = useRouter();

  const { projectId, assetId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
  }>();

  const pid = String(projectId);
  const aid = String(assetId);

  const { maintenance, loading, error, refresh } = useMaintenanceByAsset(
    pid,
    aid,
  );

  const stats = useMemo(() => {
    let open = 0;
    let inProgress = 0;
    let done = 0;
    let highPriorityOpen = 0;

    for (const m of maintenance ?? []) {
      if (m.status === "OPEN") {
        open += 1;
        if (m.priority === "HIGH") {
          highPriorityOpen += 1;
        }
      }

      if (m.status === "IN_PROGRESS") {
        inProgress += 1;
      }

      if (m.status === "DONE") {
        done += 1;
      }
    }

    return {
      total: maintenance?.length ?? 0,
      open,
      inProgress,
      done,
      highPriorityOpen,
    };
  }, [maintenance]);

  return (
    <View className="gap-6 p-4 web:p-6">
      <View className="gap-3">
        <PageHeader
          title="Maintenance"
          subTitle="Manage maintenance tasks for this vessel."
        />

        {/* Action Row */}
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-muted">
            Vessel: <Text className="text-foreground font-semibold">{aid}</Text>
          </Text>

          <Pressable
            onPress={() =>
              router.push(`/projects/${pid}/vessels/${aid}/maintenance/create`)
            }
            className="rounded-full px-4 py-2 bg-primary"
          >
            <Text className="text-primary-foreground text-sm font-semibold">
              + Add Task
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Stats */}
      <View className="gap-2 xl:gap-5 flex flex-row flex-wrap items-center justify-start xl:justify-between">
        <StatCard
          iconName="construct-outline"
          iconLib="ion"
          title="Total Tasks"
          value={String(stats.total)}
          suffix="for this vessel"
          badgeValue={String(stats.highPriorityOpen)}
          badgeColor={stats.highPriorityOpen > 0 ? "fail" : "success"}
          badgeLabel="high priority open"
        />

        <StatCard
          iconName="alert-circle-outline"
          iconLib="ion"
          title="Open"
          value={String(stats.open)}
          suffix="pending action"
          badgeValue={stats.open > 0 ? "ACTIVE" : "OK"}
          badgeColor={stats.open > 0 ? "fail" : "success"}
          badgeLabel="status"
        />

        <StatCard
          iconName="time-outline"
          iconLib="ion"
          title="In Progress"
          value={String(stats.inProgress)}
          suffix="currently ongoing"
          badgeValue={stats.inProgress > 0 ? "WORKING" : "OK"}
          badgeColor="success"
          badgeLabel="status"
        />

        <StatCard
          iconName="checkmark-circle-outline"
          iconLib="ion"
          title="Completed"
          value={String(stats.done)}
          suffix="finished tasks"
          badgeValue={String(stats.done)}
          badgeColor="success"
          badgeLabel="done"
        />
      </View>

      {/* Table */}
      <View className="flex-1">
        <MaintenanceTable
          title="Vessel Maintenance Tasks"
          subtitleRight="Sorted by due date"
          data={maintenance}
          isLoading={loading}
          error={error}
          onRetry={refresh}
          showVesselColumn={false}
          sortByDueDate
        />
      </View>
    </View>
  );
}
