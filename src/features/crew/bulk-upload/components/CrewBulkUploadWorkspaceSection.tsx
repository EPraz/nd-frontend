import { ErrorState, Text } from "@/src/components";
import {
  RegistrySummaryStrip,
  RegistryWorkspaceSection,
} from "@/src/components/ui/registryWorkspace";
import { ToolbarSelect } from "@/src/components/ui/forms/ToolbarSelect";
import { TableFilterSearch } from "@/src/components/ui/table";
import { DEFAULT_PAGE_SIZE } from "@/src/contracts/pagination.contract";
import { useSessionContext } from "@/src/context/SessionProvider";
import { useToast } from "@/src/context/ToastProvider";
import { useVessels } from "@/src/features/vessels/core";
import { humanizeTechnicalLabel } from "@/src/helpers";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { canUser } from "@/src/security/rolePermissions";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Platform, View } from "react-native";
import { useCreateCrewBulkUploadSession } from "../hooks/useCreateCrewBulkUploadSession";
import { useCrewBulkUploadSessionActions } from "../hooks/useCrewBulkUploadSessionActions";
import { useCrewBulkUploadSessions } from "../hooks/useCrewBulkUploadSessions";
import { CrewBulkUploadSessionsTable } from "./CrewBulkUploadSessionsTable";
import { CrewBulkUploadStartSessionSection } from "./CrewBulkUploadStartSessionSection";
import {
  getCrewBulkUploadSummaryItems,
  getCrewBulkUploadSummaryItemsFromStats,
} from "./crewBulkUploadWorkspace.helpers";

type FormValues = {
  defaultAssetId: string;
};

