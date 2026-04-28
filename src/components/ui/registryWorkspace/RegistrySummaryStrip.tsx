import { View } from "react-native";
import { Text } from "../text/Text";

export type RegistrySummaryTone =
  | "accent"
  | "ok"
  | "warn"
  | "danger"
  | "info"
  | "neutral";

export type RegistrySummaryItem = {
  label: string;
  value: string;
  helper: string;
  tone: RegistrySummaryTone;
};

type RegistrySummaryStripSize = "default" | "compact";

type RegistrySummaryStripColumns = 2 | 3 | 4;

function toneStyle(tone: RegistrySummaryTone) {
  switch (tone) {
    case "ok":
      return { backgroundColor: "#34d399" };
    case "warn":
      return { backgroundColor: "#fbbf24" };
    case "danger":
      return { backgroundColor: "#fb7185" };
    case "info":
      return { backgroundColor: "#7dd3fc" };
    case "neutral":
      return { backgroundColor: "#94a3b8" };
    case "accent":
    default:
      return { backgroundColor: "#ff8f3a" };
  }
}

function toneTextStyle(tone: RegistrySummaryTone) {
  switch (tone) {
    case "ok":
      return { color: "#6ee7b7" };
    case "warn":
      return { color: "#fcd34d" };
    case "danger":
      return { color: "#fb7185" };
    case "info":
      return { color: "#7dd3fc" };
    case "neutral":
      return { color: "#cbd5e1" };
    case "accent":
    default:
      return { color: "#ffb173" };
  }
}

export function RegistrySummaryStrip({
  items,
  size = "default",
  columns,
  loading = false,
}: {
  items: RegistrySummaryItem[];
  size?: RegistrySummaryStripSize;
  columns?: RegistrySummaryStripColumns;
  loading?: boolean;
}) {
  const isCompact = size === "compact";

  return (
    <View
      className={[
        "rounded-[18px] border border-shellLine bg-shellPanelSoft",
        isCompact ? "px-3 py-2.5" : "px-4 py-3",
      ].join(" ")}
    >
      <View
        className={[
          columns
            ? "flex-row flex-nowrap gap-3"
            : "flex-row flex-wrap",
          isCompact ? "gap-x-4 gap-y-3" : "gap-x-6 gap-y-4",
        ].join(" ")}
      >
        {items.map((item) => (
          <RegistrySummaryStat
            key={item.label}
            label={item.label}
            value={item.value}
            helper={item.helper}
            tone={item.tone}
            compact={isCompact}
            fixedColumns={Boolean(columns)}
            loading={loading}
          />
        ))}
      </View>
    </View>
  );
}

function RegistrySummaryStat({
  label,
  value,
  helper,
  tone,
  compact = false,
  fixedColumns = false,
  loading = false,
}: RegistrySummaryItem & {
  compact?: boolean;
  fixedColumns?: boolean;
  loading?: boolean;
}) {
  return (
    <View
      className={[
        "flex-1",
        fixedColumns
          ? compact
            ? "min-w-0 gap-1.5"
            : "min-w-0 gap-2"
          : compact
            ? "min-w-[140px] gap-1.5"
            : "min-w-[180px] gap-2",
      ].join(" ")}
    >
      <Text
        className={[
          "font-semibold uppercase text-muted",
          compact
            ? "text-[9px] tracking-[0.22em]"
            : "text-[10px] tracking-[0.28em]",
        ].join(" ")}
      >
        {label}
      </Text>

      <View
        className={
          compact ? "flex-row items-center gap-2" : "flex-row items-center gap-2"
        }
      >
        <View
          className={
            compact
              ? "h-2 w-2 rounded-full opacity-95"
              : "h-2 w-2 rounded-full opacity-95"
          }
          style={loading ? { backgroundColor: "#475569" } : toneStyle(tone)}
        />
        {loading ? (
          <View
            className="rounded-full bg-shellLine"
            style={{
              width: compact ? 32 : 44,
              height: compact ? 12 : 24,
              opacity: 0.72,
            }}
          />
        ) : (
          <Text
            className={[
              "leading-none font-semibold tracking-tight text-textMain",
              compact ? "text-[12px]" : "text-[26px]",
            ].join(" ")}
            style={compact ? toneTextStyle(tone) : undefined}
          >
            {value}
          </Text>
        )}
      </View>

      {loading ? (
        <View
          className="rounded-full bg-shellLine"
          style={{
            width: compact ? 92 : 150,
            height: compact ? 8 : 10,
            opacity: 0.46,
          }}
        />
      ) : (
        <Text
          className={[
            "text-muted",
            compact ? "text-[10px] leading-[14px]" : "text-[12px] leading-5",
          ].join(" ")}
        >
          {helper}
        </Text>
      )}
    </View>
  );
}
