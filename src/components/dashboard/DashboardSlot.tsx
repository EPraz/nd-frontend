import { cn } from "@/src/lib/utils";
import { ReactNode, useState } from "react";
import { View } from "react-native";
import { ModulePicker } from "../modules/projectDashboard/ModulePicket";
import type { DashboardModuleId } from "../modules/registry";
import { Card, Text } from "../ui";

type Item = { id: DashboardModuleId; label: string };

export function DashboardSlot(props: {
  slotTitle: string;
  selectedModuleId: DashboardModuleId;
  items: Item[];
  onSelect: (moduleId: DashboardModuleId) => void;
  children: ReactNode;

  flush?: boolean;
  pickerPlacement?: "header" | "overlay" | "hidden"; // ✅ nuevo
}) {
  const {
    slotTitle,
    selectedModuleId,
    items,
    onSelect,
    children,
    flush = false,
    pickerPlacement = "header",
  } = props;

  const [open, setOpen] = useState(false);

  return (
    <Card
      className={cn(flush ? "p-0 gap-0 overflow-hidden relative" : "p-4 gap-3")}
    >
      {/* HEADER */}
      {pickerPlacement === "header" && (
        <View className={cn(flush ? "px-4 pt-4 pb-3" : null)}>
          <ModulePicker
            title={slotTitle}
            value={selectedModuleId}
            items={items}
            onChange={onSelect}
          />
        </View>
      )}

      {/* OVERLAY BUTTON + PICKER */}
      {pickerPlacement === "overlay" && (
        <View
          pointerEvents="box-none"
          className="absolute top-3 left-3 z-20 w-fit self-end"
        >
          <View className="overflow-hidden rounded-md border border-white/10 bg-black/50">
            <ModulePicker
              title={slotTitle}
              value={selectedModuleId}
              items={items}
              onChange={onSelect}
              variant="overlay"
            />
          </View>
        </View>
      )}

      {/* BODY */}
      {flush ? (
        <View>
          {children ?? (
            <Text className="text-muted text-sm px-4 pb-4">No content</Text>
          )}
        </View>
      ) : (
        <View className="rounded-md border border-border p-3">
          {children ?? <Text className="text-muted text-sm">No content</Text>}
        </View>
      )}
    </Card>
  );
}
