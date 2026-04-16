import { Button, ErrorState, PageHeader, StatCard, Text } from "@/src/components";
import { SearchableVesselSelect } from "@/src/components/ui/forms/SearchableVesselSelect";
import { useToast } from "@/src/context";
import { useVessels } from "@/src/features/vessels/hooks/useVessels";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Platform, Pressable, ScrollView, View } from "react-native";
import { useCreateCrewBulkUploadSession } from "../hooks/useCreateCrewBulkUploadSession";
import { useCrewBulkUploadSessionActions } from "../hooks/useCrewBulkUploadSessionActions";
import { useCrewBulkUploadSessions } from "../hooks/useCrewBulkUploadSessions";

type FormValues = {
  defaultAssetId: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function statusTone(status: string) {
  switch (status) {
    case "COMMITTED":
      return "bg-success/15 text-success border-success/30";
    case "DISCARDED":
      return "bg-muted/10 text-muted border-shellLine";
    default:
      return "bg-warning/15 text-warning border-warning/30";
  }
}

function statusDescription(
  status: string,
  counts: { createdCount: number; updatedCount: number; skippedCount: number },
) {
  switch (status) {
    case "COMMITTED":
      return `${counts.createdCount} created • ${counts.updatedCount} updated • ${counts.skippedCount} skipped`;
    case "DISCARDED":
      return "Closed session kept only as traceability record";
    default:
      return "Open review session";
  }
}

export default function CrewBulkUploadWorkspaceScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const pid = String(projectId);

  const { vessels, loading: vesselsLoading, error: vesselsError } = useVessels(pid);
  const { sessions, loading, error, refresh } = useCrewBulkUploadSessions(pid);
  const { submit, loading: uploading, error: uploadError } =
    useCreateCrewBulkUploadSession(pid);
  const {
    downloadTemplate,
    loading: templateLoading,
    error: templateError,
  } = useCrewBulkUploadSessionActions(pid);

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

  const stats = useMemo(
    () => ({
      total: sessions.length,
      ready: sessions.filter((session) => session.status === "READY_FOR_REVIEW")
        .length,
      committed: sessions.filter((session) => session.status === "COMMITTED")
        .length,
      critical: sessions.reduce(
        (acc, session) => acc + session.criticalCount,
        0,
      ),
    }),
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
      router.push(`/projects/${pid}/crew/bulk-upload/${session.id}`);
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
      <View className="flex-1 items-center justify-center bg-shellCanvas">
        <Text className="text-muted">Loading bulk upload workspace...</Text>
      </View>
    );
  }

  if (error && sessions.length === 0) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  return (
    <View className="flex-1 bg-shellCanvas">
      <ScrollView
        contentContainerClassName="gap-6 p-4 web:p-6 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title="Crew Bulk Upload"
          subTitle="Create a persistent session, review normalized rows, then commit crew changes without losing the trail."
          onRefresh={refresh}
          actions={
            <>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onPress={() => router.push(`/projects/${pid}/crew-certificates`)}
              >
                Open crew certificates
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onPress={() => router.push(`/projects/${pid}/crew`)}
              >
                Back to crew
              </Button>
            </>
          }
        />

        <View className="gap-2 xl:gap-5 flex flex-row flex-wrap items-center justify-start xl:justify-between">
          <StatCard
            iconName="cloud-upload-outline"
            iconLib="ion"
            title="Sessions"
            value={String(stats.total)}
            suffix="bulk uploads created"
          />

          <StatCard
            iconName="search-outline"
            iconLib="ion"
            title="Ready for review"
            value={String(stats.ready)}
            suffix="need a final commit decision"
          />

          <StatCard
            iconName="checkmark-circle-outline"
            iconLib="ion"
            title="Committed"
            value={String(stats.committed)}
            suffix="already applied to crew records"
          />

          <StatCard
            iconName="alert-circle-outline"
            iconLib="ion"
            title="Critical issues"
            value={String(stats.critical)}
            suffix="must be resolved before commit"
          />
        </View>

        <View className="rounded-[24px] border border-shellLine bg-shellPanel p-5 gap-4">
          <Text className="text-textMain text-[18px] font-semibold">
            Start a new session
          </Text>
          <Text className="text-muted text-[13px] leading-[20px]">
            The workbook is parsed on the backend immediately so you can leave
            and come back without losing the session. If your file does not
            include vessel IMO or license, choose a default vessel first.
          </Text>

          <View className="flex-row flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onPress={onDownloadTemplate}
              loading={templateLoading}
              disabled={!isWeb}
            >
              Download official template
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onPress={onPickWorkbook}
            >
              {file ? "Change workbook" : "Select workbook"}
            </Button>
          </View>

          <Text className="text-[12px] text-muted leading-[18px]">
            {isWeb
              ? "Use the official template whenever possible. In this foundation release, the Certificates sheet stays in preview-only mode and does not create compliance records."
              : "Template download currently works in web only. Open ARXIS in the browser to download the official workbook, then come back to this workspace if needed."}
          </Text>

          <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft p-4 gap-1">
            <Text className="text-[12px] text-muted">Selected workbook</Text>
            <Text className="text-textMain font-semibold">
              {file?.name ?? "No workbook selected yet"}
            </Text>
            <Text className="text-[12px] text-muted">
              {file?.mimeType ?? "Accepts .xlsx or .csv"}
            </Text>
          </View>

          {vessels.length > 1 ? (
            <SearchableVesselSelect
              label="Default vessel (optional but recommended)"
              placeholder="Choose a vessel for rows without IMO/license"
              vessels={vessels}
              value={selectedVessel}
              onChange={(value) =>
                setValue("defaultAssetId", value.id, { shouldDirty: true })
              }
              disabled={vesselsLoading}
            />
          ) : selectedVessel ? (
            <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft p-4 gap-1">
              <Text className="text-[12px] text-muted">Default vessel</Text>
              <Text className="text-textMain font-semibold">
                {selectedVessel.name}
              </Text>
              <Text className="text-[12px] text-muted">
                The current project only has one vessel, so it will be applied automatically.
              </Text>
            </View>
          ) : null}

          {localError ? (
            <Text className="text-[12px] text-destructive">{localError}</Text>
          ) : null}
          {uploadError ? (
            <Text className="text-[12px] text-destructive">{uploadError}</Text>
          ) : null}
          {templateError ? (
            <Text className="text-[12px] text-warning">{templateError}</Text>
          ) : null}
          {vesselsError ? (
            <Text className="text-[12px] text-warning">{vesselsError}</Text>
          ) : null}

          <Button
            variant="default"
            size="lg"
            className="rounded-full self-start"
            onPress={onCreateSession}
            loading={uploading}
            disabled={!file}
          >
            Upload and create session
          </Button>
          {!file ? (
            <Text className="text-[12px] text-muted">
              Select a workbook first to enable session creation.
            </Text>
          ) : null}
        </View>

        <View className="rounded-[24px] border border-shellLine bg-shellPanel p-5 gap-4">
          <View className="gap-1">
            <Text className="text-textMain text-[18px] font-semibold">
              Existing sessions
            </Text>
            <Text className="text-muted text-[13px] leading-[20px]">
              Every session stays available until it is discarded or committed,
              so the client can always resume the review without depending on a
              hidden queue.
            </Text>
          </View>

          {sessions.length === 0 ? (
            <View className="rounded-[18px] border border-dashed border-shellLine bg-shellPanelSoft p-5">
              <Text className="text-textMain font-semibold">
                No bulk sessions yet
              </Text>
              <Text className="text-muted text-[13px] mt-1">
                Upload the first workbook to create a reviewable session.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {sessions.map((session) => (
                <Pressable
                  key={session.id}
                  onPress={() =>
                    router.push(`/projects/${pid}/crew/bulk-upload/${session.id}`)
                  }
                  className="rounded-[18px] border border-shellLine bg-shellPanelSoft p-4 gap-3"
                >
                  <View className="flex-row flex-wrap items-center justify-between gap-3">
                    <View className="gap-1">
                      <Text className="text-textMain font-semibold">
                        {session.sourceFileName}
                      </Text>
                      <Text className="text-[12px] text-muted">
                        Rev {session.revisionNumber} • Updated {formatDate(session.updatedAt)}
                        {session.defaultAssetName
                          ? ` • Default vessel: ${session.defaultAssetName}`
                          : ""}
                      </Text>
                    </View>

                    <View
                      className={`rounded-full border px-3 py-1 ${statusTone(session.status)}`}
                    >
                      <Text className="text-[11px] font-semibold">
                        {session.status.replaceAll("_", " ")}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row flex-wrap gap-3">
                    <Text className="text-[12px] text-muted">
                      {session.crewRows} crew rows
                    </Text>
                    <Text className="text-[12px] text-muted">
                      {session.certificateRows} certificate rows
                    </Text>
                    <Text className="text-[12px] text-warning">
                      {session.criticalCount} critical
                    </Text>
                    <Text className="text-[12px] text-warning">
                      {session.warningCount} warnings
                    </Text>
                  </View>

                  <Text className="text-[12px] text-muted">
                    {statusDescription(session.status, {
                      createdCount: session.createdCount,
                      updatedCount: session.updatedCount,
                      skippedCount: session.skippedCount,
                    })}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
