import { Button, ErrorState, PageHeader, StatCard, Text } from "@/src/components";
import { useToast } from "@/src/context";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import type {
  CrewBulkUploadCommitSummary,
  CrewBulkUploadIssueDto,
  CrewBulkUploadRowDto,
} from "../contracts/crewBulkUpload.contract";
import { useCrewBulkUploadSession } from "../hooks/useCrewBulkUploadSession";
import { useCrewBulkUploadSessionActions } from "../hooks/useCrewBulkUploadSessionActions";

function issueTone(severity: CrewBulkUploadIssueDto["severity"]) {
  switch (severity) {
    case "CRITICAL":
      return "text-destructive";
    case "WARNING":
      return "text-warning";
    default:
      return "text-muted";
  }
}

function actionTone(action: CrewBulkUploadRowDto["proposedAction"]) {
  switch (action) {
    case "CREATE":
      return "bg-success/15 text-success border-success/30";
    case "UPDATE":
      return "bg-warning/15 text-warning border-warning/30";
    case "SKIP":
      return "bg-muted/10 text-muted border-shellLine";
    default:
      return "bg-destructive/10 text-destructive border-destructive/30";
  }
}

function commitTone(status: CrewBulkUploadRowDto["commitStatus"]) {
  switch (status) {
    case "COMMITTED":
      return "bg-success/15 text-success border-success/30";
    case "SKIPPED":
      return "bg-muted/10 text-muted border-shellLine";
    default:
      return "bg-shellPanel text-muted border-shellLine";
  }
}

function formatDate(value: string | null) {
  if (!value) return "--";
  return new Date(value).toLocaleString();
}

