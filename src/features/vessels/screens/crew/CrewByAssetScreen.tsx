import { Button, PageHeader, StatCard } from "@/src/components";
import type { CrewDto } from "@/src/features/crew/contracts";
import { CrewQuickViewModal } from "@/src/features/crew/screens/crewQuickViewModal";
import { CrewTable } from "@/src/features/crew";
import { useCrewByAsset } from "@/src/hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";

export default function CrewByAssetScreen() {
  const router = useRouter();

  const { projectId, assetId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
  }>();

  const pid = String(projectId);
  const aid = String(assetId);

  const { crew, loading, error, refresh } = useCrewByAsset(pid, aid);
  const [selectedCrew, setSelectedCrew] = useState<CrewDto | null>(null);

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
    <View className="gap-6">
      <View className="gap-3">
        <PageHeader
          title="Crew"
          subTitle="Manage crew members assigned to this vessel."
          onRefresh={refresh}
          actions={
            <Button
              variant="default"
              size="sm"
              className="rounded-full"
              onPress={() => router.push(`/projects/${pid}/vessels/${aid}/crew/new`)}
            >
              + Add Crew Member
            </Button>
          }
        />
      </View>

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

      <View className="flex-1">
        <CrewTable
          title="Vessel Crew"
          subtitleRight="Sorted by name"
          data={crew}
          isLoading={loading}
          error={error}
          onRetry={refresh}
          showVesselColumn={false}
          selectedRowId={selectedCrew?.id ?? null}
          onRowPress={(row) => setSelectedCrew(row)}
        />

        {selectedCrew ? (
          <CrewQuickViewModal
            crew={selectedCrew}
            projectId={pid}
            onClose={() => setSelectedCrew(null)}
          />
        ) : null}
      </View>
    </View>
  );
}
