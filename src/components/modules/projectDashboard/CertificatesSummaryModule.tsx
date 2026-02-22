import { MiniStat } from "@/src/helpers";
import { useCertificatesData } from "@/src/hooks";
import { View } from "react-native";
import { ModuleFrame } from "../../dashboard/ModuleFrame";
import { Card, Text } from "../../ui";

export function CertificatesSummaryModule() {
  const {
    data: certificates,
    isLoading,
    error,
    refetch,
  } = useCertificatesData();

  const counts = certificates.reduce(
    (acc, c) => {
      acc.total += 1;
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    },
    { total: 0 } as Record<string, number>,
  );

  const nextExpiry = certificates
    .filter((c) => c.expiryDate)
    .slice()
    .sort(
      (a, b) =>
        new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime(),
    )[0];

  return (
    <ModuleFrame isLoading={isLoading} error={error} onRetry={refetch}>
      <View className="gap-3">
        <View className="flex-row gap-3">
          <MiniStat label="Total" value={String(counts.total)} />
          <MiniStat label="VALID" value={String(counts.VALID ?? 0)} />
          <MiniStat
            label="EXPIRING"
            value={String(counts.EXPIRING_SOON ?? 0)}
          />
          <MiniStat label="EXPIRED" value={String(counts.EXPIRED ?? 0)} />
        </View>

        <Card className="p-3 gap-1">
          <Text className="text-sm font-semibold">Nearest expiry</Text>
          <Text className="text-xs text-muted">
            {nextExpiry ? `${nextExpiry.name} • ${nextExpiry.assetName}` : "—"}
          </Text>
          <Text className="text-xs text-muted">
            {nextExpiry?.expiryDate
              ? new Date(nextExpiry.expiryDate).toLocaleDateString()
              : "—"}
          </Text>
        </Card>
      </View>
    </ModuleFrame>
  );
}
