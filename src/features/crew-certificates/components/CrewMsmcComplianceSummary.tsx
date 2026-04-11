import { Button, Text } from "@/src/components";
import { View } from "react-native";
import type { CrewComplianceSummaryDto } from "../contracts";

type Props = {
  title?: string;
  summaries: CrewComplianceSummaryDto[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

const RISK_BADGE_CLASSES: Record<CrewComplianceSummaryDto["riskLevel"], string> = {
  UNKNOWN: "border-shellLine bg-shellGlass text-muted",
  LOW: "border-success/30 bg-success/10 text-success",
  MEDIUM: "border-warning/30 bg-warning/10 text-warning",
  HIGH: "border-destructive/30 bg-destructive/10 text-destructive",
  CRITICAL: "border-destructive/40 bg-destructive/15 text-destructive",
};

export function CrewMsmcComplianceSummary({
  title = "MSMC crew compliance",
  summaries,
  loading = false,
  error = null,
  onRetry,
}: Props) {
  const configuredCount = summaries.filter((summary) => summary.msmcConfigured).length;
  const worstSummary =
    summaries.find((summary) => ["CRITICAL", "HIGH"].includes(summary.riskLevel)) ??
    summaries[0];

  return (
    <View className="rounded-[24px] border border-shellLine bg-shellPanelSoft p-4 gap-4">
      <View className="gap-1">
        <Text className="text-textMain font-semibold text-[15px]">{title}</Text>
        <Text className="text-muted text-[12px] leading-[18px]">
          MSMC is treated as vessel-specific and flag-specific. Vessels without
          MSMC configured keep using the v1 rank-based fallback.
        </Text>
      </View>

      {loading ? (
        <Text className="text-muted text-[12px]">Loading MSMC compliance...</Text>
      ) : null}

      {error ? (
        <View className="gap-2">
          <Text className="text-destructive text-[12px]">{error}</Text>
          {onRetry ? (
            <Button
              variant="outline"
              size="sm"
              onPress={onRetry}
              className="self-start rounded-full"
            >
              Retry MSMC summary
            </Button>
          ) : null}
        </View>
      ) : null}

      {!loading && !error && summaries.length === 0 ? (
        <Text className="text-muted text-[12px]">
          No vessel summary is available yet.
        </Text>
      ) : null}

      {worstSummary ? (
        <View className="gap-3">
          <View className="flex-row flex-wrap gap-2">
            <SummaryPill label="Configured" value={`${configuredCount}/${summaries.length}`} />
            <SummaryPill
              label="Crew"
              value={`${worstSummary.currentCrewCount}/${worstSummary.totalMinimumCrew ?? "-"}`}
            />
            <SummaryPill
              label="Score"
              value={
                worstSummary.crewComplianceScore === null
                  ? "-"
                  : String(worstSummary.crewComplianceScore)
              }
            />
            <Text
              className={[
                "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[1px]",
                RISK_BADGE_CLASSES[worstSummary.riskLevel],
              ].join(" ")}
            >
              {worstSummary.riskLevel}
            </Text>
          </View>

          <View className="gap-2">
            {summaries.slice(0, 3).map((summary) => (
              <VesselSummaryRow key={summary.assetId} summary={summary} />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <View className="rounded-full border border-shellLine bg-shellGlass px-3 py-1">
      <Text className="text-muted text-[11px]">
        {label}: <Text className="text-textMain font-semibold">{value}</Text>
      </Text>
    </View>
  );
}

function VesselSummaryRow({ summary }: { summary: CrewComplianceSummaryDto }) {
  const primaryIssue = summary.issues[0]?.message ?? "No open MSMC issues.";
  const missingRoles = summary.roleGaps.filter((gap) => gap.missingCount > 0);

  return (
    <View className="rounded-[18px] border border-shellLine bg-shellGlass p-3 gap-2">
      <View className="flex-row flex-wrap items-center justify-between gap-2">
        <View className="gap-1">
          <Text className="text-textMain font-semibold text-[13px]">
            {summary.assetName}
          </Text>
          <Text className="text-muted text-[11px]">
            Flag: {summary.flagState ?? summary.vesselProfileFlag ?? "Not configured"} |
            Source: {summary.fallbackMode}
          </Text>
        </View>
        <Text
          className={[
            "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[1px]",
            RISK_BADGE_CLASSES[summary.riskLevel],
          ].join(" ")}
        >
          {summary.riskLevel}
        </Text>
      </View>

      <Text className="text-muted text-[12px] leading-[18px]">{primaryIssue}</Text>

      {missingRoles.length > 0 ? (
        <Text className="text-warning text-[12px]">
          Missing roles: {missingRoles.map((gap) => gap.role).join(", ")}
        </Text>
      ) : null}
    </View>
  );
}
