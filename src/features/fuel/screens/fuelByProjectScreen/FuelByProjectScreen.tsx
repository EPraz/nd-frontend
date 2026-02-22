import { Button, PageHeader, StatCard } from "@/src/components";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { FuelTable } from "../../components";
import type { FuelDto } from "../../contracts";
import { useFuelPageData } from "../../hooks";
import { FuelQuickViewModal } from "../fuelQuickViewModal";

export default function FuelByProjectScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const pid = String(projectId);

  const page = useFuelPageData(pid);
  const [selectedFuel, setSelectedFuel] = useState<FuelDto | null>(null);

  return (
    <View className="gap-6 p-4 web:p-6">
      <PageHeader
        title="Fuel"
        subTitle="Monitor bunkering and consumption events across vessels."
        onRefresh={page.refetch}
      />

      <View className="gap-2 xl:gap-5 flex flex-row flex-wrap items-center justify-start xl:justify-between">
        <StatCard
          iconName="flame-outline"
          iconLib="ion"
          title="Total Events"
          value={String(page.stats.total)}
          suffix="in this project"
          badgeValue={String(page.stats.critical)}
          badgeColor={page.stats.critical > 0 ? "fail" : "success"}
          badgeLabel="missing price/location"
        />

        <StatCard
          iconName="download-outline"
          iconLib="ion"
          title="Bunkered"
          value={String(page.stats.bunkered)}
          suffix="events logged"
          badgeValue={String(page.stats.bunkeredQty)}
          badgeColor="success"
          badgeLabel={`total (${page.stats.unit})`}
        />

        <StatCard
          iconName="trending-down-outline"
          iconLib="ion"
          title="Consumed"
          value={String(page.stats.consumed)}
          suffix="events logged"
          badgeValue={String(page.stats.consumedQty)}
          badgeColor={page.stats.consumed > 0 ? "fail" : "success"}
          badgeLabel={`total (${page.stats.unit})`}
        />

        <StatCard
          iconName="swap-horizontal-outline"
          iconLib="ion"
          title="Transferred"
          value={String(page.stats.transferred)}
          suffix="events logged"
          badgeValue={String(page.stats.adjustments)}
          badgeColor={page.stats.adjustments > 0 ? "fail" : "success"}
          badgeLabel="adjustments"
        />
      </View>

      <View className="flex-1 gap-4">
        <Button
          variant="default"
          size="sm"
          className="rounded-full self-end"
          onPress={() => router.push(`/projects/${pid}/fuel/new`)}
        >
          + Add Fuel Log
        </Button>

        <FuelTable
          title="Fuel Events"
          subtitleRight="Sorted by date"
          data={page.list} // ✅ FuelDto[]
          isLoading={page.isLoading}
          error={page.error}
          onRetry={page.refetch}
          showVesselColumn
          sortByDate
          selectedRowId={selectedFuel?.id ?? null}
          onRowPress={(row) => setSelectedFuel(row)}
        />

        {selectedFuel && (
          <FuelQuickViewModal
            fuel={selectedFuel}
            projectId={pid}
            onClose={() => setSelectedFuel(null)}
          />
        )}
      </View>
    </View>
  );
}
