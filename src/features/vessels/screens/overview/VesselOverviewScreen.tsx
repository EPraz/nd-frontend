import vesselBanner from "@/src/assets/ship-banner-2.jpg";
import { Button, Card, Text } from "@/src/components";
import { HeroBanner } from "@/src/components/modules/heroSection";
import type { SpecItem } from "@/src/components/modules/heroSection/hero.ui";
import { useProjectContext } from "@/src/context";
import { formatDate, humanizeTechnicalLabel } from "@/src/helpers";
import { useRouter } from "expo-router";
import { Platform, View } from "react-native";
import { useVesselShell } from "../../context/VesselShellProvider";

const LATERAL_HEIGHT = "web:h-[45vh] web:max-h-[520px] web:min-h-[375px]";
const GRID_BASE =
  "web:grid web:gap-4 web:grid-cols-1 web:md:grid-cols-2 web:2xl:grid-cols-6 web:auto-rows-[375px]";

export default function VesselOverviewScreen() {
  const router = useRouter();
  const { projectName } = useProjectContext();
  const { projectId, assetId, vessel, summary } = useVesselShell();
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
    {
      label: "Type",
      value: humanizeTechnicalLabel(vessel.vessel?.vesselType),
    },
    {
      label: "Class society",
      value: vessel.vessel?.classSociety ?? "Not set",
    },
    {
      label: "Home port",
      value: vessel.vessel?.homePort ?? "Not set",
    },
    {
      label: "Dimensions",
      value: dimensions || "Not set",
    },
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
      kind: "status" as const,
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
      kind: "status" as const,
      statusTone: summary.crew.active > 0 ? "ok" : "warn",
    },
    {
      label: "Maintenance attention",
      value: String(summary.maintenance.overdue + summary.maintenance.open),
      kind: "status" as const,
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
                  source={vesselBanner}
                  rightTitle="Operational Highlights"
                  leftSectionTitle="Overview"
                  rightSectionTitle="Readiness"
                  left={heroLeft}
                  right={heroRight}
                />
              </Card>
            </View>

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
          </View>
        </View>

        <View className="web:w-full web:gap-4 web:flex web:flex-col web:lg:w-[360px] web:lg:min-w-[340px] web:lg:max-w-[420px]">
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

          {/* <View className={LATERAL_HEIGHT}>
            <OverviewPanel
              title="Vessel profile snapshot"
              description="Client-friendly vessel details surfaced in one place."
              fullHeight
            >
              <View className="gap-3">
                {profileRows.map((row) => (
                  <DetailMetric
                    key={`profile-${row.label}`}
                    label={row.label}
                    value={row.value}
                  />
                ))}
              </View>
            </OverviewPanel>
          </View> */}
        </View>
      </View>
    );
  }

  return (
    <View className="gap-4">
      <Card className="gap-0 overflow-hidden p-0">
        <HeroBanner
          title={vessel.name}
          subtitle="Single-vessel operational snapshot with the same dashboard language used at project level."
          source={vesselBanner}
          rightTitle="Operational Highlights"
          leftSectionTitle="Overview"
          rightSectionTitle="Readiness"
          left={heroLeft}
          right={heroRight}
        />
      </Card>

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

      <OverviewPanel title={crewCard.title} description={crewCard.subtitle}>
        <ModuleSummary
          rows={crewCard.rows}
          actionLabel={crewCard.cta}
          onPress={() => router.push(crewCard.href)}
        />
      </OverviewPanel>

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

      <OverviewPanel
        title="Vessel profile snapshot"
        description="Client-friendly vessel details surfaced in one place."
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
      <View className="gap-1 border-b border-border px-4 py-4">
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

function DetailMetric({ label, value }: { label: string; value: string }) {
  return (
    <View className="rounded-xl border border-border bg-baseBg/25 px-4 py-3 gap-1">
      <Text className="text-[12px] text-muted">{label}</Text>
      <Text className="text-[13px] font-semibold text-textMain">{value}</Text>
    </View>
  );
}
