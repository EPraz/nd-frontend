import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Text } from "../text/Text";

type Props = {
  title: string;
  description: string;
  backLabel: string;
  onBack: () => void;
  disabled?: boolean;
  actions: ReactNode;
};

export function OperationalEditorHeader({
  title,
  description,
  backLabel,
  onBack,
  disabled,
  actions,
}: Props) {
  return (
    <View className="gap-4 border-b border-shellLine pb-5 web:flex-row web:items-end web:justify-between">
      <View className="min-w-0 flex-1 gap-3">
        <Pressable
          onPress={onBack}
          disabled={disabled}
          accessibilityRole="button"
          className={[
            "self-start flex-row items-center gap-2",
            disabled ? "opacity-50" : "web:hover:opacity-85",
          ].join(" ")}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="chevron-back" size={16} className="text-accent" />
            <Text className="font-semibold text-accent">{backLabel}</Text>
          </View>
        </Pressable>

        <View className="gap-2">
          <Text className="text-[11px] font-semibold uppercase tracking-[0.36em] text-accent">
            Operational Editor
          </Text>
          <Text className="text-[32px] font-semibold leading-[110%] text-textMain web:text-[40px]">
            {title}
          </Text>
          <Text className="max-w-[760px] text-[14px] leading-[22px] text-muted">
            {description}
          </Text>
        </View>
      </View>

      <View className="flex-row flex-wrap items-center gap-2">{actions}</View>
    </View>
  );
}
