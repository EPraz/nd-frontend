import { useDashboardScope, useProjectEntitlements } from "@/src/context";
import { useCrewSummaryData } from "@/src/hooks";
import { cn } from "@/src/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { ModuleUnavailableState } from "../ModuleUnavailableState";
import { ModuleFrame } from "../../dashboard/ModuleFrame";
import { Button, MiniPill, Text } from "../../ui";

const MAX_VESSELS = 10;

export default function CrewSummaryModule() {
  const { projectId } = useDashboardScope();
  const { isModuleEnabled } = useProjectEntitlements();
  const { data, isLoading, error, refetch } = useCrewSummaryData();
  const router = useRouter();

  const top = useMemo(() => {
    return data.crewByVessel.slice(0, MAX_VESSELS);
  }, [data.crewByVessel]);

  const hasList = top.length > 0;

  return (
    <ModuleFrame isLoading={isLoading} error={error} onRetry={refetch}>
      {!isModuleEnabled("crew") ? (
        <ModuleUnavailableState label="Crew" />
      ) : (
      <View className="flex-1 p-3 border border-border">
        <View className="flex-1 gap-3">
          {/* STATS */}
          {/* {compact ? (
            <View className="flex-row gap-3">
              <MiniStat
                tone="info"
                className="rounded-xl text-info"
                label="Active"
                value={String(data.active)}
              />
              <MiniStat
                tone="fail"
                className="text-destructive rounded-xl"
                label="No Crew"
                value={String(data.vesselsWithoutActiveCrew)}
              />
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-3">
              <MiniStat
                className="rounded-xl"
                label="Total"
                value={String(data.total)}
              />
              <MiniStat
                className="rounded-xl"
                label="Active"
                value={String(data.active)}
              />
              <MiniStat
                className="rounded-xl"
                label="Inactive"
                value={String(data.inactive)}
              />
              <MiniStat
                className="text-destructive rounded-xl"
                label="Vessels w/o Crew"
                value={String(data.vesselsWithoutActiveCrew)}
              />
            </View>
          )} */}

          {/* LIST */}
          {!hasList ? (
            <View className="flex-1">
              <Text className="text-xs text-muted">No crew assigned.</Text>
            </View>
          ) : (
            <View className="flex-1 gap-2">
              {/* <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-textMain">
                  Crew by Vessel
                </Text>

                <MiniPill className="bg-baseBg/35">
                  <Text className="text-[10px] text-textMain/80">
                    Top {Math.min(MAX_VESSELS, data.crewByVessel.length)}{" "}
                    Vessels
                  </Text>
                </MiniPill>
              </View> */}

              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  flexGrow: 1,
                  gap: 8,
                  paddingBottom: 12,
                }}
              >
                {top.map((v) => {
                  const isZero = v.activeCount === 0;

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
                        "border-b border-border bg-surface overflow-hidden",
                        "web:hover:bg-muted/10",
                      )}
                    >
                      <View className="flex-row items-center gap-3 px-3 py-3">
                        {/* Icon */}
                        <View className="h-9 w-9 items-center justify-center rounded-lg border border-border bg-baseBg/35">
                          <Ionicons
                            name="people-outline"
                            size={18}
                            color="rgba(255,255,255,0.85)"
                          />
                        </View>

                        {/* Text */}
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
                            Active crew
                          </Text>
                        </View>

                        {/* Count pill */}
                        <MiniPill
                          className={cn(
                            "rounded-full px-2.5 py-1",
                            isZero
                              ? "bg-destructive/12 border-destructive/30"
                              : "bg-success/12 border-success/30",
                          )}
                        >
                          <View className="flex-row items-center gap-2">
                            <View
                              className={cn(
                                "h-2 w-2 rounded-full",
                                isZero ? "bg-destructive" : "bg-success",
                              )}
                            />
                            <Text
                              className={cn(
                                "text-[10px] font-semibold",
                                isZero ? "text-destructive" : "text-success",
                              )}
                            >
                              {v.activeCount}
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
            </View>
          )}

          {/* CTA (fijo abajo) */}
          <Button
            variant="softAccent"
            size="sm"
            className="rounded-xl"
            onPress={() =>
              router.push({
                pathname: "/projects/[projectId]/crew", // ajusta a tu ruta real
                params: { projectId },
              })
            }
            leftIcon={
              <Ionicons
                name="people-outline"
                size={16}
                color="rgba(255,255,255,0.65)"
              />
            }
          >
            View All Crew
          </Button>
        </View>
      </View>
      )}
    </ModuleFrame>
  );
}
