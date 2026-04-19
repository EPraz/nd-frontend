import vesselBanner from "@/src/assets/ship-banner-2.jpg";
import { Button, Card, Text } from "@/src/components";
import { HeroBanner } from "@/src/components/modules/heroSection";
import type { SpecItem } from "@/src/components/modules/heroSection/hero.ui";
import { MiniPill } from "@/src/components/ui";
import { useProjectContext, useProjectEntitlements } from "@/src/context";
import {
  formatDate,
  humanizeTechnicalLabel,
} from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Platform, Pressable, View } from "react-native";
import { useVesselShell } from "../../context/VesselShellProvider";
import { useVesselAlertsFeedData } from "../../hooks";

const LATERAL_HEIGHT = "web:h-[45vh] web:max-h-[520px] web:min-h-[375px]";
const GRID_BASE =
  "web:grid web:gap-4 web:grid-cols-1 web:md:grid-cols-2 web:2xl:grid-cols-6 web:auto-rows-[375px]";

function alertUi(severity: "CRITICAL" | "WARNING") {
  if (severity === "CRITICAL") {
    return {
      pill: "border-destructive/30 bg-destructive/10",
      text: "text-destructive",
      dot: "bg-destructive",
      icon: "alert-circle-outline" as const,
      iconBg: "bg-destructive/10",
    };
  }

  return {
    pill: "border-warning/30 bg-warning/10",
    text: "text-warning",
    dot: "bg-warning",
    icon: "warning-outline" as const,
    iconBg: "bg-warning/10",
  };
}

