import { useProjectEntitlements } from "@/src/context/ProjectEntitlementsProvider";
import { formatDate } from "@/src/helpers";
import {
  useAlertsFeedData,
  type AlertItem,
} from "@/src/hooks/dashboard/useAlertsFeedData";
import { useCrewSummaryData } from "@/src/hooks/dashboard/useCrewSummaryData";
import { useMaintenanceOverviewData } from "@/src/hooks/dashboard/useMaintenanceOverviewData";
import { useOverviewKpisData } from "@/src/hooks/dashboard/useOverviewKpisData";
import {
  useVesselsHealthData,
  type VesselHealthStatus,
} from "@/src/hooks/dashboard/useVesselsHealthData";
import { cn } from "@/src/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { Button, Text } from "../../components";

type CommandCenterReviewLayoutProps = {
  projectId: string;
};

type CommandTone = "ok" | "warn" | "fail" | "info";

function toneClasses(tone: CommandTone) {
  if (tone === "fail") {
    return {
      border: "border-rose-400/25",
      badge: "border-rose-400/30 bg-rose-500/12",
      text: "text-rose-200",
      dot: "bg-rose-400",
      rail: "bg-rose-400",
    };
  }
  if (tone === "warn") {
    return {
      border: "border-amber-300/25",
      badge: "border-amber-300/25 bg-amber-400/10",
      text: "text-amber-100",
      dot: "bg-amber-300",
      rail: "bg-amber-300",
    };
  }
  if (tone === "ok") {
    return {
      border: "border-emerald-400/25",
      badge: "border-emerald-400/25 bg-emerald-400/10",
      text: "text-emerald-100",
      dot: "bg-emerald-400",
      rail: "bg-emerald-400",
    };
  }
  return {
    border: "border-sky-400/20",
    badge: "border-sky-400/20 bg-sky-400/10",
    text: "text-sky-100",
    dot: "bg-sky-400",
    rail: "bg-sky-400",
  };
}

function vesselTone(status: VesselHealthStatus): CommandTone {
  if (status === "CRITICAL") return "fail";
  if (status === "WARNING") return "warn";
  return "ok";
}

function alertTone(alert: AlertItem): CommandTone {
  return alert.severity === "CRITICAL" ? "fail" : "warn";
}

function routeForAlert(projectId: string, alert: AlertItem) {
  return alert.type === "MAINTENANCE"
    ? {
        pathname: "/projects/[projectId]/maintenance" as const,
        params: { projectId },
      }
    : {
        pathname: "/projects/[projectId]/certificates" as const,
        params: { projectId },
      };
}

function certificateTone(status: string): CommandTone {
  if (status === "EXPIRED") return "fail";
  if (status === "EXPIRING_SOON") return "warn";
  if (status === "VALID") return "ok";
  return "info";
}

function maintenanceTone(status: string): CommandTone {
  if (status === "OVERDUE") return "fail";
  if (status === "IN_PROGRESS") return "warn";
  if (status === "OPEN") return "info";
  return "ok";
}

function riskIndexFromHealth(critical: number, warning: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((critical * 100 + warning * 55) / total));
}

function riskLabel(index: number) {
  if (index >= 70) return "High risk";
  if (index >= 35) return "Watch";
  return "Stable";
}

function riskTone(index: number): CommandTone {
  if (index >= 70) return "fail";
  if (index >= 35) return "warn";
  return "ok";
}

function commandMeterSegments(index: number) {
  const activeSegments = Math.round(index / 10);
  return Array.from({ length: 10 }, (_, segment) => segment < activeSegments);
}

