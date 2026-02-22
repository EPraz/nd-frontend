import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { Text } from "../text/Text";

export function EmptyVesselsState({
  onCreateVessel,
}: {
  onCreateVessel: () => void;
}) {
  return (
    <View className="rounded-3xl border border-border/70 bg-surface/70 p-5 gap-4">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 rounded-2xl bg-accent/15 items-center justify-center">
          <Ionicons name="boat-outline" size={18} color="hsl(var(--accent))" />
        </View>

        <View className="flex-1">
          <Text className="text-textMain font-semibold text-[15px]">
            No vessels in this project
          </Text>
          <Text className="text-muted/70 text-[12px] mt-1">
            To add a certificate, create a vessel first.
          </Text>
        </View>
      </View>

      <Pressable
        onPress={onCreateVessel}
        className={[
          "self-start flex-row items-center gap-2 rounded-full bg-accent px-5 py-2.5 active:opacity-90",
          "web:hover:opacity-95 web:hover:scale-105",
        ].join(" ")}
      >
        <Ionicons name="add" size={18} color="hsl(var(--bg-base))" />
        <Text className="text-baseBg font-bold">Create Vessel</Text>
      </Pressable>
    </View>
  );
}
