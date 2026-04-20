import { Button, ErrorState, PageHeader, StatCard, Text } from "@/src/components";
import { DataTable } from "@/src/components/ui/table/DataTable";
import type { Column } from "@/src/components/ui/table/DataTable";
import { useToast } from "@/src/context";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import type {
  CrewBulkUploadAuditTrailEvent,
  CrewBulkUploadCommitSummary,
  CrewBulkUploadIssueDto,
  CrewBulkUploadRowAction,
  CrewBulkUploadRowCommitStatus,
  CrewBulkUploadRowDto,
} from "../contracts/crewBulkUpload.contract";
import { useCrewBulkUploadSession } from "../hooks/useCrewBulkUploadSession";
import { useCrewBulkUploadSessionActions } from "../hooks/useCrewBulkUploadSessionActions";

function formatDateTime(value: string | null) {
  if (!value) return "--";
  return new Date(value).toLocaleString();
}

function titleCaseStatus(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/(^|\s)\w/g, (match) => match.toUpperCase());
}

function readNormalizedText(row: CrewBulkUploadRowDto, key: string) {
  const value = row.normalizedData?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function issueCounts(issues: CrewBulkUploadIssueDto[]) {
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

function summarizeIssues(issues: CrewBulkUploadIssueDto[]) {
  if (issues.length === 0) return "Clear";

  const counts = issueCounts(issues);
  const parts = [
    counts.critical ? `${counts.critical} critical` : null,
    counts.warning ? `${counts.warning} warning` : null,
    counts.info ? `${counts.info} info` : null,
  ].filter(Boolean);

  return parts.join(" - ");
}

function firstIssueMessage(issues: CrewBulkUploadIssueDto[]) {
  if (issues.length === 0) return "Ready to commit if the session is approved.";
  return issues[0].message;
}

function pillToneForAction(action: CrewBulkUploadRowAction) {
  switch (action) {
    case "CREATE":
      return "border-success/30 bg-success/15 text-success";
    case "UPDATE":
      return "border-warning/30 bg-warning/15 text-warning";
    case "REVIEW":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    default:
      return "border-shellLine bg-shellPanelSoft text-muted";
  }
}

function pillToneForCommit(status: CrewBulkUploadRowCommitStatus) {
  switch (status) {
    case "COMMITTED":
      return "border-success/30 bg-success/15 text-success";
    case "SKIPPED":
      return "border-shellLine bg-shellPanelSoft text-muted";
    default:
      return "border-accent/30 bg-accent/10 text-accent";
  }
}

function requirementsRefreshTone(
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

function requirementsRefreshMessage(
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

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: string;
}) {
  return (
    <View className={`self-start rounded-full border px-3 py-1 ${tone}`}>
      <Text className="text-[10px] font-semibold uppercase tracking-[1.4px]">
        {label}
      </Text>
    </View>
  );
}

function Panel({
  title,
  description,
  children,
  tone = "border-shellLine bg-shellPanel",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  tone?: string;
}) {
  return (
    <View className={`gap-4 rounded-[20px] border p-5 ${tone}`}>
      <View className="gap-1">
        <Text className="text-[18px] font-semibold text-textMain">{title}</Text>
        {description ? (
          <Text className="text-[13px] leading-[20px] text-muted">
            {description}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function KeyValueRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start justify-between gap-4">
      <Text className="flex-1 text-[12px] text-muted">{label}</Text>
      <Text className="max-w-[210px] text-right text-[12px] font-semibold text-textMain">
        {value}
      </Text>
    </View>
  );
}

function AuditEventRow({ event }: { event: CrewBulkUploadAuditTrailEvent }) {
  return (
    <View className="gap-1 rounded-[16px] border border-shellLine bg-shellPanelSoft px-4 py-3">
      <Text className="text-[12px] font-semibold text-textMain">
        {titleCaseStatus(event.eventType)}
      </Text>
      <Text className="text-[12px] leading-[18px] text-muted">
        {event.message}
      </Text>
      <Text className="text-[11px] text-muted">{formatDateTime(event.at)}</Text>
    </View>
  );
}

export default function CrewBulkUploadSessionScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { projectId, sessionId } = useLocalSearchParams<{
    projectId: string;
    sessionId: string;
  }>();

  const pid = String(projectId);
  const sid = String(sessionId);

  const { session, loading, error, refresh, setSession } =
    useCrewBulkUploadSession(pid, sid);
  const {
    commit,
    discard,
    reupload,
    loading: actionLoading,
    error: actionError,
  } = useCrewBulkUploadSessionActions(pid, sid);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-shellCanvas">
        <Text className="text-muted">Loading session review...</Text>
      </View>
    );
  }

  if (error || !session) {
    return (
      <ErrorState
        message={error ?? "Bulk upload session not found"}
        onRetry={refresh}
      />
    );
  }

  const currentSession = session;
  const crewRows = currentSession.rows.filter((row) => row.rowKind === "CREW");
  const certificateRows = currentSession.rows.filter(
    (row) => row.rowKind === "CERTIFICATE",
  );
  const sheetSummary = currentSession.summary?.sheets ?? [];
  const previewOnlyKinds = currentSession.summary?.previewOnlyKinds ?? [];
  const duplicatePolicy = currentSession.summary?.duplicatePolicy ?? null;
  const revisionHistory = [...(currentSession.summary?.revisions ?? [])].sort(
    (left, right) => right.revisionNumber - left.revisionNumber,
  );
  const auditTrail = [...(currentSession.summary?.auditTrail ?? [])].sort(
    (left, right) =>
      new Date(right.at).getTime() - new Date(left.at).getTime(),
  );
  const latestRevision = revisionHistory[0] ?? null;
  const commitSummary = currentSession.summary?.commit ?? null;
  const blockingCrewRows = crewRows.filter((row) =>
    row.issues.some((issue) => issue.severity === "CRITICAL"),
  );
  const canCommit =
    currentSession.status === "READY_FOR_REVIEW" && blockingCrewRows.length === 0;

  async function onCommit() {
    try {
      const next = await commit();
      setSession(next);
      show("Bulk upload committed", "success");
    } catch {
      show("Failed to commit session", "error");
    }
  }

  async function onDiscard() {
    try {
      const next = await discard();
      setSession(next);
      show("Bulk upload session discarded", "success");
    } catch {
      show("Failed to discard session", "error");
    }
  }

  async function onReupload() {
    if (currentSession.status !== "READY_FOR_REVIEW") return;

    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || result.assets.length === 0) return;

    const asset = result.assets[0];

    try {
      const next = await reupload({
        defaultAssetId: currentSession.defaultAssetId ?? undefined,
        file: {
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType ?? "application/octet-stream",
          file: "file" in asset ? asset.file : undefined,
        },
      });
      setSession(next);
      show("Session updated with the corrected workbook", "success");
    } catch {
      show("Failed to replace workbook in this session", "error");
    }
  }

  const crewColumns: Column<CrewBulkUploadRowDto>[] = [
    {
      key: "row",
      header: "Crew row",
      flex: 1.25,
      render: (row) => (
        <View className="gap-0.5">
          <Text className="text-[12px] font-semibold text-textMain" numberOfLines={1}>
            {row.displayLabel ?? `Crew Row ${row.rowNumber}`}
          </Text>
          <Text className="text-[11px] text-muted">
            {row.sheetName} - Row {row.rowNumber}
          </Text>
        </View>
      ),
    },
    {
      key: "vessel",
      header: "Vessel",
      flex: 1.05,
      render: (row) => (
        <View className="gap-0.5">
          <Text className="text-[12px] font-semibold text-textMain" numberOfLines={1}>
            {row.matchedAssetName ?? readNormalizedText(row, "assetName") ?? "--"}
          </Text>
          <Text className="text-[11px] text-muted" numberOfLines={1}>
            {readNormalizedText(row, "vesselImo")
              ? `IMO ${readNormalizedText(row, "vesselImo")}`
              : readNormalizedText(row, "vesselLicenseNumber") ?? "Context required"}
          </Text>
        </View>
      ),
    },
    {
      key: "action",
      header: "Action",
      flex: 0.85,
      render: (row) => (
        <StatusPill
          label={row.proposedAction}
          tone={pillToneForAction(row.proposedAction)}
        />
      ),
    },
    {
      key: "match",
      header: "Match",
      flex: 1.1,
      render: (row) => (
        <View className="gap-0.5">
          <Text className="text-[12px] font-semibold text-textMain" numberOfLines={1}>
            {row.matchedCrewMemberName ??
              row.committedCrewMemberName ??
              "New crew profile"}
          </Text>
          <Text className="text-[11px] text-muted" numberOfLines={1}>
            {row.matchedCrewMemberName
              ? "Existing crew match"
              : row.committedCrewMemberName
                ? "Committed crew row"
                : "No existing identity match"}
          </Text>
        </View>
      ),
    },
    {
      key: "issues",
      header: "Issues",
      flex: 1.7,
      render: (row) => (
        <View className="gap-0.5">
          <Text
            className={[
              "text-[12px] font-semibold",
              row.issues.some((issue) => issue.severity === "CRITICAL")
                ? "text-destructive"
                : row.issues.some((issue) => issue.severity === "WARNING")
                  ? "text-warning"
                  : "text-success",
            ].join(" ")}
            numberOfLines={1}
          >
            {summarizeIssues(row.issues)}
          </Text>
          <Text className="text-[11px] text-muted" numberOfLines={1}>
            {firstIssueMessage(row.issues)}
          </Text>
        </View>
      ),
    },
    {
      key: "commit",
      header: "Commit",
      flex: 1,
      render: (row) => (
        <View className="gap-1">
          <StatusPill
            label={row.commitStatus}
            tone={pillToneForCommit(row.commitStatus)}
          />
          <Text className="text-[11px] text-muted" numberOfLines={1}>
            {row.committedCrewMemberName ?? "Pending session decision"}
          </Text>
        </View>
      ),
    },
  ];

  const certificateColumns: Column<CrewBulkUploadRowDto>[] = [
    {
      key: "row",
      header: "Certificate row",
      flex: 1.1,
      render: (row) => (
        <View className="gap-0.5">
          <Text className="text-[12px] font-semibold text-textMain" numberOfLines={1}>
            {row.displayLabel ?? `Certificate Row ${row.rowNumber}`}
          </Text>
          <Text className="text-[11px] text-muted">
            {row.sheetName} - Row {row.rowNumber}
          </Text>
        </View>
      ),
    },
    {
      key: "certificate",
      header: "Certificate",
      flex: 1.35,
      render: (row) => (
        <View className="gap-0.5">
          <Text className="text-[12px] font-semibold text-textMain" numberOfLines={1}>
            {readNormalizedText(row, "certificateType") ??
              "Certificate pending mapping"}
          </Text>
          <Text className="text-[11px] text-muted" numberOfLines={1}>
            {readNormalizedText(row, "certificateNumber") ?? "No number provided"}
          </Text>
        </View>
      ),
    },
    {
      key: "crewReference",
      header: "Crew reference",
      flex: 1.2,
      render: (row) => (
        <View className="gap-0.5">
          <Text className="text-[12px] font-semibold text-textMain" numberOfLines={1}>
            {readNormalizedText(row, "fullName") ?? "Crew match pending"}
          </Text>
          <Text className="text-[11px] text-muted" numberOfLines={1}>
            {readNormalizedText(row, "crewReference") ?? "No crew id in workbook"}
          </Text>
        </View>
      ),
    },
    {
      key: "issuer",
      header: "Issuer / dates",
      flex: 1.3,
      render: (row) => (
        <View className="gap-0.5">
          <Text className="text-[12px] font-semibold text-textMain" numberOfLines={1}>
            {readNormalizedText(row, "issuingAuthority") ?? "Issuer pending review"}
          </Text>
          <Text className="text-[11px] text-muted" numberOfLines={1}>
            Expiry {readNormalizedText(row, "expiryDate") ?? "not provided"}
          </Text>
        </View>
      ),
    },
    {
      key: "issues",
      header: "Issues",
      flex: 1.55,
      render: (row) => (
        <View className="gap-0.5">
          <Text
            className={[
              "text-[12px] font-semibold",
              row.issues.some((issue) => issue.severity === "CRITICAL")
                ? "text-destructive"
                : row.issues.some((issue) => issue.severity === "WARNING")
                  ? "text-warning"
                  : "text-muted",
            ].join(" ")}
            numberOfLines={1}
          >
            {summarizeIssues(row.issues)}
          </Text>
          <Text className="text-[11px] text-muted" numberOfLines={1}>
            {firstIssueMessage(row.issues)}
          </Text>
        </View>
      ),
    },
    {
      key: "mode",
      header: "Mode",
      flex: 0.85,
      render: () => (
        <StatusPill
          label="Preview"
          tone="border-accent/30 bg-accent/10 text-accent"
        />
      ),
    },
  ];

  return (
    <View className="flex-1 bg-shellCanvas">
      <ScrollView
        contentContainerClassName="gap-6 p-4 web:p-6 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Review Crew Bulk Upload Session"
          subTitle="Validate the parsed workbook, correct the same session when needed, and only commit crew data when the operational picture is safe."
          onRefresh={refresh}
          actions={
            <>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onPress={() => router.push(`/projects/${pid}/crew/bulk-upload`)}
              >
                Back to workspace
              </Button>

              {currentSession.status === "READY_FOR_REVIEW" ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onPress={onDiscard}
                    loading={actionLoading}
                  >
                    Discard session
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="rounded-full"
                    onPress={onCommit}
                    disabled={!canCommit}
                    loading={actionLoading}
                    rightIcon={
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={16}
                        className="text-textMain"
                      />
                    }
                  >
                    Commit crew data
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onPress={() => router.push(`/projects/${pid}/crew`)}
                  >
                    Open crew module
                  </Button>
                  {currentSession.status === "COMMITTED" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onPress={() => router.push(`/projects/${pid}/crew-certificates`)}
                    >
                      Open crew certificates
                    </Button>
                  ) : null}
                </>
              )}
            </>
          }
        />

        <View className="gap-2 xl:gap-5 flex flex-row flex-wrap items-center justify-start xl:justify-between">
          <StatCard
            iconName="documents-outline"
            iconLib="ion"
            title="Rows"
            value={String(currentSession.totalRows)}
            suffix="parsed in this session"
          />
          <StatCard
            iconName="people-outline"
            iconLib="ion"
            title="Crew rows"
            value={String(currentSession.crewRows)}
            suffix="eligible for commit"
          />
          <StatCard
            iconName="git-compare-outline"
            iconLib="ion"
            title="Revision"
            value={String(currentSession.revisionNumber)}
            suffix="same session, corrected over time"
          />
          <StatCard
            iconName="alert-circle-outline"
            iconLib="ion"
            title="Critical"
            value={String(currentSession.criticalCount)}
            suffix="block commit until resolved"
          />
        </View>

        <View className="gap-5 web:xl:flex-row web:items-start">
          <View className="min-w-0 flex-[1.45] gap-5">
            {currentSession.status === "READY_FOR_REVIEW" &&
            blockingCrewRows.length > 0 ? (
              <Panel
                title="Commit is blocked"
                description={`${blockingCrewRows.length} crew row${blockingCrewRows.length === 1 ? "" : "s"} still have critical issues. Correct this same session or discard it before trying to commit.`}
                tone="border-destructive/30 bg-destructive/10"
              >
                <Text className="text-[12px] leading-[18px] text-destructive">
                  The commit action stays disabled until the critical crew rows
                  are removed from the workbook or reuploaded with corrected
                  identity, vessel, or rank data.
                </Text>
              </Panel>
            ) : null}

            <Panel
              title="Parsed workbook"
              description="The backend normalized the workbook into one persistent review session with sheet-level traceability."
            >
              <View className="gap-2">
                {sheetSummary.map((sheet) => (
                  <View
                    key={`${sheet.sheetName}-${sheet.kind}`}
                    className="gap-1 rounded-[16px] border border-shellLine bg-shellPanelSoft px-4 py-3"
                  >
                    <Text className="text-[13px] font-semibold text-textMain">
                      {sheet.sheetName}
                    </Text>
                    <Text className="text-[12px] text-muted">
                      {sheet.kind} - {sheet.parsedRows} parsed rows
                    </Text>
                  </View>
                ))}
              </View>
              <Text className="text-[12px] leading-[18px] text-muted">
                {previewOnlyKinds.includes("CERTIFICATE")
                  ? "Certificate rows remain visible for review, but they do not create compliance records in this foundation branch."
                  : "No preview-only row kinds declared for this session."}
              </Text>
            </Panel>

            <DataTable
              title="Crew rows"
              subtitleRight={`${crewRows.length} row${crewRows.length === 1 ? "" : "s"} ready for structured review`}
              data={crewRows}
              isLoading={false}
              error={null}
              onRetry={refresh}
              columns={crewColumns}
              minWidth={980}
              getRowId={(row) => row.id}
              emptyText="No crew rows in this session."
            />

            <DataTable
              title="Certificate rows"
              subtitleRight={`${certificateRows.length} row${certificateRows.length === 1 ? "" : "s"} kept in preview mode`}
              data={certificateRows}
              isLoading={false}
              error={null}
              onRetry={refresh}
              columns={certificateColumns}
              minWidth={980}
              getRowId={(row) => row.id}
              emptyText="No certificate rows in this session."
            />
          </View>

          <View className="flex-1 gap-5 web:xl:max-w-[390px]">
            <Panel
              title="Session state"
              description="This card gives the operational status before anyone decides to commit or discard."
            >
              <View className="gap-3">
                <KeyValueRow label="File" value={currentSession.sourceFileName} />
                <KeyValueRow
                  label="Status"
                  value={titleCaseStatus(currentSession.status)}
                />
                <KeyValueRow
                  label="Revision"
                  value={String(currentSession.revisionNumber)}
                />
                <KeyValueRow
                  label="Default vessel"
                  value={currentSession.defaultAssetName ?? "Not set"}
                />
                <KeyValueRow
                  label="Template version"
                  value={currentSession.templateVersion ?? "Unknown"}
                />
                <KeyValueRow
                  label="Created"
                  value={formatDateTime(currentSession.createdAt)}
                />
                <KeyValueRow
                  label="Last update"
                  value={formatDateTime(currentSession.updatedAt)}
                />
                {latestRevision ? (
                  <KeyValueRow
                    label="Latest workbook revision"
                    value={`Revision ${latestRevision.revisionNumber}`}
                  />
                ) : null}
                {actionError ? (
                  <Text className="text-[12px] text-destructive">{actionError}</Text>
                ) : null}
              </View>
            </Panel>

            {currentSession.status === "READY_FOR_REVIEW" ? (
              <Panel
                title="Correct this session"
                description="Replace the workbook inside the same session when the client sends a corrected file. The session id stays stable and the revision number increases."
              >
                <Text className="text-[12px] leading-[18px] text-muted">
                  Current default vessel reuse:{" "}
                  {currentSession.defaultAssetName ?? "None selected"}
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  className="self-start rounded-full"
                  onPress={onReupload}
                  loading={actionLoading}
                >
                  Replace workbook in this session
                </Button>
              </Panel>
            ) : null}

            {duplicatePolicy ? (
              <Panel
                title="Duplicate handling policy"
                description="These are the business guardrails the parser applied while deciding whether a row can create, update, or must stay under review."
              >
                <View className="gap-3">
                  <KeyValueRow
                    label="Unique match"
                    value={duplicatePolicy.uniqueIdentityMatch ?? "--"}
                  />
                  <KeyValueRow
                    label="Ambiguous match"
                    value={duplicatePolicy.ambiguousIdentityMatch ?? "--"}
                  />
                  <KeyValueRow
                    label="Workbook duplicate"
                    value={duplicatePolicy.workbookDuplicateIdentity ?? "--"}
                  />
                  <KeyValueRow
                    label="Weak identity"
                    value={duplicatePolicy.weakIdentityNoMatch ?? "--"}
                  />
                  <KeyValueRow
                    label="Certificate rows"
                    value={duplicatePolicy.certificateRows ?? "--"}
                  />
                </View>
              </Panel>
            ) : null}

            {revisionHistory.length > 0 ? (
              <Panel
                title="Revision history"
                description="Every corrected workbook stays attached to this same session, so the reviewer can see what changed over time."
              >
                <View className="gap-2">
                  {revisionHistory.map((revision) => (
                    <View
                      key={`${revision.revisionNumber}-${revision.uploadedAt}`}
                      className="gap-1 rounded-[16px] border border-shellLine bg-shellPanelSoft px-4 py-3"
                    >
                      <Text className="text-[13px] font-semibold text-textMain">
                        Revision {revision.revisionNumber}: {revision.sourceFileName}
                      </Text>
                      <Text className="text-[12px] text-muted">
                        Uploaded {formatDateTime(revision.uploadedAt)}
                        {revision.defaultAssetName
                          ? ` - Default vessel: ${revision.defaultAssetName}`
                          : ""}
                      </Text>
                      <Text className="text-[12px] text-muted">
                        {revision.totalRows} rows - {revision.crewRows} crew -{" "}
                        {revision.certificateRows} certificates - {revision.criticalCount} critical
                      </Text>
                    </View>
                  ))}
                </View>
              </Panel>
            ) : null}

            {auditTrail.length > 0 ? (
              <Panel
                title="Session audit"
                description="Operational events recorded inside the same upload session."
              >
                <View className="gap-2">
                  {auditTrail.slice(0, 5).map((event) => (
                    <AuditEventRow
                      key={`${event.eventType}-${event.at}`}
                      event={event}
                    />
                  ))}
                </View>
              </Panel>
            ) : null}

            {currentSession.status === "COMMITTED" && commitSummary ? (
              <Panel
                title="Commit outcome"
                description="Crew rows changed the real roster only after the session passed review."
              >
                <Text className="text-[13px] text-muted">
                  {commitSummary.createdCount} created - {commitSummary.updatedCount} updated -{" "}
                  {commitSummary.skippedCount} skipped
                </Text>
                <Text
                  className={`text-[13px] leading-[20px] ${requirementsRefreshTone(commitSummary.requirementsRefresh)}`}
                >
                  {requirementsRefreshMessage(commitSummary.requirementsRefresh)}
                </Text>
              </Panel>
            ) : null}

            {currentSession.status === "DISCARDED" ? (
              <Panel
                title="Session discarded"
                description="This session stays visible only as traceability. Start a new upload from the workspace when the workbook has been corrected."
              >
                <Text className="text-[12px] leading-[18px] text-muted">
                  No crew data was committed from this session, but the review
                  trail remains visible for operational follow-up.
                </Text>
              </Panel>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
