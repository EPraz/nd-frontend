import { Text } from "@/src/components";
import { View } from "react-native";
import { CrewStatus } from "../../contracts";

export function CrewStatusPill(props: { status: CrewStatus }) {
  const s = props.status;

  const bg: Record<CrewStatus, string> = {
    ACTIVE: "bg-success/15",
    INACTIVE: "bg-muted/15",
  };

  const text: Record<CrewStatus, string> = {
    ACTIVE: "text-success",
    INACTIVE: "text-info",
  };

  return (
    <View className={`px-3 py-1 rounded-full w-fit ${bg[s]}`}>
      <Text className={`text-xs font-medium ${text[s]}`}>{s}</Text>
    </View>
  );
}
