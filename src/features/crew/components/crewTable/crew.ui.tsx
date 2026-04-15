import { Text } from "@/src/components";
import { View } from "react-native";
import { CrewInactiveReason, CrewStatus } from "../../contracts";

export function crewStatusLabel(
  status: CrewStatus,
  inactiveReason?: CrewInactiveReason | null,
) {
  if (status === "ACTIVE") return "ACTIVE";
  if (inactiveReason === "VACATION") return "VACATION";
  if (inactiveReason === "INJURED") return "INJURED";
  return "INACTIVE";
}

export function CrewStatusPill(props: {
  status: CrewStatus;
  inactiveReason?: CrewInactiveReason | null;
}) {
  const label = crewStatusLabel(props.status, props.inactiveReason);

  const bg: Record<typeof label, string> = {
    ACTIVE: "bg-success/15",
    VACATION: "bg-info/15",
    INJURED: "bg-warning/15",
    INACTIVE: "bg-muted/15",
  };

  const text: Record<typeof label, string> = {
    ACTIVE: "text-success",
    VACATION: "text-info",
    INJURED: "text-warning",
    INACTIVE: "text-info",
  };

  return (
    <View className={`w-fit rounded-full px-3 py-1 ${bg[label]}`}>
      <Text className={`text-xs font-medium ${text[label]}`}>{label}</Text>
    </View>
  );
}
