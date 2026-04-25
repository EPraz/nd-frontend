import { ErrorState, Loading, Text } from "@/src/components";
import { RegistryWorkspaceSection } from "@/src/components/ui/registryWorkspace";
import { DataTable, RegistryTablePill } from "@/src/components/ui/table";
import { useSessionContext } from "@/src/context/SessionProvider";
import { useToast } from "@/src/context/ToastProvider";
import { humanizeTechnicalLabel } from "@/src/helpers/humanizeTechnicalLabel";
import { canUser } from "@/src/security/rolePermissions";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { ScrollView, View } from "react-native";
import { useCrewBulkUploadSession } from "../hooks/useCrewBulkUploadSession";
import { useCrewBulkUploadSessionActions } from "../hooks/useCrewBulkUploadSessionActions";
import { CrewBulkUploadSessionHeader } from "./CrewBulkUploadSessionHeader";
import { CrewBulkUploadSessionSidebar } from "./CrewBulkUploadSessionSidebar";
import {
  buildCertificateColumns,
  buildCrewColumns,
} from "./crewBulkUploadSession.tables";

function formatSnapshotDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function TimingRow({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <View className="gap-1">
      <Text className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">
        {label}
      </Text>
      <Text className="text-[15px] font-semibold text-textMain">{value}</Text>
      <Text className="text-[12px] leading-[18px] text-muted">{helper}</Text>
    </View>
  );
}

function SessionTimingCard({
  createdAt,
  updatedAt,
}: {
  createdAt: string;
  updatedAt: string;
}) {
  return (
    <View className="min-w-[260px] flex-[1.15] gap-3 rounded-[20px] border border-shellLine bg-shellPanelSoft px-4 py-3.5">
      <Text className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">
        Session timing
      </Text>

      <View className="gap-3">
        <TimingRow
          label="Created"
          value={formatSnapshotDateTime(createdAt)}
          helper="initial upload that opened this lane"
        />
        <View className="h-px bg-shellLine" />
        <TimingRow
          label="Last update"
          value={formatSnapshotDateTime(updatedAt)}
          helper="most recent parsing or workflow change"
        />
      </View>
    </View>
  );
}

type SnapshotMetricTone = "accent" | "ok" | "warn";

function snapshotMetricClasses(tone: SnapshotMetricTone) {
  switch (tone) {
    case "ok":
      return {
        surface: "border-emerald-400/25 bg-emerald-400/10",
        label: "text-emerald-100/80",
        value: "text-emerald-50",
      };
    case "warn":
      return {
        surface: "border-amber-300/25 bg-amber-300/10",
        label: "text-amber-100/80",
        value: "text-amber-50",
      };
    case "accent":
    default:
      return {
        surface: "border-accent/30 bg-accent/12",
        label: "text-accent/80",
        value: "text-accent",
      };
  }
}

function SnapshotMetricCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  tone: SnapshotMetricTone;
}) {
  const ui = snapshotMetricClasses(tone);

  return (
    <View
      className={[
        "min-w-[210px] flex-1 gap-2 rounded-[20px] border px-4 py-3.5",
        ui.surface,
      ].join(" ")}
    >
      <Text className={["text-[10px] font-semibold uppercase tracking-[0.24em]", ui.label].join(" ")}>
        {label}
      </Text>
      <Text className={["text-[28px] leading-none font-semibold", ui.value].join(" ")}>
        {value}
      </Text>
      <Text className="text-[12px] leading-[18px] text-muted">{helper}</Text>
    </View>
  );
}

type SessionMetaTagTone = "accent" | "info" | "ok";

function sessionMetaTagClasses(tone: SessionMetaTagTone) {
  switch (tone) {
    case "ok":
      return {
        surface: "border-emerald-400/25 bg-emerald-400/10",
        dot: "bg-emerald-300",
        label: "text-emerald-100/80",
        value: "text-emerald-50",
      };
    case "info":
      return {
        surface: "border-sky-400/25 bg-sky-400/10",
        dot: "bg-sky-300",
        label: "text-sky-100/80",
        value: "text-sky-50",
      };
    case "accent":
    default:
      return {
        surface: "border-accent/35 bg-accent/12",
        dot: "bg-accent",
        label: "text-accent/80",
        value: "text-accent",
      };
  }
}