function requirementsRefreshTone(status?: CrewBulkUploadCommitSummary["requirementsRefresh"]) {
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

function RowCard({ row }: { row: CrewBulkUploadRowDto }) {
  return (
    <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft p-4 gap-3">
      <View className="flex-row flex-wrap items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text className="text-textMain font-semibold">
            {row.displayLabel ?? `Row ${row.rowNumber}`}
          </Text>
          <Text className="text-[12px] text-muted">
            {row.sheetName} - Row {row.rowNumber}
          </Text>
          {row.matchedAssetName ? (
            <Text className="text-[12px] text-muted">
              Vessel: {row.matchedAssetName}
            </Text>
          ) : null}
          {row.matchedCrewMemberName ? (
            <Text className="text-[12px] text-muted">
              Matched crew: {row.matchedCrewMemberName}
            </Text>
          ) : null}
          {row.committedCrewMemberName ? (
            <Text className="text-[12px] text-success">
              Committed as: {row.committedCrewMemberName}
            </Text>
          ) : null}
        </View>

        <View className="flex-row flex-wrap justify-end gap-2">
          <View
            className={`rounded-full border px-3 py-1 ${actionTone(row.proposedAction)}`}
          >
            <Text className="text-[11px] font-semibold">
              {row.proposedAction}
            </Text>
          </View>

          {row.commitStatus !== "PENDING" ? (
            <View
              className={`rounded-full border px-3 py-1 ${commitTone(row.commitStatus)}`}
            >
              <Text className="text-[11px] font-semibold">
                {row.commitStatus}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {row.issues.length > 0 ? (
        <View className="gap-1">
          {row.issues.map((issue, index) => (
            <Text
              key={`${row.id}-${issue.code}-${index}`}
              className={`text-[12px] ${issueTone(issue.severity)}`}
            >
              {issue.severity}: {issue.message}
            </Text>
          ))}
        </View>
      ) : (
        <Text className="text-[12px] text-success">
          No issues detected for this row.
        </Text>
      )}
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

  return (
    <View className="flex-1 bg-shellCanvas">
      <ScrollView
        contentContainerClassName="gap-6 p-4 web:p-6 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Review Crew Bulk Upload Session"
          subTitle="Validate the parsed rows, confirm the actions, and only commit when the session is operationally safe."
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

        <View className="rounded-[24px] border border-shellLine bg-shellPanel p-5 gap-3">
          <Text className="text-textMain text-[18px] font-semibold">
            Session state
          </Text>
          <Text className="text-[13px] text-muted">
            File: {currentSession.sourceFileName}
          </Text>
          <Text className="text-[13px] text-muted">
            Revision: {currentSession.revisionNumber}
          </Text>
          <Text className="text-[13px] text-muted">
            Status: {currentSession.status.replaceAll("_", " ")}
          </Text>
          <Text className="text-[13px] text-muted">
            Created: {formatDate(currentSession.createdAt)}
          </Text>
          <Text className="text-[13px] text-muted">
            Last session update: {formatDate(currentSession.updatedAt)}
          </Text>
          <Text className="text-[13px] text-muted">
            Default vessel: {currentSession.defaultAssetName ?? "Not set"}
          </Text>
          <Text className="text-[13px] text-muted">
            Template version: {currentSession.templateVersion ?? "Unknown"}
          </Text>
          <Text className="text-[13px] text-muted">
            Certificate handling: {previewOnlyKinds.includes("CERTIFICATE")
              ? "Certificate rows stay preview-only in this foundation branch."
              : "No preview-only row kinds declared."}
          </Text>
          {latestRevision ? (
            <Text className="text-[13px] text-muted">
              Latest workbook revision: {latestRevision.sourceFileName} on{" "}
              {formatDate(latestRevision.uploadedAt)}
            </Text>
          ) : null}
          {actionError ? (
            <Text className="text-[12px] text-destructive">{actionError}</Text>
          ) : null}
        </View>

        {currentSession.status === "READY_FOR_REVIEW" ? (
          <View className="rounded-[24px] border border-shellLine bg-shellPanel p-5 gap-3">
            <Text className="text-textMain text-[18px] font-semibold">
              Correct this session
            </Text>
            <Text className="text-[13px] text-muted">
              Replace the workbook inside the same session when the client sends a corrected file.
              The session keeps the same id, increments the revision number, and replaces the parsed
              rows without losing the review trail.
            </Text>
            <Text className="text-[13px] text-muted">
              Current default vessel reuse: {currentSession.defaultAssetName ?? "None selected"}
            </Text>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full self-start"
              onPress={onReupload}
              loading={actionLoading}
            >
              Replace workbook in this session
            </Button>
          </View>
        ) : null}

        {duplicatePolicy ? (
          <View className="rounded-[24px] border border-shellLine bg-shellPanel p-5 gap-3">
            <Text className="text-textMain text-[18px] font-semibold">
              Duplicate handling policy
            </Text>
            <Text className="text-[13px] text-muted">
              Unique match: {duplicatePolicy.uniqueIdentityMatch ?? "--"}
            </Text>
            <Text className="text-[13px] text-muted">
              Ambiguous match: {duplicatePolicy.ambiguousIdentityMatch ?? "--"}
            </Text>
            <Text className="text-[13px] text-muted">
              Weak identity with no match: {duplicatePolicy.weakIdentityNoMatch ?? "--"}
            </Text>
            <Text className="text-[13px] text-muted">
              Certificate rows: {duplicatePolicy.certificateRows ?? "--"}
            </Text>
          </View>
        ) : null}

        {revisionHistory.length > 0 ? (
          <View className="rounded-[24px] border border-shellLine bg-shellPanel p-5 gap-3">
            <Text className="text-textMain text-[18px] font-semibold">
              Revision history
            </Text>
            <Text className="text-[13px] text-muted">
              Every correction stays attached to this same session so the user can follow what changed.
            </Text>
            <View className="gap-2">
              {revisionHistory.map((revision) => (
                <View
                  key={`${revision.revisionNumber}-${revision.uploadedAt}`}
                  className="rounded-[16px] border border-shellLine bg-shellPanelSoft px-4 py-3 gap-1"
                >
                  <Text className="text-textMain font-semibold">
                    Revision {revision.revisionNumber}: {revision.sourceFileName}
                  </Text>
                  <Text className="text-[12px] text-muted">
                    Uploaded {formatDate(revision.uploadedAt)}
                    {revision.defaultAssetName
                      ? ` • Default vessel: ${revision.defaultAssetName}`
                      : ""}
                  </Text>
                  <Text className="text-[12px] text-muted">
                    {revision.totalRows} rows • {revision.crewRows} crew •{" "}
                    {revision.certificateRows} certificates • {revision.criticalCount} critical •{" "}
                    {revision.warningCount} warnings
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {sheetSummary.length > 0 ? (
          <View className="rounded-[24px] border border-shellLine bg-shellPanel p-5 gap-3">
            <Text className="text-textMain text-[18px] font-semibold">
              Parsed workbook
            </Text>
            <Text className="text-[13px] text-muted">
              The backend normalized each recognized sheet into a persistent review session.
            </Text>
            <View className="gap-2">
              {sheetSummary.map((sheet) => (
                <View
                  key={`${sheet.sheetName}-${sheet.kind}`}
                  className="rounded-[16px] border border-shellLine bg-shellPanelSoft px-4 py-3"
                >
                  <Text className="text-textMain font-semibold">
                    {sheet.sheetName}
                  </Text>
                  <Text className="text-[12px] text-muted">
                    {sheet.kind} - {sheet.parsedRows} parsed rows
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {currentSession.status === "READY_FOR_REVIEW" && blockingCrewRows.length > 0 ? (
          <View className="rounded-[20px] border border-destructive/30 bg-destructive/10 p-4 gap-2">
            <Text className="text-textMain font-semibold text-[13px]">
              Commit is blocked
            </Text>
            <Text className="text-[12px] text-destructive">
              {blockingCrewRows.length} crew row
              {blockingCrewRows.length === 1 ? "" : "s"} still have critical issues.
              Replace the workbook in this same session or discard it before trying to commit.
            </Text>
          </View>
        ) : null}

        {currentSession.status === "COMMITTED" && commitSummary ? (
          <View className="rounded-[24px] border border-shellLine bg-shellPanel p-5 gap-3">
            <Text className="text-textMain text-[18px] font-semibold">
              Commit outcome
            </Text>
            <Text className="text-[13px] text-muted">
              {commitSummary.createdCount} created - {commitSummary.updatedCount} updated -{" "}
              {commitSummary.skippedCount} skipped
            </Text>
            <Text
              className={`text-[13px] ${requirementsRefreshTone(commitSummary.requirementsRefresh)}`}
            >
              {requirementsRefreshMessage(commitSummary.requirementsRefresh)}
            </Text>
          </View>
        ) : null}

        {currentSession.status === "DISCARDED" ? (
          <View className="rounded-[24px] border border-shellLine bg-shellPanel p-5 gap-3">
            <Text className="text-textMain text-[18px] font-semibold">
              Session discarded
            </Text>
            <Text className="text-[13px] text-muted">
              This session stays visible only as traceability. Start a new upload
              from the workspace when the workbook has been corrected.
            </Text>
          </View>
        ) : null}

        <View className="rounded-[24px] border border-shellLine bg-shellPanel p-5 gap-4">
          <Text className="text-textMain text-[18px] font-semibold">
            Crew rows
          </Text>
          <Text className="text-muted text-[13px] leading-[20px]">
            These rows create or update crew profiles. If a row says `UPDATE`,
            the session found an existing crew member using the identity rules.
          </Text>
          <View className="gap-3">
            {crewRows.map((row) => (
              <RowCard key={row.id} row={row} />
            ))}
          </View>
        </View>

        <View className="rounded-[24px] border border-shellLine bg-shellPanel p-5 gap-4">
          <Text className="text-textMain text-[18px] font-semibold">
            Certificate rows
          </Text>
          <Text className="text-muted text-[13px] leading-[20px]">
            These rows stay visible in the session preview, but they do not
            create compliance records in this foundation branch. That avoids a
            silent mismatch between Excel input and evidence-driven crew
            certificates.
          </Text>
          <View className="gap-3">
            {certificateRows.length === 0 ? (
              <View className="rounded-[18px] border border-dashed border-shellLine bg-shellPanelSoft p-4">
                <Text className="text-muted">No certificate rows in this session.</Text>
              </View>
            ) : (
              certificateRows.map((row) => <RowCard key={row.id} row={row} />)
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
