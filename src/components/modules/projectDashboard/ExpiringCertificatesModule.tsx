import { formatDate } from "@/src/helpers";
import { useCertificatesData } from "@/src/hooks";
import { View } from "react-native";
import { ModuleFrame } from "../../dashboard/ModuleFrame";
import { Badge, Text } from "../../ui";

export function ExpiringCertificatesModule() {
  const {
    data: certificates,
    isLoading,
    error,
    refetch,
  } = useCertificatesData();

  const items = certificates
    .filter((c) => c.expiryDate)
    .slice()
    .sort(
      (a, b) =>
        new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime(),
    )
    .slice(0, 6);

  return (
    <ModuleFrame isLoading={isLoading} error={error} onRetry={refetch}>
      <View className="gap-3">
        {items.map((c) => (
          <View
            key={c.id}
            className="flex-row items-center justify-between gap-3"
          >
            <View className="flex-1">
              <Text className="text-sm font-semibold" numberOfLines={1}>
                {c.name}
              </Text>
              <Text className="text-xs text-muted" numberOfLines={1}>
                {c.assetName}
              </Text>
            </View>

            <View className="items-end gap-1">
              <Badge variant="secondary">
                <Text className="text-[10px]">{c.status}</Text>
              </Badge>
              <Text className="text-xs text-muted">
                {formatDate(c.expiryDate)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ModuleFrame>
  );
}
