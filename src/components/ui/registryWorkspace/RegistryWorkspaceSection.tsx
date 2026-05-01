import type { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "../text/Text";

type Props = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function RegistryWorkspaceSection({
  title,
  subtitle,
  actions,
  children,
}: Props) {
  return (
    <View className="min-w-0 max-w-full gap-4 rounded-[22px] border border-shellLine bg-shellPanel p-4 web:backdrop-blur-md md:p-5">
      <View className="min-w-0 gap-3 lg:flex-row lg:items-start lg:justify-between">
        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-[18px] leading-[130%] font-semibold text-textMain">
            {title}
          </Text>

          {subtitle ? (
            <Text className="text-[13px] leading-[20px] text-muted">
              {subtitle}
            </Text>
          ) : null}
        </View>

        {actions ? (
          <View className="w-full min-w-0 flex-row flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
            {actions}
          </View>
        ) : null}
      </View>

      {children}
    </View>
  );
}
