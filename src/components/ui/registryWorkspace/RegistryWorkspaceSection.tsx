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
    <View className="gap-4 rounded-[22px] border border-shellLine bg-shellPanel p-5 web:backdrop-blur-md">
      <View className="flex-row items-start justify-between gap-4">
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
          <View className="ml-auto flex-row flex-wrap items-center justify-end gap-2 self-start">
            {actions}
          </View>
        ) : null}
      </View>

      {children}
    </View>
  );
}
