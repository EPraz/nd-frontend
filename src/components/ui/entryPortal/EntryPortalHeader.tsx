import type { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "../text/Text";

type EntryPortalHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  actions?: ReactNode;
  meta?: ReactNode;
};

export function EntryPortalHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  meta,
}: EntryPortalHeaderProps) {
  return (
    <View className="min-w-0 max-w-full gap-4">
      <View className="min-w-0 gap-3 lg:flex-row lg:items-start lg:justify-between">
        <View className="min-w-0 flex-1 gap-2">
          <Text className="text-[11px] font-semibold uppercase tracking-[0.28em] text-shellHighlight">
            {eyebrow}
          </Text>
          <View className="gap-1.5">
            <Text className="text-[34px] font-semibold leading-[38px] tracking-tight text-textMain lg:text-[40px] lg:leading-[44px]">
              {title}
            </Text>
            <Text className="max-w-[680px] text-[14px] leading-6 text-muted">
              {subtitle}
            </Text>
          </View>
        </View>

        {actions ? (
          <View className="w-full min-w-0 flex-row flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
            {actions}
          </View>
        ) : null}
      </View>

      {meta ? (
        <View className="flex-row flex-wrap items-center gap-3">{meta}</View>
      ) : null}
    </View>
  );
}
