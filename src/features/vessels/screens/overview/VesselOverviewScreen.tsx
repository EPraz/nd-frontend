import { Button, Card, Text } from "@/src/components";
import { useProjectContext } from "@/src/context";
import { formatDate, humanizeTechnicalLabel } from "@/src/helpers";
import { useRouter } from "expo-router";
import { Platform, View } from "react-native";
import { useVesselShell } from "../../context/VesselShellProvider";

const LATERAL_HEIGHT = "web:h-[45vh] web:max-h-[520px] web:min-h-[375px]";
const GRID_BASE =
  "web:grid web:gap-4 web:grid-cols-1 web:md:grid-cols-2 web:2xl:grid-cols-6";

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
  const fuelLabel = summary.fuel.lastEventType
    ? humanizeTechnicalLabel(summary.fuel.lastEventType)
    : "No events";

  const moduleCards = [
    {
      title: "Certificates",
      subtitle: "Requirements and uploaded records for this vessel.",
      rows: [
        { label: "Provided", value: String(summary.certificates.valid) },
        { label: "Under review", value: String(summary.certificates.pending) },
        { label: "At risk", value: String(certificatesAtRisk) },
      ],
      cta: "Open certificates",
      href: `/projects/${projectId}/vessels/${assetId}/certificates`,
    },
    {
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
    },
    {
      title: "Maintenance",
      subtitle: "Task load and due-date pressure around this vessel.",
      rows: [
        { label: "Open", value: String(summary.maintenance.open) },
        { label: "In progress", value: String(summary.maintenance.inProgress) },
        { label: "Overdue", value: String(summary.maintenance.overdue) },
      ],
      cta: "Open maintenance",
      href: `/projects/${projectId}/vessels/${assetId}/maintenance`,
    },
  ];

  const heroRows = [
    { label: "Project", value: projectName },
    { label: "Identifier", value: identifier },
    { label: "Flag", value: vessel.vessel?.flag ?? "Pending" },
    { label: "Type", value: humanizeTechnicalLabel(vessel.vessel?.vesselType) },
    { label: "Class society", value: vessel.vessel?.classSociety ?? "Not set" },
    { label: "Dimensions", value: dimensions || "Not set" },
  ];

  const profileRows = [
    {
      label: "Home port",
      value: vessel.vessel?.homePort ?? "Not set",
    },
    {
      label: "Builder",
      value: vessel.vessel?.builder ?? "Not set",
    },
    {
      label: "Year built",
      value: vessel.vessel?.yearBuilt
        ? String(vessel.vessel.yearBuilt)
        : "Not set",
    },
    {
      label: "Call sign / MMSI",
      value:
        [vessel.vessel?.callSign, vessel.vessel?.mmsi]
          .filter(Boolean)
          .join(" | ") || "Not set",
    },
    {
      label: "Propulsion",
      value: humanizeTechnicalLabel(vessel.vessel?.propulsionType),
    },
    {
      label: "Main engine",
      value: vessel.vessel?.mainEngineModel ?? "Not set",
    },
  ];

  if (isWeb) {
    return (
      <View className="web:flex web:flex-col web:gap-4 web:lg:flex-row">
        <View className="web:flex-1">
          <View className={GRID_BASE}>
            <View className="web:col-span-1 web:md:col-span-2 web:2xl:col-span-6">
              <OverviewPanel
                title="Vessel overview"
                description="Single-asset operational snapshot aligned with the same dashboard language used at project level."
                flush
              >
                <View className="gap-5 px-6 pb-6">
                  <View className="gap-4 web:grid web:grid-cols-1 web:xl:grid-cols-3">
                    <View className="web:xl:col-span-2">
                      <View className="gap-3 web:grid web:grid-cols-1 web:md:grid-cols-2">
                        {heroRows.map((row) => (
                          <DetailMetric
                            key={`hero-${row.label}`}
                            label={row.label}
                            value={row.value}
                          />
                        ))}
                      </View>
                    </View>

                    <View className="rounded-xl border border-border bg-baseBg/30 p-4 gap-3">
                      <Text className="text-sm font-semibold text-textMain">
                        Operational pulse
                      </Text>
                      <PulseMetric
                        label="Certificates at risk"
                        value={String(certificatesAtRisk)}
                        tone={certificatesAtRisk > 0 ? "fail" : "success"}
                      />
                      <PulseMetric
                        label="Crew active"
                        value={`${summary.crew.active}/${summary.crew.total}`}
                        tone={summary.crew.active > 0 ? "success" : "neutral"}
                      />
                      <PulseMetric
                        label="Maintenance attention"
                        value={String(
                          summary.maintenance.overdue +
                            summary.maintenance.open,
                        )}
                        tone={
                          summary.maintenance.overdue > 0
                            ? "fail"
                            : summary.maintenance.open > 0
                              ? "warn"
                              : "success"
                        }
                      />
                      <PulseMetric
                        label="Last fuel event"
                        value={fuelLabel}
                        tone={summary.fuel.total > 0 ? "success" : "neutral"}
                      />
                    </View>
                  </View>
                </View>
              </OverviewPanel>
            </View>

            <View className="web:col-span-1 web:md:col-span-2 web:2xl:col-span-2">
              <OverviewPanel
                title={moduleCards[0].title}
                description={moduleCards[0].subtitle}
              >
                <ModuleSummary
                  rows={moduleCards[0].rows}
                  actionLabel={moduleCards[0].cta}
                  onPress={() => router.push(moduleCards[0].href)}
                />
              </OverviewPanel>
            </View>

            <View className="web:col-span-1 web:md:col-span-2 web:2xl:col-span-4">
              <OverviewPanel
                title="Vessel profile snapshot"
                description="Client-friendly vessel details surfaced in one place."
              >
                <View className="gap-3 web:grid web:grid-cols-1 web:md:grid-cols-2">
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

            <View className="web:col-span-1 web:md:col-span-2 web:2xl:col-span-3">
              <OverviewPanel
                title={moduleCards[1].title}
                description={moduleCards[1].subtitle}
              >
                <ModuleSummary
                  rows={moduleCards[1].rows}
                  actionLabel={moduleCards[1].cta}
                  onPress={() => router.push(moduleCards[1].href)}
                />
              </OverviewPanel>
            </View>

            <View className="web:col-span-1 web:md:col-span-2 web:2xl:col-span-3">
              <OverviewPanel
                title={moduleCards[2].title}
                description={moduleCards[2].subtitle}
              >
                <ModuleSummary
                  rows={moduleCards[2].rows}
                  actionLabel={moduleCards[2].cta}
                  onPress={() => router.push(moduleCards[2].href)}
                />
              </OverviewPanel>
            </View>
          </View>
        </View>

        <View className="web:w-full web:gap-4 web:flex web:flex-col web:lg:w-[360px] web:lg:min-w-[340px] web:lg:max-w-[420px]">
          <View className={LATERAL_HEIGHT}>
            <OverviewPanel
              title="Fuel"
              description="Latest event and basic fuel context for this vessel."
              fullHeight
            >
              <ModuleSummary
                rows={[
                  { label: "Events", value: String(summary.fuel.total) },
                  { label: "Last event type", value: fuelLabel },
                  {
                    label: "Last event date",
                    value: formatDate(summary.fuel.lastEventAt),
                  },
                ]}
                actionLabel="Open fuel"
                onPress={() =>
                  router.push(`/projects/${projectId}/vessels/${assetId}/fuel`)
                }
              />
            </OverviewPanel>
          </View>

          <View className={LATERAL_HEIGHT}>
            <OverviewPanel
              title="Vessel context"
              description="Actions and timestamps anchored to this asset."
              fullHeight
            >
              <View className="flex-1 justify-between gap-4">
                <View className="gap-3">
                  <DetailMetric label="Project" value={projectName} />
                  <DetailMetric
                    label="Status"
                    value={humanizeTechnicalLabel(vessel.status)}
                  />
                  <DetailMetric
                    label="Summary refreshed"
                    value={formatDate(summary.updatedAt)}
                  />
                </View>

                <View className="gap-2">
                  <Button
                    variant="softAccent"
                    size="sm"
                    onPress={() =>
                      router.push(
                        `/projects/${projectId}/vessels/${assetId}/edit`,
                      )
                    }
                  >
                    Edit vessel profile
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() =>
                      router.push(`/projects/${projectId}/dashboard`)
                    }
                  >
                    Back to project dashboard
                  </Button>
                </View>
              </View>
            </OverviewPanel>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="gap-4">
      <OverviewPanel
        title="Vessel overview"
        description="Single-asset operational snapshot aligned with the same dashboard language used at project level."
      >
        <View className="gap-3">
          {heroRows.map((row) => (
            <DetailMetric
              key={`mobile-hero-${row.label}`}
              label={row.label}
              value={row.value}
            />
          ))}
        </View>
      </OverviewPanel>

      <OverviewPanel title="Operational pulse">
        <View className="gap-3">
          <PulseMetric
            label="Certificates at risk"
            value={String(certificatesAtRisk)}
            tone={certificatesAtRisk > 0 ? "fail" : "success"}
          />
          <PulseMetric
            label="Crew active"
            value={`${summary.crew.active}/${summary.crew.total}`}
            tone={summary.crew.active > 0 ? "success" : "neutral"}
          />
          <PulseMetric
            label="Maintenance attention"
            value={String(
              summary.maintenance.overdue + summary.maintenance.open,
            )}
            tone={
              summary.maintenance.overdue > 0
                ? "fail"
                : summary.maintenance.open > 0
                  ? "warn"
                  : "success"
            }
          />
          <PulseMetric
            label="Last fuel event"
            value={fuelLabel}
            tone={summary.fuel.total > 0 ? "success" : "neutral"}
          />
        </View>
      </OverviewPanel>

      {moduleCards.map((card) => (
        <OverviewPanel
          key={card.title}
          title={card.title}
          description={card.subtitle}
        >
          <ModuleSummary
            rows={card.rows}
            actionLabel={card.cta}
            onPress={() => router.push(card.href)}
          />
        </OverviewPanel>
      ))}

      <OverviewPanel
        title="Fuel"
        description="Latest event and basic fuel context for this vessel."
      >
        <ModuleSummary
          rows={[
            { label: "Events", value: String(summary.fuel.total) },
            { label: "Last event type", value: fuelLabel },
            {
              label: "Last event date",
              value: formatDate(summary.fuel.lastEventAt),
            },
          ]}
          actionLabel="Open fuel"
          onPress={() =>
            router.push(`/projects/${projectId}/vessels/${assetId}/fuel`)
          }
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
  flush?: boolean;
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
        className={[
          props.flush ? "flex-1" : "flex-1 px-4 py-4",
          props.fullHeight ? "h-full" : "",
        ].join(" ")}
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

function PulseMetric(props: {
  label: string;
  value: string;
  tone: "success" | "warn" | "fail" | "neutral";
}) {
  return (
    <View className="rounded-xl border border-border bg-baseBg/25 px-4 py-3 gap-1">
      <Text className="text-[12px] text-muted">{props.label}</Text>
      <Text
        className={["text-[18px] font-semibold", toneClasses(props.tone)].join(
          " ",
        )}
      >
        {props.value}
      </Text>
    </View>
  );
}

function toneClasses(tone: "success" | "warn" | "fail" | "neutral") {
  switch (tone) {
    case "success":
      return "text-success";
    case "warn":
      return "text-warning";
    case "fail":
      return "text-destructive";
    case "neutral":
    default:
      return "text-textMain";
  }
}
