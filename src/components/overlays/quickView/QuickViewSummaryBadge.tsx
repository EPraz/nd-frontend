import { Text } from "@/src/components/ui";
import { View } from "react-native";

export type QuickViewSummaryBadgeTone =
  | "neutral"
  | "ok"
  | "warn"
  | "info"
  | "danger"
  | "accent";

function toneStyle(tone: QuickViewSummaryBadgeTone) {
  switch (tone) {
    case "ok":
      return {
        borderColor: "#2f8f6b",
        backgroundColor: "rgba(52, 211, 153, 0.10)",
        dotColor: "#34d399",
      };
    case "warn":
      return {
        borderColor: "#a46f12",
        backgroundColor: "rgba(251, 191, 36, 0.10)",
        dotColor: "#fbbf24",
      };
    case "info":
      return {
        borderColor: "#2b76aa",
        backgroundColor: "rgba(125, 211, 252, 0.10)",
        dotColor: "#7dd3fc",
      };
    case "danger":
      return {
        borderColor: "#a43b57",
        backgroundColor: "rgba(251, 113, 133, 0.10)",
        dotColor: "#fb7185",
      };
    case "accent":
      return {
        borderColor: "#b96a22",
        backgroundColor: "rgba(255, 143, 58, 0.10)",
        dotColor: "#ff8f3a",
      };
    case "neutral":
    default:
      return {
        borderColor: "#4b5d7f",
        backgroundColor: "rgba(42, 52, 75, 0.9)",
        dotColor: "#94a3b8",
      };
  }
}

export function QuickViewSummaryBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: QuickViewSummaryBadgeTone;
}) {
  const toneValue = toneStyle(tone);

  return (
    <View
      className="flex-row items-center gap-1.5 rounded-full border px-2.5 py-1"
      style={{
        borderColor: toneValue.borderColor,
        backgroundColor: toneValue.backgroundColor,
      }}
    >
      <View
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: toneValue.dotColor }}
      />
      <Text className="text-[10px] text-textMain">{label}</Text>
    </View>
  );
}
