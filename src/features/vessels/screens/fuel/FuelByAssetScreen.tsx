import { FuelTable, PageHeader, StatCard, Text } from "@/src/components";
import { useFuelByAsset } from "@/src/hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, View } from "react-native";

export default function FuelByAssetScreen() {
  const router = useRouter();

  const { projectId, assetId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
  }>();

  const pid = String(projectId);
  const aid = String(assetId);

  const { fuelLogs, loading, error, refresh } = useFuelByAsset(pid, aid);

  const stats = useMemo(() => {
    const raw = fuelLogs ?? [];

    let bunkered = 0;
    let consumed = 0;
    let transferred = 0;
    let adjustments = 0;

    let critical = 0;

    // unit dominante (L/MT)
    let lCount = 0;
    let mtCount = 0;

    for (const f of raw) {
      if (f.unit === "L") lCount += 1;
      if (f.unit === "MT") mtCount += 1;

      if (!f.price || !f.location) critical += 1;

      switch (f.eventType) {
        case "BUNKERED":
          bunkered += 1;
          break;
        case "CONSUMED":
          consumed += 1;
          break;
        case "TRANSFERRED":
          transferred += 1;
          break;
        case "ADJUSTMENT":
          adjustments += 1;
          break;
      }
    }

    const unit = mtCount > lCount ? "MT" : "L";

    // totales simples en unidad dominante (sin float)
    const toInt = (s: string) => Math.round(Number(s || "0") * 1000);
    const toStr = (n: number) => (n / 1000).toFixed(3).replace(/\.?0+$/, "");

    let bunkeredQtyInt = 0;
    let consumedQtyInt = 0;

    for (const f of raw) {
      if (f.unit !== unit) continue;
      if (f.eventType === "BUNKERED") bunkeredQtyInt += toInt(f.quantity);
      if (f.eventType === "CONSUMED") consumedQtyInt += toInt(f.quantity);
    }

    const bunkeredQty = toStr(bunkeredQtyInt);
    const consumedQty = toStr(consumedQtyInt);
    const netQty = toStr(bunkeredQtyInt - consumedQtyInt);

    return {
      total: raw.length,
      bunkered,
      consumed,
      transferred,
      adjustments,
      critical,
      unit,
      bunkeredQty,
      consumedQty,
      netQty,
    };
  }, [fuelLogs]);

  return (
    <View className="gap-6 p-4 web:p-6">
      <View className="gap-3">
        <PageHeader
          title="Fuel"
          subTitle="Review and log fuel operations for this vessel."
        />

        {/* Action row */}
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-muted">
            Vessel: <Text className="text-foreground font-semibold">{aid}</Text>
          </Text>

          <Pressable
            onPress={() =>
              router.push(`/projects/${pid}/vessels/${aid}/fuel/create`)
            }
            className="rounded-full px-4 py-2 bg-primary"
          >
            <Text className="text-primary-foreground text-sm font-semibold">
              + Add Fuel Log
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Stats */}
      <View className="gap-2 xl:gap-5 flex flex-row flex-wrap items-center justify-start xl:justify-between">
        <StatCard
          iconName="flame-outline"
          iconLib="ion"
          title="Total Events"
          value={String(stats.total)}
          suffix="for this vessel"
          badgeValue={String(stats.critical)}
          badgeColor={stats.critical > 0 ? "fail" : "success"}
          badgeLabel="missing price/location"
        />

        <StatCard
          iconName="download-outline"
          iconLib="ion"
          title="Bunkered"
          value={String(stats.bunkered)}
          suffix="events logged"
          badgeValue={`${stats.bunkeredQty} ${stats.unit}`}
          badgeColor="success"
          badgeLabel="total bunkered"
        />

        <StatCard
          iconName="trending-down-outline"
          iconLib="ion"
          title="Consumed"
          value={String(stats.consumed)}
          suffix="events logged"
          badgeValue={`${stats.consumedQty} ${stats.unit}`}
          badgeColor={stats.consumed > 0 ? "fail" : "success"}
          badgeLabel="total consumed"
        />

        <StatCard
          iconName="analytics-outline"
          iconLib="ion"
          title="Net"
          value={`${stats.netQty}`}
          suffix={`${stats.unit} (bunkered - consumed)`}
          badgeValue={stats.netQty.startsWith("-") ? "NEG" : "OK"}
          badgeColor={stats.netQty.startsWith("-") ? "fail" : "success"}
          badgeLabel="balance"
        />
      </View>

      {/* Table */}
      <View className="flex-1">
        <FuelTable
          title="Vessel Fuel Logs"
          subtitleRight="Sorted by date"
          data={fuelLogs}
          isLoading={loading}
          error={error}
          onRetry={refresh}
          showVesselColumn={false}
          sortByDate
          groupByFuelType
          // si luego tienes detail page:
          // onRowPress={(row) => router.push(`/projects/${pid}/vessels/${aid}/fuel/${row.id}`)}
        />
      </View>
    </View>
  );
}