export function CommandCenterReviewLayout({
  projectId,
}: CommandCenterReviewLayoutProps) {
  const router = useRouter();
  const { isModuleEnabled } = useProjectEntitlements();
  const overview = useOverviewKpisData();
  const vesselsHealth = useVesselsHealthData();
  const alerts = useAlertsFeedData();
  const maintenance = useMaintenanceOverviewData();
  const crew = useCrewSummaryData();

  const vesselModule = isModuleEnabled("vessels");
  const certificateModule = isModuleEnabled("certificates");
  const maintenanceModule = isModuleEnabled("maintenance");
  const crewModule = isModuleEnabled("crew");

  const commandAlerts = alerts.data.slice(0, 5);
  const watchlist = vesselsHealth.data.vessels.slice(0, 6);
  const maintenanceRows = maintenance.data.upcoming.slice(0, 5);
  const certificateRows = overview.data.certificatesList
    .filter((item) => item.status !== "VALID")
    .slice(0, 5);
  const crewRows = crew.data.crewByVessel.slice(0, 5);

  const complianceCoverage =
    overview.data.certificates.total > 0
      ? Math.round(
          ((overview.data.certificates.valid +
            overview.data.certificates.expiringSoon) /
            overview.data.certificates.total) *
            100,
        )
      : 100;

  const riskIndex = riskIndexFromHealth(
    vesselsHealth.data.critical,
    vesselsHealth.data.warning,
    vesselsHealth.data.totalVessels,
  );

  const alertCounts = {
    critical: alerts.data.filter((item) => item.severity === "CRITICAL").length,
    warning: alerts.data.filter((item) => item.severity === "WARNING").length,
  };

  const coverageTone =
    overview.data.certificates.expired > 0
      ? "fail"
      : overview.data.certificates.expiringSoon > 0
        ? "warn"
        : "ok";

  const riskUi = toneClasses(riskTone(riskIndex));

  return (
    <View className="gap-4">
      {/* {/* <View className="rounded-[22px] border border-shellLine bg-shellPanel px-4 py-4 web:backdrop-blur-md">
        <View className="flex-row flex-wrap items-start justify-between gap-4">
          <View className="max-w-[860px] gap-1.5">
            <Text className="text-[11px] font-semibold uppercase tracking-[0.24em] text-shellHighlight">
              Review Mode
            </Text>
            <Text className="text-[22px] font-semibold text-textMain">
              Fleet Command Center
            </Text>
            <Text className="text-[13px] leading-[20px] text-muted">
              Experimental dashboard direction for ARXIS. The layout stays
              grounded on live project data already available today so we can
              compare command-center density against the current modular
              dashboard without inventing telemetry.
            </Text>
          </View>

          <View className="flex-row flex-wrap items-center gap-2">
            <View className="rounded-full border border-shellBadgeBorder bg-shellBadge px-3 py-1.5">
              <Text className="text-[10px] font-semibold uppercase tracking-[0.16em] text-shellHighlight">
                Temporary comparison
              </Text>
            </View>
            <View className="rounded-full border border-shellLine bg-shellPanelSoft px-3 py-1.5">
              <Text className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                {projectName ?? "Project"} overview
              </Text>
            </View>
          </View>
        </View>
      </View> */}

      <View className="web:grid web:grid-cols-1 web:gap-4 web:xl:grid-cols-12">
        <CommandPanel
          eyebrow="Key Metrics"
          title="Project snapshot"
          className="web:xl:col-span-3"
        >
          <MetricMatrix
            items={[
              {
                label: "Vessels",
                value: vesselModule
                  ? String(overview.data.totalVessels)
                  : "Module off",
                hint: vesselModule ? "tracked in project" : "enable vessels",
              },
              {
                label: "Active crew",
                value: crewModule
                  ? String(overview.data.crewActive)
                  : "Module off",
                hint: crewModule ? "current onboard" : "enable crew",
              },
              {
                label: "Certificates",
                value: certificateModule
                  ? String(overview.data.certificates.total)
                  : "Module off",
                hint: certificateModule
                  ? "records tracked"
                  : "enable certificates",
              },
              {
                label: "Open work",
                value: maintenanceModule
                  ? String(maintenance.data.open + maintenance.data.inProgress)
                  : "Module off",
                hint: maintenanceModule
                  ? "maintenance queue"
                  : "enable maintenance",
              },
            ]}
          />

          <PanelFooterAction
            label="Open fleet workspace"
            disabled={!vesselModule}
            onPress={() =>
              router.push({
                pathname: "/projects/[projectId]/vessels",
                params: { projectId },
              })
            }
          />
        </CommandPanel>

        <CommandPanel
          eyebrow="Compliance"
          title="Certificate coverage"
          className="web:xl:col-span-3"
        >
          {certificateModule ? (
            <View className="gap-4">
              <View className="flex-row items-end justify-between">
                <View>
                  <Text className="text-[34px] font-semibold leading-[38px] text-textMain">
                    {complianceCoverage}%
                  </Text>
                  <Text className="text-xs text-muted">
                    derived from current certificate states
                  </Text>
                </View>

                <StatusBadge
                  label={
                    coverageTone === "ok"
                      ? "Covered"
                      : coverageTone === "warn"
                        ? "Watch"
                        : "At risk"
                  }
                  tone={coverageTone}
                />
              </View>

              <View className="gap-2">
                <StatusRail
                  label="Valid"
                  value={overview.data.certificates.valid}
                  tone="ok"
                />
                <StatusRail
                  label="Expiring soon"
                  value={overview.data.certificates.expiringSoon}
                  tone="warn"
                />
                <StatusRail
                  label="Expired"
                  value={overview.data.certificates.expired}
                  tone="fail"
                />
                <StatusRail
                  label="Pending"
                  value={overview.data.certificates.pending}
                  tone="info"
                />
              </View>
            </View>
          ) : (
            <ModuleOffCopy label="Certificates" />
          )}

          <PanelFooterAction
            label="Open certificates"
            disabled={!certificateModule}
            onPress={() =>
              router.push({
                pathname: "/projects/[projectId]/certificates",
                params: { projectId },
              })
            }
          />
        </CommandPanel>

        <CommandPanel
          eyebrow="Risk Index"
          title="Operational posture"
          className="web:xl:col-span-3"
        >
          {vesselModule ? (
            <View className="gap-4">
              <View className="flex-row items-end justify-between">
                <View>
                  <Text className="text-[34px] font-semibold leading-[38px] text-textMain">
                    {riskIndex}
                  </Text>
                  <Text className="text-xs text-muted">
                    derived from vessel health state
                  </Text>
                </View>

                <StatusBadge
                  label={riskLabel(riskIndex)}
                  tone={riskTone(riskIndex)}
                />
              </View>

              <View className="gap-2">
                <View className="flex-row gap-2">
                  {commandMeterSegments(riskIndex).map((active, index) => (
                    <View
                      key={`risk-segment-${index}`}
                      className={cn(
                        "h-2 flex-1 rounded-full bg-shellPanelSoft",
                        active ? riskUi.rail : "bg-shellPanelSoft",
                      )}
                    />
                  ))}
                </View>

                <View className="flex-row flex-wrap gap-2">
                  <StatusBadge
                    label={`${vesselsHealth.data.critical} critical`}
                    tone="fail"
                  />
                  <StatusBadge
                    label={`${vesselsHealth.data.warning} warning`}
                    tone="warn"
                  />
                  <StatusBadge
                    label={`${vesselsHealth.data.ok} healthy`}
                    tone="ok"
                  />
                </View>
              </View>
            </View>
          ) : (
            <ModuleOffCopy label="Vessels" />
          )}

          <PanelFooterAction
            label="Open health view"
            disabled={!vesselModule}
            onPress={() =>
              router.push({
                pathname: "/projects/[projectId]/vessels",
                params: { projectId },
              })
            }
          />
        </CommandPanel>

        <CommandPanel
          eyebrow="Alerts"
          title="Priority snapshot"
          className="web:xl:col-span-3"
        >
          <View className="gap-4">
            <View className="flex-row flex-wrap gap-2">
              <MetricChip
                label="Critical"
                value={String(alertCounts.critical)}
                tone="fail"
              />
              <MetricChip
                label="Warning"
                value={String(alertCounts.warning)}
                tone="warn"
              />
            </View>

            {commandAlerts[0] ? (
              <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft px-3 py-3">
                <Text className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                  Next attention point
                </Text>
                <Text
                  className="mt-2 text-sm font-semibold text-textMain"
                  numberOfLines={2}
                >
                  {commandAlerts[0].title}
                </Text>
                <Text className="mt-1 text-xs text-muted" numberOfLines={1}>
                  {commandAlerts[0].subtitle}
                </Text>
                <Text className="mt-2 text-xs text-muted">
                  {commandAlerts[0].date
                    ? formatDate(commandAlerts[0].date)
                    : "No due date"}
                </Text>
              </View>
            ) : (
              <EmptyPanelCopy
                title="No active alerts"
                body="Certificates and maintenance issues will surface here when they require attention."
              />
            )}
          </View>
        </CommandPanel>
      </View>

      <View className="web:grid web:grid-cols-1 web:gap-4 web:xl:grid-cols-12">
        <CommandPanel
          eyebrow="Status Overview"
          title="Fleet watchlist"
          className="web:xl:col-span-8"
          bodyClassName="gap-3"
        >
          {vesselModule ? (
            <>
              <View className="hidden flex-row items-center border-b border-shellLine px-3 pb-2 web:flex">
                <TableHeader className="flex-[1.8]">Vessel</TableHeader>
                <TableHeader className="flex-1">Health</TableHeader>
                <TableHeader className="flex-[0.8]">Crew</TableHeader>
                <TableHeader className="flex-[1.2]">Certificates</TableHeader>
                <TableHeader className="flex-[1.2]">Maintenance</TableHeader>
                <TableHeader className="flex-[1.6]">Focus</TableHeader>
              </View>

              <View className="gap-2">
                {watchlist.length > 0 ? (
                  watchlist.map((item) => (
                    <Pressable
                      key={item.assetId}
                      onPress={() =>
                        router.push({
                          pathname: "/projects/[projectId]/vessels/[assetId]",
                          params: { projectId, assetId: item.assetId },
                        })
                      }
                      className="rounded-[18px] border border-shellLine bg-shellPanelSoft px-3 py-3 web:hover:border-shellHighlight/35"
                    >
                      <View className="gap-2 web:hidden">
                        <View className="flex-row items-start justify-between gap-3">
                          <View className="flex-1">
                            <Text className="text-sm font-semibold text-textMain">
                              {item.assetName}
                            </Text>
                            <Text className="mt-1 text-xs text-muted">
                              {item.reasons[0] ?? "All good"}
                            </Text>
                          </View>
                          <StatusBadge
                            label={item.status}
                            tone={vesselTone(item.status)}
                          />
                        </View>

                        <View className="flex-row flex-wrap gap-2">
                          <InlineDataPill
                            label="Crew"
                            value={String(item.activeCrew)}
                          />
                          <InlineDataPill
                            label="Certs"
                            value={`${item.expiredCerts}/${item.expiringCerts}`}
                          />
                          <InlineDataPill
                            label="Maint."
                            value={`${item.overdueMaintenance}/${item.dueSoonMaintenance}`}
                          />
                        </View>
                      </View>

                      <View className="hidden flex-row items-center web:flex">
                        <View className="flex-[1.8] pr-3">
                          <Text className="text-sm font-semibold text-textMain">
                            {item.assetName}
                          </Text>
                        </View>
                        <View className="flex-1 pr-3">
                          <StatusBadge
                            label={item.status}
                            tone={vesselTone(item.status)}
                          />
                        </View>
                        <TableCell className="flex-[0.8]">
                          {String(item.activeCrew)}
                        </TableCell>
                        <TableCell className="flex-[1.2]">
                          {item.expiredCerts} exp. / {item.expiringCerts} soon
                        </TableCell>
                        <TableCell className="flex-[1.2]">
                          {item.overdueMaintenance} over /{" "}
                          {item.dueSoonMaintenance} due
                        </TableCell>
                        <TableCell className="flex-[1.6]">
                          {item.reasons[0] ?? "All good"}
                        </TableCell>
                      </View>
                    </Pressable>
                  ))
                ) : (
                  <EmptyPanelCopy
                    title="No vessels to compare"
                    body="Once vessels, certificates, or maintenance tasks exist, this watchlist will become the operational center of the dashboard."
                  />
                )}
              </View>
            </>
          ) : (
            <ModuleOffCopy label="Vessels" />
          )}

          <PanelFooterAction
            label="Open vessel directory"
            disabled={!vesselModule}
            onPress={() =>
              router.push({
                pathname: "/projects/[projectId]/vessels",
                params: { projectId },
              })
            }
          />
        </CommandPanel>

        <CommandPanel
          eyebrow="Priority Queue"
          title="Alerts requiring attention"
          className="web:xl:col-span-4"
          bodyClassName="gap-2"
        >
          {commandAlerts.length > 0 ? (
            commandAlerts.map((alert) => (
              <Pressable
                key={alert.id}
                onPress={() => router.push(routeForAlert(projectId, alert))}
                className={cn(
                  "rounded-[18px] border border-shellLine bg-shellPanelSoft px-3 py-3",
                  "web:hover:border-shellHighlight/35",
                )}
              >
                <View className="flex-row items-start gap-3">
                  <View
                    className={cn(
                      "mt-0.5 h-8 w-8 items-center justify-center rounded-xl border border-shellLine",
                      toneClasses(alertTone(alert)).badge,
                    )}
                  >
                    <Ionicons
                      name={
                        alert.severity === "CRITICAL"
                          ? "alert-circle-outline"
                          : "warning-outline"
                      }
                      size={16}
                      color="rgba(255,255,255,0.88)"
                    />
                  </View>

                  <View className="flex-1 gap-1">
                    <View className="flex-row items-start justify-between gap-3">
                      <Text
                        className="flex-1 text-sm font-semibold text-textMain"
                        numberOfLines={2}
                      >
                        {alert.title}
                      </Text>
                      <StatusBadge
                        label={alert.severity}
                        tone={alertTone(alert)}
                      />
                    </View>
                    <Text className="text-xs text-muted" numberOfLines={1}>
                      {alert.subtitle}
                    </Text>
                    <Text className="text-xs text-muted">
                      {alert.date ? formatDate(alert.date) : "No due date"}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))
          ) : (
            <EmptyPanelCopy
              title="Alert queue is clear"
              body="Critical certificates and overdue maintenance items will appear here when thresholds are crossed."
            />
          )}
        </CommandPanel>
      </View>

      <View className="web:grid web:grid-cols-1 web:gap-4 web:xl:grid-cols-12">
        <CommandPanel
          eyebrow="Certificate Watch"
          title="Expiring and pending documents"
          className="web:xl:col-span-4"
          bodyClassName="gap-2"
        >
          {certificateModule ? (
            certificateRows.length > 0 ? (
              certificateRows.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() =>
                    router.push({
                      pathname: "/projects/[projectId]/certificates",
                      params: { projectId },
                    })
                  }
                  className="rounded-[18px] border border-shellLine bg-shellPanelSoft px-3 py-3 web:hover:border-shellHighlight/35"
                >
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text
                        className="text-sm font-semibold text-textMain"
                        numberOfLines={2}
                      >
                        {item.certificateName}
                      </Text>
                      <Text
                        className="mt-1 text-xs text-muted"
                        numberOfLines={1}
                      >
                        {item.assetName}
                      </Text>
                    </View>
                    <StatusBadge
                      label={item.status.replaceAll("_", " ")}
                      tone={certificateTone(item.status)}
                    />
                  </View>
                  <Text className="mt-2 text-xs text-muted">
                    {item.expiryDate
                      ? formatDate(item.expiryDate)
                      : "No expiry"}
                  </Text>
                </Pressable>
              ))
            ) : (
              <EmptyPanelCopy
                title="No expiring certificates"
                body="This block prioritizes pending, expiring, and expired records once they exist."
              />
            )
          ) : (
            <ModuleOffCopy label="Certificates" />
          )}

          <PanelFooterAction
            label="Open certificates"
            disabled={!certificateModule}
            onPress={() =>
              router.push({
                pathname: "/projects/[projectId]/certificates",
                params: { projectId },
              })
            }
          />
        </CommandPanel>

        <CommandPanel
          eyebrow="Maintenance Due"
          title="Upcoming work"
          className="web:xl:col-span-4"
          bodyClassName="gap-2"
        >
          {maintenanceModule ? (
            maintenanceRows.length > 0 ? (
              maintenanceRows.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() =>
                    router.push({
                      pathname: "/projects/[projectId]/maintenance",
                      params: { projectId },
                    })
                  }
                  className="rounded-[18px] border border-shellLine bg-shellPanelSoft px-3 py-3 web:hover:border-shellHighlight/35"
                >
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text
                        className="text-sm font-semibold text-textMain"
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>
                      <Text
                        className="mt-1 text-xs text-muted"
                        numberOfLines={1}
                      >
                        {item.assetName}
                      </Text>
                    </View>
                    <StatusBadge
                      label={item.status}
                      tone={maintenanceTone(item.status)}
                    />
                  </View>
                  <Text className="mt-2 text-xs text-muted">
                    {formatDate(item.dueDate)}
                  </Text>
                </Pressable>
              ))
            ) : (
              <EmptyPanelCopy
                title="No upcoming maintenance"
                body="Open or overdue maintenance work will concentrate here once the schedule is populated."
              />
            )
          ) : (
            <ModuleOffCopy label="Maintenance" />
          )}

          <PanelFooterAction
            label="Open maintenance"
            disabled={!maintenanceModule}
            onPress={() =>
              router.push({
                pathname: "/projects/[projectId]/maintenance",
                params: { projectId },
              })
            }
          />
        </CommandPanel>

        <CommandPanel
          eyebrow="Crew Coverage"
          title="Operational readiness"
          className="web:xl:col-span-4"
          bodyClassName="gap-3"
        >
          {crewModule ? (
            <>
              <View className="flex-row flex-wrap gap-2">
                <MetricChip
                  label="Active"
                  value={String(crew.data.active)}
                  tone="ok"
                />
                <MetricChip
                  label="Inactive"
                  value={String(crew.data.inactive)}
                  tone={crew.data.inactive > 0 ? "warn" : "ok"}
                />
                <MetricChip
                  label="No crew"
                  value={String(crew.data.vesselsWithoutActiveCrew)}
                  tone={crew.data.vesselsWithoutActiveCrew > 0 ? "fail" : "ok"}
                />
              </View>

              <View className="gap-2">
                {crewRows.length > 0 ? (
                  crewRows.map((item) => (
                    <Pressable
                      key={item.assetId}
                      onPress={() =>
                        router.push({
                          pathname: "/projects/[projectId]/crew",
                          params: { projectId },
                        })
                      }
                      className="rounded-[18px] border border-shellLine bg-shellPanelSoft px-3 py-3 web:hover:border-shellHighlight/35"
                    >
                      <View className="flex-row items-center justify-between gap-3">
                        <View className="flex-1">
                          <Text
                            className="text-sm font-semibold text-textMain"
                            numberOfLines={1}
                          >
                            {item.assetName}
                          </Text>
                          <Text className="mt-1 text-xs text-muted">
                            {item.activeCount === 0
                              ? "No active crew assigned"
                              : `${item.activeCount} active crew members`}
                          </Text>
                        </View>
                        <StatusBadge
                          label={String(item.activeCount)}
                          tone={
                            item.activeCount === 0
                              ? "fail"
                              : item.activeCount < 4
                                ? "warn"
                                : "ok"
                          }
                        />
                      </View>
                    </Pressable>
                  ))
                ) : (
                  <EmptyPanelCopy
                    title="No crew coverage data"
                    body="Crew coverage appears once members are assigned into the project fleet."
                  />
                )}
              </View>
            </>
          ) : (
            <ModuleOffCopy label="Crew" />
          )}

          <PanelFooterAction
            label="Open crew workspace"
            disabled={!crewModule}
            onPress={() =>
              router.push({
                pathname: "/projects/[projectId]/crew",
                params: { projectId },
              })
            }
          />
        </CommandPanel>
      </View>
    </View>
  );
}

