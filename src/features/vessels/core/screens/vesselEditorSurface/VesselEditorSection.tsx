import { Text } from "@/src/components";
import type { ReactNode } from "react";
import { View } from "react-native";

type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export function VesselEditorSection({
  eyebrow,
  title,
  description,
  children,
}: Props) {
  return (
    <View className="overflow-hidden rounded-[28px] border border-shellLine bg-shellPanel">
      <View className="gap-1 border-b border-shellLine px-5 py-4">
        <Text className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
          {eyebrow}
        </Text>
        <Text className="text-[18px] font-semibold text-textMain">
          {title}
        </Text>
        {description ? (
          <Text className="max-w-[720px] text-[13px] leading-[19px] text-muted">
            {description}
          </Text>
        ) : null}
      </View>

      <View className="gap-4 p-5">{children}</View>
    </View>
  );
}
