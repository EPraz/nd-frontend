import { View } from "react-native";
import { Text } from "../text/Text";

export function RowInfo({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-[12px] text-muted">{label}</Text>
      <Text className="text-textMain font-semibold">{value}</Text>
    </View>
  );
}
