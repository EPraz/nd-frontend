import { useDashboardScope } from "@/src/context";
import { AlertSeverity, useAlertsFeedData } from "@/src/hooks";
import { cn } from "@/src/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { ModuleFrame } from "../../dashboard/ModuleFrame";
import { Button, MiniPill, Text, Tone, toneClasses } from "../../ui";

const MAX_ALERTS = 6;

function alertTone(sev: AlertSeverity): Tone {
  if (sev === "CRITICAL") return "fail";
  if (sev === "WARNING") return "warn";
  return "info";
}

function alertIcon(sev: AlertSeverity) {
  if (sev === "CRITICAL") return "alert-circle-outline";
  if (sev === "WARNING") return "warning-outline";
  return "information-circle-outline";
}

function sevRank(sev: AlertSeverity) {
  if (sev === "CRITICAL") return 0;
  if (sev === "WARNING") return 1;
  return 2;
}

export default function AlertsFeedModule() {
  const { projectId } = useDashboardScope();
  const { data, isLoading, error, refetch } = useAlertsFeedData();
  const router = useRouter();

  const sorted = data.slice().sort((a, b) => {
    // 1) severidad
    const ra = sevRank(a.severity);
    const rb = sevRank(b.severity);
    if (ra !== rb) return ra - rb;

    return a.title.localeCompare(b.title);
  });

  const top = sorted.slice(0, MAX_ALERTS);

  return (
    <ModuleFrame isLoading={isLoading} error={error} onRetry={refetch}>
      <View className="flex-1 p-3 border border-border">
        <View className="flex-1 gap-3">
          {/* LIST */}
          {data.length === 0 ? (
            <View className="flex-1">
              <Text className="text-xs text-muted">No alerts.</Text>
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
              {top.map((a) => {
                const tone = alertTone(a.severity);
                const ui = toneClasses(tone);

                return (
                  <Pressable
                    key={a.id}
                    onPress={() =>
                      router.push({
                        pathname: "/projects/[projectId]/alerts",
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
                          // si toneClasses ya trae un bg para icon, úsalo
                          ui.iconBg ?? "bg-baseBg/35",
                        )}
                      >
                        <Ionicons
                          name={alertIcon(a.severity) as any}
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
                          {a.title}
                        </Text>
                        <Text
                          className="text-xs text-muted mt-0.5"
                          numberOfLines={1}
                        >
                          {a.subtitle}
                        </Text>
                      </View>

                      {/* Severity */}
                      <MiniPill
                        className={cn(
                          ui.chip,
                          "flex-row items-center gap-2 rounded-full px-2.5 py-1",
                        )}
                      >
                        <View className={cn("flex-row items-center gap-2 ")}>
                          <View
                            className={cn("h-2 w-2 rounded-full", ui.dot)}
                          />
                          <Text
                            className={cn("font-semibold text-[10px]", ui.text)}
                          >
                            {a.severity}
                          </Text>
                        </View>
                      </MiniPill>

                      {/* Chevron */}
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

          {/* FOOTER CTA (fijo abajo) */}

          <Button
            variant="softAccent"
            size="sm"
            className="rounded-xl"
            disabled
            onPress={() =>
              router.push({
                pathname: "/projects/[projectId]/alerts",
                params: { projectId },
              })
            }
            leftIcon={
              <Ionicons
                name="folder-outline"
                size={16}
                color="rgba(255,255,255,0.65)"
              />
            }
          >
            View All Alerts
          </Button>
        </View>
      </View>
    </ModuleFrame>
  );
}
