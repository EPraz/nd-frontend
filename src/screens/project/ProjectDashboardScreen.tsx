import { useLocalSearchParams } from "expo-router";
import { type ReactNode, useMemo, useState } from "react";
import { Platform, ScrollView, View } from "react-native";
import { Button, Text } from "../../components";
import { DashboardSlot } from "../../components/dashboard/DashboardSlot";
import { RecentActivityPanel } from "../../components/modules/recentActivity";
import {
  DashboardModuleId,
  getAvailableModules,
  getModuleById,
} from "../../components/modules/registry";
import {
  DashboardScopeProvider,
  useProjectContext,
  useProjectEntitlements,
} from "../../context";
import { useProjectAuditEvents } from "../../hooks/useProjectAuditEvents";
import { CommandCenterReviewLayout } from "./CommandCenterReviewLayout";

type SlotId =
  | "hero"
  | "rightTop"
  | "rightBottom"
  | "leftCenter"
  | "leftBottom"
  | "centerMid"
  | "centerBottomLeft";

type DashboardSlots = Record<SlotId, DashboardModuleId>;
type DashboardMode = "classic" | "review";

const DEFAULT_SLOTS: DashboardSlots = {
  hero: "overview_kpis",
  rightTop: "vessels_list",
  rightBottom: "alerts_feed",
  leftCenter: "maintenance_overview",
  leftBottom: "crew_summary",
  centerMid: "vessels_health",
  centerBottomLeft: "certs_expiring",
};

const LATERAL_HEIGHT = "web:h-[45vh] web:max-h-[520px] web:min-h-[375px]";
const GRID_BASE =
  "web:grid web:gap-4 web:grid-cols-1 web:md:grid-cols-2 web:2xl:grid-cols-6";
const GRID_ROWS = "web:auto-rows-[375px]";

const SLOT_CLASS_2XL: Record<SlotId, string> = {
  hero: "web:col-span-1 web:md:col-span-2 web:2xl:col-span-6",
  leftCenter: "web:col-span-1 web:md:col-span-2 web:2xl:col-span-2",
  centerMid: "web:col-span-1 web:md:col-span-2 web:2xl:col-span-4",
  leftBottom: "web:col-span-1 web:md:col-span-2 web:2xl:col-span-3",
  centerBottomLeft: "web:col-span-1 web:md:col-span-2 web:2xl:col-span-3",
  rightTop: "web:col-span-1",
  rightBottom: "web:col-span-1",
};

function slotClass2(id: SlotId) {
  return SLOT_CLASS_2XL[id];
}

export default function ProjectDashboardScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const pid = String(projectId);
  const { projectKind } = useProjectContext();
  const { isModuleEnabled } = useProjectEntitlements();
  const auditState = useProjectAuditEvents(pid, { limit: 8 });

  const available = useMemo(
    () => getAvailableModules({ scope: "PROJECT", projectKind }),
    [projectKind],
  );

  const items = useMemo(
    () => available.map((m) => ({ id: m.id, label: m.label })),
    [available],
  );

  const [slots, setSlots] = useState<DashboardSlots>(DEFAULT_SLOTS);
  const [mode, setMode] = useState<DashboardMode>("classic");
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
      <ScrollView className="flex-1 bg-transparent">
        <View className="gap-4 p-4 web:p-0">
          <View className="flex-row flex-wrap items-start justify-between gap-3">
            <View className="gap-1">
              <Text className="text-2xl font-semibold">ARXIS Dashboard</Text>
              <Text className="text-sm text-muted">
                Vista agregada de todos los assets del proyecto.
              </Text>
            </View>

            <View className="flex-row flex-wrap items-center gap-2">
              <Button
                variant={mode === "classic" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onPress={() => setMode("classic")}
              >
                Current layout
              </Button>
              <Button
                variant={mode === "review" ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onPress={() => setMode("review")}
              >
                Review layout
              </Button>
            </View>
          </View>

          {mode === "review" ? (
            <CommandCenterReviewLayout projectId={pid} />
          ) : (
            <ClassicDashboardLayout
              isWeb={isWeb}
              items={items}
              slots={slots}
              renderModule={renderModule}
              setSlot={setSlot}
            />
          )}

          <RecentActivityPanel
            title="Recent Activity"
            description="Latest changes across enabled project modules, using the transversal audit foundation instead of separate per-screen logic."
            events={auditState.events}
            isLoading={auditState.loading}
            error={auditState.error}
            onRetry={auditState.refresh}
            isModuleEnabled={isModuleEnabled}
            maxItems={6}
          />
        </View>
      </ScrollView>
    </DashboardScopeProvider>
  );
}

