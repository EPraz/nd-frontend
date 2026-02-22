import { Button, PageHeader, StatCard } from "@/src/components";
import { useCrewPageData } from "@/src/features/crew/hooks/useCrewPageData";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { CrewTable } from "../../components";
import type { CrewDto } from "../../contracts";
import { CrewQuickViewModal } from "../crewQuickViewModal";

export default function CrewByProjectScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const pid = String(projectId);

  const page = useCrewPageData(pid);
  const [selectedCrew, setSelectedCrew] = useState<CrewDto | null>(null);

  return (
    <View className="gap-6 p-4 web:p-6">
      <PageHeader
        title="Crew"
        subTitle="Track and manage crew members across vessels."
        onRefresh={page.refetch}
      />

      <View className="gap-2 xl:gap-5 flex flex-row flex-wrap items-center justify-start xl:justify-between">
        <StatCard
          iconName="people-outline"
          iconLib="ion"
          title="Total Crew"
          value={String(page.stats.total)}
          suffix="in this project"
          badgeValue={String(page.stats.vesselsWithCrew)}
          badgeColor={page.stats.vesselsWithCrew > 0 ? "success" : "fail"}
          badgeLabel="vessels covered"
        />

        <StatCard
          iconName="checkmark-circle-outline"
          iconLib="ion"
          title="Active"
          value={String(page.stats.active)}
          suffix="available members"
          badgeValue={page.stats.active > 0 ? "OK" : "—"}
          badgeColor={page.stats.active > 0 ? "success" : "fail"}
          badgeLabel="status"
        />

        <StatCard
          iconName="close-circle-outline"
          iconLib="ion"
          title="Inactive"
          value={String(page.stats.inactive)}
          suffix="not active"
          badgeValue={page.stats.inactive > 0 ? "ATTN" : "OK"}
          badgeColor={page.stats.inactive > 0 ? "fail" : "success"}
          badgeLabel="status"
        />
      </View>

      <View className="flex-1 gap-4">
        <Button
          variant="default"
          size="sm"
          className="rounded-full self-end"
          onPress={() => router.push(`/projects/${pid}/crew/new`)}
        >
          + Add Crew
        </Button>

        <CrewTable
          title="Crew Members"
          subtitleRight="Sorted by name"
          data={page.list}
          isLoading={page.isLoading}
          error={page.error}
          onRetry={page.refetch}
          showVesselColumn
          selectedRowId={selectedCrew?.id ?? null}
          onRowPress={(row) => setSelectedCrew(row)}
        />

        {selectedCrew && (
          <CrewQuickViewModal
            crew={selectedCrew}
            projectId={pid}
            onClose={() => setSelectedCrew(null)}
          />
        )}
      </View>
    </View>
  );
}
