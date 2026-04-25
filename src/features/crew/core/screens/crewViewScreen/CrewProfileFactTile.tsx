import { Text } from "@/src/components";
import { cn } from "@/src/lib/utils";
import type { ReactNode } from "react";
import { View } from "react-native";
import type { RegistrySummaryTone } from "@/src/components/ui/registryWorkspace";

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

type Props = {
  label: string;
  value: ReactNode;
  helper?: string;
  tone?: RegistrySummaryTone;
  className?: string;
};

export default function CrewProfileFactTile({
  label,
  value,
  helper,
  tone = "neutral",
  className,
}: Props) {
  const textValue =
    typeof value === "string" || typeof value === "number" ? value : null;

  return (
    <View
      className={cn(
        "rounded-[18px] border border-shellLine bg-shellPanelSoft px-4 py-3",
        className,
      )}
    >
      <Text className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </Text>

      <View className="mt-2 flex-row items-start gap-2">
        <View
          className="mt-1 h-2 w-2 rounded-full"
          style={toneStyle(tone)}
        />

        <View className="min-w-0 flex-1 gap-1">
          {textValue !== null ? (
            <Text
              className="text-[15px] font-semibold leading-[20px] text-textMain"
              style={toneTextStyle(tone)}
            >
              {textValue}
            </Text>
          ) : (
            value
          )}

          {helper ? (
            <Text className="text-[12px] leading-[17px] text-muted">
              {helper}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
