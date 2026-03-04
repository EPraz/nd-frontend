import { useDashboardScope } from "@/src/context";
import { CertificateDto, CertificateStatus } from "@/src/features/certificates";
import { formatDate } from "@/src/helpers";
import { useCertificatesData } from "@/src/hooks";
import { cn } from "@/src/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { ModuleFrame } from "../../dashboard/ModuleFrame";
import { Button, MiniPill, Text, Tone, toneClasses } from "../../ui";

const MAX_CERTS = 10;

function statusTone(s: CertificateStatus): Tone {
  if (s === "EXPIRED") return "fail";
  if (s === "EXPIRING_SOON") return "warn";
  if (s === "PENDING") return "info";
  return "ok";
}

function statusRank(s: CertificateStatus) {
  // menor = más importante
  if (s === "EXPIRED") return 0;
  if (s === "EXPIRING_SOON") return 1;
  if (s === "PENDING") return 2;
  return 3; // VALID
}

function statusIcon(s: CertificateStatus) {
  if (s === "EXPIRED") return "alert-circle-outline";
  if (s === "EXPIRING_SOON") return "time-outline";
  if (s === "PENDING") return "hourglass-outline";
  return "checkmark-circle-outline";
}

export default function ExpiringCertificatesModule() {
  const { projectId } = useDashboardScope();
  const router = useRouter();

  const { data, isLoading, error, refetch } = useCertificatesData();

  const top = useMemo(() => {
    const withDate = data.filter((c) => Boolean(c.expiryDate));

    return withDate
      .slice()
      .sort((a, b) => {
        // 1) prioridad por status
        const ra = statusRank(a.status);
        const rb = statusRank(b.status);
        if (ra !== rb) return ra - rb;

        // 2) por fecha asc (más cercano primero)
        const da = new Date(a.expiryDate!).getTime();
        const db = new Date(b.expiryDate!).getTime();
        if (da !== db) return da - db;

        // 3) estable: nombre
        return a.name.localeCompare(b.name);
      })
      .slice(0, MAX_CERTS);
  }, [data]);

  const totalExpiringLike = useMemo(() => {
    // útil para “Top N” badge. Incluye expired + expiringSoon + pending
    return data.filter(
      (c) =>
        c.status === "EXPIRED" ||
        c.status === "EXPIRING_SOON" ||
        c.status === "PENDING",
    ).length;
  }, [data]);

  return (
    <ModuleFrame isLoading={isLoading} error={error} onRetry={refetch}>
      <View className="flex-1 p-3 border border-border">
        <View className="flex-1 gap-3">
          {/* Header mini */}
          {/* <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-textMain">
              Expiring Certificates
            </Text>

            <MiniPill className="bg-baseBg/35">
              <Text className="text-[10px] text-textMain/80">
                Top {Math.min(MAX_CERTS, totalExpiringLike || MAX_CERTS)}
              </Text>
            </MiniPill>
          </View> */}

          {/* List */}
          {top.length === 0 ? (
            <View className="flex-1">
              <Text className="text-xs text-muted">No certificates found.</Text>
            </View>
          ) : (
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, gap: 8, paddingBottom: 12 }}
            >
              {top.map((c: CertificateDto) => {
                const tone = statusTone(c.status);
                const ui = toneClasses(tone);

                return (
                  <Pressable
                    key={c.id}
                    onPress={() =>
                      router.push({
                        pathname: "/projects/[projectId]/certificates",
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
                          name={statusIcon(c.status) as any}
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
                          {c.name}
                        </Text>
                        <Text
                          className="text-xs text-muted mt-0.5"
                          numberOfLines={1}
                        >
                          {c.assetName} • {formatDate(c.expiryDate)}
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
                            className={cn("text-[10px] font-semibold", ui.text)}
                          >
                            {c.status}
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

          {/* Footer CTA fijo */}
          <Button
            variant="softAccent"
            size="sm"
            className="rounded-xl"
            onPress={() =>
              router.push({
                pathname: "/projects/[projectId]/certificates",
                params: { projectId },
              })
            }
            leftIcon={
              <Ionicons
                name="documents-outline"
                size={16}
                color="rgba(255,255,255,0.65)"
              />
            }
          >
            View All Certificates
          </Button>
        </View>
      </View>
    </ModuleFrame>
  );
}
