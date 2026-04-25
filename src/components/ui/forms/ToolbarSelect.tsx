import { AnchoredPopover } from "@/src/components/ui/popover";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { Text } from "../text/Text";

type ToolbarSelectProps<T extends string> = {
  value: T;
  options: T[];
  open: boolean;
  onToggle: () => void;
  onChange: (value: T) => void;
  renderLabel: (value: T) => string;
  triggerIconName?: keyof typeof Ionicons.glyphMap;
  minWidth?: number;
};

export function ToolbarSelect<T extends string>(props: ToolbarSelectProps<T>) {
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen !== props.open) {
      props.onToggle();
    }
  };

  return (
    <AnchoredPopover
      open={props.open}
      onOpenChange={handleOpenChange}
      align="end"
      minWidth={props.minWidth ?? 220}
      estimatedHeight={props.options.length * 44 + 16}
      backdropClassName="bg-black/20"
      contentClassName="rounded-2xl border border-shellLine bg-shellPanel p-2 shadow-sm shadow-black/30 web:backdrop-blur-md"
      trigger={({ anchorRef, openPopover }) => (
        <View ref={anchorRef} collapsable={false}>
          <Pressable
            onPress={openPopover}
            className="min-h-11 flex-row items-center justify-between gap-3 rounded-full border border-shellLine bg-shellGlass px-4 py-2 web:backdrop-blur-md"
            style={props.minWidth ? { minWidth: props.minWidth } : undefined}
          >
            <View className="flex-row items-center gap-2">
              {props.triggerIconName ? (
                <Ionicons
                  name={props.triggerIconName}
                  size={14}
                  color="rgba(231,237,247,0.95)"
                />
              ) : null}
              <Text className="text-[13px] font-medium text-textMain">
                {props.renderLabel(props.value)}
              </Text>
            </View>

            <Ionicons
              name={props.open ? "chevron-up" : "chevron-down"}
              size={16}
              color="rgba(221,230,237,0.92)"
            />
          </Pressable>
        </View>
      )}
    >
      {props.options.map((option) => {
        const active = option === props.value;

        return (
          <Pressable
            key={option}
            onPress={() => props.onChange(option)}
            className={[
              "flex-row items-center justify-between rounded-xl px-3 py-3",
              active ? "bg-accent/12" : "bg-transparent",
            ].join(" ")}
          >
            <Text
              className={[
                "text-[13px] font-medium",
                active ? "text-accent" : "text-textMain",
              ].join(" ")}
            >
              {props.renderLabel(option)}
            </Text>

            {active ? (
              <Ionicons
                name="checkmark"
                size={16}
                color="hsl(24 95% 60%)"
              />
            ) : null}
          </Pressable>
        );
      })}
    </AnchoredPopover>
  );
}
