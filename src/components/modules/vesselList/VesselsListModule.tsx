import { useDashboardScope } from "@/src/context/DashboardScopeProvider";
import { useProjectEntitlements } from "@/src/context/ProjectEntitlementsProvider";
import { useVesselsListData } from "@/src/hooks/dashboard/useVesselsListData";
import type { VesselCertStatus } from "@/src/hooks/dashboard/useVesselsListData";
import { cn } from "@/src/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { ModuleUnavailableState } from "../ModuleUnavailableState";
import { ModuleFrame } from "../../dashboard/ModuleFrame";
import { Button } from "../../ui/button/Button";
import { MiniPill } from "../../ui/miniPill/MiniPill";
import { Text } from "../../ui/text/Text";
import { toneClasses, type Tone } from "../../ui/toneClasses/ToneClasses";

const MAX_VESSELS = 6;

function statusTone(status: VesselCertStatus): Tone {
  if (status === "CRITICAL") return "fail";
  if (status === "WARNING") return "warn";
  return "ok";
}

function statusRank(status: VesselCertStatus) {
  // menor = más importante
  if (status === "CRITICAL") return 0;
  if (status === "WARNING") return 1;
  return 2;
}

export default function VesselsListModule() {
  const { projectId } = useDashboardScope();
  const { isModuleEnabled } = useProjectEntitlements();
  const { data, isLoading, error, refetch } = useVesselsListData();
  const router = useRouter();

  const sorted = data.slice().sort((a, b) => {
    const ra = statusRank(a.certStatus);
    const rb = statusRank(b.certStatus);
    if (ra !== rb) return ra - rb;
    if (a.expired !== b.expired) return b.expired - a.expired;
    if (a.expiringSoon !== b.expiringSoon)
      return b.expiringSoon - a.expiringSoon;
    if (a.totalCertificates !== b.totalCertificates)
      return b.totalCertificates - a.totalCertificates;
    return a.assetName.localeCompare(b.assetName);
  });

  const top = sorted.slice(0, MAX_VESSELS);

  return (
    <ModuleFrame isLoading={isLoading} error={error} onRetry={refetch}>
      {!isModuleEnabled("vessels") ? (
        <ModuleUnavailableState label="Vessels" />
      ) : (
      <View className="flex-1 rounded-[22px] border border-shellLine bg-shellPanel p-3 web:backdrop-blur-md">
        <View className="flex-1 gap-3">
          {data.length === 0 ? (
            <View className="flex-1">
              <Text className="text-xs text-muted">No Vessels.</Text>
            </View>
          ) : (
            <ScrollView
              className="flex-1"
              contentContainerStyle={{
                flexGrow: 1,
                gap: 8,
                paddingBottom: 12,
              }}
              showsVerticalScrollIndicator={false}
            >
              {top.map((row) => {
                const tone = statusTone(row.certStatus);
                const ui = toneClasses(tone);
                const hasExpired = row.expired > 0;
                const hasExpiring = row.expiringSoon > 0;

                return (
                  <Pressable
                    key={row.assetId}
                    onPress={() =>
                      router.push({
                        pathname: "/projects/[projectId]/vessels/[assetId]",
                        params: { projectId, assetId: row.assetId },
                      })
                    }
                    className={cn(
                      "flex-row items-center justify-between border-b border-shellLine bg-shellPanel px-3 py-3",
                      "web:hover:bg-shellPanelSoft",
                    )}
                  >
                    <View className="flex-1 pr-3">
                      <Text
                        className="text-sm font-semibold text-textMain"
                        numberOfLines={1}
                      >
                        {row.assetName}
                      </Text>

                      <View className="flex-row flex-wrap items-center gap-2 mt-1">
                        <Text className="text-xs text-muted">
                          {row.totalCertificates} certs
                        </Text>
                        <Text className="text-xs text-muted">•</Text>
                        <Text className="text-xs text-muted">
                          {row.crewActive} crew active
                        </Text>
                      </View>
                    </View>

                    <View className="items-end gap-2">
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
                            {row.certStatus}
                          </Text>
                        </View>
                      </MiniPill>

                      <View className="flex-row items-center gap-2">
                        {hasExpired ? (
                          <MiniPill className="bg-destructive/12 border-destructive/30">
                            <View className="flex-row items-center gap-1">
                              <Ionicons
                                name="alert-circle-outline"
                                size={14}
                                color="rgba(255,255,255,0.75)"
                              />
                              <Text className="text-[11px] font-semibold text-destructive">
                                {row.expired} Expired
                              </Text>
                            </View>
                          </MiniPill>
                        ) : null}

                        {hasExpiring ? (
                          <MiniPill className="bg-warning/12 border-warning/30">
                            <View className="flex-row items-center gap-1">
                              <Ionicons
                                name="time-outline"
                                size={14}
                                color="rgba(255,255,255,0.75)"
                              />
                              <Text className="text-[11px] font-semibold text-warning">
                                {row.expiringSoon} Expiring
                              </Text>
                            </View>
                          </MiniPill>
                        ) : null}

                        {!hasExpired && !hasExpiring ? (
                          <MiniPill className="bg-success/12 border-success/30">
                            <View className="flex-row items-center gap-1">
                              <Ionicons
                                name="checkmark-circle-outline"
                                size={14}
                                color="rgba(255,255,255,0.75)"
                              />
                              <Text className="text-[11px] font-semibold text-success">
                                All good
                              </Text>
                            </View>
                          </MiniPill>
                        ) : null}
                      </View>
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
            View All vessels
          </Button>
        </View>
      </View>
      )}
    </ModuleFrame>
  );
}
