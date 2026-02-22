import { cn } from "@/src/lib/utils";
import { View } from "react-native";
import { Text } from "../text/Text";

type FieldDisplayProps = {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  className?: string;
};

export function FieldDisplay({
  label,
  value,
  mono,
  className,
}: FieldDisplayProps) {
  return (
    <View className={cn("gap-1", className)}>
      <Text className="text-[11px] uppercase tracking-wide text-muted">
        {label}
      </Text>

      {typeof value === "string" || typeof value === "number" ? (
        <Text
          className={cn("text-[13px] text-textMain", mono && "font-semibold")}
        >
          {value}
        </Text>
      ) : (
        <View className="pt-0.5">{value}</View>
      )}
    </View>
  );
}
