import { MiniStat } from "@/src/helpers";
import { useMaintenanceOverviewData } from "@/src/hooks";
import { View } from "react-native";
import { ModuleFrame } from "../../dashboard/ModuleFrame";
import { Card, Text } from "../../ui";

export function MaintenanceOverviewModule() {
  const { data, isLoading, error, refetch } = useMaintenanceOverviewData();

  return (
    <ModuleFrame isLoading={isLoading} error={error} onRetry={refetch}>
      <View className="gap-3">
        {/* Stats */}
        <View className="flex-row gap-3">
          <MiniStat label="Total" value={String(data.total)} />
          <MiniStat label="Open" value={String(data.open)} />
          <MiniStat label="In Progress" value={String(data.inProgress)} />
          <MiniStat label="Overdue" value={String(data.overdue)} />
        </View>

        {/* Next Due */}
        <Card className="p-3 gap-1">
          <Text className="text-sm font-semibold">Next Maintenance</Text>

          {data.nextDue ? (
            <>
              <Text className="text-sm font-medium">{data.nextDue.title}</Text>
              <Text className="text-xs text-muted">
                {data.nextDue.assetName}
              </Text>
              <Text className="text-xs text-muted">
                {new Date(data.nextDue.dueDate).toLocaleDateString()}
              </Text>
            </>
          ) : (
            <Text className="text-xs text-muted">No upcoming maintenance.</Text>
          )}
        </Card>
      </View>
    </ModuleFrame>
  );
}
