import type { RegistrySummaryItem } from "@/src/components/ui/registryWorkspace";
import type {
  CrewBulkUploadCommitSummary,
  CrewBulkUploadIssueDto,
  CrewBulkUploadRowAction,
  CrewBulkUploadRowCommitStatus,
  CrewBulkUploadSessionDto,
  CrewBulkUploadSessionStatus,
} from "../contracts/crewBulkUpload.contract";

type PillTone = "ok" | "warn" | "info" | "danger" | "accent" | "neutral";

export function formatDateTime(value: string | null) {
  if (!value) return "--";
  return new Date(value).toLocaleString();
}

export function titleCaseStatus(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/(^|\s)\w/g, (match) => match.toUpperCase());
}

export function readNormalizedText(
  row: { normalizedData: Record<string, unknown> | null },
  key: string,
) {
  const value = row.normalizedData?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function issueCounts(issues: CrewBulkUploadIssueDto[]) {
  return issues.reduce(
    (accumulator, issue) => {
      if (issue.severity === "CRITICAL") accumulator.critical += 1;
      if (issue.severity === "WARNING") accumulator.warning += 1;
      if (issue.severity === "INFO") accumulator.info += 1;
      return accumulator;
    },
    { critical: 0, warning: 0, info: 0 },
  );
}

export function summarizeIssues(issues: CrewBulkUploadIssueDto[]) {
  if (issues.length === 0) return "Clear";

  const counts = issueCounts(issues);
  const parts = [
    counts.critical ? `${counts.critical} critical` : null,
    counts.warning ? `${counts.warning} warning` : null,
    counts.info ? `${counts.info} info` : null,
  ].filter(Boolean);

  return parts.join(" - ");
}

export function firstIssueMessage(issues: CrewBulkUploadIssueDto[]) {
  if (issues.length === 0) return "Ready to commit if the session is approved.";
  return issues[0].message;
}

export function actionTone(action: CrewBulkUploadRowAction): PillTone {
  switch (action) {
    case "CREATE":
      return "ok";
    case "UPDATE":
      return "warn";
    case "REVIEW":
      return "danger";
    case "SKIP":
    default:
      return "neutral";
  }
}

export function commitTone(status: CrewBulkUploadRowCommitStatus): PillTone {
  switch (status) {
    case "COMMITTED":
      return "ok";
    case "SKIPPED":
      return "neutral";
    case "PENDING":
    default:
      return "accent";
  }
}

export function issueTone(issues: CrewBulkUploadIssueDto[]) {
  if (issues.some((issue) => issue.severity === "CRITICAL")) {
    return "text-destructive";
  }

  if (issues.some((issue) => issue.severity === "WARNING")) {
    return "text-warning";
  }

  return "text-success";
}

export function sessionStatusTone(
  status: CrewBulkUploadSessionStatus,
): RegistrySummaryItem["tone"] {
  switch (status) {
    case "COMMITTED":
      return "ok";
    case "DISCARDED":
      return "info";
    case "READY_FOR_REVIEW":
    default:
      return "warn";
  }
}

export function sessionStatusHelper(status: CrewBulkUploadSessionStatus) {
  switch (status) {
    case "COMMITTED":
      return "crew rows already applied to live records";
    case "DISCARDED":
      return "traceability only, no crew data committed";
    case "READY_FOR_REVIEW":
    default:
      return "waiting for final review decision";
  }
}

export function getSessionSummaryItems(
  session: CrewBulkUploadSessionDto,
): RegistrySummaryItem[] {
  return [
    {
      label: "Session state",
      value: titleCaseStatus(session.status),
      helper: sessionStatusHelper(session.status),
      tone: sessionStatusTone(session.status),
    },
    {
      label: "Crew rows",
      value: String(session.crewRows),
      helper: "eligible for real roster changes",
      tone: session.crewRows > 0 ? "accent" : "neutral",
    },
    {
      label: "Certificate preview",
      value: String(session.certificateRows),
      helper: "validated here, not committed in this lane",
      tone: session.certificateRows > 0 ? "info" : "neutral",
    },
    {
      label: "Revision",
      value: String(session.revisionNumber),
      helper: "same session corrected over time",
      tone: session.revisionNumber > 1 ? "accent" : "info",
    },
    {
      label: "Critical",
      value: String(session.criticalCount),
      helper: "block commit until resolved",
      tone: session.criticalCount > 0 ? "danger" : "ok",
    },
  ];
}

export function requirementsRefreshTone(
  status?: CrewBulkUploadCommitSummary["requirementsRefresh"],
) {
  switch (status) {
    case "DONE":
      return "text-success";
    case "FAILED":
      return "text-warning";
    default:
      return "text-muted";
  }
}

export function requirementsRefreshMessage(
  status?: CrewBulkUploadCommitSummary["requirementsRefresh"],
) {
  switch (status) {
    case "DONE":
      return "Crew certificate requirements were refreshed after commit.";
    case "FAILED":
      return "Crew rows were committed, but the requirements refresh failed. Open crew certificates and trigger a refresh before relying on compliance totals.";
    default:
      return "Crew rows were committed. Requirements refresh is still pending confirmation.";
  }
}