function CommandPanel(props: {
  eyebrow: string;
  title: string;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <View
      className={cn(
        "rounded-[22px] border border-shellLine bg-shellPanel px-4 py-4 web:backdrop-blur-md",
        props.className,
      )}
    >
      <View className={cn("gap-4", props.bodyClassName)}>
        <View className="gap-1">
          <Text className="text-[10px] font-semibold uppercase tracking-[0.18em] text-shellHighlight">
            {props.eyebrow}
          </Text>
          <Text className="text-[17px] font-semibold text-textMain">
            {props.title}
          </Text>
        </View>

        {props.children}
      </View>
    </View>
  );
}

function MetricMatrix(props: {
  items: { label: string; value: string; hint: string }[];
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {props.items.map((item) => (
        <View
          key={item.label}
          className="w-[48%] rounded-[18px] border border-shellLine bg-shellPanelSoft px-3 py-3"
        >
          <Text className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            {item.label}
          </Text>
          <Text className="mt-2 text-[26px] font-semibold leading-[30px] text-textMain">
            {item.value}
          </Text>
          <Text className="mt-1 text-xs text-muted">{item.hint}</Text>
        </View>
      ))}
    </View>
  );
}

function MetricChip(props: {
  label: string;
  value: string;
  tone: CommandTone;
}) {
  const ui = toneClasses(props.tone);

  return (
    <View
      className={cn(
        "min-w-[96px] flex-1 rounded-[18px] border px-3 py-3",
        "bg-shellPanelSoft",
        ui.border,
      )}
    >
      <Text className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
        {props.label}
      </Text>
      <Text className="mt-2 text-[22px] font-semibold leading-[26px] text-textMain">
        {props.value}
      </Text>
    </View>
  );
}

