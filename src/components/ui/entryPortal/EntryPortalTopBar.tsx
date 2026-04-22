import type { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "../text/Text";

export function EntryPortalTopBar({
  companyName,
  actions,
}: {
  companyName?: string;
  actions?: ReactNode;
}) {
  return (
    <View className="flex-row flex-wrap items-center justify-between gap-3">
      <View className="flex-row flex-wrap items-center gap-3">
        <View className="rounded-full border border-shellBadgeBorder bg-shellBadge px-4 py-2">
          <Text className="text-[11px] font-semibold uppercase tracking-[0.22em] text-shellHighlight">
            ARXIS
          </Text>
        </View>

        <View className="rounded-full border border-shellLine bg-shellPanelSoft px-4 py-2">
          <Text className="text-[12px] font-medium text-textMain">
            {companyName ?? "Operational company"}
          </Text>
        </View>
      </View>

      {actions ? (
        <View className="flex-row flex-wrap items-center gap-2">{actions}</View>
      ) : null}
    </View>
  );
}