export default function VesselOverviewScreen() {
  const router = useRouter();
  const { projectName } = useProjectContext();
  const { isModuleEnabled } = useProjectEntitlements();
  const { projectId, assetId, vessel, summary } = useVesselShell();
  const alertsState = useVesselAlertsFeedData(projectId, assetId);
  const isWeb = Platform.OS === "web";

  if (!vessel) return null;

  const certificatesAtRisk =
    summary.certificates.expired + summary.certificates.expiringSoon;
  const identifier = vessel.vessel?.imo
    ? `IMO ${vessel.vessel.imo}`
    : vessel.vessel?.licenseNumber
      ? `License ${vessel.vessel.licenseNumber}`
      : "Pending";
  const dimensions = [
    vessel.vessel?.loaM ? `LOA ${vessel.vessel.loaM} m` : null,
    vessel.vessel?.beamM ? `Beam ${vessel.vessel.beamM} m` : null,
    vessel.vessel?.draftM ? `Draft ${vessel.vessel.draftM} m` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const certificatesCard = {
    title: "Certificates",
    subtitle: "Requirements and uploaded records for this vessel.",
    rows: [
      { label: "Provided", value: String(summary.certificates.valid) },
      { label: "Under review", value: String(summary.certificates.pending) },
      { label: "At risk", value: String(certificatesAtRisk) },
    ],
    cta: "Open certificates",
    href: `/projects/${projectId}/vessels/${assetId}/certificates`,
  };

  const crewCard = {
    title: "Crew",
    subtitle: "Assigned people, activity status, and readiness context.",
    rows: [
      { label: "Active", value: String(summary.crew.active) },
      { label: "Inactive", value: String(summary.crew.inactive) },
      {
        label: "Readiness",
        value: summary.crew.active > 0 ? "Crew onboard" : "Needs assignment",
      },
    ],
    cta: "Open crew",
    href: `/projects/${projectId}/vessels/${assetId}/crew`,
  };

  const maintenanceCard = {
    title: "Maintenance",
    subtitle: "Task load and due-date pressure around this vessel.",
    rows: [
      { label: "Open", value: String(summary.maintenance.open) },
      { label: "In progress", value: String(summary.maintenance.inProgress) },
      { label: "Overdue", value: String(summary.maintenance.overdue) },
    ],
    cta: "Open maintenance",
    href: `/projects/${projectId}/vessels/${assetId}/maintenance`,
  };

  const profileRows = [
    { label: "Flag", value: vessel.vessel?.flag ?? "Pending" },
    { label: "Type", value: humanizeTechnicalLabel(vessel.vessel?.vesselType) },
    { label: "Operations Email", value: vessel.vessel?.email ?? "Not set" },
    { label: "Home Port", value: vessel.vessel?.homePort ?? "Not set" },
    { label: "Class Society", value: vessel.vessel?.classSociety ?? "Not set" },
    { label: "Dimensions", value: dimensions || "Not set" },
    {
      label: "Builder / Year",
      value:
        [vessel.vessel?.builder, vessel.vessel?.yearBuilt]
          .filter(Boolean)
          .join(" | ") || "Not set",
    },
  ];

  const heroLeft: SpecItem[] = [
    { label: "Project", value: projectName },
    { label: "Identifier", value: identifier },
  ];

  const heroRight: SpecItem[] = [
    {
      label: "Certificates at risk",
      value: String(certificatesAtRisk),
      kind: "status",
      statusTone:
        certificatesAtRisk === 0
          ? "ok"
          : certificatesAtRisk <= 2
            ? "warn"
            : "fail",
    },
    {
      label: "Crew active",
      value: `${summary.crew.active}/${summary.crew.total}`,
      kind: "status",
      statusTone: summary.crew.active > 0 ? "ok" : "warn",
    },
    {
      label: "Maintenance attention",
      value: String(summary.maintenance.overdue + summary.maintenance.open),
      kind: "status",
      statusTone:
        summary.maintenance.overdue > 0
          ? "fail"
          : summary.maintenance.open > 0
            ? "warn"
            : "ok",
    },
    {
      label: "Updated",
      value: formatDate(summary.updatedAt),
    },
  ];

  const showCertificates = isModuleEnabled("certificates");
  const showCrew = isModuleEnabled("crew");
  const showMaintenance = isModuleEnabled("maintenance");
  const showAlerts = showCertificates || showMaintenance;
  const heroSource = vessel.imageUrl ? { uri: vessel.imageUrl } : vesselBanner;

  if (isWeb) {
    return (
      <View className="web:flex web:flex-col web:gap-4 web:lg:flex-row">
        <View className="web:flex-1">
          <View className={GRID_BASE}>
            <View className="web:col-span-1 web:md:col-span-2 web:2xl:col-span-6">
              <Card className="gap-0 overflow-hidden p-0">
                <HeroBanner
                  title={vessel.name}
                  subtitle="Single-vessel operational snapshot with the same dashboard language used at project level."
                  source={heroSource}
                  rightTitle="Operational Highlights"
                  leftSectionTitle="Overview"
                  rightSectionTitle="Readiness"
                  left={heroLeft}
                  right={heroRight}
                />
              </Card>
            </View>

            {showCrew ? (
              <View className="web:col-span-1 web:md:col-span-2 web:2xl:col-span-3">
                <OverviewPanel
                  title={crewCard.title}
                  description={crewCard.subtitle}
                  fullHeight
                >
                  <ModuleSummary
                    rows={crewCard.rows}
                    actionLabel={crewCard.cta}
                    onPress={() => router.push(crewCard.href)}
                  />
                </OverviewPanel>
              </View>
            ) : null}

            {showMaintenance ? (
              <View className="web:col-span-1 web:md:col-span-2 web:2xl:col-span-3">
                <OverviewPanel
                  title={maintenanceCard.title}
                  description={maintenanceCard.subtitle}
                  fullHeight
                >
                  <ModuleSummary
                    rows={maintenanceCard.rows}
                    actionLabel={maintenanceCard.cta}
                    onPress={() => router.push(maintenanceCard.href)}
                  />
                </OverviewPanel>
              </View>
            ) : null}

            <View className="web:col-span-1 web:md:col-span-2 web:2xl:col-span-6">
              <OverviewPanel
                title="Vessel profile snapshot"
                description="Client-facing vessel details without surfacing technical database identifiers."
              >
                <View className="grid gap-3 web:grid web:grid-cols-2 web:gap-3 xl:grid-cols-3">
                  {profileRows.map((row) => (
                    <DetailMetric
                      key={`profile-${row.label}`}
                      label={row.label}
                      value={row.value}
                    />
                  ))}
                </View>
              </OverviewPanel>
            </View>
          </View>
        </View>

        {(showCertificates || showAlerts) ? (
          <View className="web:w-full web:gap-4 web:flex web:flex-col web:lg:w-[360px] web:lg:min-w-[340px] web:lg:max-w-[420px]">
            {showCertificates ? (
              <View className={LATERAL_HEIGHT}>
                <OverviewPanel
                  title={certificatesCard.title}
                  description={certificatesCard.subtitle}
                  fullHeight
                >
                  <ModuleSummary
                    rows={certificatesCard.rows}
                    actionLabel={certificatesCard.cta}
                    onPress={() => router.push(certificatesCard.href)}
                  />
                </OverviewPanel>
              </View>
            ) : null}

            {showAlerts ? (
              <View className={LATERAL_HEIGHT}>
                <OverviewPanel
                  title="Alerts Feed"
                  description="Certificate and maintenance alerts filtered to this vessel using the same thresholds as the project dashboard."
                  fullHeight
                >
                  <AlertsList
                    alerts={alertsState.data}
                    isLoading={alertsState.isLoading}
                    error={alertsState.error}
                    onRetry={alertsState.refetch}
                    onNavigate={(type) =>
                      router.push(
                        type === "MAINTENANCE"
                          ? `/projects/${projectId}/vessels/${assetId}/maintenance`
                          : `/projects/${projectId}/vessels/${assetId}/certificates`,
                      )
                    }
                  />
                </OverviewPanel>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View className="gap-4">
      <Card className="gap-0 overflow-hidden p-0">
        <HeroBanner
          title={vessel.name}
          subtitle="Single-vessel operational snapshot with the same dashboard language used at project level."
          source={heroSource}
          rightTitle="Operational Highlights"
          leftSectionTitle="Overview"
          rightSectionTitle="Readiness"
          left={heroLeft}
          right={heroRight}
        />
      </Card>

      {showCertificates ? (
        <OverviewPanel
          title={certificatesCard.title}
          description={certificatesCard.subtitle}
        >
          <ModuleSummary
            rows={certificatesCard.rows}
            actionLabel={certificatesCard.cta}
            onPress={() => router.push(certificatesCard.href)}
          />
        </OverviewPanel>
      ) : null}

      {showAlerts ? (
        <OverviewPanel
          title="Alerts Feed"
          description="Certificate and maintenance alerts filtered to this vessel using the same thresholds as the project dashboard."
        >
          <AlertsList
            alerts={alertsState.data}
            isLoading={alertsState.isLoading}
            error={alertsState.error}
            onRetry={alertsState.refetch}
            onNavigate={(type) =>
              router.push(
                type === "MAINTENANCE"
                  ? `/projects/${projectId}/vessels/${assetId}/maintenance`
                  : `/projects/${projectId}/vessels/${assetId}/certificates`,
              )
            }
          />
        </OverviewPanel>
      ) : null}

      {showCrew ? (
        <OverviewPanel title={crewCard.title} description={crewCard.subtitle}>
          <ModuleSummary
            rows={crewCard.rows}
            actionLabel={crewCard.cta}
            onPress={() => router.push(crewCard.href)}
          />
        </OverviewPanel>
      ) : null}

      {showMaintenance ? (
        <OverviewPanel
          title={maintenanceCard.title}
          description={maintenanceCard.subtitle}
        >
          <ModuleSummary
            rows={maintenanceCard.rows}
            actionLabel={maintenanceCard.cta}
            onPress={() => router.push(maintenanceCard.href)}
          />
        </OverviewPanel>
      ) : null}

      <OverviewPanel
        title="Vessel profile snapshot"
        description="Client-facing vessel details without surfacing technical database identifiers."
      >
        <View className="gap-3">
          {profileRows.map((row) => (
            <DetailMetric
              key={`mobile-profile-${row.label}`}
              label={row.label}
              value={row.value}
            />
          ))}
        </View>
      </OverviewPanel>
    </View>
  );
}

function OverviewPanel(props: {
  title: string;
  description?: string;
  children: React.ReactNode;
  fullHeight?: boolean;
}) {
  return (
    <Card
      className={[
        "gap-0 overflow-hidden p-0",
        props.fullHeight ? "h-full" : "",
      ].join(" ")}
    >
      <View className="gap-1 border-b border-shellLine px-4 py-4">
        <Text className="text-[15px] font-semibold text-textMain">
          {props.title}
        </Text>
        {props.description ? (
          <Text className="text-[12px] leading-[18px] text-muted">
            {props.description}
          </Text>
        ) : null}
      </View>

      <View
        className={["flex-1 px-4 py-4", props.fullHeight ? "h-full" : ""].join(
          " ",
        )}
      >
        {props.children}
      </View>
    </Card>
  );
}

function ModuleSummary(props: {
  rows: { label: string; value: string }[];
  actionLabel: string;
  onPress: () => void;
}) {
  return (
    <View className="flex-1 justify-between gap-4">
      <View className="gap-3">
        {props.rows.map((row) => (
          <View
            key={row.label}
            className="flex-row items-center justify-between gap-4"
          >
            <Text className="text-[13px] text-muted">{row.label}</Text>
            <Text className="text-[13px] font-semibold text-textMain">
              {row.value}
            </Text>
          </View>
        ))}
      </View>

      <Button variant="softAccent" size="sm" onPress={props.onPress}>
        {props.actionLabel}
      </Button>
    </View>
  );
}

function AlertsList(props: {
  alerts: {
    id: string;
    title: string;
    type: "CERTIFICATE" | "MAINTENANCE";
    severity: "CRITICAL" | "WARNING";
    date?: string | null;
  }[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => Promise<void>;
  onNavigate: (type: "CERTIFICATE" | "MAINTENANCE") => void;
}) {
  if (props.isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-[13px] text-muted">Loading alerts...</Text>
      </View>
    );
  }

  if (props.error) {
    return (
      <View className="flex-1 items-start justify-center gap-3 rounded-[18px] border border-shellLine bg-shellPanelSoft p-4">
        <Text className="text-[13px] text-destructive">{props.error}</Text>
        <Button variant="outline" size="sm" onPress={props.onRetry}>
          Retry
        </Button>
      </View>
    );
  }

  if (props.alerts.length === 0) {
    return (
      <View className="flex-1 items-center justify-center gap-3 rounded-[18px] border border-shellLine bg-shellPanelSoft px-4 py-6">
        <View className="h-10 w-10 items-center justify-center rounded-full border border-success/25 bg-success/10">
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            className="text-success"
          />
        </View>
        <View className="max-w-[260px] gap-1">
          <Text className="text-center text-sm font-semibold text-textMain">
            No active alerts
          </Text>
          <Text className="text-center text-xs leading-5 text-muted">
            Certificate and maintenance alerts will appear here when this vessel
            needs attention.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 gap-3">
      {props.alerts.slice(0, 4).map((alert) => {
        const ui = alertUi(alert.severity);
        const metaLabel =
          alert.type === "MAINTENANCE" ? "Due" : "Expiry";

        return (
          <Pressable
            key={alert.id}
            onPress={() => props.onNavigate(alert.type)}
            className="rounded-[18px] border border-shellLine bg-shellPanelSoft px-4 py-3 active:opacity-90 web:hover:bg-shellSoft"
          >
            <View className="flex-row items-center gap-3">
              <View
                className={`h-10 w-10 items-center justify-center rounded-xl border border-shellLine ${ui.iconBg}`}
              >
                <Ionicons
                  name={ui.icon}
                  size={18}
                  className="text-textMain"
                />
              </View>

              <View className="flex-1 gap-0.5">
                <Text className="text-[13px] font-semibold text-textMain">
                  {alert.title}
                </Text>
                <Text className="text-[12px] text-muted">
                  {metaLabel}: {formatDate(alert.date ?? null)}
                </Text>
              </View>

              <MiniPill className={`border ${ui.pill}`}>
                <View className="flex-row items-center gap-2">
                  <View className={`h-2 w-2 rounded-full ${ui.dot}`} />
                  <Text className={`text-[10px] font-semibold ${ui.text}`}>
                    {alert.severity}
                  </Text>
                </View>
              </MiniPill>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <View className="gap-1 rounded-xl border border-shellLine bg-shellPanelSoft px-4 py-3">
      <Text className="text-[12px] text-muted">{label}</Text>
      <Text className="text-[13px] font-semibold text-textMain">{value}</Text>
    </View>
  );
}
