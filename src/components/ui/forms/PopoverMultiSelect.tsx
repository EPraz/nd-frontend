import { AnchoredPopover } from "@/src/components/ui/popover";
import { Check, ChevronDown } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Text } from "../text/Text";

const POPOVER_MIN_WIDTH = 360;
const POPOVER_MAX_WIDTH = 520;
const POPOVER_ESTIMATED_HEIGHT = 320;
const MUTED_ICON_COLOR = "#9fb0c8";
const ACCENT_ICON_COLOR = "#ff8a3d";

export type PopoverMultiSelectOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
  accessibilityLabel?: string;
  disabled?: boolean;
};

type PopoverMultiSelectProps<T extends string> = {
  label: string;
  value: T[];
  options: PopoverMultiSelectOption<T>[];
  onChange: (value: T[]) => void;
  placeholder?: string;
  selectedLabel?: string;
  helperText?: string;
  emptyMessage?: string;
  disabled?: boolean;
  minWidth?: number;
  maxWidth?: number;
};

export function PopoverMultiSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = "No options selected",
  selectedLabel,
  helperText,
  emptyMessage = "No options available.",
  disabled = false,
  minWidth = POPOVER_MIN_WIDTH,
  maxWidth = POPOVER_MAX_WIDTH,
}: PopoverMultiSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const selectedCount = value.length;
  const displayLabel =
    selectedLabel ??
    (selectedCount === 0
      ? placeholder
      : `${selectedCount} option${selectedCount === 1 ? "" : "s"} selected`);

  function toggleOption(optionValue: T) {
    const nextValue = value.includes(optionValue)
      ? value.filter((item) => item !== optionValue)
      : [...value, optionValue];

    onChange(nextValue);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (disabled && nextOpen) return;
    setOpen(nextOpen);
  }

  return (
    <>
      <AnchoredPopover
        open={open}
        onOpenChange={handleOpenChange}
        minWidth={minWidth}
        maxWidth={maxWidth}
        estimatedHeight={POPOVER_ESTIMATED_HEIGHT}
        trigger={({ anchorRef, openPopover, isOpen }) => (
          <View ref={anchorRef} collapsable={false}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${label} selector`}
              accessibilityState={{ expanded: isOpen, disabled }}
              disabled={disabled}
              onPress={openPopover}
              className={[
                "flex-row items-center justify-between gap-3 rounded-[18px] border border-shellLine bg-shellPanelSoft px-4 py-3",
                disabled ? "opacity-60" : "",
              ].join(" ")}
            >
              <View className="min-w-0 flex-1 gap-1">
                <Text className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                  {label}
                </Text>
                <Text
                  numberOfLines={1}
                  className={[
                    "text-sm font-semibold",
                    selectedCount > 0 ? "text-textMain" : "text-muted",
                  ].join(" ")}
                >
                  {displayLabel}
                </Text>
              </View>
              <ChevronDown size={18} color={MUTED_ICON_COLOR} />
            </Pressable>
          </View>
        )}
      >
        <View className="gap-3">
          <View className="flex-row items-start justify-between gap-3 px-1">
            <View className="gap-1">
              <Text className="text-[11px] font-semibold uppercase tracking-[0.2em] text-shellHighlight">
                {label}
              </Text>
              <Text className="text-[12px] text-muted">
                Choose one or more options.
              </Text>
            </View>
            <Text className="text-[12px] font-semibold text-muted">
              {selectedCount} selected
            </Text>
          </View>

          <ScrollView
            className="max-h-[300px]"
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            <View className="gap-1">
              {options.length === 0 ? (
                <View className="rounded-2xl border border-shellLine bg-shellPanelSoft px-3 py-4">
                  <Text className="text-[12px] text-muted">
                    {emptyMessage}
                  </Text>
                </View>
              ) : (
                options.map((option) => {
                  const selected = value.includes(option.value);

                  return (
                    <Pressable
                      key={option.value}
                      accessibilityRole="switch"
                      accessibilityLabel={
                        option.accessibilityLabel ??
                        [option.label, option.description]
                          .filter(Boolean)
                          .join(" ")
                      }
                      accessibilityState={{
                        checked: selected,
                        disabled: option.disabled,
                      }}
                      disabled={option.disabled}
                      onPress={() => toggleOption(option.value)}
                      className={[
                        "flex-row items-center gap-3 rounded-2xl border px-3 py-3",
                        selected
                          ? "border-accent/35 bg-accent/10"
                          : "border-transparent bg-shellPanelSoft",
                        option.disabled ? "opacity-60" : "",
                      ].join(" ")}
                    >
                      <View
                        className={[
                          "h-7 w-7 items-center justify-center rounded-full border",
                          selected
                            ? "border-accent/40 bg-accent/15"
                            : "border-shellLine bg-shellCanvas",
                        ].join(" ")}
                      >
                        {selected ? (
                          <Check size={14} color={ACCENT_ICON_COLOR} />
                        ) : null}
                      </View>
                      <View className="min-w-0 flex-1 gap-0.5">
                        <Text className="text-sm font-semibold text-textMain">
                          {option.label}
                        </Text>
                        {option.description ? (
                          <Text className="text-[12px] text-muted">
                            {option.description}
                          </Text>
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })
              )}
            </View>
          </ScrollView>
        </View>
      </AnchoredPopover>

      {helperText ? (
        <Text className="text-[12px] leading-5 text-muted">{helperText}</Text>
      ) : null}
    </>
  );
}
