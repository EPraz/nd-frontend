import { ErrorState, Loading, Text } from "@/src/components";
import { ToolbarSelect } from "@/src/components/ui/forms/ToolbarSelect";
import { RegistryWorkspaceSection } from "@/src/components/ui/registryWorkspace";
import {
  DataTable,
  RegistryTablePill,
  TableFilterSearch,
} from "@/src/components/ui/table";
import { useSessionContext } from "@/src/context/SessionProvider";
import { useToast } from "@/src/context/ToastProvider";
import { DEFAULT_PAGE_SIZE } from "@/src/contracts/pagination.contract";
import { humanizeTechnicalLabel } from "@/src/helpers/humanizeTechnicalLabel";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { canUser } from "@/src/security/rolePermissions";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useCrewBulkUploadSession } from "../hooks/useCrewBulkUploadSession";
import { useCrewBulkUploadSessionActions } from "../hooks/useCrewBulkUploadSessionActions";
import { useCrewBulkUploadSessionRows } from "../hooks/useCrewBulkUploadSessionRows";
import { CrewBulkUploadSessionHeader } from "./CrewBulkUploadSessionHeader";
import { CrewBulkUploadSessionSidebar } from "./CrewBulkUploadSessionSidebar";
import {
  buildCertificateColumns,
  buildCrewColumns,
} from "./crewBulkUploadSession.tables";

const ROW_ACTION_OPTIONS = ["ALL", "CREATE", "UPDATE", "SKIP", "REVIEW"] as const;
const COMMIT_STATUS_OPTIONS = ["ALL", "PENDING", "COMMITTED", "SKIPPED"] as const;
const ISSUE_SEVERITY_OPTIONS = ["ALL", "CRITICAL", "WARNING", "INFO"] as const;

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

