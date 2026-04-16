import { Text } from "@/src/components/ui/text/Text";
import { Feather } from "@expo/vector-icons";
import { Pressable, View } from "react-native";

export function AdminMetricCard({
  label,
  value,
  caption,
  tone = "default",
}: {
  label: string;
  value: string;
  caption: string;
  tone?: "default" | "accent";
}) {
  return (
    <View
      className={[
        "min-w-[170px] flex-1 rounded-[24px] border p-5",
        tone === "accent"
          ? "border-accent/35 bg-accent/10"
          : "border-shellLine bg-shellPanelSoft",
      ].join(" ")}
    >
      <Text className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
        {label}
      </Text>
      <Text className="mt-3 text-[34px] font-semibold leading-none text-textMain">
        {value}
      </Text>
      <Text className="mt-2 text-sm leading-5 text-muted">{caption}</Text>
    </View>
  );
}

export function ChoicePill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={[
        "rounded-full border px-4 py-2.5",
        active
          ? "border-accent/40 bg-accent/14"
          : "border-shellLine bg-shellPanelSoft",
      ].join(" ")}
    >
      <Text
        className={[
          "text-sm font-semibold",
          active ? "text-accent" : "text-textMain",
        ].join(" ")}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function MiniTag({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "accent" | "success" | "warning";
}) {
  const toneClass = {
    accent: "border-accent/35 bg-accent/12",
    default: "border-shellLine bg-shellPanelSoft",
    success: "border-success/35 bg-success/15",
    warning: "border-warning/35 bg-warning/15",
  }[tone];

  const textClass = {
    accent: "text-accent",
    default: "text-muted",
    success: "text-success",
    warning: "text-warning",
  }[tone];

  return (
    <View className={["rounded-full border px-3 py-1.5", toneClass].join(" ")}>
      <Text className={["text-xs font-medium", textClass].join(" ")}>
        {label}
      </Text>
    </View>
  );
}

export function SelectRow({
  title,
  subtitle,
  selected,
  onPress,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="switch"
      accessibilityLabel={`${title} ${subtitle}`}
      accessibilityState={{ checked: selected }}
      className={[
        "flex-row items-center justify-between gap-4 rounded-2xl border px-4 py-3",
        selected
          ? "border-accent/35 bg-accent/10"
          : "border-shellLine bg-shellPanelSoft",
      ].join(" ")}
    >
      <View className="flex-1 gap-1">
        <Text className="font-semibold text-textMain">{title}</Text>
        <Text className="text-sm text-muted">{subtitle}</Text>
      </View>

      <View
        className={[
          "h-6 w-11 rounded-full px-1",
          selected ? "bg-accent/25" : "bg-shellSoft",
        ].join(" ")}
      >
        <View
          className={[
            "mt-1 h-4 w-4 rounded-full",
            selected ? "ml-auto bg-accent" : "ml-0 bg-shellLine",
          ].join(" ")}
        />
      </View>
    </Pressable>
  );
}

export function EmptyAdminState({ children }: { children: string }) {
  return (
    <View className="items-center gap-3 rounded-[24px] border border-dashed border-shellLine bg-shellGlass p-8">
      <View className="h-12 w-12 items-center justify-center rounded-2xl border border-shellLine bg-shellPanelSoft">
        <Feather name="inbox" size={18} color="hsl(var(--muted))" />
      </View>
      <Text className="text-center text-sm leading-6 text-muted">
        {children}
      </Text>
    </View>
  );
}
