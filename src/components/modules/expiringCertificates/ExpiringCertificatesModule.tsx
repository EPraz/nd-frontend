import { useDashboardScope } from "@/src/context/DashboardScopeProvider";
import { useProjectEntitlements } from "@/src/context/ProjectEntitlementsProvider";
import type {
  CertificateDto,
  CertificateStatus,
} from "@/src/features/certificates/contracts/certificates.contract";
import { formatDate } from "@/src/helpers";
import { useCertificatesData } from "@/src/hooks/dashboard/useCertificatesData";
import { cn } from "@/src/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { ModuleFrame } from "../../dashboard/ModuleFrame";
import { Button, MiniPill, Text, Tone, toneClasses } from "../../ui";
import { ModuleUnavailableState } from "../ModuleUnavailableState";

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
  const { isModuleEnabled } = useProjectEntitlements();
  const router = useRouter();

  const { data, isLoading, error, refetch } = useCertificatesData();

  const top = useMemo(() => {
    const withDate = data.filter((certificate) =>
      Boolean(certificate.expiryDate),
    );

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

  const emptyMessage =
    data.length === 0
      ? "No certificate records have been uploaded for this project yet."
      : "Certificate records exist, but none have expiry dates to track here yet.";

  return (
    <ModuleFrame isLoading={isLoading} error={error} onRetry={refetch}>
      {!isModuleEnabled("certificates") ? (
        <ModuleUnavailableState label="Certificates" />
      ) : (
        <View className="flex-1 rounded-[22px] border border-shellLine bg-shellPanel p-3 web:backdrop-blur-md">
          <View className="flex-1 gap-3">
            {top.length === 0 ? (
              <EmptyCertificatesState message={emptyMessage} />
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
                            {certificate.assetName} ·{" "}
                            {formatDate(certificate.expiryDate)}
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
                              className={cn(
                                "text-[10px] font-semibold",
                                ui.text,
                              )}
                            >
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
      )}
    </ModuleFrame>
  );
}

function EmptyCertificatesState({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 rounded-2xl border border-border bg-baseBg/25 px-4 py-6">
      <View className="h-10 w-10 items-center justify-center rounded-2xl border border-info/25 bg-info/10">
        <Ionicons
          name="documents-outline"
          size={20}
          color="rgba(255,255,255,0.85)"
        />
      </View>
      <View className="max-w-[280px] gap-1">
        <Text className="text-center text-sm font-semibold text-textMain">
          No expiring certificates
        </Text>
        <Text className="text-center text-xs leading-5 text-muted">
          {message}
        </Text>
      </View>
    </View>
  );
}
