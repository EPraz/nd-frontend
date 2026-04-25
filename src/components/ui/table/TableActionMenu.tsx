import { AnchoredPopover } from "@/src/components/ui/popover";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Text } from "../text/Text";

const MENU_WIDTH = 220;
const MENU_ESTIMATED_HEIGHT = 196;

export type TableActionMenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  tone?: "default" | "accent" | "danger";
};

type Props = {
  items: TableActionMenuItem[];
  tooltip?: string;
};

export function TableActionMenu({
  items,
  tooltip = "Open row actions",
}: Props) {
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <AnchoredPopover
      open={open}
      onOpenChange={setOpen}
      align="end"
      width={MENU_WIDTH}
      estimatedHeight={MENU_ESTIMATED_HEIGHT}
      backdropClassName="bg-black/18"
      contentClassName="rounded-[18px] border border-shellLine bg-shellPanel p-2 shadow-sm shadow-black/30 web:backdrop-blur-md"
      trigger={({ anchorRef, openPopover }) => (
        <View ref={anchorRef} collapsable={false}>
          <Pressable
            onPress={(e) => {
              const event = e as { stopPropagation?: () => void };
              event.stopPropagation?.();
              openPopover();
            }}
            accessibilityLabel={tooltip}
            className="relative web:cursor-pointer"
          >
            {(state) => {
              const hovered = Boolean((state as { hovered?: boolean }).hovered);
              const pressed = Boolean(state.pressed);

              return (
                <View
                  className={[
                    "h-7 w-7 items-center justify-center rounded-full bg-transparent transition-colors",
                    hovered ? "bg-shellSoft" : "",
                    pressed ? "opacity-85" : "",
                  ].join(" ")}
                >
                  <Ionicons
                    name="ellipsis-vertical"
                    size={14}
                    className="text-textMain"
                  />
                </View>
              );
            }}
          </Pressable>
        </View>
      )}
    >
      <View className="gap-1">
        {items.map((item) => (
          <Pressable
            key={item.label}
            onPress={(e) => {
              const event = e as { stopPropagation?: () => void };
              event.stopPropagation?.();
              closeMenu();
              item.onPress();
            }}
            className="flex-row items-center gap-3 rounded-xl px-3 py-3 active:opacity-90 web:hover:bg-shellPanelSoft"
          >
            <Ionicons
              name={item.icon}
              size={15}
              className={
                item.tone === "danger"
                  ? "text-destructive"
                  : item.tone === "accent"
                    ? "text-accent"
                    : "text-textMain"
              }
            />
            <Text
              className={
                item.tone === "danger"
                  ? "text-[13px] font-medium text-destructive"
                  : item.tone === "accent"
                    ? "text-[13px] font-medium text-accent"
                    : "text-[13px] font-medium text-textMain"
              }
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </AnchoredPopover>
  );
}
