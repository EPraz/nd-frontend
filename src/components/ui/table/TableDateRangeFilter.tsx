import { AnchoredPopover } from "@/src/components/ui/popover";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { DateField } from "../forms/DateField";
import { Text } from "../text/Text";

type TableDateRangeFilterProps = {
  from: string;
  to: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onClear: () => void;
  label?: string;
};

export function TableDateRangeFilter({
  from,
  to,
  open,
  onOpenChange,
  onFromChange,
  onToChange,
  onClear,
  label = "Date range",
}: TableDateRangeFilterProps) {
  const active = Boolean(from || to);

  return (
    <AnchoredPopover
      open={open}
      onOpenChange={onOpenChange}
      align="end"
      width={320}
      estimatedHeight={260}
      backdropClassName="bg-black/20"
      contentClassName="rounded-2xl border border-shellLine bg-shellPanel p-4 shadow-sm shadow-black/30 web:backdrop-blur-md"
      trigger={({ anchorRef, openPopover }) => (
        <View ref={anchorRef} collapsable={false}>
          <Pressable
            onPress={openPopover}
            className={[
              "min-h-11 flex-row items-center justify-between gap-3 rounded-full border px-4 py-2 web:backdrop-blur-md",
              active
                ? "border-accent/60 bg-accent/10"
                : "border-shellLine bg-shellGlass",
            ].join(" ")}
          >
            <View className="flex-row items-center gap-2">
              <Ionicons
                name="calendar-number-outline"
                size={14}
                color={active ? "hsl(24 95% 60%)" : "rgba(231,237,247,0.95)"}
              />
              <Text
                className={[
                  "text-[13px] font-medium",
                  active ? "text-accent" : "text-textMain",
                ].join(" ")}
              >
                {active ? "Custom range" : label}
              </Text>
            </View>

            <Ionicons
              name={open ? "chevron-up" : "chevron-down"}
              size={16}
              color="rgba(221,230,237,0.92)"
            />
          </Pressable>
        </View>
      )}
    >
      <View className="gap-4">
        <View className="gap-1">
          <Text className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
            Custom range
          </Text>
          <Text className="text-[12px] leading-[18px] text-muted">
            Use this when the preset windows are too narrow for planning.
          </Text>
        </View>

        <View className="gap-3">
          <DateField
            label="From"
            value={from}
            onChange={onFromChange}
            placeholder="Start date"
            surfaceTone="raised"
          />
          <DateField
            label="To"
            value={to}
            onChange={onToChange}
            placeholder="End date"
            surfaceTone="raised"
          />
        </View>

        <View className="flex-row justify-end gap-2">
          <Pressable
            onPress={onClear}
            className="min-h-10 items-center justify-center rounded-full border border-shellLine px-4"
          >
            <Text className="text-[13px] font-semibold text-textMain">
              Clear
            </Text>
          </Pressable>
          <Pressable
            onPress={() => onOpenChange(false)}
            className="min-h-10 items-center justify-center rounded-full bg-accent px-4"
          >
            <Text className="text-[13px] font-semibold text-white">Apply</Text>
          </Pressable>
        </View>
      </View>
    </AnchoredPopover>
  );
}
