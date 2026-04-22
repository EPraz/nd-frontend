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
    <View className="gap-4">
      <View className="gap-3 web:flex-row web:items-start web:justify-between">
        <View className="min-w-0 flex-1 gap-2">
          <Text className="text-[11px] font-semibold uppercase tracking-[0.28em] text-shellHighlight">
            {eyebrow}
          </Text>
          <View className="gap-1.5">
            <Text className="text-[30px] font-semibold leading-[34px] tracking-tight text-textMain web:text-[40px] web:leading-[44px]">
              {title}
            </Text>
            <Text className="max-w-[680px] text-[14px] leading-6 text-muted">
              {subtitle}
            </Text>
          </View>
        </View>

        {actions ? (
          <View className="flex-row flex-wrap items-center gap-2 self-start">
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
