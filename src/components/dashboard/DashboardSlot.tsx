import { ReactNode } from "react";
import { View } from "react-native";
import { ModulePicker } from "../modules/projectDashboard/ModulePicker";
import { moduleIcons, type DashboardModuleId } from "../modules/registry";
import { Card, Text } from "../ui";

type Item = { id: DashboardModuleId; label: string };

export function DashboardSlot(props: {
  slotTitle: string;
  selectedModuleId: DashboardModuleId;
  items: Item[];
  onSelect: (moduleId: DashboardModuleId) => void;
  children: ReactNode;

  // flush?: boolean;
  pickerPlacement?: "header" | "hidden";
}) {
  const {
    slotTitle,
    selectedModuleId,
    items,
    onSelect,
    children,
    // flush = false,
    pickerPlacement = "header",
  } = props;

  return (
    <Card
      // className={cn(flush ? "p-0 gap-0 overflow-hidden relative" : "p-4 gap-3")}
      className={"flex-1 h-full p-0 gap-0 overflow-hidden relative"}
    >
      {/* HEADER (card style) */}
      {pickerPlacement === "header" ? (
        // <View className={cn(flush ? "px-4 pt-4 pb-3" : null)}>
        <View className={"px-4 pt-4 pb-3"}>
          <ModulePicker
            title={slotTitle}
            value={selectedModuleId}
            items={items}
            onChange={onSelect}
            variant="inline"
            iconName={moduleIcons[selectedModuleId]}
          />
        </View>
      ) : null}

      {/* BODY */}
      {/* {flush ? (
        <View>
          {children ?? (
            <Text className="text-muted text-sm px-4 pb-4">No content</Text>
          )}
        </View>
      ) : (
        <View className="rounded-md border border-border p-3">
          {children ?? <Text className="text-muted text-sm">No content</Text>}
        </View>
      )} */}
      <View className="flex-1">
        {children ?? (
          <Text className="text-muted text-sm px-4 pb-4">No content</Text>
        )}
      </View>
    </Card>
  );
}
