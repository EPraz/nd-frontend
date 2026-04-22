import type { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "../text/Text";

type Props = {
  title: string;
  eyebrow: string;
  subtitle?: string;
  actions?: ReactNode;
  showDivider?: boolean;
};

export function RegistryWorkspaceHeader({
  title,
  eyebrow,
  subtitle,
  actions,
  showDivider = true,
}: Props) {
  return (
    <View className="gap-4">
      <View className="flex-row items-start justify-between gap-4">
        <View className="min-w-0 flex-1 gap-2">
          <Text className="text-[34px] leading-[1.05] font-semibold tracking-tight text-textMain">
            {title}
          </Text>
          <Text className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">
            {eyebrow}
          </Text>
          {subtitle ? (
            <Text className="max-w-[860px] text-[14px] leading-7 text-muted">
              {subtitle}
            </Text>
          ) : null}
        </View>

        {actions ? (
          <View className="ml-auto flex-row flex-wrap items-center justify-end gap-2 self-start">
            {actions}
          </View>
        ) : null}
      </View>

      {/* {showDivider ? <View className="h-px bg-shellLine" /> : null} */}
    </View>
  );
}
