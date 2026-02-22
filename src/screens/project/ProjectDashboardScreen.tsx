import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Platform, ScrollView, View } from "react-native";
import { Text } from "../../components";
import { DashboardSlot } from "../../components/dashboard/DashboardSlot";
import {
  DashboardModuleId,
  getAvailableModules,
  getModuleById,
} from "../../components/modules/registry";
import { DashboardScopeProvider, useProjectContext } from "../../context";

type SlotId =
  | "hero"
  | "rightTop"
  | "rightBottom"
  | "leftCenter"
  | "leftBottom"
  | "centerMid"
  | "centerBottomLeft"
  | "centerBottomRight";

type DashboardSlots = Record<SlotId, DashboardModuleId>;

const DEFAULT_SLOTS: DashboardSlots = {
  hero: "overview_kpis",
  rightTop: "vessels_list",
  rightBottom: "alerts_feed",
  leftCenter: "maintenance_overview",
  leftBottom: "crew_summary",
  centerMid: "project_health",
  centerBottomLeft: "certs_expiring",
  centerBottomRight: "certs_summary",
};

export default function ProjectDashboardScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const pid = String(projectId);
  const { projectKind, projectName } = useProjectContext();

  const available = useMemo(
    () => getAvailableModules({ scope: "PROJECT", projectKind }),
    [projectKind],
  );

  const items = useMemo(
    () => available.map((m) => ({ id: m.id, label: m.label })),
    [available],
  );

  const [slots, setSlots] = useState<DashboardSlots>(DEFAULT_SLOTS);
  const isWeb = Platform.OS === "web";

  const renderModule = (moduleId: DashboardModuleId) => {
    const mod = getModuleById(moduleId);
    if (!mod) return null;
    const Cmp = mod.Component;
    return <Cmp />;
  };

  const setSlot = (slotId: SlotId, moduleId: DashboardModuleId) => {
    setSlots((prev) => ({ ...prev, [slotId]: moduleId }));
  };

  return (
    <DashboardScopeProvider
      value={{ scope: "PROJECT", projectId: pid, projectKind }}
    >
      <ScrollView className="flex-1 bg-baseBg">
        <View className="p-4 web:p-6 gap-4">
          <View className="gap-1">
            <Text className="text-2xl font-semibold">
              {projectName} Dashboard
            </Text>
            <Text className="text-sm text-muted">
              Vista agregada de todos los assets del proyecto.
            </Text>
          </View>

          {isWeb ? (
            <View className="web:flex web:flex-col web:gap-4 web:lg:flex-row">
              <View className="web:flex-1">
                <View className="web:grid web:grid-cols-1 web:gap-4 web:md:grid-cols-2 web:xl:grid-cols-3">
                  <View className="web:col-span-1 web:md:col-span-2 web:xl:col-span-3 ">
                    <DashboardSlot
                      flush
                      pickerPlacement="hidden"
                      slotTitle="Overview"
                      selectedModuleId={slots.hero}
                      items={items}
                      onSelect={(id) => setSlot("hero", id)}
                    >
                      {renderModule(slots.hero)}
                    </DashboardSlot>
                  </View>
                  <View className="web:col-span-2 web:xl:col-span-1">
                    <DashboardSlot
                      slotTitle="leftCenter"
                      selectedModuleId={slots.leftCenter}
                      items={items}
                      onSelect={(id) => setSlot("leftCenter", id)}
                    >
                      {renderModule(slots.leftCenter)}
                    </DashboardSlot>
                  </View>
                  <View className="web:col-span-1 web:md:col-span-2 web:xl:col-span-2">
                    <DashboardSlot
                      slotTitle="centerMid"
                      selectedModuleId={slots.centerMid}
                      items={items}
                      onSelect={(id) => setSlot("centerMid", id)}
                    >
                      {renderModule(slots.centerMid)}
                    </DashboardSlot>
                  </View>
                  <View className="web:col-span-2 web:xl:col-span-1">
                    <DashboardSlot
                      slotTitle="leftBottom"
                      selectedModuleId={slots.leftBottom}
                      items={items}
                      onSelect={(id) => setSlot("leftBottom", id)}
                    >
                      {renderModule(slots.leftBottom)}
                    </DashboardSlot>
                  </View>
                  <View className="web:col-span-2 web:xl:col-span-1">
                    <DashboardSlot
                      slotTitle="centerBottomLeft"
                      selectedModuleId={slots.centerBottomLeft}
                      items={items}
                      onSelect={(id) => setSlot("centerBottomLeft", id)}
                    >
                      {renderModule(slots.centerBottomLeft)}
                    </DashboardSlot>
                  </View>
                  <View className="web:col-span-2 web:xl:col-span-1">
                    <DashboardSlot
                      slotTitle="centerBottomRight"
                      selectedModuleId={slots.centerBottomRight}
                      items={items}
                      onSelect={(id) => setSlot("centerBottomRight", id)}
                    >
                      {renderModule(slots.centerBottomRight)}
                    </DashboardSlot>
                  </View>
                </View>
              </View>

              <View className="web:w-full web:gap-4 web:flex web:flex-col web:lg:w-[360px] web:lg:min-w-[340px] web:lg:max-w-[420px]">
                <View className="web:flex-1">
                  <DashboardSlot
                    slotTitle="rightTop"
                    selectedModuleId={slots.rightTop}
                    items={items}
                    onSelect={(id) => setSlot("rightTop", id)}
                  >
                    {renderModule(slots.rightTop)}
                  </DashboardSlot>
                </View>

                <View className="web:flex-1">
                  <DashboardSlot
                    slotTitle="rightBottom"
                    selectedModuleId={slots.rightBottom}
                    items={items}
                    onSelect={(id) => setSlot("rightBottom", id)}
                  >
                    {renderModule(slots.rightBottom)}
                  </DashboardSlot>
                </View>
              </View>
            </View>
          ) : (
            <View className="gap-4">
              {(
                [
                  ["hero", "Overview"],
                  ["rightTop", "rightTop"],
                  ["rightBottom", "rightBottom"],
                  ["leftCenter", "leftCenter"],
                  ["centerMid", "centerMid"],
                  ["leftBottom", "leftBottom"],
                  ["centerBottomLeft", "centerBottomLeft"],
                  ["centerBottomRight", "centerBottomRight"],
                ] as const
              ).map(([id, title]) => {
                const isHero = id === "hero";

                return (
                  <DashboardSlot
                    key={id}
                    slotTitle={title}
                    selectedModuleId={slots[id]}
                    items={items}
                    onSelect={(moduleId) => setSlot(id, moduleId)}
                    flush={isHero}
                    pickerPlacement={isHero ? "hidden" : "header"}
                  >
                    {renderModule(slots[id])}
                  </DashboardSlot>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </DashboardScopeProvider>
  );
}
