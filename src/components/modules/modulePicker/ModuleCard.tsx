import { Card, Text } from "@/src/components/ui";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  iconName?: React.ComponentProps<typeof Ionicons>["name"];
  children: React.ReactNode;
  className?: string;
};

export function ModuleCard({
  title,
  subtitle,
  right,
  iconName,
  children,
  className,
}: Props) {
  return (
    <Card className={["p-3 gap-3", className].filter(Boolean).join(" ")}>
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center gap-2">
          {iconName ? (
            <Ionicons name={iconName} size={16} color="white" />
          ) : null}
          <View className="gap-0.5">
            <Text className="text-sm font-semibold">{title}</Text>
            {subtitle ? (
              <Text className="text-xs text-muted">{subtitle}</Text>
            ) : null}
          </View>
        </View>

        {right ? <View>{right}</View> : null}
      </View>

      {children}
    </Card>
  );
}