function ClassicDashboardLayout(props: {
  isWeb: boolean;
  items: { id: DashboardModuleId; label: string }[];
  slots: DashboardSlots;
  renderModule: (moduleId: DashboardModuleId) => ReactNode;
  setSlot: (slotId: SlotId, moduleId: DashboardModuleId) => void;
}) {
  if (props.isWeb) {
    return (
      <View className="web:flex web:flex-col web:gap-4 web:lg:flex-row">
        <View className="web:flex-1">
          <View className={[GRID_BASE, GRID_ROWS].join(" ")}>
            <View className={slotClass2("leftCenter")}>
              <DashboardSlot
                slotTitle="leftCenter"
                selectedModuleId={props.slots.leftCenter}
                items={props.items}
                onSelect={(id) => props.setSlot("leftCenter", id)}
              >
                {props.renderModule(props.slots.leftCenter)}
              </DashboardSlot>
            </View>

            <View className={slotClass2("centerMid")}>
              <DashboardSlot
                slotTitle="centerMid"
                selectedModuleId={props.slots.centerMid}
                items={props.items}
                onSelect={(id) => props.setSlot("centerMid", id)}
              >
                {props.renderModule(props.slots.centerMid)}
              </DashboardSlot>
            </View>

            <View className={slotClass2("leftBottom")}>
              <DashboardSlot
                slotTitle="leftBottom"
                selectedModuleId={props.slots.leftBottom}
                items={props.items}
                onSelect={(id) => props.setSlot("leftBottom", id)}
              >
                {props.renderModule(props.slots.leftBottom)}
              </DashboardSlot>
            </View>

            <View className={slotClass2("centerBottomLeft")}>
              <DashboardSlot
                slotTitle="centerBottomLeft"
                selectedModuleId={props.slots.centerBottomLeft}
                items={props.items}
                onSelect={(id) => props.setSlot("centerBottomLeft", id)}
              >
                {props.renderModule(props.slots.centerBottomLeft)}
              </DashboardSlot>
            </View>
          </View>
        </View>

        <View className="web:w-full web:gap-4 web:flex web:flex-col web:lg:w-[360px] web:lg:min-w-[340px] web:lg:max-w-[420px]">
          <View className={LATERAL_HEIGHT}>
            <DashboardSlot
              pickerPlacement="header"
              slotTitle="rightTop"
              selectedModuleId={props.slots.rightTop}
              items={props.items}
              onSelect={(id) => props.setSlot("rightTop", id)}
            >
              {props.renderModule(props.slots.rightTop)}
            </DashboardSlot>
          </View>

          <View className={LATERAL_HEIGHT}>
            <DashboardSlot
              slotTitle="rightBottom"
              selectedModuleId={props.slots.rightBottom}
              items={props.items}
              onSelect={(id) => props.setSlot("rightBottom", id)}
            >
              {props.renderModule(props.slots.rightBottom)}
            </DashboardSlot>
          </View>
        </View>
      </View>
    );
  }

  return (
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
            selectedModuleId={props.slots[id]}
            items={props.items}
            onSelect={(moduleId) => props.setSlot(id, moduleId)}
            pickerPlacement={isHero ? "hidden" : "header"}
          >
            {props.renderModule(props.slots[id])}
          </DashboardSlot>
        );
      })}
    </View>
  );
}
