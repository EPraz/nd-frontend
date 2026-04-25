import vesselBanner from "@/src/assets/ship-banner-2.jpg";
import { Button, Card, Text } from "@/src/components";
import { RecentActivityPanel } from "@/src/components/modules/recentActivity";
import { MiniPill } from "@/src/components/ui";
import type { AssetDto } from "@/src/contracts/assets.contract";
import type { AuditEventDto } from "@/src/contracts/audit.contract";
import { formatDate, humanizeTechnicalLabel } from "@/src/helpers";
import { cn } from "@/src/lib/utils";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";

type AlertItem = {
  id: string;
  title: string;
  type: "CERTIFICATE" | "MAINTENANCE";
  severity: "CRITICAL" | "WARNING";
  date?: string | null;
};

type Props = {
  projectId: string;
  assetId: string;
  projectName: string;
  vessel: AssetDto;
  summary: {
    certificates: {
      total: number;
      valid: number;
      pending: number;
      expired: number;
      expiringSoon: number;
    };
    crew: {
      total: number;
      active: number;
      inactive: number;
    };
    maintenance: {
      total: number;
      open: number;
      inProgress: number;
      done: number;
      overdue: number;
    };
    fuel: {
      total: number;
      lastEventAt: string | null;
      lastEventType: string | null;
    };
    updatedAt: string;
  };
  alerts: AlertItem[];
  alertsLoading: boolean;
  alertsError: string | null;
  onRetryAlerts: () => Promise<void>;
  auditState: {
    events: AuditEventDto[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
  };
  isModuleEnabled: (moduleKey: string) => boolean;
};

export function VesselOperationalProfileReviewLayout({
  projectId,
  assetId,
  projectName,
  vessel,
  summary,
  alerts,
  alertsLoading,
  alertsError,
  onRetryAlerts,
  auditState,
  isModuleEnabled,
}: Props) {
  const router = useRouter();
  const heroSource = vessel.imageUrl ? { uri: vessel.imageUrl } : vesselBanner;
  const certificatesAtRisk =
    summary.certificates.expired + summary.certificates.expiringSoon;
  const maintenanceAttention =
    summary.maintenance.overdue +
    summary.maintenance.open +
    summary.maintenance.inProgress;
  const identifier = vessel.vessel?.imo
    ? `IMO ${vessel.vessel.imo}`
    : vessel.vessel?.licenseNumber
      ? `License ${vessel.vessel.licenseNumber}`
      : "Pending";
  const operationalFacts = [
    { label: "Flag", value: vessel.vessel?.flag ?? "Pending" },
    {
      label: "Type",
      value: humanizeTechnicalLabel(vessel.vessel?.vesselType) || "Pending",
    },
    { label: "Ops email", value: vessel.vessel?.email ?? "Not set" },
    {
      label: "Home port",
      value: vessel.vessel?.homePort ?? "Not set",
    },
    {
      label: "Class",
      value: vessel.vessel?.classSociety ?? "Not set",
    },
    {
      label: "Last summary",
      value: formatDate(summary.updatedAt),
    },
  ];

  return (
    <View className="gap-4">
      <View className="web:grid web:grid-cols-1 web:gap-4 web:xl:grid-cols-12 web:xl:items-start">
        <View className="gap-4 web:xl:col-span-8">
          <Card className="gap-0 overflow-hidden p-0">
            <View className="overflow-hidden border-b border-shellLine">
              <View className="relative h-[230px] w-full overflow-hidden bg-shellPanelSoft">
                <Image
                  source={heroSource}
                  contentFit="cover"
                  style={{ width: "100%", height: "100%" }}
                />
                <View className="absolute inset-0 bg-black/35" />
                <View className="absolute inset-x-0 bottom-0 gap-3 px-5 py-5">
                  <View className="gap-1">
                    <Text className="text-[10px] font-semibold uppercase tracking-[0.24em] text-shellHighlight">
                      Operational profile
                    </Text>
                    <Text className="text-[32px] font-semibold tracking-tight text-white">
                      {vessel.name}
                    </Text>
                    <Text className="text-[13px] leading-6 text-white/85">
                      {identifier} • {humanizeTechnicalLabel(vessel.status)} •{" "}
                      {projectName}
                    </Text>
                  </View>

                  <View className="flex-row flex-wrap gap-2">
                    <StatusChip
                      label={`${certificatesAtRisk} at risk`}
                      tone={certificatesAtRisk > 0 ? "fail" : "ok"}
                    />
                    <StatusChip
                      label={`${summary.crew.active}/${summary.crew.total} crew active`}
                      tone={summary.crew.active > 0 ? "ok" : "warn"}
                    />
                    <StatusChip
                      label={`${maintenanceAttention} maintenance attention`}
                      tone={
                        summary.maintenance.overdue > 0
                          ? "fail"
                          : maintenanceAttention > 0
                            ? "warn"
                            : "ok"
                      }
                    />
                  </View>
                </View>
              </View>
            </View>

            <View className="gap-4 px-5 py-5">
              <View className="grid gap-3 web:grid web:grid-cols-2 web:gap-3 xl:grid-cols-3">
                {operationalFacts.map((fact) => (
                  <View
                    key={fact.label}
                    className="rounded-[18px] border border-shellLine bg-shellPanelSoft px-4 py-3"
                  >
                    <Text className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                      {fact.label}
                    </Text>
                    <Text className="mt-2 text-[14px] font-semibold text-textMain">
                      {fact.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>

          <View className="grid gap-4 web:grid web:grid-cols-1 web:gap-4 md:grid-cols-2 xl:grid-cols-3">
            <OperationalPanel
              eyebrow="Crew"
              title="Readiness"
              description="Assigned people and immediate staffing posture."
            >
              <MetricRow label="Active" value={String(summary.crew.active)} />
              <MetricRow
                label="Inactive"
                value={String(summary.crew.inactive)}
              />
              <MetricRow label="Total" value={String(summary.crew.total)} />
              <Button
                variant="outline"
                size="sm"
                className="rounded-full self-start"
                onPress={() =>
                  router.push(`/projects/${projectId}/vessels/${assetId}/crew`)
                }
                disabled={!isModuleEnabled("crew")}
              >
                Open crew
              </Button>
            </OperationalPanel>

            <OperationalPanel
              eyebrow="Maintenance"
              title="Workload"
              description="Operational pressure across open, active, and overdue maintenance."
            >
              <MetricRow
                label="Open"
                value={String(summary.maintenance.open)}
              />
              <MetricRow
                label="In progress"
                value={String(summary.maintenance.inProgress)}
              />
              <MetricRow
                label="Overdue"
                value={String(summary.maintenance.overdue)}
                emphasis={summary.maintenance.overdue > 0 ? "fail" : "ok"}
              />
              <Button
                variant="outline"
                size="sm"
                className="rounded-full self-start"
                onPress={() =>
                  router.push(
                    `/projects/${projectId}/vessels/${assetId}/maintenance`,
                  )
                }
                disabled={!isModuleEnabled("maintenance")}
              >
                Open maintenance
              </Button>
            </OperationalPanel>

            <OperationalPanel
              eyebrow="Fuel"
              title="Log context"
              description="Fuel history and last operational event registered for this vessel."
            >
              <MetricRow label="Records" value={String(summary.fuel.total)} />
              <MetricRow
                label="Last event"
                value={summary.fuel.lastEventType ?? "Not set"}
              />
              <MetricRow
                label="Last entry"
                value={
                  summary.fuel.lastEventAt
                    ? formatDate(summary.fuel.lastEventAt)
                    : "Not set"
                }
              />
              <Button
                variant="outline"
                size="sm"
                className="rounded-full self-start"
                onPress={() =>
                  router.push(`/projects/${projectId}/vessels/${assetId}/fuel`)
                }
                disabled={!isModuleEnabled("fuel")}
              >
                Open fuel
              </Button>
            </OperationalPanel>
          </View>
        </View>

        <View className="gap-4 self-start web:xl:col-span-4">
          <OperationalPanel
            eyebrow="Certificates"
            title="Compliance pulse"
            description="Current certificate pressure and next compliance move for this vessel."
          >
            <MetricRow
              label="Provided"
              value={String(summary.certificates.valid)}
            />
            <MetricRow
              label="Under review"
              value={String(summary.certificates.pending)}
            />
            <MetricRow
              label="At risk"
              value={String(certificatesAtRisk)}
              emphasis={certificatesAtRisk > 0 ? "fail" : "ok"}
            />
            <Button
              variant="outline"
              size="sm"
              className="rounded-full self-start"
              onPress={() =>
                router.push(
                  `/projects/${projectId}/vessels/${assetId}/certificates`,
                )
              }
              disabled={!isModuleEnabled("certificates")}
            >
              Open certificates
            </Button>
          </OperationalPanel>

          <OperationalPanel
            eyebrow="Attention queue"
            title="Alerts"
            description="Certificate and maintenance items that currently need attention."
          >
            <AlertsSnapshot
              alerts={alerts}
              isLoading={alertsLoading}
              error={alertsError}
              onRetry={onRetryAlerts}
              onNavigate={(type) =>
                router.push(
                  type === "MAINTENANCE"
                    ? `/projects/${projectId}/vessels/${assetId}/maintenance`
                    : `/projects/${projectId}/vessels/${assetId}/certificates`,
                )
              }
            />
          </OperationalPanel>
        </View>
      </View>

      <RecentActivityPanel
        title="Recent Activity"
        description="Latest changes tied to this vessel, filtered from the project-wide audit foundation."
        events={auditState.events}
        isLoading={auditState.loading}
        error={auditState.error}
        onRetry={auditState.refresh}
        isModuleEnabled={isModuleEnabled}
        maxItems={5}
      />
    </View>
  );
}

function OperationalPanel(props: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("gap-4 overflow-hidden p-0", props.className)}>
      <View className="gap-1 border-b border-shellLine px-4 py-4">
        <Text className="text-[10px] font-semibold uppercase tracking-[0.18em] text-shellHighlight">
          {props.eyebrow}
        </Text>
        <Text className="text-[18px] font-semibold text-textMain">
          {props.title}
        </Text>
        <Text className="text-[12px] leading-[18px] text-muted">
          {props.description}
        </Text>
      </View>

      <View className="gap-3 px-4 py-4">{props.children}</View>
    </Card>
  );
}

function MetricRow(props: {
  label: string;
  value: string;
  emphasis?: "ok" | "warn" | "fail";
}) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <Text className="text-[13px] text-muted">{props.label}</Text>
      <Text
        className={cn(
          "text-[14px] font-semibold text-textMain",
          props.emphasis === "fail" ? "text-destructive" : "",
          props.emphasis === "warn" ? "text-warning" : "",
          props.emphasis === "ok" ? "text-success" : "",
        )}
      >
        {props.value}
      </Text>
    </View>
  );
}

function StatusChip(props: { label: string; tone: "ok" | "warn" | "fail" }) {
  const ui =
    props.tone === "fail"
      ? { dot: "#fb7185", text: "text-rose-100" }
      : props.tone === "warn"
        ? { dot: "#fbbf24", text: "text-amber-100" }
        : { dot: "#34d399", text: "text-emerald-100" };

  return (
    <MiniPill className="border border-white/15 bg-black/25">
      <View className="flex-row items-center gap-2">
        <View
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: ui.dot }}
        />
        <Text
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.08em]",
            ui.text,
          )}
        >
          {props.label}
        </Text>
      </View>
    </MiniPill>
  );
}

