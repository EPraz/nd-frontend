import { useDashboardScope } from "@/src/context";
import { MaintenanceStatus } from "@/src/features/maintenance";
import { formatDate } from "@/src/helpers";
import { useMaintenanceOverviewData } from "@/src/hooks";
import { cn } from "@/src/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { ModuleFrame } from "../../dashboard/ModuleFrame";
import { Button, MiniPill, MiniStat, Text, Tone, toneClasses } from "../../ui";

const MAX_NEXT = 6;

function maintenanceTone(s: MaintenanceStatus): Tone {
  // ajusta a tus statuses reales
  if (s === "OVERDUE") return "fail";
  if (s === "IN_PROGRESS") return "warn";
  if (s === "OPEN") return "info";
  return "ok";
}

function statusRank(s: MaintenanceStatus) {
  // menor = más importante
  if (s === "OVERDUE") return 0;
  if (s === "IN_PROGRESS") return 1;
  if (s === "OPEN") return 2;
  return 3;
}

export default function MaintenanceOverviewModule() {
  const { projectId } = useDashboardScope();
  const { data, isLoading, error, refetch } = useMaintenanceOverviewData();
  const router = useRouter();

  const upcoming = (data as any)?.upcoming as
    | Array<{
        id: string;
        title: string;
        assetName: string;
        dueDate: string;
        status?: MaintenanceStatus;
      }>
    | undefined;

  const list =
    upcoming && upcoming.length > 0
      ? upcoming
          .slice()
          .sort((a, b) => {
            const ra = statusRank(a.status ?? "OPEN");
            const rb = statusRank(b.status ?? "OPEN");
            if (ra !== rb) return ra - rb;

            // por fecha asc
            const da = new Date(a.dueDate).getTime();
            const db = new Date(b.dueDate).getTime();
            return da - db;
          })
          .slice(0, MAX_NEXT)
      : [];

  const hasList = list.length > 0;
  const nextDue = data.nextDue;

  return (
    <ModuleFrame isLoading={isLoading} error={error} onRetry={refetch}>
      <View className="flex-1 p-3 border border-border">
        <View className="flex-1 gap-3">
          {/* STATS */}
          <View className="flex-row flex-wrap gap-3">
            <MiniStat label="Total" value={String(data.total)} />
            <MiniStat label="Open" value={String(data.open)} />
            <MiniStat label="In Progress" value={String(data.inProgress)} />
            <MiniStat
              tone="fail"
              className="text-destructive"
              label="Overdue"
              value={String(data.overdue)}
            />
          </View>

          {/* LIST / NEXT */}
          {!hasList ? (
            <View className="flex-1">
              <Text className="text-sm font-semibold text-textMain">
                Next Maintenance
              </Text>

              <View className="mt-2 rounded-xl border border-border bg-surface px-3 py-3">
                {nextDue ? (
                  <>
                    <Text
                      className="text-sm font-semibold text-textMain"
                      numberOfLines={1}
                    >
                      {nextDue.title}
                    </Text>
                    <Text
                      className="text-xs text-muted mt-0.5"
                      numberOfLines={1}
                    >
                      {nextDue.assetName}
                    </Text>
                    <View className="flex-row items-center justify-between mt-2">
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

                      {/* si tu nextDue trae status */}
                      {"status" in nextDue
                        ? (() => {
                            const tone = maintenanceTone(
                              (nextDue as any).status,
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
                                    {(nextDue as any).status}
                                  </Text>
                                </View>
                              </MiniPill>
                            );
                          })()
                        : null}
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
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-semibold text-textMain">
                  Upcoming Maintenance
                </Text>

                <MiniPill className="bg-baseBg/35">
                  <Text className="text-[10px] text-textMain/80">
                    Top {Math.min(MAX_NEXT, upcoming?.length ?? MAX_NEXT)}
                  </Text>
                </MiniPill>
              </View>

              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  flexGrow: 1,
                  gap: 8,
                  paddingBottom: 12,
                }}
              >
                {list.map((m) => {
                  const tone = maintenanceTone(m.status ?? "OPEN");
                  const ui = toneClasses(tone);

                  return (
                    <Pressable
                      key={m.id}
                      onPress={() =>
                        router.push({
                          pathname: "/projects/[projectId]/maintenance",
                          params: { projectId },
                        })
                      }
                      className={cn(
                        "border-b border-border bg-surface overflow-hidden",
                        "web:hover:bg-muted/10",
                      )}
                    >
                      <View className="flex-row items-center gap-3 px-3 py-3">
                        {/* Icon */}
                        <View
                          className={cn(
                            "h-9 w-9 items-center justify-center rounded-lg border border-border",
                            ui.iconBg ?? "bg-baseBg/35",
                          )}
                        >
                          <Ionicons
                            name="construct-outline"
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
                            {m.title}
                          </Text>
                          <Text
                            className="text-xs text-muted mt-0.5"
                            numberOfLines={1}
                          >
                            {m.assetName} • {formatDate(m.dueDate)}
                          </Text>
                        </View>

                        {/* Status chip */}
                        <MiniPill
                          className={cn(ui.chip, "rounded-full px-2.5 py-1")}
                        >
                          <View className="flex-row items-center gap-2">
                            <View
                              className={cn("h-2 w-2 rounded-full", ui.dot)}
                            />
                            <Text
                              className={cn(
                                "text-[10px] font-semibold",
                                ui.text,
                              )}
                            >
                              {m.status ?? "OPEN"}
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

          {/* FOOTER CTA */}
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
    </ModuleFrame>
  );
}
