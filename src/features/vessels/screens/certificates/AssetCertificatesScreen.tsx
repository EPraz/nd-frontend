import { PageHeader, StatCard, Text } from "@/src/components";
import { CertificatesTable } from "@/src/features/certificates/components";
import { useCertificatesByAsset } from "@/src/hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, View } from "react-native";

export default function AssetCertificatesScreen() {
  const router = useRouter();
  const { projectId, assetId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
  }>();

  const pid = String(projectId);
  const aid = String(assetId);

  const { certificates, loading, error, refresh } = useCertificatesByAsset(
    pid,
    aid,
  );

  const stats = useMemo(() => {
    let valid = 0;
    let expiringSoon = 0;
    let expired = 0;
    let pending = 0;

    for (const c of certificates ?? []) {
      switch (c.status) {
        case "VALID":
          valid += 1;
          break;
        case "EXPIRING_SOON":
          expiringSoon += 1;
          break;
        case "EXPIRED":
          expired += 1;
          break;
        case "PENDING":
          pending += 1;
          break;
      }
    }

    return {
      total: certificates?.length ?? 0,
      valid,
      expiringSoon,
      expired,
      pending,
      critical: expired + expiringSoon,
    };
  }, [certificates]);

  return (
    <View className="gap-6 p-4 web:p-6">
      <View className="gap-3">
        <PageHeader
          title="Certificates"
          subTitle="Monitor certificate validity and compliance for this vessel."
        />

        {/* Action row (MVP): create */}
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-muted">
            Vessel: <Text className="text-foreground font-semibold">{aid}</Text>
          </Text>

          <Pressable
            onPress={() =>
              router.push(`/projects/${pid}/vessels/${aid}/certificates/new`)
            }
            className="rounded-full px-4 py-2 bg-primary"
          >
            <Text className="text-primary-foreground text-sm font-semibold">
              + Add Certificate
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Stats */}
      <View className="gap-2 xl:gap-5 flex flex-row flex-wrap items-center justify-start xl:justify-between">
        <StatCard
          iconName="documents-outline"
          iconLib="ion"
          title="Total Certificates"
          value={String(stats.total)}
          suffix="for this vessel"
          badgeValue={String(stats.critical)}
          badgeColor={stats.critical > 0 ? "fail" : "success"}
          badgeLabel="critical items"
        />

        <StatCard
          iconName="alert-circle-outline"
          iconLib="ion"
          title="Expired"
          value={String(stats.expired)}
          suffix="require immediate action"
          badgeValue={stats.expired > 0 ? "CRITICAL" : "OK"}
          badgeColor={stats.expired > 0 ? "fail" : "success"}
          badgeLabel="status"
        />

        <StatCard
          iconName="time-outline"
          iconLib="ion"
          title="Expiring Soon"
          value={String(stats.expiringSoon)}
          suffix="upcoming renewals"
          badgeValue={stats.expiringSoon > 0 ? "ATTN" : "OK"}
          badgeColor={stats.expiringSoon > 0 ? "fail" : "success"}
          badgeLabel="status"
        />

        <StatCard
          iconName="checkmark-circle-outline"
          iconLib="ion"
          title="Valid"
          value={String(stats.valid)}
          suffix="currently compliant"
          badgeValue={String(stats.pending)}
          badgeColor={stats.pending > 0 ? "fail" : "success"}
          badgeLabel="pending"
        />
      </View>

      {/* Table */}
      <View className="flex-1">
        <CertificatesTable
          title="Vessel Certificates"
          subtitleRight="Sorted by expiry"
          data={certificates}
          isLoading={loading}
          error={error}
          onRetry={refresh}
          sortByExpiry
        />
      </View>
    </View>
  );
}
