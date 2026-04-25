import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { Text } from "@/src/components";

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1900;

export function VesselEditorYearBuiltField({
  value,
  onChange,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);

  const years = useMemo(
    () =>
      Array.from(
        { length: CURRENT_YEAR - MIN_YEAR + 1 },
        (_, index) => String(CURRENT_YEAR - index),
      ),
    [],
  );

  function close() {
    setOpen(false);
  }

  return (
    <View className="gap-2">
      <Text className="text-sm font-medium text-muted">Year Built</Text>

      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={[
          "h-12 flex-row items-center justify-between rounded-[20px] border border-shellLine bg-shellCanvas px-4 web:backdrop-blur-md",
          disabled ? "opacity-60" : "active:opacity-90",
        ].join(" ")}
      >
        <Text className={value ? "text-textMain" : "text-muted"}>
          {value || "Select build year"}
        </Text>
        <Ionicons
          name="calendar-outline"
          size={16}
          className={value ? "text-textMain" : "text-muted"}
        />
      </Pressable>

      <Modal
        visible={open}
        animationType="fade"
        transparent
        onRequestClose={close}
      >
        <View className="flex-1 items-center justify-start bg-black/60 px-4 pt-24">
          <Pressable onPress={close} className="absolute inset-0" />
          <View className="w-full rounded-3xl border border-shellLine bg-shellPanel p-4 web:w-[420px] web:backdrop-blur-md">
            <View className="flex-row items-center justify-between">
              <Text className="text-[16px] font-semibold text-textMain">
                Select build year
              </Text>
              <Pressable onPress={close} className="p-2 active:opacity-80">
                <Ionicons name="close" size={20} className="text-textMain" />
              </Pressable>
            </View>

            <ScrollView
              className="mt-3 max-h-[360px]"
              showsVerticalScrollIndicator={false}
            >
              <View className="gap-2">
                {years.map((year) => {
                  const active = year === value;

                  return (
                    <Pressable
                      key={year}
                      onPress={() => {
                        onChange(year);
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
                        <Text className="font-semibold text-textMain">{year}</Text>
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
        </View>
      </Modal>
    </View>
  );
}
