import { useAlertsFeedData } from "@/src/hooks";
import { View } from "react-native";
import { ModuleFrame } from "../../dashboard/ModuleFrame";
import { Card, Text } from "../../ui";

export function AlertsFeedModule() {
  const { data, isLoading, error, refetch } = useAlertsFeedData();

  return (
    <ModuleFrame isLoading={isLoading} error={error} onRetry={refetch}>
      <Card className="p-3 gap-3">
        <Text className="text-sm font-semibold">Alerts</Text>

        {data.length === 0 ? (
          <Text className="text-xs text-muted">No alerts.</Text>
        ) : (
          <View className="gap-2">
            {data.slice(0, 10).map((a) => (
              <View
                key={a.id}
                className="flex-row items-center justify-between border-b border-border pb-2"
              >
                <View className="flex-1">
                  <Text className="text-sm font-medium">{a.title}</Text>
                  <Text className="text-xs text-muted">{a.subtitle}</Text>
                </View>

                <Text
                  className={`text-xs font-semibold ${
                    a.severity === "CRITICAL"
                      ? "text-destructive"
                      : "text-yellow-500"
                  }`}
                >
                  {a.severity}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    </ModuleFrame>
  );
}
