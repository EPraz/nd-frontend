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

  /** "inline" = header style (card-like) | "overlay" = glass pill (hero) */
  variant?: "inline" | "overlay";
  iconName?: React.ComponentProps<typeof Ionicons>["name"];
}) {
  const {
    title,
    value,
    items,
    onChange,
    variant = "inline",
    iconName = "grid-outline",
  } = props;

  const [open, setOpen] = useState(false);

  const currentLabel = useMemo(() => {
    return items.find((i) => i.id === value)?.label ?? "Select module";
  }, [items, value]);

  return (
    <>
      {/* Trigger */}
      {variant === "overlay" ? (
        // HERO: glass pill
        <Pressable
          onPress={() => setOpen(true)}
          className="flex-row items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 px-3 py-2"
        >
          <View className="flex-1">
            <Text className="text-[11px] text-textMain/60">{title}</Text>
            <Text
              className="text-sm text-textMain font-semibold"
              numberOfLines={1}
            >
              {currentLabel}
            </Text>
          </View>

          <View className="h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5">
            <Ionicons name="chevron-down" size={18} color="white" />
          </View>
        </Pressable>
      ) : (
        // CARD HEADER: enterprise look
        <Pressable
          onPress={() => setOpen(true)}
          className="flex-row items-start justify-between"
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name={iconName} size={16} color="white" />
            <View className="gap-0.5">
              <Text className="text-sm font-semibold text-muted">
                {currentLabel}
              </Text>
              {/* <Text className="text-xs text-muted" numberOfLines={1}>
                {currentLabel}
              </Text> */}
            </View>
          </View>

          <View className="h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface">
            <Ionicons name="chevron-down" size={18} color="white" />
          </View>
        </Pressable>
      )}

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
            {/* stop propagation */}
            <Pressable onPress={() => {}} className="w-full max-w-[560px]">
              <View className="rounded-2xl border border-border bg-surface overflow-hidden">
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
                          "rounded-xl border px-3 py-3",
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
                    className="rounded-lg border border-border bg-surface px-3 py-2"
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