function AlertsSnapshot(props: {
  alerts: AlertItem[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => Promise<void>;
  onNavigate: (type: "CERTIFICATE" | "MAINTENANCE") => void;
}) {
  if (props.isLoading) {
    return <Text className="text-[13px] text-muted">Loading alerts...</Text>;
  }

  if (props.error) {
    return (
      <View className="gap-3 rounded-[18px] border border-shellLine bg-shellPanelSoft px-4 py-4">
        <Text className="text-[13px] text-destructive">{props.error}</Text>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full self-start"
          onPress={props.onRetry}
        >
          Retry
        </Button>
      </View>
    );
  }

  if (props.alerts.length === 0) {
    return (
      <View className="gap-2 rounded-[18px] border border-shellLine bg-shellPanelSoft px-4 py-4">
        <Text className="text-[13px] font-semibold text-textMain">
          No active alerts
        </Text>
        <Text className="text-[12px] leading-[18px] text-muted">
          Certificate and maintenance alerts will appear here when this vessel
          needs attention.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="max-h-[260px]"
      contentContainerClassName="gap-2 pr-1"
      showsVerticalScrollIndicator
    >
      {props.alerts.slice(0, 4).map((alert) => (
        <Pressable
          key={alert.id}
          onPress={() => props.onNavigate(alert.type)}
          className="rounded-[18px] border border-shellLine bg-shellPanelSoft px-4 py-3 web:hover:bg-shellCardHover"
        >
          <View className="flex-row items-start justify-between gap-3">
            <View className="min-w-0 flex-1 gap-1">
              <Text
                className="text-[13px] font-semibold text-textMain"
                numberOfLines={2}
              >
                {alert.title}
              </Text>
              <Text className="text-[12px] text-muted">
                {alert.date ? formatDate(alert.date) : "No due date"}
              </Text>
            </View>

            <MiniPill className="border border-shellLine bg-shellPanel">
              <View className="flex-row items-center gap-2">
                <View
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor:
                      alert.severity === "CRITICAL" ? "#fb7185" : "#fbbf24",
                  }}
                />
                <Text
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-[0.08em]",
                    alert.severity === "CRITICAL"
                      ? "text-destructive"
                      : "text-warning",
                  )}
                >
                  {alert.severity}
                </Text>
              </View>
            </MiniPill>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}