function StatusRail(props: {
  label: string;
  value: number;
  tone: CommandTone;
}) {
  const ui = toneClasses(props.tone);

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-muted">{props.label}</Text>
        <Text className="text-xs font-semibold text-textMain">
          {props.value}
        </Text>
      </View>
      <View className="h-2 overflow-hidden rounded-full bg-shellPanelSoft">
        <View
          className={cn(
            "h-full rounded-full",
            ui.rail,
            props.value === 0
              ? "w-[6%] opacity-30"
              : props.value < 3
                ? "w-[22%]"
                : props.value < 6
                  ? "w-[45%]"
                  : "w-[72%]",
          )}
        />
      </View>
    </View>
  );
}

function StatusBadge(props: { label: string; tone: CommandTone }) {
  const ui = toneClasses(props.tone);
  return (
    <View className={cn("rounded-full border px-2.5 py-1", ui.badge)}>
      <View className="flex-row items-center gap-2">
        <View className={cn("h-2 w-2 rounded-full", ui.dot)} />
        <Text
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.08em]",
            ui.text,
          )}
        >
          {props.label}
        </Text>
      </View>
    </View>
  );
}

function InlineDataPill(props: { label: string; value: string }) {
  return (
    <View className="rounded-full border border-shellLine bg-shellPanelSoft px-2.5 py-1.5">
      <Text className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
        {props.label}
      </Text>
      <Text className="text-xs font-semibold text-textMain">{props.value}</Text>
    </View>
  );
}

