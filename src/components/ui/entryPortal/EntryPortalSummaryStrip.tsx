import { View } from "react-native";
import { Text } from "../text/Text";

export type EntryPortalSummaryTone = "accent" | "ok" | "warn" | "info";

export type EntryPortalSummaryItem = {
  label: string;
  value: string;
  helper: string;
  tone: EntryPortalSummaryTone;
};

const TONE_STYLES: Record<
  EntryPortalSummaryTone,
  { dot: string; value: string }
> = {
  accent: { dot: "bg-accent", value: "text-shellHighlight" },
  ok: { dot: "bg-success", value: "text-success" },
  warn: { dot: "bg-warning", value: "text-warning" },
  info: { dot: "bg-info", value: "text-info" },
};

export function EntryPortalSummaryStrip({
  items,
}: {
  items: EntryPortalSummaryItem[];
}) {
  return (
    <View className="rounded-[24px] border border-shellLine bg-shellPanel px-4 py-4 web:px-5">
      <View className="flex-row flex-wrap gap-x-6 gap-y-4">
        {items.map((item) => {
          const tone = TONE_STYLES[item.tone];

          return (
            <View
              key={item.label}
              className="min-w-[140px] flex-1 gap-1.5 px-1 py-1"
            >
              <Text className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">
                {item.label}
              </Text>

              <View className="flex-row items-center gap-2">
                <View className={["h-2 w-2 rounded-full", tone.dot].join(" ")} />
                <Text
                  className={[
                    "text-[18px] font-semibold leading-none",
                    tone.value,
                  ].join(" ")}
                >
                  {item.value}
                </Text>
              </View>

              <Text className="text-[12px] leading-5 text-muted">
                {item.helper}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
