import { MiniStat } from "@/src/helpers";
import { useCrewSummaryData } from "@/src/hooks";
import { View } from "react-native";
import { ModuleFrame } from "../../dashboard/ModuleFrame";
import { Card, Text } from "../../ui";

export function CrewSummaryModule() {
  const { data, isLoading, error, refetch } = useCrewSummaryData();

  return (
    <ModuleFrame isLoading={isLoading} error={error} onRetry={refetch}>
      <View className="gap-3">
        {/* Stats */}
        <View className="flex-row gap-3">
          <MiniStat label="Total" value={String(data.total)} />
          <MiniStat label="Active" value={String(data.active)} />
          <MiniStat label="Inactive" value={String(data.inactive)} />
          <MiniStat
            label="Vessels w/o Crew"
            value={String(data.vesselsWithoutActiveCrew)}
          />
        </View>

        {/* Top vessels */}
        <Card className="p-3 gap-2">
          <Text className="text-sm font-semibold">Top Crew by Vessel</Text>

          {data.crewByVessel.length === 0 ? (
            <Text className="text-xs text-muted">No crew assigned.</Text>
          ) : (
            data.crewByVessel.map((v) => (
              <View
                key={v.assetId}
                className="flex-row justify-between border-b border-border pb-2"
              >
                <Text className="text-sm">{v.assetName}</Text>
                <Text className="text-sm font-semibold">{v.activeCount}</Text>
              </View>
            ))
          )}
        </Card>
      </View>
    </ModuleFrame>
  );
}