function TableHeader(props: { children: React.ReactNode; className?: string }) {
  return (
    <Text
      className={cn(
        "text-[10px] font-semibold uppercase tracking-[0.16em] text-muted",
        props.className,
      )}
    >
      {props.children}
    </Text>
  );
}

function TableCell(props: { children: React.ReactNode; className?: string }) {
  return (
    <Text className={cn("pr-3 text-xs text-muted", props.className)}>
      {props.children}
    </Text>
  );
}

function ModuleOffCopy(props: { label: string; mutedBody?: boolean }) {
  return (
    <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft px-3 py-4">
      <Text className="text-sm font-semibold text-textMain">
        {props.label} unavailable
      </Text>
      <Text
        className={cn(
          "mt-1 text-xs leading-[18px] text-muted",
          props.mutedBody ? "max-w-[320px]" : "",
        )}
      >
        Enable the matching project entitlement to surface this block inside the
        command center review.
      </Text>
    </View>
  );
}

function EmptyPanelCopy(props: { title: string; body: string }) {
  return (
    <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft px-3 py-4">
      <Text className="text-sm font-semibold text-textMain">{props.title}</Text>
      <Text className="mt-1 text-xs leading-[18px] text-muted">
        {props.body}
      </Text>
    </View>
  );
}

function PanelFooterAction(props: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="rounded-xl self-start"
      disabled={props.disabled}
      onPress={props.onPress}
    >
      {props.label}
    </Button>
  );
}
