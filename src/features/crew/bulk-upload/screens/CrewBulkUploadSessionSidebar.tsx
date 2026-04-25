import { Button } from "@/src/components";
import { RegistryWorkspaceSection } from "@/src/components/ui/registryWorkspace";
import { RegistryTablePill } from "@/src/components/ui/table";
import { Text } from "@/src/components/ui/text/Text";
import { View } from "react-native";
import type {
  CrewBulkUploadAuditTrailEvent,
  CrewBulkUploadCommitSummary,
  CrewBulkUploadRevisionSummary,
  CrewBulkUploadSessionDto,
  CrewBulkUploadSessionMeta,
} from "../contracts/crewBulkUpload.contract";
import {
  formatDateTime,
  requirementsRefreshMessage,
  requirementsRefreshTone,
  sessionStatusTone,
  titleCaseStatus,
} from "./crewBulkUploadSession.helpers";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between gap-4">
      <Text className="flex-1 text-[12px] text-muted">{label}</Text>
      <Text className="max-w-[220px] text-right text-[12px] font-semibold text-textMain">
        {value}
      </Text>
    </View>
  );
}

type TimelineTone = "accent" | "ok" | "warn" | "info" | "danger";

function timelineToneClasses(tone: TimelineTone) {
  switch (tone) {
    case "ok":
      return {
        dot: "bg-emerald-300",
        chipSurface: "border-emerald-400/25 bg-emerald-400/10",
        chipText: "text-emerald-100",
      };
    case "warn":
      return {
        dot: "bg-amber-300",
        chipSurface: "border-amber-300/25 bg-amber-300/10",
        chipText: "text-amber-100",
      };
    case "danger":
      return {
        dot: "bg-rose-300",
        chipSurface: "border-rose-400/25 bg-rose-400/10",
        chipText: "text-rose-100",
      };
    case "info":
      return {
        dot: "bg-sky-300",
        chipSurface: "border-sky-400/25 bg-sky-400/10",
        chipText: "text-sky-100",
      };
    case "accent":
    default:
      return {
        dot: "bg-accent",
        chipSurface: "border-accent/30 bg-accent/12",
        chipText: "text-accent",
      };
  }
}