function SessionMetaTag({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: SessionMetaTagTone;
}) {
  const ui = sessionMetaTagClasses(tone);

  return (
    <View
      className={[
        "flex-row items-center gap-2 rounded-full border px-3 py-1.5",
        ui.surface,
      ].join(" ")}
    >
      <View className={["h-2 w-2 rounded-full", ui.dot].join(" ")} />
      <Text className={["text-[11px]", ui.label].join(" ")}>{label}:</Text>
      <Text className={["text-[11px] font-semibold", ui.value].join(" ")}>
        {value}
      </Text>
    </View>
  );
}

function describeSourceType(mimeType: string) {
  if (mimeType.includes("spreadsheetml")) return "XLSX workbook";
  if (mimeType.includes("ms-excel")) return "Excel workbook";
  if (mimeType.includes("csv")) return "CSV workbook";
  return "Uploaded document";
}

function SheetCard({
  title,
  rowCount,
  kind,
}: {
  title: string;
  rowCount: number;
  kind: "CREW" | "CERTIFICATE" | "UNKNOWN";
}) {
  const tone =
    kind === "CREW" ? "ok" : kind === "CERTIFICATE" ? "warn" : "info";
  const helper =
    kind === "CREW"
      ? "crew rows normalized for commit review"
      : kind === "CERTIFICATE"
        ? "certificate rows kept visible in preview mode"
        : "unclassified rows still tracked in this session";

  return (
    <View className="min-w-[200px] flex-1 gap-2 rounded-[18px] border border-shellLine bg-shellPanelSoft px-4 py-3">
      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-[13px] font-semibold text-textMain">{title}</Text>
        <RegistryTablePill label={humanizeTechnicalLabel(kind)} tone={tone} />
      </View>
      <Text className="text-[22px] font-semibold text-textMain">
        {rowCount}
      </Text>
      <Text className="text-[12px] leading-[18px] text-muted">{helper}</Text>
    </View>
  );
}

export default function CrewBulkUploadSessionScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { session: userSession } = useSessionContext();
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

  const crewColumns = useMemo(() => buildCrewColumns(), []);
  const certificateColumns = useMemo(() => buildCertificateColumns(), []);

  if (loading) return <Loading fullScreen />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!session) {
    return <ErrorState message="Bulk upload session not found." onRetry={refresh} />;
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
  const commitSummary = currentSession.summary?.commit ?? null;
  const canUploadDocuments = canUser(userSession, "DOCUMENT_UPLOAD");
  const canConfirmIngestion = canUser(userSession, "INGESTION_CONFIRM");
  const blockingCrewRows = crewRows.filter((row) =>
    row.issues.some((issue) => issue.severity === "CRITICAL"),
  );
  const canCommit =
    canConfirmIngestion &&
    currentSession.status === "READY_FOR_REVIEW" &&
    blockingCrewRows.length === 0;

  async function onCommit() {
    if (!canConfirmIngestion) {
      show("Your role can review this session, but cannot commit crew data.", "error");
      return;
    }

    try {
      const next = await commit();
      setSession(next);
      show("Bulk upload committed", "success");
    } catch {
      show("Failed to commit session", "error");
    }
  }

  async function onDiscard() {
    if (!canUploadDocuments) {
      show("Your role can review this session, but cannot discard uploads.", "error");
      return;
    }

    try {
      const next = await discard();
      setSession(next);
      show("Bulk upload session discarded", "success");
    } catch {
      show("Failed to discard session", "error");
    }
  }

  async function onReupload() {
    if (!canUploadDocuments) {
      show("Your role can review this session, but cannot replace workbooks.", "error");
      return;
    }

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
    <ScrollView
      contentContainerClassName="gap-5 p-4 web:p-6 pb-10"
      showsVerticalScrollIndicator={false}
    >
      <CrewBulkUploadSessionHeader
        currentSession={currentSession}
        blockingCrewRowsCount={blockingCrewRows.length}
        canCommitSession={canConfirmIngestion}
        canCommit={canCommit}
        canDiscardSession={canUploadDocuments}
        actionLoading={actionLoading}
        onRefresh={refresh}
        onBackToWorkspace={() => router.push(`/projects/${pid}/crew?tab=bulk-upload`)}
        onCommit={onCommit}
        onDiscard={onDiscard}
        onOpenCrewModule={() => router.push(`/projects/${pid}/crew`)}
        onOpenCrewCertificates={() =>
          router.push(`/projects/${pid}/crew?tab=certificates`)
        }
      />

      <View className="gap-5 web:xl:flex-row web:xl:items-start">
        <View className="min-w-0 flex-[1.45] gap-5">
          <RegistryWorkspaceSection
            title="Session snapshot"
            subtitle="The parser keeps workbook identity, sheet traceability, and revision history inside one persistent review lane."
          >
            <View className="gap-5">
              <View className="gap-2">
                <Text className="text-[24px] leading-[30px] font-semibold text-textMain">
                  {currentSession.sourceFileName}
                </Text>
                <Text className="text-[13px] leading-[20px] text-muted">
                  Revision {currentSession.revisionNumber} remains attached to the
                  same session so review work can continue without losing the audit
                  trail.
                </Text>

                <View className="flex-row flex-wrap gap-2">
                  <SessionMetaTag
                    label="Default vessel"
                    value={currentSession.defaultAssetName ?? "Not set"}
                    tone="accent"
                  />
                  <SessionMetaTag
                    label="Template"
                    value={currentSession.templateVersion ?? "Unknown"}
                    tone="info"
                  />
                  <SessionMetaTag
                    label="Source type"
                    value={describeSourceType(currentSession.sourceMimeType)}
                    tone="ok"
                  />
                </View>
              </View>

              <View className="flex-row flex-wrap items-start gap-3">
                <SessionTimingCard
                  createdAt={currentSession.createdAt}
                  updatedAt={currentSession.updatedAt}
                />
                <SnapshotMetricCard
                  label="Total rows"
                  value={String(currentSession.totalRows)}
                  helper="all rows currently carried by this session"
                  tone="accent"
                />
                <SnapshotMetricCard
                  label="Warnings"
                  value={String(currentSession.warningCount)}
                  helper={
                    currentSession.warningCount > 0
                      ? "non-blocking issues still worth analyst attention"
                      : "no analyst warnings in the current revision"
                  }
                  tone={currentSession.warningCount > 0 ? "warn" : "ok"}
                />
              </View>

              <View className="gap-3">
                <Text className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                  Parsed workbook
                </Text>

                <View className="flex-row flex-wrap gap-3">
                  {sheetSummary.length > 0 ? (
                    sheetSummary.map((sheet) => (
                      <SheetCard
                        key={`${sheet.sheetName}-${sheet.kind}`}
                        title={sheet.sheetName}
                        rowCount={sheet.parsedRows}
                        kind={sheet.kind}
                      />
                    ))
                  ) : (
                    <Text className="text-[12px] leading-[18px] text-muted">
                      No sheet-level summary metadata was returned for this session.
                    </Text>
                  )}
                </View>
              </View>

              <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft px-4 py-3">
                <View className="flex-row flex-wrap items-center gap-2">
                  <RegistryTablePill
                    label={
                      previewOnlyKinds.includes("CERTIFICATE")
                        ? "Certificate preview"
                        : "Direct review"
                    }
                    tone={
                      previewOnlyKinds.includes("CERTIFICATE") ? "accent" : "info"
                    }
                  />
                </View>

                <Text className="mt-2 text-[12px] leading-[18px] text-muted">
                  {previewOnlyKinds.includes("CERTIFICATE")
                    ? "Certificate rows remain visible for validation, but they do not create compliance records in this foundation lane."
                    : "No preview-only row kinds were declared for this session."}
                </Text>
              </View>
            </View>
          </RegistryWorkspaceSection>

          <DataTable
            title="Crew decision queue"
            subtitleRight={`${crewRows.length} row${crewRows.length === 1 ? "" : "s"} visible in this review session`}
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
            title="Certificate preview queue"
            subtitleRight={`${certificateRows.length} row${certificateRows.length === 1 ? "" : "s"} kept visible in preview-only mode`}
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

        <CrewBulkUploadSessionSidebar
          currentSession={currentSession}
          actionError={actionError}
          actionLoading={actionLoading}
          duplicatePolicy={duplicatePolicy}
          revisionHistory={revisionHistory}
          auditTrail={auditTrail}
          commitSummary={commitSummary}
          canReupload={canUploadDocuments}
          onReupload={onReupload}
        />
      </View>
    </ScrollView>
  );
}
