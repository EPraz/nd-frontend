import {
  DataTable,
  RegistryTablePill,
  RegistryTableTextStack,
  type Column,
} from "@/src/components/ui/table";
import { RegistrySummaryStrip } from "@/src/components/ui/registryWorkspace";
import { Text } from "@/src/components/ui/text/Text";
import { humanizeTechnicalLabel } from "@/src/helpers";
import { useMemo } from "react";
import type { CrewComplianceSummaryDto } from "../contracts";

type Props = {
  title?: string;
  summaries: CrewComplianceSummaryDto[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

function getRiskTone(riskLevel: CrewComplianceSummaryDto["riskLevel"]) {
  switch (riskLevel) {
    case "LOW":
      return "ok" as const;
    case "MEDIUM":
      return "warn" as const;
    case "HIGH":
    case "CRITICAL":
      return "danger" as const;
    case "UNKNOWN":
    default:
      return "neutral" as const;
  }
}

function getFallbackTone(mode: CrewComplianceSummaryDto["fallbackMode"]) {
  return mode === "MSMC" ? ("ok" as const) : ("warn" as const);
}

export function CrewMsmcComplianceSummary({
  title = "Fleet safe manning overview",
  summaries,
  loading = false,
  error = null,
  onRetry = () => undefined,
}: Props) {
  const summaryItems = useMemo(() => {
    const configuredCount = summaries.filter(
      (summary) => summary.msmcConfigured,
    ).length;
    const fallbackCount = summaries.filter(
      (summary) => summary.fallbackMode === "V1_RULES",
    ).length;
    const atRiskCount = summaries.filter((summary) =>
      ["HIGH", "CRITICAL"].includes(summary.riskLevel),
    ).length;

    return [
      {
        label: "Vessels tracked",
        value: String(summaries.length),
        helper: "crew compliance summaries available",
        tone: "accent" as const,
      },
      {
        label: "MSMC configured",
        value: String(configuredCount),
        helper: "using vessel-specific safe manning",
        tone: configuredCount > 0 ? ("ok" as const) : ("warn" as const),
      },
      {
        label: "Fallback active",
        value: String(fallbackCount),
        helper: "using rank-based v1 rules",
        tone: fallbackCount > 0 ? ("warn" as const) : ("ok" as const),
      },
      {
        label: "At risk",
        value: String(atRiskCount),
        helper: "high or critical vessel summaries",
        tone: atRiskCount > 0 ? ("danger" as const) : ("ok" as const),
      },
    ];
  }, [summaries]);

  const rows = useMemo(() => {
    const severityOrder = {
      CRITICAL: 0,
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3,
      UNKNOWN: 4,
    } as const;

    return [...summaries].sort((left, right) => {
      if (left.riskLevel !== right.riskLevel) {
        return severityOrder[left.riskLevel] - severityOrder[right.riskLevel];
      }
      return left.assetName.localeCompare(right.assetName);
    });
  }, [summaries]);

  const columns = useMemo<Column<CrewComplianceSummaryDto>[]>(() => {
    return [
      {
        key: "vessel",
        header: "Vessel",
        flex: 1.6,
        render: (row) => (
          <RegistryTableTextStack
            primary={row.assetName}
            secondary={`Flag: ${row.flagState ?? row.vesselProfileFlag ?? "Not configured"}`}
          />
        ),
      },
      {
        key: "source",
        header: "Source",
        flex: 1,
        render: (row) => (
          <RegistryTablePill
            label={row.fallbackMode === "MSMC" ? "MSMC" : "V1 fallback"}
            tone={getFallbackTone(row.fallbackMode)}
          />
        ),
      },
      {
        key: "crew",
        header: "Crew Count",
        flex: 1.2,
        render: (row) => (
          <RegistryTableTextStack
            primary={`${row.currentCrewCount} / ${row.totalMinimumCrew ?? "-"}`}
            secondary="current vs minimum crew"
          />
        ),
      },
      {
        key: "risk",
        header: "Risk",
        flex: 0.9,
        render: (row) => (
          <RegistryTablePill
            label={humanizeTechnicalLabel(row.riskLevel)}
            tone={getRiskTone(row.riskLevel)}
          />
        ),
      },
      {
        key: "issue",
        header: "Open Focus",
        flex: 2.1,
        render: (row) => {
          const primaryIssue =
            row.issues[0]?.message ?? "No open safe manning issues.";
          const missingRoles = row.roleGaps.filter(
            (gap) => gap.missingCount > 0,
          ).length;

          return (
            <RegistryTableTextStack
              primary={primaryIssue}
              secondary={`${row.issues.length} issues | ${missingRoles} role gaps`}
            />
          );
        },
      },
    ];
  }, []);

  return (
    <DataTable<CrewComplianceSummaryDto>
      title={title}
      subtitleRight={`${summaries.length} vessels in fleet view`}
      toolbarContent={
        <DataTableSupportCopy
          description="Shows vessel-by-vessel safe manning risk. When a vessel has MSMC configured, compliance is measured against that document; otherwise the module falls back to v1 rank rules."
          summaryItems={summaryItems}
          loading={loading}
        />
      }
      data={rows}
      isLoading={loading}
      error={error}
      onRetry={onRetry}
      columns={columns}
      minWidth={1040}
      getRowId={(row) => row.assetId}
      emptyText="No fleet safe manning summary is available yet."
    />
  );
}

function DataTableSupportCopy({
  description,
  summaryItems,
  loading,
}: {
  description: string;
  loading: boolean;
  summaryItems: {
    label: string;
    value: string;
    helper: string;
    tone: "accent" | "ok" | "warn" | "danger";
  }[];
}) {
  return (
    <>
      <Text className="text-[13px] leading-[20px] text-muted">
        {description}
      </Text>
      <RegistrySummaryStrip items={summaryItems} loading={loading} />
    </>
  );
}
