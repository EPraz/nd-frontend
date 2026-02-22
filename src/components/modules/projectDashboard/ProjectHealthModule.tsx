import { useProjectHealthData } from "@/src/hooks";
import { View } from "react-native";
import { ModuleFrame } from "../../dashboard/ModuleFrame";
import { Card, Text } from "../../ui";

export function ProjectHealthModule() {
  const { data, isLoading, error, refetch } = useProjectHealthData();

  const getColor = () => {
    switch (data.status) {
      case "HEALTHY":
        return "text-green-500";
      case "ATTENTION_REQUIRED":
        return "text-yellow-500";
      case "CRITICAL":
        return "text-destructive";
    }
  };

  return (
    <ModuleFrame isLoading={isLoading} error={error} onRetry={refetch}>
      <Card className="p-4 gap-4">
        <Text className="text-sm font-semibold">Project Health</Text>

        <Text className={`text-xl font-bold ${getColor()}`}>
          {data.status.replace("_", " ")}
        </Text>

        <View className="gap-1">
          {data.reasons.map((reason, i) => (
            <Text key={i} className="text-xs text-muted">
              • {reason}
            </Text>
          ))}
        </View>
      </Card>
    </ModuleFrame>
  );
}
