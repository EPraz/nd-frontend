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
      <View className="flex-1 rounded-[22px] border border-shellLine bg-shellPanel p-3 web:backdrop-blur-md">
        <View className="flex-1 gap-3">
          {!hasList ? (
            <View className="flex-1">
              <Text className="text-xs text-muted">No crew assigned.</Text>
            </View>
          ) : (
            <View className="flex-1 gap-2">
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
                      "overflow-hidden border-b border-shellLine bg-shellPanel",
                      "web:hover:bg-shellPanelSoft",
                    )}
                  >
                    <View className="flex-row items-center gap-3 px-3 py-3">
                      <View className="h-9 w-9 items-center justify-center rounded-lg border border-shellLine bg-shellPanelSoft">
                        <Ionicons
                          name="people-outline"
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
                            Active crew
                          </Text>
                        </View>

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