function SessionRowsTableActions({
  prefix,
  search,
  onSearchChange,
  actionFilter,
  onActionFilterChange,
  commitFilter,
  onCommitFilterChange,
  issueFilter,
  onIssueFilterChange,
  openControl,
  setOpenControl,
  toggleControl,
}: {
  prefix: string;
  search: string;
  onSearchChange: (value: string) => void;
  actionFilter: string;
  onActionFilterChange: (value: string) => void;
  commitFilter: string;
  onCommitFilterChange: (value: string) => void;
  issueFilter: string;
  onIssueFilterChange: (value: string) => void;
  openControl: string | null;
  setOpenControl: (value: string | null) => void;
  toggleControl: (controlId: string) => void;
}) {
  return (
    <>
      <TableFilterSearch
        value={search}
        onChangeText={onSearchChange}
        placeholder="Search rows..."
        open={openControl === `${prefix}-search`}
        onOpenChange={(open) => setOpenControl(open ? `${prefix}-search` : null)}
        minWidth={280}
      />
      <ToolbarSelect
        value={actionFilter}
        options={[...ROW_ACTION_OPTIONS]}
        open={openControl === `${prefix}-action`}
        onToggle={() => toggleControl(`${prefix}-action`)}
        onChange={onActionFilterChange}
        renderLabel={(value) =>
          value === "ALL" ? "All actions" : humanizeTechnicalLabel(value)
        }
        triggerIconName="flash-outline"
        minWidth={160}
      />
      <ToolbarSelect
        value={commitFilter}
        options={[...COMMIT_STATUS_OPTIONS]}
        open={openControl === `${prefix}-commit`}
        onToggle={() => toggleControl(`${prefix}-commit`)}
        onChange={onCommitFilterChange}
        renderLabel={(value) =>
          value === "ALL" ? "All commit" : humanizeTechnicalLabel(value)
        }
        triggerIconName="checkmark-done-outline"
        minWidth={160}
      />
      <ToolbarSelect
        value={issueFilter}
        options={[...ISSUE_SEVERITY_OPTIONS]}
        open={openControl === `${prefix}-issues`}
        onToggle={() => toggleControl(`${prefix}-issues`)}
        onChange={onIssueFilterChange}
        renderLabel={(value) =>
          value === "ALL" ? "All issues" : humanizeTechnicalLabel(value)
        }
        triggerIconName="warning-outline"
        minWidth={150}
      />
    </>
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
  const [crewRowsPage, setCrewRowsPage] = useState(1);
  const [crewRowsPageSize, setCrewRowsPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [crewRowsSearch, setCrewRowsSearch] = useState("");
  const [crewRowsActionFilter, setCrewRowsActionFilter] = useState("ALL");
  const [crewRowsCommitFilter, setCrewRowsCommitFilter] = useState("ALL");
  const [crewRowsIssueFilter, setCrewRowsIssueFilter] = useState("ALL");
  const [certificateRowsPage, setCertificateRowsPage] = useState(1);
  const [certificateRowsPageSize, setCertificateRowsPageSize] =
    useState(DEFAULT_PAGE_SIZE);
  const [certificateRowsSearch, setCertificateRowsSearch] = useState("");
  const [certificateRowsActionFilter, setCertificateRowsActionFilter] =
    useState("ALL");
  const [certificateRowsCommitFilter, setCertificateRowsCommitFilter] =
    useState("ALL");
  const [certificateRowsIssueFilter, setCertificateRowsIssueFilter] =
    useState("ALL");
  const [openControl, setOpenControl] = useState<string | null>(null);
  const debouncedCrewRowsSearch = useDebouncedValue(crewRowsSearch, 180);
  const debouncedCertificateRowsSearch = useDebouncedValue(
    certificateRowsSearch,
    180,
  );

  const { session, loading, error, refresh, setSession } =
    useCrewBulkUploadSession(pid, sid);
  const crewRowsPageResult = useCrewBulkUploadSessionRows(pid, sid, {
    page: crewRowsPage,
    pageSize: crewRowsPageSize,
    rowKind: "CREW",
    search: debouncedCrewRowsSearch,
    proposedAction:
      crewRowsActionFilter === "ALL" ? undefined : crewRowsActionFilter,
    commitStatus:
      crewRowsCommitFilter === "ALL" ? undefined : crewRowsCommitFilter,
    issueSeverity:
      crewRowsIssueFilter === "ALL" ? undefined : crewRowsIssueFilter,
  });
  const certificateRowsPageResult = useCrewBulkUploadSessionRows(pid, sid, {
    page: certificateRowsPage,
    pageSize: certificateRowsPageSize,
    rowKind: "CERTIFICATE",
    search: debouncedCertificateRowsSearch,
    proposedAction:
      certificateRowsActionFilter === "ALL"
        ? undefined
        : certificateRowsActionFilter,
    commitStatus:
      certificateRowsCommitFilter === "ALL"
        ? undefined
        : certificateRowsCommitFilter,
    issueSeverity:
      certificateRowsIssueFilter === "ALL"
        ? undefined
        : certificateRowsIssueFilter,
  });
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
  const crewRows = crewRowsPageResult.rows;
  const certificateRows = certificateRowsPageResult.rows;
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
  const blockingCrewRowsCount = crewRowsPageResult.stats?.critical ?? 0;
  const canCommit =
    canConfirmIngestion &&
    currentSession.status === "READY_FOR_REVIEW" &&
    blockingCrewRowsCount === 0;

  function toggleControl(controlId: string) {
    setOpenControl((current) => (current === controlId ? null : controlId));
  }

  async function refreshAll() {
    await Promise.all([
      refresh(),
      crewRowsPageResult.refresh(),
      certificateRowsPageResult.refresh(),
    ]);
  }

  async function onCommit() {
    if (!canConfirmIngestion) {
      show("Your role can review this session, but cannot commit crew data.", "error");
      return;
    }

    try {
      const next = await commit();
      setSession(next);
      await Promise.all([
        crewRowsPageResult.refresh(),
        certificateRowsPageResult.refresh(),
      ]);
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
      await Promise.all([
        crewRowsPageResult.refresh(),
        certificateRowsPageResult.refresh(),
      ]);
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
      await Promise.all([
        crewRowsPageResult.refresh(),
        certificateRowsPageResult.refresh(),
      ]);
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
        blockingCrewRowsCount={blockingCrewRowsCount}
        canCommitSession={canConfirmIngestion}
        canCommit={canCommit}
        canDiscardSession={canUploadDocuments}
        actionLoading={actionLoading}
        onRefresh={refreshAll}
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
            subtitleRight={`${crewRowsPageResult.pagination?.totalItems ?? crewRows.length} row${(crewRowsPageResult.pagination?.totalItems ?? crewRows.length) === 1 ? "" : "s"} visible in this review session`}
            headerActions={
              <SessionRowsTableActions
                prefix="crew"
                search={crewRowsSearch}
                onSearchChange={(value) => {
                  setCrewRowsSearch(value);
                  setCrewRowsPage(1);
                }}
                actionFilter={crewRowsActionFilter}
                onActionFilterChange={(value) => {
                  setCrewRowsActionFilter(value);
                  setCrewRowsPage(1);
                }}
                commitFilter={crewRowsCommitFilter}
                onCommitFilterChange={(value) => {
                  setCrewRowsCommitFilter(value);
                  setCrewRowsPage(1);
                }}
                issueFilter={crewRowsIssueFilter}
                onIssueFilterChange={(value) => {
                  setCrewRowsIssueFilter(value);
                  setCrewRowsPage(1);
                }}
                openControl={openControl}
                setOpenControl={setOpenControl}
                toggleControl={toggleControl}
              />
            }
            data={crewRows}
            isLoading={crewRowsPageResult.loading}
            error={crewRowsPageResult.error}
            onRetry={crewRowsPageResult.refresh}
            columns={crewColumns}
            minWidth={980}
            getRowId={(row) => row.id}
            emptyText="No crew rows in this session."
            pagination={
              crewRowsPageResult.pagination
                ? {
                    meta: crewRowsPageResult.pagination,
                    onPageChange: setCrewRowsPage,
                    onPageSizeChange: (nextPageSize) => {
                      setCrewRowsPageSize(nextPageSize);
                      setCrewRowsPage(1);
                    },
                  }
                : undefined
            }
          />

          <DataTable
            title="Certificate preview queue"
            subtitleRight={`${certificateRowsPageResult.pagination?.totalItems ?? certificateRows.length} row${(certificateRowsPageResult.pagination?.totalItems ?? certificateRows.length) === 1 ? "" : "s"} kept visible in preview-only mode`}
            headerActions={
              <SessionRowsTableActions
                prefix="certificate"
                search={certificateRowsSearch}
                onSearchChange={(value) => {
                  setCertificateRowsSearch(value);
                  setCertificateRowsPage(1);
                }}
                actionFilter={certificateRowsActionFilter}
                onActionFilterChange={(value) => {
                  setCertificateRowsActionFilter(value);
                  setCertificateRowsPage(1);
                }}
                commitFilter={certificateRowsCommitFilter}
                onCommitFilterChange={(value) => {
                  setCertificateRowsCommitFilter(value);
                  setCertificateRowsPage(1);
                }}
                issueFilter={certificateRowsIssueFilter}
                onIssueFilterChange={(value) => {
                  setCertificateRowsIssueFilter(value);
                  setCertificateRowsPage(1);
                }}
                openControl={openControl}
                setOpenControl={setOpenControl}
                toggleControl={toggleControl}
              />
            }
            data={certificateRows}
            isLoading={certificateRowsPageResult.loading}
            error={certificateRowsPageResult.error}
            onRetry={certificateRowsPageResult.refresh}
            columns={certificateColumns}
            minWidth={980}
            getRowId={(row) => row.id}
            emptyText="No certificate rows in this session."
            pagination={
              certificateRowsPageResult.pagination
                ? {
                    meta: certificateRowsPageResult.pagination,
                    onPageChange: setCertificateRowsPage,
                    onPageSizeChange: (nextPageSize) => {
                      setCertificateRowsPageSize(nextPageSize);
                      setCertificateRowsPage(1);
                    },
                  }
                : undefined
            }
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
