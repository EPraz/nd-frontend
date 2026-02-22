import { View } from "react-native";
import { Text } from "../components";

export function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-md border border-border p-3">
      <Text className="text-[11px] text-muted">{label}</Text>
      <Text className="text-baseBg font-semibold">{value}</Text>
    </View>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 gap-1">
      <Text className="text-textMain/50 text-[12px]">{label}</Text>
      <Text className="text-textMain text-[18px] font-semibold">{value}</Text>
    </View>
  );
}

export function StatSlot({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <View className="flex-1 gap-1">
      <Text className="text-textMain/50 text-[12px]">{label}</Text>
      <View className="min-h-[26px] justify-center">{value}</View>
    </View>
  );
}