export function CrewBulkUploadWorkspaceSection({
  projectId,
}: {
  projectId: string;
}) {
  const router = useRouter();
  const { show } = useToast();
  const { session } = useSessionContext();
  const canCreateBulkUploadSession = canUser(session, "DOCUMENT_UPLOAD");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionStatusFilter, setSessionStatusFilter] = useState("ALL");
  const [sessionAssetFilter, setSessionAssetFilter] = useState("ALL");
  const [sessionCriticalFilter, setSessionCriticalFilter] = useState("ALL");
  const [showSessionSearch, setShowSessionSearch] = useState(false);
  const [showSessionStatusMenu, setShowSessionStatusMenu] = useState(false);
  const [showSessionAssetMenu, setShowSessionAssetMenu] = useState(false);
  const [showSessionCriticalMenu, setShowSessionCriticalMenu] = useState(false);
  const debouncedSessionSearch = useDebouncedValue(sessionSearch, 180);

  const {
    vessels,
    loading: vesselsLoading,
    error: vesselsError,
    refresh: refreshVessels,
  } = useVessels(projectId);
  const { sessions, pagination, stats, loading, error, refresh } =
    useCrewBulkUploadSessions(projectId, {
      page,
      pageSize,
      sort: "UPDATED_DESC",
      search: debouncedSessionSearch,
      status:
        sessionStatusFilter === "ALL" ? undefined : sessionStatusFilter,
      defaultAssetId:
        sessionAssetFilter === "ALL" ? undefined : sessionAssetFilter,
      hasCriticalIssues:
        sessionCriticalFilter === "ALL" ? undefined : sessionCriticalFilter,
    });
  const { submit, loading: uploading, error: uploadError } =
    useCreateCrewBulkUploadSession(projectId);
  const {
    downloadTemplate,
    loading: templateLoading,
    error: templateError,
  } = useCrewBulkUploadSessionActions(projectId);

  const { setValue, watch } = useForm<FormValues>({
    defaultValues: { defaultAssetId: "" },
  });
  const defaultAssetId = watch("defaultAssetId");
  const isWeb = Platform.OS === "web";

  const [file, setFile] = useState<{
    uri: string;
    name: string;
    mimeType: string;
    file?: unknown;
  } | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (vessels.length === 1 && !defaultAssetId) {
      setValue("defaultAssetId", vessels[0].id, { shouldDirty: false });
    }
  }, [defaultAssetId, setValue, vessels]);

  const selectedVessel =
    vessels.find((vessel) => vessel.id === defaultAssetId) ?? null;
  const summaryItems = useMemo(
    () =>
      stats
        ? getCrewBulkUploadSummaryItemsFromStats(stats)
        : getCrewBulkUploadSummaryItems(sessions),
    [sessions, stats],
  );

  async function onPickWorkbook() {
    setLocalError(null);

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
    setFile({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType ?? "application/octet-stream",
      file: "file" in asset ? asset.file : undefined,
    });
  }

  async function onCreateSession() {
    setLocalError(null);

    if (!canCreateBulkUploadSession) {
      show(
        "Your role can review bulk upload sessions, but cannot upload workbooks.",
        "error",
      );
      return;
    }

    if (!file) {
      setLocalError("Select an .xlsx or .csv workbook first.");
      return;
    }

    try {
      const session = await submit({
        defaultAssetId: defaultAssetId || undefined,
        file,
      });
      show("Workbook uploaded. Review the session before commit.", "success");
      router.push(`/projects/${projectId}/crew/bulk-upload/${session.id}`);
    } catch {
      show("Failed to create crew bulk upload session", "error");
    }
  }

  async function onDownloadTemplate() {
    try {
      await downloadTemplate();
      show("Template download started", "success");
    } catch {
      show("Template download failed", "error");
    }
  }

  if (loading && sessions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-shellCanvas py-10">
        <Text className="text-muted">Loading bulk upload workspace...</Text>
      </View>
    );
  }

  if (error && sessions.length === 0) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  return (
    <View className="gap-4">
      <RegistrySummaryStrip items={summaryItems} />

      {canCreateBulkUploadSession ? (
        <CrewBulkUploadStartSessionSection
          isWeb={isWeb}
          file={file}
          selectedVessel={selectedVessel}
          vessels={vessels}
          vesselsLoading={vesselsLoading}
          vesselsError={vesselsError}
          localError={localError}
          uploadError={uploadError}
          templateError={templateError}
          uploading={uploading}
          templateLoading={templateLoading}
          onRetryVessels={refreshVessels}
          onDownloadTemplate={onDownloadTemplate}
          onPickWorkbook={onPickWorkbook}
          onCreateSession={onCreateSession}
          onSelectVessel={(value) =>
            setValue("defaultAssetId", value.id, { shouldDirty: true })
          }
        />
      ) : (
        <RegistryWorkspaceSection
          title="Bulk upload read-only"
          subtitle="Your role can review existing sessions, but workbook intake is reserved for operational users."
        >
          <Text className="text-[13px] leading-[20px] text-muted">
            Backend permissions still enforce this if someone attempts to call
            the upload endpoint directly.
          </Text>
        </RegistryWorkspaceSection>
      )}

      <CrewBulkUploadSessionsTable
        title="Existing sessions"
        subtitleRight={
          pagination
            ? `${pagination.totalItems} sessions in scope`
            : `${sessions.length} sessions in this workspace`
        }
        headerActions={
          <>
            <TableFilterSearch
              value={sessionSearch}
              onChangeText={(value) => {
                setSessionSearch(value);
                setPage(1);
              }}
              placeholder="Search workbook or vessel..."
              open={showSessionSearch}
              onOpenChange={setShowSessionSearch}
              minWidth={300}
            />

            <ToolbarSelect
              value={sessionStatusFilter}
              options={["ALL", "READY_FOR_REVIEW", "COMMITTED", "DISCARDED"]}
              open={showSessionStatusMenu}
              onToggle={() => setShowSessionStatusMenu((prev) => !prev)}
              onChange={(value) => {
                setSessionStatusFilter(value);
                setPage(1);
                setShowSessionStatusMenu(false);
              }}
              renderLabel={(value) =>
                value === "ALL" ? "All sessions" : humanizeTechnicalLabel(value)
              }
              triggerIconName="filter-outline"
              minWidth={170}
            />

            <ToolbarSelect
              value={sessionAssetFilter}
              options={["ALL", ...vessels.map((vessel) => vessel.id)]}
              open={showSessionAssetMenu}
              onToggle={() => setShowSessionAssetMenu((prev) => !prev)}
              onChange={(value) => {
                setSessionAssetFilter(value);
                setPage(1);
                setShowSessionAssetMenu(false);
              }}
              renderLabel={(value) => {
                if (value === "ALL") return "All vessels";
                return vessels.find((vessel) => vessel.id === value)?.name ?? "Vessel";
              }}
              triggerIconName="boat-outline"
              minWidth={170}
            />

            <ToolbarSelect
              value={sessionCriticalFilter}
              options={["ALL", "true"]}
              open={showSessionCriticalMenu}
              onToggle={() => setShowSessionCriticalMenu((prev) => !prev)}
              onChange={(value) => {
                setSessionCriticalFilter(value);
                setPage(1);
                setShowSessionCriticalMenu(false);
              }}
              renderLabel={(value) =>
                value === "ALL" ? "All issues" : "Critical issues"
              }
              triggerIconName="alert-circle-outline"
              minWidth={158}
            />
          </>
        }
        data={sessions}
        isLoading={loading}
        error={error}
        onRetry={refresh}
        onRowPress={(session) =>
          router.push(`/projects/${projectId}/crew/bulk-upload/${session.id}`)
        }
        pagination={
          pagination
            ? {
                meta: pagination,
                onPageChange: setPage,
                onPageSizeChange: (nextPageSize) => {
                  setPageSize(nextPageSize);
                  setPage(1);
                },
              }
            : undefined
        }
      />
    </View>
  );
}
