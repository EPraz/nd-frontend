import { AnchoredPopover } from "@/src/components/ui/popover";
import { usePlaceholderColor } from "@/src/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { DateField } from "../forms/DateField";
import { Text } from "../text/Text";

type TableFilterMenuProps = {
  children: ReactNode;
  activeCount?: number;
  title?: string;
  triggerLabel?: string;
  onClear?: () => void;
};

export function TableFilterMenu({
  children,
  activeCount = 0,
  title = "Table filters",
  triggerLabel = "Filters",
  onClear,
}: TableFilterMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <AnchoredPopover
      align="end"
      width={420}
      estimatedHeight={520}
      backdropClassName="bg-black/30"
      contentClassName="rounded-[26px] border border-shellLine bg-shellCanvas p-4 shadow-2xl shadow-black/60 web:backdrop-blur-md"
      open={open}
      onOpenChange={setOpen}
      trigger={({ anchorRef, openPopover, isOpen }) => (
        <View ref={anchorRef} collapsable={false}>
          <Pressable
            onPress={openPopover}
            className={[
              "min-h-11 shrink-0 flex-row items-center gap-3 rounded-full border px-4 py-2 web:backdrop-blur-md",
              activeCount > 0
                ? "border-accent bg-shellGlass"
                : "border-shellLine bg-shellGlass",
            ].join(" ")}
          >
            <Ionicons
              name="filter-outline"
              size={15}
              className={activeCount > 0 ? "text-accent" : "text-muted"}
            />
            <Text className="text-[13px] font-semibold text-textMain">
              {triggerLabel}
            </Text>
            {activeCount > 0 ? (
              <View className="min-w-6 items-center rounded-full bg-accent px-2 py-0.5">
                <Text className="text-[11px] font-semibold text-textMain">
                  {activeCount}
                </Text>
              </View>
            ) : null}
            <Ionicons
              name={isOpen ? "chevron-up" : "chevron-down"}
              size={15}
              className={activeCount > 0 ? "text-accent" : "text-muted"}
            />
          </Pressable>
        </View>
      )}
    >
      <TableFilterMenuContent title={title} onClear={onClear}>
        {children}
      </TableFilterMenuContent>
    </AnchoredPopover>
  );
}

function TableFilterMenuContent({
  title,
  onClear,
  children,
}: {
  title: string;
  onClear?: () => void;
  children: ReactNode;
}) {
  return (
    <View className="gap-4">
      <View className="flex-row items-start justify-between gap-4">
        <View className="gap-1">
          <Text className="text-[11px] font-semibold uppercase tracking-[0.24em] text-shellHighlight">
            Filters
          </Text>
          <Text className="text-[18px] font-semibold text-textMain">
            {title}
          </Text>
        </View>

        {onClear ? (
          <Pressable
            onPress={onClear}
            className="min-h-9 items-center justify-center rounded-full border border-shellLine px-3"
          >
            <Text className="text-[12px] font-semibold text-textMain">
              Reset
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View className="h-px bg-shellLine" />

      <ScrollView
        className="max-h-[420px]"
        contentContainerClassName="gap-4"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function TableToolbarSearch({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  const placeholderColor = usePlaceholderColor();

  return (
    <View className="w-full md:w-[300px] lg:w-[340px]">
      <View className="min-h-11 flex-row items-center gap-3 rounded-full border border-shellLine bg-shellGlass px-4 web:backdrop-blur-md">
        <Ionicons
          name="search-outline"
          size={17}
          className="text-muted"
        />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          className="h-11 min-w-0 flex-1 text-textMain outline-none"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value ? (
          <Pressable
            onPress={() => onChangeText("")}
            className="h-8 w-8 items-center justify-center rounded-full bg-shellPanelSoft"
          >
            <Ionicons name="close" size={15} className="text-muted" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function TableFilterOptionGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  renderLabel,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  renderLabel: (value: T) => string;
}) {
  return (
    <View className="gap-2">
      <Text className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
        {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const active = option === value;

          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              className={[
                "min-h-9 flex-row items-center gap-2 rounded-full border px-3",
                active
                  ? "border-accent bg-softAccent"
                  : "border-shellLine bg-shellPanel",
              ].join(" ")}
            >
              <View
                className={[
                  "h-1.5 w-1.5 rounded-full",
                  active ? "bg-accent" : "bg-muted",
                ].join(" ")}
              />
              <Text
                className={[
                  "text-[12px] font-semibold",
                  active ? "text-accent" : "text-textMain",
                ].join(" ")}
              >
                {renderLabel(option)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function TableFilterDateRange({
  from,
  to,
  onFromChange,
  onToChange,
  onClear,
  label = "Custom range",
}: {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onClear: () => void;
  label?: string;
}) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
          {label}
        </Text>
        {from || to ? (
          <Pressable onPress={onClear}>
            <Text className="text-[12px] font-semibold text-accent">Clear</Text>
          </Pressable>
        ) : null}
      </View>
      <View className="gap-3 md:flex-row">
        <View className="flex-1">
          <DateField
            label="From"
            value={from}
            onChange={onFromChange}
            placeholder="Start date"
            surfaceTone="raised"
          />
        </View>
        <View className="flex-1">
          <DateField
            label="To"
            value={to}
            onChange={onToChange}
            placeholder="End date"
            surfaceTone="raised"
          />
        </View>
      </View>
    </View>
  );
}
