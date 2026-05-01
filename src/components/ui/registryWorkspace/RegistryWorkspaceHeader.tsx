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
    <View className="min-w-0 max-w-full gap-4">
      <View className="min-w-0 gap-4 lg:flex-row lg:items-start lg:justify-between">
        <View className="min-w-0 flex-1 gap-2">
          <Text className="text-[30px] leading-[1.08] font-semibold tracking-tight text-textMain md:text-[34px]">
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
          <View className="w-full min-w-0 flex-row flex-wrap items-center gap-2 lg:w-auto lg:max-w-[48%] lg:justify-end">
            {actions}
          </View>
        ) : null}
      </View>

      {/* {showDivider ? <View className="h-px bg-shellLine" /> : null} */}
    </View>
  );
}
