import { PageHeader, StatCard, Text } from "@/src/components";
import { CrewTable } from "@/src/features/crew";
import { useCrewByAsset } from "@/src/hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, View } from "react-native";

export default function CrewByAssetScreen() {
  const router = useRouter();

  const { projectId, assetId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
  }>();

  const pid = String(projectId);
  const aid = String(assetId);

  const { crew, loading, error, refresh } = useCrewByAsset(pid, aid);

  const stats = useMemo(() => {
    let active = 0;
    let inactive = 0;

    for (const member of crew ?? []) {
      if (member.status === "ACTIVE") active += 1;
      if (member.status === "INACTIVE") inactive += 1;
    }

    return {
      total: crew?.length ?? 0,
      active,
      inactive,
    };
  }, [crew]);

  return (
    <View className="gap-6 p-4 web:p-6">
      <View className="gap-3">
        <PageHeader
          title="Crew"
          subTitle="Manage crew members assigned to this vessel."
        />

        {/* Action Row */}
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-muted">
            Vessel: <Text className="text-foreground font-semibold">{aid}</Text>
          </Text>

          <Pressable
            onPress={() =>
              router.push(`/projects/${pid}/vessels/${aid}/crew/create`)
            }
            className="rounded-full px-4 py-2 bg-primary"
          >
            <Text className="text-primary-foreground text-sm font-semibold">
              + Add Crew Member
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Stats */}
      <View className="gap-2 xl:gap-5 flex flex-row flex-wrap items-center justify-start xl:justify-between">
        <StatCard
          iconName="people-outline"
          iconLib="ion"
          title="Total Crew"
          value={String(stats.total)}
          suffix="assigned to this vessel"
          badgeValue={stats.active > 0 ? "OK" : "0"}
          badgeColor={stats.active > 0 ? "success" : "fail"}
          badgeLabel="status"
        />

        <StatCard
          iconName="checkmark-circle-outline"
          iconLib="ion"
          title="Active"
          value={String(stats.active)}
          suffix="currently active"
          badgeValue={stats.active > 0 ? "OK" : "0"}
          badgeColor={stats.active > 0 ? "success" : "fail"}
          badgeLabel="status"
        />

        <StatCard
          iconName="close-circle-outline"
          iconLib="ion"
          title="Inactive"
          value={String(stats.inactive)}
          suffix="not currently active"
          badgeValue={stats.inactive > 0 ? "INACTIVE" : "OK"}
          badgeColor={stats.inactive > 0 ? "fail" : "success"}
          badgeLabel="status"
        />
      </View>

      {/* Table */}
      <View className="flex-1">
        <CrewTable
          title="Vessel Crew"
          subtitleRight="Sorted by name"
          data={crew}
          isLoading={loading}
          error={error}
          onRetry={refresh}
          showVesselColumn={false}
        />
      </View>
    </View>
  );
}
