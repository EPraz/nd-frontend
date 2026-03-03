import { cn } from "@/src/lib/utils";
import { Platform, View } from "react-native";
import { Text } from "../text/Text";

type MiniStatProps = {
  label: string;
  value: string;
  className?: string;

  /** opcional: si quieres que el card tenga un hint visual sin depender de text-* */
  tone?: "neutral" | "info" | "ok" | "warn" | "fail";
};

function toneBg(tone?: MiniStatProps["tone"]) {
  switch (tone) {
    case "info":
      return "bg-info/10 border-info/25";
    case "ok":
      return "bg-success/10 border-success/25";
    case "warn":
      return "bg-warning/10 border-warning/25";
    case "fail":
      return "bg-destructive/10 border-destructive/25";
    default:
      return "bg-surface border-border";
  }
}

export function MiniStat({
  label,
  value,
  className,
  tone = "neutral",
}: MiniStatProps) {
  const isWeb = Platform.OS === "web";

  return (
    <View
      className={cn(
        "flex-1 min-w-[140px] rounded-xl border p-3",
        toneBg(tone),
        className,
      )}
    >
      {/* Label: siempre muted + ellipsis */}
      <Text
        className="text-[11px] text-muted"
        numberOfLines={1}
        ellipsizeMode="tail"
        {...(isWeb ? { title: label } : {})}
      >
        {label}
      </Text>

      {/* Value: hereda text-* del container si lo pones en className */}
      <Text
        className="text-base font-semibold text-inherit mt-1"
        numberOfLines={1}
        ellipsizeMode="tail"
        {...(isWeb ? { title: label } : {})}
      >
        {value}
      </Text>
    </View>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 gap-1">
      <Text className="text-textMain/50 text-[12px]">{label}</Text>
      <Text className="text-textMain text-[18px] font-semibold">{value}</Text>
    </View>
  );
}

export function StatSlot({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <View className="flex-1 gap-1">
      <Text className="text-textMain/50 text-[12px]">{label}</Text>
      <View className="min-h-[26px] justify-center">{value}</View>
    </View>
  );
}
