import { useDashboardScope, useProjectEntitlements } from "@/src/context";
import { useVesselsHealthData, VesselHealthStatus } from "@/src/hooks";
import { cn } from "@/src/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { ModuleUnavailableState } from "../ModuleUnavailableState";
import { ModuleFrame } from "../../dashboard/ModuleFrame";
import { Button, MiniPill, Text, Tone, toneClasses } from "../../ui";

const MAX = 10;

function toneFor(s: VesselHealthStatus): Tone {
  if (s === "CRITICAL") return "fail";
  if (s === "WARNING") return "warn";
  return "ok";
}

function iconFor(s: VesselHealthStatus) {
  if (s === "CRITICAL") return "alert-circle-outline";
  if (s === "WARNING") return "warning-outline";
  return "checkmark-circle-outline";
}

export default function VesselsHealthModule() {
  const { projectId } = useDashboardScope();
  const { isModuleEnabled } = useProjectEntitlements();
  const { data, isLoading, error, refetch } = useVesselsHealthData();
  const router = useRouter();

  const top = data.vessels.slice(0, MAX);

  return (
    <ModuleFrame isLoading={isLoading} error={error} onRetry={refetch}>
      {!isModuleEnabled("vessels") ? (
        <ModuleUnavailableState label="Vessels" />
      ) : (
      <View className="flex-1 rounded-[22px] border border-shellLine bg-shellPanel p-3 web:backdrop-blur-md">
        <View className="flex-1 gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-textMain">
              Vessel Health
            </Text>

            <View className="flex-row items-center gap-2">
              <MiniPill className="bg-shellPanelSoft">
                <Text className="text-[10px] text-muted">
                  {data.critical} critical
                </Text>
              </MiniPill>
              <MiniPill className="bg-shellPanelSoft">
                <Text className="text-[10px] text-muted">
                  {data.warning} warning
                </Text>
              </MiniPill>
            </View>
          </View>

          {top.length === 0 ? (
            <View className="flex-1">
              <Text className="text-xs text-muted">No vessels found.</Text>
            </View>
          ) : (
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, gap: 8, paddingBottom: 12 }}
            >
              {top.map((v) => {
                const tone = toneFor(v.status);
                const ui = toneClasses(tone);

                return (
                  <Pressable
                    key={v.assetId}
                    onPress={() =>
                      router.push({
                        pathname: "/projects/[projectId]/vessels/[assetId]",
                        params: { projectId, assetId: v.assetId },
                      })
                    }
                    className={cn(
                      "overflow-hidden border-b border-shellLine bg-shellPanel",
                      "web:hover:bg-shellPanelSoft",
                    )}
                  >
                    <View className="flex-row items-center gap-3 px-3 py-3">
                      <View
                        className={cn(
                          "h-9 w-9 items-center justify-center rounded-lg border border-shellLine",
                          ui.iconBg ?? "bg-shellPanelSoft",
                        )}
                      >
                        <Ionicons
                          name={iconFor(v.status) as any}
                          size={18}
                          color="rgba(255,255,255,0.85)"
                        />
                      </View>

                      <View className="flex-1">
                        <Text
                          className="text-sm font-semibold text-textMain"
                          numberOfLines={1}
                        >
                          {v.assetName}
                        </Text>

                        <Text
                          className="text-xs text-muted mt-0.5"
                          numberOfLines={1}
                        >
                          {v.reasons[0] ?? "All good"}
                          {v.reasons.length > 1
                            ? ` • +${v.reasons.length - 1}`
                            : ""}
                        </Text>
                      </View>

                      <MiniPill
                        className={cn(ui.chip, "rounded-full px-2.5 py-1")}
                      >
                        <View className="flex-row items-center gap-2">
                          <View
                            className={cn("h-2 w-2 rounded-full", ui.dot)}
                          />
                          <Text
                            className={cn("text-[10px] font-semibold", ui.text)}
                          >
                            {v.status}
                          </Text>
                        </View>
                      </MiniPill>

                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color="rgba(255,255,255,0.35)"
                      />
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          <Button
            variant="softAccent"
            size="sm"
            className="rounded-xl"
            onPress={() =>
              router.push({
                pathname: "/projects/[projectId]/vessels",
                params: { projectId },
              })
            }
            leftIcon={
              <Ionicons
                name="boat-outline"
                size={16}
                color="rgba(255,255,255,0.65)"
              />
            }
          >
            View All Vessels
          </Button>
        </View>
      </View>
      )}
    </ModuleFrame>
  );
}
