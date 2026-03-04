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
  | "centerBottomLeft";

type DashboardSlots = Record<SlotId, DashboardModuleId>;

const DEFAULT_SLOTS: DashboardSlots = {
  hero: "overview_kpis",
  rightTop: "vessels_list",
  rightBottom: "alerts_feed",
  leftCenter: "maintenance_overview",
  leftBottom: "crew_summary",
  centerMid: "vessels_health",
  centerBottomLeft: "certs_expiring",
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

  // Nota: tenías min-h igual a max-h; lo dejo más lógico.
  const LATERAL_HEIGHT = "web:h-[45vh] web:max-h-[520px] web:min-h-[375px]";
  const GRID_BASE =
    "web:grid web:gap-4 web:grid-cols-1 web:md:grid-cols-2 web:2xl:grid-cols-6";
  const GRID_ROWS = "web:auto-rows-[375px]"; // opcional

  const SLOT_CLASS_2XL: Record<SlotId, string> = {
    hero: "web:col-span-1 web:md:col-span-2 web:2xl:col-span-6",
    leftCenter: "web:col-span-1 web:md:col-span-2 web:2xl:col-span-2",
    centerMid: "web:col-span-1 web:md:col-span-2 web:2xl:col-span-4",
    leftBottom: "web:col-span-1 web:md:col-span-2 web:2xl:col-span-3",
    centerBottomLeft: "web:col-span-1 web:md:col-span-2 web:2xl:col-span-3",
    // estos no se usan en el grid, están en la columna derecha:
    rightTop: "web:col-span-1",
    rightBottom: "web:col-span-1",
  };

  function slotClass2(id: SlotId) {
    return SLOT_CLASS_2XL[id];
  }

  return (
    <DashboardScopeProvider
      value={{ scope: "PROJECT", projectId: pid, projectKind }}
    >
      <ScrollView className="flex-1 bg-baseBg">
        <View className="p-4 web:p-0 gap-4">
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
              {/* MAIN GRID */}
              <View className="web:flex-1">
                <View className={[GRID_BASE, GRID_ROWS].join(" ")}>
                  {/* HERO: full width */}
                  <View className={slotClass2("hero")}>
                    <DashboardSlot
                      pickerPlacement="hidden"
                      slotTitle="Overview"
                      selectedModuleId={slots.hero}
                      items={items}
                      onSelect={(id) => setSlot("hero", id)}
                    >
                      {renderModule(slots.hero)}
                    </DashboardSlot>
                  </View>

                  {/* leftCenter: 1 slot (2/6) en 2xl */}
                  <View className={slotClass2("leftCenter")}>
                    <DashboardSlot
                      slotTitle="leftCenter"
                      selectedModuleId={slots.leftCenter}
                      items={items}
                      onSelect={(id) => setSlot("leftCenter", id)}
                    >
                      {renderModule(slots.leftCenter)}
                    </DashboardSlot>
                  </View>

                  {/* centerMid: 2 slots (4/6) en 2xl */}
                  <View className={slotClass2("centerMid")}>
                    <DashboardSlot
                      slotTitle="centerMid"
                      selectedModuleId={slots.centerMid}
                      items={items}
                      onSelect={(id) => setSlot("centerMid", id)}
                    >
                      {renderModule(slots.centerMid)}
                    </DashboardSlot>
                  </View>

                  {/* leftBottom: 1.5 slots (3/6) en 2xl */}
                  <View className={slotClass2("leftBottom")}>
                    <DashboardSlot
                      slotTitle="leftBottom"
                      selectedModuleId={slots.leftBottom}
                      items={items}
                      onSelect={(id) => setSlot("leftBottom", id)}
                    >
                      {renderModule(slots.leftBottom)}
                    </DashboardSlot>
                  </View>

                  {/* centerBottomLeft: 1.5 slots (3/6) en 2xl */}

                  <View className={slotClass2("centerBottomLeft")}>
                    <DashboardSlot
                      slotTitle="centerBottomLeft"
                      selectedModuleId={slots.centerBottomLeft}
                      items={items}
                      onSelect={(id) => setSlot("centerBottomLeft", id)}
                    >
                      {renderModule(slots.centerBottomLeft)}
                    </DashboardSlot>
                  </View>
                </View>
              </View>

              {/* RIGHT COLUMN (fixed width) */}
              <View className="web:w-full web:gap-4 web:flex web:flex-col web:lg:w-[360px] web:lg:min-w-[340px] web:lg:max-w-[420px]">
                <View className={LATERAL_HEIGHT}>
                  <DashboardSlot
                    pickerPlacement="header"
                    slotTitle="rightTop"
                    selectedModuleId={slots.rightTop}
                    items={items}
                    onSelect={(id) => setSlot("rightTop", id)}
                  >
                    {renderModule(slots.rightTop)}
                  </DashboardSlot>
                </View>

                <View className={LATERAL_HEIGHT}>
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
            // MOBILE: igual que antes
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
