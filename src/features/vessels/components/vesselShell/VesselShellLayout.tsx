import { Button, Card, ErrorState, Loading, Text } from "@/src/components";
import { useProjectContext } from "@/src/context";
import { formatDate, humanizeTechnicalLabel } from "@/src/helpers";
import { usePathname, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { useVesselShell } from "../../context/VesselShellProvider";

type NavTone = "success" | "warn" | "fail" | "neutral";

export function VesselShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { projectName } = useProjectContext();
  const {
    projectId,
    assetId,
    vessel,
    summary,
    loading,
    vesselError,
    summaryError,
    refresh,
  } = useVesselShell();

  if (loading && !vessel) {
    return <Loading fullScreen />;
  }

  if (vesselError && !vessel) {
    return <ErrorState message={vesselError} onRetry={refresh} />;
  }

  if (!vessel) {
    return <ErrorState message="Vessel not found." onRetry={refresh} />;
  }

  const basePath = `/projects/${projectId}/vessels/${assetId}`;
  const identifier = vessel.vessel?.imo
    ? `IMO ${vessel.vessel.imo}`
    : vessel.vessel?.licenseNumber
      ? `License ${vessel.vessel.licenseNumber}`
      : "Identifier pending";
  const certificatesAtRisk =
    summary.certificates.expired + summary.certificates.expiringSoon;
  const maintenanceAttention =
    summary.maintenance.overdue + summary.maintenance.open;
  const lastFuelEvent = summary.fuel.lastEventType
    ? humanizeTechnicalLabel(summary.fuel.lastEventType)
    : "No fuel events";

  const navItems = [
    {
      key: "overview",
      label: "Overview",
      href: basePath,
      helper: "Asset-level operational snapshot",
      tone: "neutral" as const,
    },
    {
      key: "certificates",
      label: "Certificates",
      href: `${basePath}/certificates`,
      helper:
        certificatesAtRisk > 0
          ? `${certificatesAtRisk} at risk`
          : `${summary.certificates.total} records on file`,
      tone: certificatesAtRisk > 0 ? ("fail" as const) : ("success" as const),
    },
    {
      key: "crew",
      label: "Crew",
      href: `${basePath}/crew`,
      helper: `${summary.crew.active} active of ${summary.crew.total}`,
      tone:
        summary.crew.active > 0 ? ("success" as const) : ("neutral" as const),
    },
    {
      key: "maintenance",
      label: "Maintenance",
      href: `${basePath}/maintenance`,
      helper:
        summary.maintenance.overdue > 0
          ? `${summary.maintenance.overdue} overdue`
          : `${summary.maintenance.open} open tasks`,
      tone:
        summary.maintenance.overdue > 0
          ? ("fail" as const)
          : summary.maintenance.open > 0
            ? ("warn" as const)
            : ("success" as const),
    },
    {
      key: "fuel",
      label: "Fuel",
      href: `${basePath}/fuel`,
      helper:
        summary.fuel.total > 0
          ? `${summary.fuel.total} events | ${lastFuelEvent}`
          : "No fuel history yet",
      tone:
        summary.fuel.total > 0 ? ("success" as const) : ("neutral" as const),
    },
  ];

  const hasDedicatedActiveSection = navItems
    .filter((item) => item.key !== "overview")
    .some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  const shellStats = [
    {
      label: "Certificates at risk",
      value: String(certificatesAtRisk),
      tone: certificatesAtRisk > 0 ? ("fail" as const) : ("success" as const),
    },
    {
      label: "Crew active",
      value: `${summary.crew.active}/${summary.crew.total}`,
      tone: summary.crew.active > 0 ? ("success" as const) : ("neutral" as const),
    },
    {
      label: "Maintenance attention",
      value: String(maintenanceAttention),
      tone:
        summary.maintenance.overdue > 0
          ? ("fail" as const)
          : maintenanceAttention > 0
            ? ("warn" as const)
            : ("success" as const),
    },
    {
      label: "Last fuel event",
      value: lastFuelEvent,
      tone: summary.fuel.total > 0 ? ("success" as const) : ("neutral" as const),
    },
  ];

  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text className="text-2xl font-semibold">{vessel.name} Dashboard</Text>
        <Text className="text-sm text-muted">
          Vessel-specific operational context inside {projectName}. Use this
          page the same way the project dashboard aggregates the fleet, but
          focused on one asset.
        </Text>
      </View>

      <View className="flex-row flex-wrap items-center justify-between gap-3">
        <View className="flex-row flex-wrap gap-2">
          <MetaChip label="Status" value={humanizeTechnicalLabel(vessel.status)} />
          <MetaChip label="Identifier" value={identifier} />
          <MetaChip label="Flag" value={vessel.vessel?.flag ?? "Flag pending"} />
          <MetaChip
            label="Type"
            value={humanizeTechnicalLabel(vessel.vessel?.vesselType)}
          />
          <MetaChip label="Summary refreshed" value={formatDate(summary.updatedAt)} />
        </View>

        <View className="flex-row flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onPress={() => router.push(`/projects/${projectId}/dashboard`)}
            className="rounded-full"
          >
            Project dashboard
          </Button>
          <Button
            variant="outline"
            size="sm"
            onPress={() => router.push(`${basePath}/edit`)}
            className="rounded-full"
          >
            Edit vessel
          </Button>
          <Button
            variant="default"
            size="sm"
            onPress={refresh}
            className="rounded-full"
          >
            Refresh
          </Button>
        </View>
      </View>

      <Card className="gap-0 p-0 overflow-hidden">
        <View className="gap-1 border-b border-border px-4 py-4">
          <Text className="text-sm font-semibold text-textMain">
            Vessel modules
          </Text>
          <Text className="text-xs leading-[18px] text-muted">
            Move between overview, certificates, crew, maintenance, and fuel
            without leaving this vessel context.
          </Text>
        </View>

        <View className="gap-4 px-4 py-4">
          <View className="flex-row flex-wrap gap-2">
            {navItems.map((item) => {
              const isActive =
                item.key === "overview"
                  ? !hasDedicatedActiveSection &&
                    (pathname === item.href ||
                      pathname === `${item.href}/` ||
                      pathname.startsWith(`${item.href}/edit`))
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Pressable
                  key={item.key}
                  onPress={() => router.push(item.href)}
                  className={[
                    "min-w-[180px] flex-1 rounded-xl border px-4 py-3",
                    isActive
                      ? "border-accent/45 bg-accent/10"
                      : "border-border bg-baseBg/25",
                  ].join(" ")}
                >
                  <View className="gap-2">
                    <View className="flex-row items-center justify-between gap-3">
                      <Text
                        className={[
                          "text-[14px] font-semibold",
                          isActive ? "text-accent" : "text-textMain",
                        ].join(" ")}
                      >
                        {item.label}
                      </Text>

                      <View
                        className={[
                          "rounded-full px-2.5 py-1",
                          toneClasses(item.tone).bg,
                        ].join(" ")}
                      >
                        <Text
                          className={[
                            "text-[10px] font-semibold",
                            toneClasses(item.tone).text,
                          ].join(" ")}
                        >
                          {isActive ? "Open" : item.label}
                        </Text>
                      </View>
                    </View>

                    <Text className="text-[12px] leading-[18px] text-muted">
                      {item.helper}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View className="flex-row flex-wrap gap-3">
            {shellStats.map((item) => (
              <View
                key={item.label}
                className="min-w-[180px] flex-1 rounded-xl border border-border bg-baseBg/25 px-4 py-3"
              >
                <Text className="text-[12px] text-muted">{item.label}</Text>
                <Text
                  className={[
                    "mt-1 text-[18px] font-semibold",
                    toneClasses(item.tone).text,
                  ].join(" ")}
                >
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Card>

      {summaryError ? (
        <Text className="text-[12px] text-warning">
          Operational summary is temporarily unavailable. The vessel shell
          remains usable while summary data retries.
        </Text>
      ) : null}

      <View>{children}</View>
    </View>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <View className="rounded-full border border-border bg-baseBg/30 px-3 py-2">
      <Text className="text-[11px] text-muted">{label}</Text>
      <Text className="text-[13px] font-semibold text-textMain">{value}</Text>
    </View>
  );
}

function toneClasses(tone: NavTone) {
  switch (tone) {
    case "success":
      return { bg: "bg-success/15", text: "text-success" };
    case "warn":
      return { bg: "bg-warning/15", text: "text-warning" };
    case "fail":
      return { bg: "bg-destructive/15", text: "text-destructive" };
    case "neutral":
    default:
      return { bg: "bg-baseBg/45", text: "text-textMain/75" };
  }
}
