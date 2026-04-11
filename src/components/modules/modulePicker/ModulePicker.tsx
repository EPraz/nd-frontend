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
  const currentLabel = useMemo(
    () => items.find((item) => item.id === value)?.label ?? "Select module",
    [items, value],
  );

  return (
    <>
      {variant === "overlay" ? (
        <Pressable
          onPress={() => setOpen(true)}
          className="flex-row items-center justify-between gap-3 rounded-xl border border-shellLine bg-shellChromeSoft px-3 py-2 web:backdrop-blur-md"
        >
          <View className="flex-1">
            <Text className="text-[11px] text-muted">{title}</Text>
            <Text className="text-sm font-semibold text-textMain" numberOfLines={1}>
              {currentLabel}
            </Text>
          </View>

          <View className="h-8 w-8 items-center justify-center rounded-lg border border-shellLine bg-shellPanelSoft">
            <Ionicons
              name="chevron-down"
              size={18}
              color="hsl(var(--muted))"
            />
          </View>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => setOpen(true)}
          className="flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name={iconName} size={16} color="hsl(var(--muted))" />
            <View className="gap-0.5">
              <Text className="text-sm font-semibold text-muted">
                {currentLabel}
              </Text>
            </View>
          </View>

          <View className="h-8 w-8 items-center justify-center rounded-full border border-shellLine bg-shellPanelSoft">
            <Ionicons
              name="chevron-down"
              size={18}
              color="hsl(var(--muted))"
            />
          </View>
        </Pressable>
      )}

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
              <View className="overflow-hidden rounded-2xl border border-shellLine bg-shellPanel web:backdrop-blur-md">
                <View className="px-4 py-3">
                  <Text className="font-semibold text-textMain">
                    Choose module
                  </Text>
                  <Text className="mt-1 text-xs text-muted">
                    Change this dashboard section.
                  </Text>
                </View>

                <Separator />

                <View className="gap-2 p-3">
                  {items.map((item) => {
                    const active = item.id === value;

                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => {
                          onChange(item.id);
                          setOpen(false);
                        }}
                        className={[
                          "rounded-xl border px-3 py-3",
                          active
                            ? "border-accent/40 bg-accent/15"
                            : "border-shellLine bg-shellPanelSoft",
                        ].join(" ")}
                      >
                        <View className="flex-row items-center justify-between">
                          <Text
                            className={[
                              "text-sm",
                              active
                                ? "font-semibold text-textMain"
                                : "text-textMain",
                            ].join(" ")}
                          >
                            {item.label}
                          </Text>

                          {active ? (
                            <View className="h-6 w-6 items-center justify-center rounded-full border border-accent/40 bg-accent/25">
                              <Ionicons
                                name="checkmark"
                                size={14}
                                color="hsl(var(--text-main))"
                              />
                            </View>
                          ) : (
                            <Ionicons
                              name="chevron-forward"
                              size={16}
                              color="hsl(var(--muted))"
                            />
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>

                <Separator />

                <View className="flex-row justify-end px-4 py-3">
                  <Pressable
                    onPress={() => setOpen(false)}
                    className="rounded-lg border border-shellLine bg-shellPanelSoft px-3 py-2"
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
