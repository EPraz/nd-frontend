import { Button, PageHeader, StatCard } from "@/src/components";
import { AssetDto } from "@/src/contracts/assets.contract";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { VesselsTable } from "../../components";
import { useVesselsPageData } from "../../hooks";
import { VesselQuickViewModal } from "../vesselQuickViewModal";

export default function VesselsByProjectScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const pid = String(projectId);
  const [selectedVessel, setSelectedVessel] = useState<AssetDto | null>(null);

  const page = useVesselsPageData(pid);

  return (
    <View className="gap-6 p-4 web:p-6">
      <PageHeader
        title="Vessels"
        subTitle="Manage vessels assigned to this project."
      />

      <View className="gap-2 xl:gap-5 flex flex-row flex-wrap items-center justify-start xl:justify-between">
        <StatCard
          iconName="boat-outline"
          iconLib="ion"
          title="Total Vessels"
          value={String(page.stats.total)}
          suffix="in this project"
          badgeValue={String(page.stats.withIMO)}
          badgeColor={page.stats.withIMO > 0 ? "success" : "fail"}
          badgeLabel="with IMO"
        />

        <StatCard
          iconName="pricetag-outline"
          iconLib="ion"
          title="With License"
          value={String(page.stats.withLicense)}
          suffix="identified by license"
          badgeValue={String(page.stats.withFlag)}
          badgeColor={page.stats.withFlag > 0 ? "success" : "fail"}
          badgeLabel="with flag"
        />

        <StatCard
          iconName="flag-outline"
          iconLib="ion"
          title="Missing Flag"
          value={String(page.stats.missingFlag)}
          suffix="needs completion"
          badgeValue={page.stats.missingFlag > 0 ? "ATTN" : "OK"}
          badgeColor={page.stats.missingFlag > 0 ? "fail" : "success"}
          badgeLabel="status"
        />

        <StatCard
          iconName="information-circle-outline"
          iconLib="ion"
          title="Profiles"
          value={String(page.stats.withProfile)}
          suffix="vessel profiles"
          badgeValue={String(page.stats.total - page.stats.withProfile)}
          badgeColor={
            page.stats.withProfile === page.stats.total ? "success" : "fail"
          }
          badgeLabel="missing profile"
        />
      </View>

      <View className="flex-1 gap-4">
        <Button
          variant="default"
          size="sm"
          className="rounded-full self-end"
          onPress={() => router.push(`/projects/${pid}/vessels/new`)}
        >
          + Add Vessel
        </Button>

        <VesselsTable
          projectId={pid}
          title="Project Vessels"
          subtitleRight="Sorted by name"
          data={page.list}
          isLoading={page.isLoading}
          error={page.error}
          onRetry={page.refetch}
          sortByName
          selectedRowId={selectedVessel?.id ?? null}
          onRowPress={(row) => setSelectedVessel(row)}
        />

        {selectedVessel && (
          <VesselQuickViewModal
            vessel={selectedVessel}
            onClose={() => setSelectedVessel(null)}
            projectId={projectId}
          />
        )}
      </View>
    </View>
  );
}
