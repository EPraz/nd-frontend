import { Text } from "@/src/components";

import { View } from "react-native";
import { MaintenancePriority, MaintenanceStatus } from "../../contracts";

export function MaintenanceStatusPill(props: {
  status: MaintenanceStatus;
  overdue?: boolean;
}) {
  const { status, overdue } = props;

  const isOverdue = overdue && status !== "DONE";

  if (isOverdue) {
    return (
      <View className="px-3 py-1 rounded-full w-fit bg-destructive/20">
        <Text className="text-xs font-medium text-destructive">OVERDUE</Text>
      </View>
    );
  }

  const pillBg: Record<MaintenanceStatus, string> = {
    OPEN: "bg-destructive/15",
    IN_PROGRESS: "bg-warning/15",
    DONE: "bg-success/15",
  };

  const pillText: Record<MaintenanceStatus, string> = {
    OPEN: "text-destructive",
    IN_PROGRESS: "text-warning",
    DONE: "text-success",
  };

  return (
    <View className={`px-3 py-1 rounded-full w-fit ${pillBg[status]}`}>
      <Text className={`text-xs font-medium ${pillText[status]}`}>
        {status}
      </Text>
    </View>
  );
}

export function MaintenancePriorityPill(props: {
  priority: MaintenancePriority;
}) {
  const p = props.priority;

  const pillBg: Record<MaintenancePriority, string> = {
    LOW: "bg-muted/15",
    MEDIUM: "bg-warning/15",
    HIGH: "bg-destructive/15",
  };

  const pillText: Record<MaintenancePriority, string> = {
    LOW: "text-info",
    MEDIUM: "text-warning",
    HIGH: "text-destructive",
  };

  return (
    <View className={`px-3 py-1 rounded-full w-fit ${pillBg[p]}`}>
      <Text className={`text-xs font-medium ${pillText[p]}`}>{p}</Text>
    </View>
  );
}
