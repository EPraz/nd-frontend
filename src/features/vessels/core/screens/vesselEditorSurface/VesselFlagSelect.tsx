import { Text } from "@/src/components";
import { AnchoredPopover } from "@/src/components/ui/popover";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import {
  getVesselFlagLabel,
  getVesselFlagSearchText,
  VESSEL_FLAG_CODES,
} from "./vesselFlagCodes";

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function VesselFlagSelect({ value, onChange, disabled = false }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedLabel = value ? getVesselFlagLabel(value) : "Select flag code";

  const options = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return VESSEL_FLAG_CODES.filter((code) => {
      if (!normalizedQuery) return true;

      return (
        code.toLowerCase().includes(normalizedQuery) ||
        getVesselFlagSearchText(code).includes(normalizedQuery)
      );
    });
  }, [query]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  function handleOpenChange(nextOpen: boolean) {
    if (disabled && nextOpen) return;

    if (nextOpen) {
      setOpen(true);
      return;
    }

    close();
  }

  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-muted ">Flag Code</Text>

      <AnchoredPopover
        open={open}
        onOpenChange={handleOpenChange}
        minWidth={440}
        maxWidth={560}
        estimatedHeight={520}
        backdropClassName="bg-black/50"
        trigger={({ anchorRef, openPopover }) => (
          <View ref={anchorRef} collapsable={false}>
            <Pressable
              disabled={disabled}
              onPress={openPopover}
              className={[
                "h-12 flex-row items-center justify-between rounded-[20px] border border-shellLine bg-shellCanvas px-4 web:backdrop-blur-md",
                disabled ? "opacity-60" : "active:opacity-90",
              ].join(" ")}
            >
              <Text className={value ? "text-textMain" : "text-muted"}>
                {selectedLabel}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                className="text-textMain"
              />
            </Pressable>
          </View>
        )}
      >
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-[16px] font-semibold text-textMain">
              Select flag state
            </Text>
            <Pressable onPress={close} className="p-2 active:opacity-80">
              <Ionicons name="close" size={20} className="text-textMain" />
            </Pressable>
          </View>

          <View className="flex-row items-center gap-2 rounded-2xl border border-shellLine bg-shellPanelSoft px-3">
            <Ionicons name="search" size={16} className="text-muted" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search by code or country..."
              placeholderTextColor="rgba(221,230,237,0.35)"
              className="h-11 flex-1 text-textMain"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
          </View>

          <ScrollView
            className="max-h-[360px]"
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-2">
              {options.map((code) => {
                const active = code === value;

                return (
                  <Pressable
                    key={code}
                    onPress={() => {
                      onChange(code);
                      close();
                    }}
                    className={[
                      "rounded-2xl border px-4 py-3",
                      active
                        ? "border-accent bg-shellPanelSoft"
                        : "border-shellLine bg-shellPanelSoft active:opacity-90",
                    ].join(" ")}
                  >
                    <View className="flex-row items-center justify-between gap-3">
                      <View className="flex-1">
                        <Text className="font-semibold text-textMain">
                          {getVesselFlagLabel(code)}
                        </Text>
                      </View>

                      {active ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          className="text-accent"
                        />
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </AnchoredPopover>

      <Text className="text-[12px] leading-[18px] text-muted">
        Use the official two-letter flag state code.
      </Text>
    </View>
  );
}