function TimelineItem({
  badgeLabel,
  badgeTone,
  title,
  metadata,
  timestamp,
  detail,
  showConnector,
}: {
  badgeLabel: string;
  badgeTone: TimelineTone;
  title: string;
  metadata?: string | null;
  timestamp: string;
  detail?: string | null;
  showConnector: boolean;
}) {
  const tone = timelineToneClasses(badgeTone);

  return (
    <View className="relative pl-8">
      <View className="absolute left-[7px] top-[10px] h-4 w-4 items-center justify-center rounded-full border border-shellLine bg-shellPanel">
        <View className={["h-2.5 w-2.5 rounded-full", tone.dot].join(" ")} />
      </View>

      {showConnector ? (
        <View className="absolute bottom-0 left-[14px] top-[28px] w-px bg-shellLine" />
      ) : null}

      <View className={["gap-2", showConnector ? "pb-4" : ""].join(" ")}>
        <View className="flex-row flex-wrap items-start justify-between gap-3">
          <View
            className={[
              "self-start rounded-full border px-2.5 py-1",
              tone.chipSurface,
            ].join(" ")}
          >
            <Text
              className={[
                "text-[10px] font-semibold uppercase tracking-[0.14em]",
                tone.chipText,
              ].join(" ")}
            >
              {badgeLabel}
            </Text>
          </View>

          <Text className="text-[11px] text-muted">{timestamp}</Text>
        </View>

        <View className="gap-1.5">
          <Text className="text-[13px] font-semibold leading-[19px] text-textMain">
            {title}
          </Text>
          {metadata ? (
            <Text className="text-[12px] leading-[18px] text-muted">
              {metadata}
            </Text>
          ) : null}
          {detail ? (
            <Text className="text-[12px] leading-[18px] text-muted">
              {detail}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function revisionTone(revision: CrewBulkUploadRevisionSummary): TimelineTone {
  if (revision.criticalCount > 0) return "warn";
  if (revision.revisionNumber === 1) return "accent";
  return "info";
}

function auditEventTone(event: CrewBulkUploadAuditTrailEvent): TimelineTone {
  const type = event.eventType.toUpperCase();

  if (type.includes("COMMIT")) return "ok";
  if (type.includes("DISCARD")) return "danger";
  if (type.includes("REUPLOAD") || type.includes("REPLACE")) return "warn";
  if (type.includes("CREATE")) return "accent";
  return "info";
}

type Props = {
  currentSession: CrewBulkUploadSessionDto;
  actionError: string | null;
  actionLoading: boolean;
  duplicatePolicy: CrewBulkUploadSessionMeta["duplicatePolicy"] | null;
  revisionHistory: CrewBulkUploadRevisionSummary[];
  auditTrail: CrewBulkUploadAuditTrailEvent[];
  commitSummary: CrewBulkUploadCommitSummary | null;
  onReupload: () => void;
};

export function CrewBulkUploadSessionSidebar({
  currentSession,
  actionError,
  actionLoading,
  duplicatePolicy,
  revisionHistory,
  auditTrail,
  commitSummary,
  onReupload,
}: Props) {
  const latestRevision = revisionHistory[0] ?? null;

  return (
    <View className="w-full gap-5 web:xl:w-[390px]">
      <RegistryWorkspaceSection
        title="Session control"
        subtitle="Track the live state of this review lane before anyone commits or discards it."
        actions={
          <RegistryTablePill
            label={titleCaseStatus(currentSession.status)}
            tone={sessionStatusTone(currentSession.status)}
          />
        }
      >
        <View className="gap-3">
          <DetailRow label="File" value={currentSession.sourceFileName} />
          <DetailRow
            label="Status"
            value={titleCaseStatus(currentSession.status)}
          />
          <DetailRow
            label="Revision"
            value={String(currentSession.revisionNumber)}
          />
          <DetailRow
            label="Default vessel"
            value={currentSession.defaultAssetName ?? "Not set"}
          />
          <DetailRow
            label="Template version"
            value={currentSession.templateVersion ?? "Unknown"}
          />
          <DetailRow
            label="Created"
            value={formatDateTime(currentSession.createdAt)}
          />
          <DetailRow
            label="Last update"
            value={formatDateTime(currentSession.updatedAt)}
          />
          {latestRevision ? (
            <DetailRow
              label="Latest workbook revision"
              value={`Revision ${latestRevision.revisionNumber}`}
            />
          ) : null}
          {actionError ? (
            <Text className="text-[12px] text-destructive">{actionError}</Text>
          ) : null}
        </View>
      </RegistryWorkspaceSection>

      {currentSession.status === "READY_FOR_REVIEW" ? (
        <RegistryWorkspaceSection
          title="Correct same session"
          subtitle="Replace the workbook here when the client sends a corrected file. The session id stays stable and the revision chain keeps the review trace."
        >
          <View className="gap-4">
            <Text className="text-[12px] leading-[18px] text-muted">
              Current default vessel reuse:{" "}
              {currentSession.defaultAssetName ?? "None selected"}
            </Text>
            <Button
              variant="softAccent"
              size="pillSm"
              className="self-start rounded-full"
              onPress={onReupload}
              loading={actionLoading}
            >
              Replace workbook in this session
            </Button>
          </View>
        </RegistryWorkspaceSection>
      ) : null}

      {duplicatePolicy ? (
        <RegistryWorkspaceSection
          title="Duplicate handling policy"
          subtitle="Business guardrails the parser applied while deciding whether a row can create, update, or must stay under review."
        >
          <View className="gap-3">
            <DetailRow
              label="Unique match"
              value={duplicatePolicy.uniqueIdentityMatch ?? "--"}
            />
            <DetailRow
              label="Ambiguous match"
              value={duplicatePolicy.ambiguousIdentityMatch ?? "--"}
            />
            <DetailRow
              label="Workbook duplicate"
              value={duplicatePolicy.workbookDuplicateIdentity ?? "--"}
            />
            <DetailRow
              label="Weak identity"
              value={duplicatePolicy.weakIdentityNoMatch ?? "--"}
            />
            <DetailRow
              label="Certificate rows"
              value={duplicatePolicy.certificateRows ?? "--"}
            />
          </View>
        </RegistryWorkspaceSection>
      ) : null}

      {revisionHistory.length > 0 ? (
        <RegistryWorkspaceSection
          title="Revision history"
          subtitle="Every corrected workbook stays attached to this same session so the reviewer can see what changed over time."
        >
          <View className="relative gap-0">
            {revisionHistory.map((revision, index) => (
              <TimelineItem
                key={`${revision.revisionNumber}-${revision.uploadedAt}`}
                badgeLabel={`Revision ${revision.revisionNumber}`}
                badgeTone={revisionTone(revision)}
                title={revision.sourceFileName}
                metadata={
                  revision.defaultAssetName
                    ? `Default vessel: ${revision.defaultAssetName}`
                    : "No default vessel pinned for this revision"
                }
                timestamp={formatDateTime(revision.uploadedAt)}
                detail={`${revision.totalRows} rows | ${revision.crewRows} crew | ${revision.certificateRows} certificates${
                  revision.criticalCount > 0
                    ? ` | ${revision.criticalCount} critical`
                    : " | no critical issues"
                }`}
                showConnector={index < revisionHistory.length - 1}
              />
            ))}
          </View>
        </RegistryWorkspaceSection>
      ) : null}

      {auditTrail.length > 0 ? (
        <RegistryWorkspaceSection
          title="Session audit"
          subtitle="Operational events recorded inside the same upload session."
        >
          <View className="relative gap-0">
            {auditTrail.slice(0, 5).map((event, index, list) => (
              <TimelineItem
                key={`${event.eventType}-${event.at}-${index}`}
                badgeLabel={titleCaseStatus(event.eventType)}
                badgeTone={auditEventTone(event)}
                title={event.message}
                timestamp={formatDateTime(event.at)}
                showConnector={index < list.length - 1}
              />
            ))}
          </View>
        </RegistryWorkspaceSection>
      ) : null}

      {currentSession.status === "COMMITTED" && commitSummary ? (
        <RegistryWorkspaceSection
          title="Commit outcome"
          subtitle="Crew rows changed the real roster only after this session passed review."
        >
          <View className="gap-3">
            <Text className="text-[13px] text-muted">
              {commitSummary.createdCount} created - {commitSummary.updatedCount} updated -{" "}
              {commitSummary.skippedCount} skipped
            </Text>
            <Text
              className={`text-[13px] leading-[20px] ${requirementsRefreshTone(commitSummary.requirementsRefresh)}`}
            >
              {requirementsRefreshMessage(commitSummary.requirementsRefresh)}
            </Text>
          </View>
        </RegistryWorkspaceSection>
      ) : null}

      {currentSession.status === "DISCARDED" ? (
        <RegistryWorkspaceSection
          title="Session discarded"
          subtitle="This session stays visible only as traceability. Start a new upload from the workspace when the workbook has been corrected."
        >
          <Text className="text-[12px] leading-[18px] text-muted">
            No crew data was committed from this session, but the review trail
            remains visible for operational follow-up.
          </Text>
        </RegistryWorkspaceSection>
      ) : null}
    </View>
  );
}
