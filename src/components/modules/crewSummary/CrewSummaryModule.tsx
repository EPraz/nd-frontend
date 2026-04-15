import { useDashboardScope } from "@/src/context/DashboardScopeProvider";
import { useProjectEntitlements } from "@/src/context/ProjectEntitlementsProvider";
import { useCrewSummaryData } from "@/src/hooks/dashboard/useCrewSummaryData";
import { cn } from "@/src/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { ModuleFrame } from "../../dashboard/ModuleFrame";
import { ModuleUnavailableState } from "../ModuleUnavailableState";
import { Button, MiniPill, Text } from "../../ui";

const MAX_VESSELS = 10;

type CrewCoverageFilter = "ALL" | "NEEDS_CREW" | "COVERED";

const FILTERS: { key: CrewCoverageFilter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "NEEDS_CREW", label: "No crew" },
  { key: "COVERED", label: "Covered" },
];

function matchesFilter(activeCount: number, filter: CrewCoverageFilter) {
  if (filter === "NEEDS_CREW") return activeCount === 0;
  if (filter === "COVERED") return activeCount > 0;
  return true;
}

export default function CrewSummaryModule() {
  const { projectId } = useDashboardScope();
  const { isModuleEnabled } = useProjectEntitlements();
  const { data, isLoading, error, refetch } = useCrewSummaryData();
  const router = useRouter();
  const [filter, setFilter] = useState<CrewCoverageFilter>("ALL");

  const top = useMemo(
    () =>
      data.crewByVessel
        .filter((vessel) => matchesFilter(vessel.activeCount, filter))
        .slice(0, MAX_VESSELS),
    [data.crewByVessel, filter],
  );

  const hasList = top.length > 0;

  return (
    <ModuleFrame isLoading={isLoading} error={error} onRetry={refetch}>
      {!isModuleEnabled("crew") ? (
        <ModuleUnavailableState label="Crew" />
      ) : (
        <View className="flex-1 rounded-[22px] border border-shellLine bg-shellPanel p-3 web:backdrop-blur-md">
          <View className="flex-1 gap-3">
            <View className="flex-row flex-wrap items-start justify-between gap-3">
              <View className="gap-2">
                <Text className="text-sm font-semibold text-textMain">
                  Crew coverage
                </Text>

                <View className="flex-row flex-wrap gap-2">
                  <MiniPill>{`Active: ${data.active}`}</MiniPill>
                  <MiniPill>{`Inactive: ${data.inactive}`}</MiniPill>
                  <MiniPill>{`No crew: ${data.vesselsWithoutActiveCrew}`}</MiniPill>
                </View>
              </View>

              <View className="flex-row flex-wrap gap-2">
                {FILTERS.map((item) => {
                  const active = item.key === filter;

                  return (
                    <Pressable
                      key={item.key}
                      onPress={() => setFilter(item.key)}
                      className={cn(
                        "rounded-full border px-3 py-1",
                        active
                          ? "border-accent/60 bg-accent/15"
                          : "border-shellLine bg-shellGlass",
                      )}
                    >
                      <Text
                        className={cn(
                          "text-[10px] font-semibold",
                          active ? "text-accent" : "text-muted",
                        )}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {!hasList ? (
              <View className="flex-1 items-center justify-center rounded-[18px] border border-shellLine bg-shellPanelSoft px-4 py-6">
                <Text className="text-center text-sm font-semibold text-textMain">
                  {filter === "ALL"
                    ? "No vessels found."
                    : "No vessels match this filter."}
                </Text>
                <Text className="mt-1 text-center text-xs leading-5 text-muted">
                  Crew coverage entries will appear here once the selected filter
                  has matching vessels.
                </Text>
              </View>
            ) : (
              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  flexGrow: 1,
                  gap: 8,
                  paddingBottom: 12,
                }}
              >
                {top.map((vessel) => {
                  const needsCrew = vessel.activeCount === 0;

                  return (
                    <Pressable
                      key={vessel.assetId}
                      onPress={() =>
                        router.push({
                          pathname: "/projects/[projectId]/vessels/[assetId]",
                          params: { projectId, assetId: vessel.assetId },
                        })
                      }
                      className="overflow-hidden border-b border-shellLine bg-shellPanel web:hover:bg-shellPanelSoft"
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
                            {vessel.assetName}
                          </Text>
                          <Text
                            className="mt-0.5 text-xs text-muted"
                            numberOfLines={1}
                          >
                            {needsCrew ? "Needs crew assignment" : "Active crew"}
                          </Text>
                        </View>

                        <MiniPill
                          className={cn(
                            "rounded-full px-2.5 py-1",
                            needsCrew
                              ? "border-destructive/30 bg-destructive/12"
                              : "border-success/30 bg-success/12",
                          )}
                        >
                          <View className="flex-row items-center gap-2">
                            <View
                              className={cn(
                                "h-2 w-2 rounded-full",
                                needsCrew ? "bg-destructive" : "bg-success",
                              )}
                            />
                            <Text
                              className={cn(
                                "text-[10px] font-semibold",
                                needsCrew ? "text-destructive" : "text-success",
                              )}
                            >
                              {vessel.activeCount}
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
                  pathname: "/projects/[projectId]/crew",
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
