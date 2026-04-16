import { useDashboardScope } from "@/src/context/DashboardScopeProvider";
import { useProjectEntitlements } from "@/src/context/ProjectEntitlementsProvider";
import type { MaintenanceStatus } from "@/src/features/maintenance/contracts/maintenance.contract";
import { formatDate } from "@/src/helpers";
import { useMaintenanceOverviewData } from "@/src/hooks/dashboard/useMaintenanceOverviewData";
import { cn } from "@/src/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { ModuleFrame } from "../../dashboard/ModuleFrame";
import { Button } from "../../ui/button/Button";
import { MiniPill } from "../../ui/miniPill/MiniPill";
import { MiniStat } from "../../ui/miniStat/MiniStat";
import { Text } from "../../ui/text/Text";
import { toneClasses, type Tone } from "../../ui/toneClasses/ToneClasses";
import { ModuleUnavailableState } from "../ModuleUnavailableState";

const MAX_NEXT = 10;

function maintenanceTone(status: MaintenanceStatus): Tone {
  if (status === "OVERDUE") return "fail";
  if (status === "IN_PROGRESS") return "warn";
  if (status === "OPEN") return "info";
  return "ok";
}

function statusRank(status: MaintenanceStatus) {
  if (status === "OVERDUE") return 0;
  if (status === "IN_PROGRESS") return 1;
  if (status === "OPEN") return 2;
  return 3;
}

export default function MaintenanceOverviewModule() {
  const { projectId } = useDashboardScope();
  const { isModuleEnabled } = useProjectEntitlements();
  const { data, isLoading, error, refetch } = useMaintenanceOverviewData();
  const router = useRouter();

  const upcoming = data.upcoming as
    | {
        id: string;
        title: string;
        assetName: string;
        dueDate: string;
        status?: MaintenanceStatus;
      }[]
    | undefined;

  const list =
    upcoming && upcoming.length > 0
      ? upcoming
          .slice()
          .sort((left, right) => {
            const leftRank = statusRank(left.status ?? "OPEN");
            const rightRank = statusRank(right.status ?? "OPEN");
            if (leftRank !== rightRank) return leftRank - rightRank;

            const leftDate = new Date(left.dueDate).getTime();
            const rightDate = new Date(right.dueDate).getTime();
            return leftDate - rightDate;
          })
          .slice(0, MAX_NEXT)
      : [];

  const hasList = list.length > 0;
  const nextDue = data.nextDue;

  return (
    <ModuleFrame isLoading={isLoading} error={error} onRetry={refetch}>
      {!isModuleEnabled("maintenance") ? (
        <ModuleUnavailableState label="Maintenance" />
      ) : (
        <View className="flex-1 rounded-[22px] border border-shellLine bg-shellPanel p-3 web:backdrop-blur-md">
          <View className="flex-1 gap-3">
            <View className="flex-row flex-wrap gap-3">
              <MiniStat label="Total" value={String(data.total)} />
              <MiniStat label="Open" value={String(data.open)} />
              <MiniStat
                label="In Progress"
                value={String(data.inProgress)}
              />
              <MiniStat
                className="text-destructive"
                label="Overdue"
                value={String(data.overdue)}
              />
            </View>

            {!hasList ? (
              <View className="flex-1">
                <Text className="text-sm font-semibold text-textMain">
                  Next Maintenance
                </Text>

                <View className="mt-2 rounded-xl border border-shellLine bg-shellPanelSoft px-3 py-3 web:backdrop-blur-md">
                  {nextDue ? (
                    <>
                      <Text
                        className="text-sm font-semibold text-textMain"
                        numberOfLines={1}
                      >
                        {nextDue.title}
                      </Text>
                      <Text
                        className="mt-0.5 text-xs text-muted"
                        numberOfLines={1}
                      >
                        {nextDue.assetName}
                      </Text>
                      <View className="mt-2 flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color="rgba(255,255,255,0.65)"
                          />
                          <Text className="text-xs text-muted">
                            {formatDate(nextDue.dueDate)}
                          </Text>
                        </View>

                        {"status" in nextDue ? (
                          (() => {
                            const tone = maintenanceTone(
                              (nextDue as { status: MaintenanceStatus }).status,
                            );
                            const ui = toneClasses(tone);

                            return (
                              <MiniPill
                                className={cn(
                                  ui.chip,
                                  "rounded-full px-2.5 py-1",
                                )}
                              >
                                <View className="flex-row items-center gap-2">
                                  <View
                                    className={cn(
                                      "h-2 w-2 rounded-full",
                                      ui.dot,
                                    )}
                                  />
                                  <Text
                                    className={cn(
                                      "text-[10px] font-semibold",
                                      ui.text,
                                    )}
                                  >
                                    {(nextDue as { status: MaintenanceStatus }).status}
                                  </Text>
                                </View>
                              </MiniPill>
                            );
                          })()
                        ) : null}
                      </View>
                    </>
                  ) : (
                    <Text className="text-xs text-muted">
                      No upcoming maintenance.
                    </Text>
                  )}
                </View>
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
                  {list.map((item) => {
                    const tone = maintenanceTone(item.status ?? "OPEN");
                    const ui = toneClasses(tone);

                    return (
                      <Pressable
                        key={item.id}
                        onPress={() =>
                          router.push({
                            pathname: "/projects/[projectId]/maintenance",
                            params: { projectId },
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
                              name="construct-outline"
                              size={18}
                              color="rgba(255,255,255,0.85)"
                            />
                          </View>

                          <View className="flex-1">
                            <Text
                              className="text-sm font-semibold text-textMain"
                              numberOfLines={1}
                            >
                              {item.title}
                            </Text>
                            <Text
                              className="mt-0.5 text-xs text-muted"
                              numberOfLines={1}
                            >
                              {item.assetName} • {formatDate(item.dueDate)}
                            </Text>
                          </View>

                          <MiniPill
                            className={cn(ui.chip, "rounded-full px-2.5 py-1")}
                          >
                            <View className="flex-row items-center gap-2">
                              <View className={cn("h-2 w-2 rounded-full", ui.dot)} />
                              <Text
                                className={cn(
                                  "text-[10px] font-semibold",
                                  ui.text,
                                )}
                              >
                                {item.status ?? "OPEN"}
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
                  pathname: "/projects/[projectId]/maintenance",
                  params: { projectId },
                })
              }
              leftIcon={
                <Ionicons
                  name="list-outline"
                  size={16}
                  color="rgba(255,255,255,0.65)"
                />
              }
            >
              View All Maintenance
            </Button>
          </View>
        </View>
      )}
    </ModuleFrame>
  );
}
