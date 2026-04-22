import { ErrorState, Text } from "@/src/components";
import { RegistrySummaryStrip } from "@/src/components/ui/registryWorkspace";
import { useToast } from "@/src/context/ToastProvider";
import { useVessels } from "@/src/features/vessels/core";
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
import { getCrewBulkUploadSummaryItems } from "./crewBulkUploadWorkspace.helpers";

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

  const {
    vessels,
    loading: vesselsLoading,
    error: vesselsError,
    refresh: refreshVessels,
  } = useVessels(projectId);
  const { sessions, loading, error, refresh } =
    useCrewBulkUploadSessions(projectId);
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
    () => getCrewBulkUploadSummaryItems(sessions),
    [sessions],
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

      <CrewBulkUploadSessionsTable
        title="Existing sessions"
        subtitleRight={`${sessions.length} sessions in this workspace`}
        data={sessions}
        isLoading={loading}
        error={error}
        onRetry={refresh}
        onRowPress={(session) =>
          router.push(`/projects/${projectId}/crew/bulk-upload/${session.id}`)
        }
      />
    </View>
  );
}
