import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { Text } from "../text/Text";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  tooltip: string;
  tone?: "default" | "accent";
};

type PressState = { pressed: boolean } & { hovered?: boolean };

export function TableActionIcon({
  icon,
  onPress,
  tooltip,
  tone = "default",
}: Props) {
  return (
    <Pressable
      onPress={(e) => {
        const event = e as { stopPropagation?: () => void };
        event.stopPropagation?.();
        onPress();
      }}
      accessibilityLabel={tooltip}
      className="relative web:cursor-pointer"
    >
      {(state) => {
        const s = state as PressState;
        const hovered = Boolean(s.hovered);
        const pressed = Boolean(s.pressed);

        const baseClass =
          tone === "accent"
            ? "border-accent/35 bg-accent/10"
            : "border-border/80 bg-baseBg/45";

        const hoverClass =
          tone === "accent"
            ? "border-accent/50 bg-accent/18"
            : "border-border bg-baseBg/70";

        return (
          <>
            <View
              className={[
                "h-8 w-8 items-center justify-center rounded-full border transition-colors",
                baseClass,
                hovered ? hoverClass : "",
                pressed ? "opacity-85" : "",
              ].join(" ")}
            >
              <Ionicons
                name={icon}
                size={14}
                className={tone === "accent" ? "text-accent" : "text-textMain"}
              />
            </View>

            {hovered ? (
              <View className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-full border border-border bg-baseBg px-3 py-1.5 shadow-sm shadow-black/20 web:z-[200]">
                <Text className="text-[11px] font-medium text-textMain whitespace-nowrap">
                  {tooltip}
                </Text>
              </View>
            ) : null}
          </>
        );
      }}
    </Pressable>
  );
}
