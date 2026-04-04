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

function statusTone(status: CertificateStatus): Tone {
  if (status === "EXPIRED") return "fail";
  if (status === "EXPIRING_SOON") return "warn";
  if (status === "PENDING") return "info";
  return "ok";
}

function statusRank(status: CertificateStatus) {
  if (status === "EXPIRED") return 0;
  if (status === "EXPIRING_SOON") return 1;
  if (status === "PENDING") return 2;
  return 3;
}

function statusIcon(status: CertificateStatus) {
  if (status === "EXPIRED") return "alert-circle-outline";
  if (status === "EXPIRING_SOON") return "time-outline";
  if (status === "PENDING") return "hourglass-outline";
  return "checkmark-circle-outline";
}

export default function ExpiringCertificatesModule() {
  const { projectId } = useDashboardScope();
  const router = useRouter();

  const { data, isLoading, error, refetch } = useCertificatesData();

  const top = useMemo(() => {
    const withDate = data.filter((certificate) => Boolean(certificate.expiryDate));

    return withDate
      .slice()
      .sort((left, right) => {
        const leftRank = statusRank(left.status);
        const rightRank = statusRank(right.status);
        if (leftRank !== rightRank) return leftRank - rightRank;

        const leftExpiry = new Date(left.expiryDate!).getTime();
        const rightExpiry = new Date(right.expiryDate!).getTime();
        if (leftExpiry !== rightExpiry) return leftExpiry - rightExpiry;

        return left.certificateName.localeCompare(right.certificateName);
      })
      .slice(0, MAX_CERTS);
  }, [data]);

  return (
    <ModuleFrame isLoading={isLoading} error={error} onRetry={refetch}>
      <View className="flex-1 border border-border p-3">
        <View className="flex-1 gap-3">
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
              {top.map((certificate: CertificateDto) => {
                const tone = statusTone(certificate.status);
                const ui = toneClasses(tone);

                return (
                  <Pressable
                    key={certificate.id}
                    onPress={() =>
                      router.push({
                        pathname: "/projects/[projectId]/certificates",
                        params: { projectId },
                      })
                    }
                    className={cn(
                      "overflow-hidden border-b border-border bg-surface",
                      "web:hover:bg-muted/10",
                    )}
                  >
                    <View className="flex-row items-center gap-3 px-3 py-3">
                      <View
                        className={cn(
                          "h-9 w-9 items-center justify-center rounded-lg border border-border",
                          ui.iconBg ?? "bg-baseBg/35",
                        )}
                      >
                        <Ionicons
                          name={statusIcon(certificate.status) as any}
                          size={18}
                          color="rgba(255,255,255,0.85)"
                        />
                      </View>

                      <View className="flex-1">
                        <Text
                          className="text-sm font-semibold text-textMain"
                          numberOfLines={1}
                        >
                          {certificate.certificateName}
                        </Text>
                        <Text
                          className="mt-0.5 text-xs text-muted"
                          numberOfLines={1}
                        >
                          {certificate.assetName} · {formatDate(certificate.expiryDate)}
                        </Text>
                      </View>

                      <MiniPill className={cn(ui.chip, "rounded-full px-2.5 py-1")}>
                        <View className="flex-row items-center gap-2">
                          <View className={cn("h-2 w-2 rounded-full", ui.dot)} />
                          <Text className={cn("text-[10px] font-semibold", ui.text)}>
                            {certificate.status}
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
