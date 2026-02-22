import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { Separator, Text } from "../../ui";
import type { DashboardModuleId } from "../registry";

type Item = { id: DashboardModuleId; label: string };

export function ModulePicker(props: {
  title: string;
  value: DashboardModuleId;
  items: Item[];
  onChange: (id: DashboardModuleId) => void;

  /** opcional: para modo overlay en hero */
  variant?: "inline" | "overlay";
}) {
  const { title, value, items, onChange, variant = "inline" } = props;
  const [open, setOpen] = useState(false);

  const currentLabel = useMemo(() => {
    return items.find((i) => i.id === value)?.label ?? "Select module";
  }, [items, value]);

  return (
    <>
      {/* Trigger */}
      <Pressable
        onPress={() => setOpen(true)}
        className={[
          "flex-row items-center justify-between gap-3 rounded-md border border-border",
          variant === "overlay"
            ? "bg-black/35 px-3 py-2"
            : "bg-surface px-3 py-2",
        ].join(" ")}
      >
        <View className="flex-1">
          <Text className="text-[11px] text-muted">{title}</Text>
          <Text
            className="text-sm text-textMain font-semibold"
            numberOfLines={1}
          >
            {currentLabel}
          </Text>
        </View>

        <View className="h-8 w-8 items-center justify-center rounded-md border border-border bg-surface/70">
          <Ionicons name="chevron-down" size={18} color="white" />
        </View>
      </Pressable>

      {/* Modal */}
      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/55"
          onPress={() => setOpen(false)}
        >
          <View className="flex-1 items-center justify-center px-6">
            <Pressable onPress={() => {}} className="w-full max-w-[560px]">
              <View className="rounded-xl border border-border bg-surface overflow-hidden">
                {/* Header */}
                <View className="px-4 py-3">
                  <Text className="text-textMain font-semibold">
                    Choose module
                  </Text>
                  <Text className="text-xs text-muted mt-1">
                    Cambia el contenido de esta sección.
                  </Text>
                </View>

                <Separator />

                {/* List */}
                <View className="p-3 gap-2">
                  {items.map((it) => {
                    const active = it.id === value;

                    return (
                      <Pressable
                        key={it.id}
                        onPress={() => {
                          onChange(it.id);
                          setOpen(false);
                        }}
                        className={[
                          "rounded-lg border px-3 py-3",
                          active
                            ? "border-ring bg-accent/15"
                            : "border-border bg-surface/40",
                        ].join(" ")}
                      >
                        <View className="flex-row items-center justify-between">
                          <Text
                            className={[
                              "text-sm",
                              active
                                ? "text-textMain font-semibold"
                                : "text-textMain",
                            ].join(" ")}
                          >
                            {it.label}
                          </Text>

                          {active ? (
                            <View className="h-6 w-6 items-center justify-center rounded-full bg-accent/25 border border-ring">
                              <Ionicons
                                name="checkmark"
                                size={14}
                                color="white"
                              />
                            </View>
                          ) : (
                            <Ionicons
                              name="chevron-forward"
                              size={16}
                              color="rgba(255,255,255,0.35)"
                            />
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>

                <Separator />

                {/* Footer */}
                <View className="px-4 py-3 flex-row justify-end">
                  <Pressable
                    onPress={() => setOpen(false)}
                    className="rounded-md border border-border bg-surface px-3 py-2"
                  >
                    <Text className="text-sm text-textMain">Close</Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
