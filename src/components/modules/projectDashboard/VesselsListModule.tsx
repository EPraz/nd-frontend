import { useDashboardScope } from "@/src/context";
import { useVesselsListData } from "@/src/hooks";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { ModuleFrame } from "../../dashboard/ModuleFrame";
import { Card, Text } from "../../ui";

export function VesselsListModule() {
  const { projectId } = useDashboardScope();

  const { data, isLoading, error, refetch } = useVesselsListData();
  const router = useRouter();

  return (
    <ModuleFrame isLoading={isLoading} error={error} onRetry={refetch}>
      <Card className="p-3 gap-3">
        <Text className="text-sm font-semibold">Vessels</Text>

        <View className="border border-border rounded-md">
          <View className="flex-row bg-muted px-3 py-2">
            <Text className="flex-1 text-xs font-semibold">Name</Text>
            <Text className="w-[70px] text-xs font-semibold text-right">
              Cert
            </Text>
            <Text className="w-[70px] text-xs font-semibold text-right">
              Exp
            </Text>
            <Text className="w-[70px] text-xs font-semibold text-right">
              Crew
            </Text>
          </View>

          {data.map((row) => (
            <Pressable
              key={row.assetId}
              onPress={() =>
                router.push({
                  pathname: "/projects/[projectId]/vessels/[assetId]",
                  params: { projectId, assetId: row.assetId },
                })
              }
              className="flex-row items-center border-t border-border px-3 py-2"
            >
              <Text className="flex-1 text-xs font-medium">
                {row.assetName}
              </Text>

              <Text className="w-[70px] text-xs text-right">
                {row.totalCertificates}
              </Text>

              <Text
                className={`w-[70px] text-xs text-right ${
                  row.status === "CRITICAL"
                    ? "text-destructive"
                    : row.status === "WARNING"
                      ? "text-yellow-500"
                      : "text-muted"
                }`}
              >
                {row.expired}
              </Text>

              <Text className="w-[70px] text-xs text-right">
                {row.crewActive}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>
    </ModuleFrame>
  );
}
