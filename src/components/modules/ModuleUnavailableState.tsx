import { View } from "react-native";
import { Text } from "../ui";

export function ModuleUnavailableState({
  label,
}: {
  label: string;
}) {
  return (
    <View className="flex-1 justify-center rounded-2xl border border-border bg-baseBg/30 px-4 py-5">
      <Text className="text-sm font-semibold text-textMain">
        Module unavailable
      </Text>
      <Text className="mt-2 text-xs leading-5 text-muted">
        {label} is disabled for this project in Project Settings.
      </Text>
    </View>
  );
}
