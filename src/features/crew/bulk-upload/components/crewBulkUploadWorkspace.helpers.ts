import type {
  CrewBulkUploadSessionSummaryDto,
  CrewBulkUploadSessionStatus,
} from "../contracts/crewBulkUpload.contract";

export function formatSessionTimestamp(value: string) {
  return new Date(value).toLocaleString();
}

export function describeSessionOutcome(
  session: Pick<
    CrewBulkUploadSessionSummaryDto,
    | "status"
    | "createdCount"
    | "updatedCount"
    | "skippedCount"
    | "warningCount"
    | "criticalCount"
  >,
) {
  switch (session.status) {
    case "COMMITTED":
      return `${session.createdCount} created | ${session.updatedCount} updated | ${session.skippedCount} skipped`;
    case "DISCARDED":
      return "Discarded session kept only for traceability";
    case "READY_FOR_REVIEW":
    default:
      return `${session.criticalCount} critical | ${session.warningCount} warnings before commit`;
  }
}

export function describeSessionTrace(
  session: Pick<
    CrewBulkUploadSessionSummaryDto,
    "status" | "committedAt" | "discardedAt"
  >,
) {
  if (session.status === "COMMITTED") {
    return session.committedAt
      ? `Committed ${formatSessionTimestamp(session.committedAt)}`
      : "Committed to crew records";
  }

  if (session.status === "DISCARDED") {
    return session.discardedAt
      ? `Discarded ${formatSessionTimestamp(session.discardedAt)}`
      : "Retained only as traceability";
  }

  return "Awaiting final review decision";
}

export function getPendingCriticalCount(
  sessions: CrewBulkUploadSessionSummaryDto[],
) {
  return sessions
    .filter((session) => session.status === "READY_FOR_REVIEW")
    .reduce((sum, session) => sum + session.criticalCount, 0);
}

export function getSessionCountByStatus(
  sessions: CrewBulkUploadSessionSummaryDto[],
  status: CrewBulkUploadSessionStatus,
) {
  return sessions.filter((session) => session.status === status).length;
}

export function getCrewBulkUploadSummaryItems(
  sessions: CrewBulkUploadSessionSummaryDto[],
) {
  const readyForReviewCount = getSessionCountByStatus(
    sessions,
    "READY_FOR_REVIEW",
  );
  const committedCount = getSessionCountByStatus(sessions, "COMMITTED");
  const pendingCriticalCount = getPendingCriticalCount(sessions);

  return [
    {
      label: "Sessions",
      value: String(sessions.length),
      helper: "bulk uploads created",
      tone: "accent" as const,
    },
    {
      label: "Ready for review",
      value: String(readyForReviewCount),
      helper: "need a final commit decision",
      tone: readyForReviewCount > 0 ? ("warn" as const) : ("ok" as const),
    },
    {
      label: "Committed",
      value: String(committedCount),
      helper: "already applied to crew records",
      tone: committedCount > 0 ? ("ok" as const) : ("accent" as const),
    },
    {
      label: "Critical before commit",
      value: String(pendingCriticalCount),
      helper: "counted only across open review sessions",
      tone: pendingCriticalCount > 0 ? ("danger" as const) : ("ok" as const),
    },
  ];
}
