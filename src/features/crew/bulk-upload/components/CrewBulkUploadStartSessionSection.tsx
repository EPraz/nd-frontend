import { Button, ErrorState } from "@/src/components";
import { SearchableVesselSelect } from "@/src/components/ui/forms/SearchableVesselSelect";
import {
  RegistrySummaryStrip,
  RegistryWorkspaceSection,
} from "@/src/components/ui/registryWorkspace";
import { Text } from "@/src/components/ui/text/Text";
import type { AssetDto } from "@/src/contracts/assets.contract";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

type FileSelection = {
  uri: string;
  name: string;
  mimeType: string;
  file?: unknown;
} | null;

type Props = {
  isWeb: boolean;
  file: FileSelection;
  selectedVessel: AssetDto | null;
  vessels: AssetDto[];
  vesselsLoading: boolean;
  vesselsError: string | null;
  localError: string | null;
  uploadError: string | null;
  templateError: string | null;
  uploading: boolean;
  templateLoading: boolean;
  onRetryVessels: () => void;
  onDownloadTemplate: () => void;
  onPickWorkbook: () => void;
  onCreateSession: () => void;
  onSelectVessel: (value: AssetDto) => void;
};

function SessionFeedback({
  tone,
  message,
}: {
  tone: "danger" | "warn";
  message: string;
}) {
  const surfaceClasses =
    tone === "danger"
      ? "border-destructive/30 bg-destructive/10"
      : "border-warning/30 bg-warning/10";
  const textClasses = tone === "danger" ? "text-destructive" : "text-warning";

  return (
    <View className={`rounded-[16px] border px-4 py-3 ${surfaceClasses}`}>
      <Text className={`text-[12px] leading-[18px] ${textClasses}`}>
        {message}
      </Text>
    </View>
  );
}

function SessionRule({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <View className="flex-row items-start gap-3 rounded-[18px] border border-shellLine bg-shellPanel px-4 py-3">
      <View className="mt-0.5 h-7 w-7 items-center justify-center rounded-full bg-accent">
        <Text className="text-[11px] font-semibold text-black">{step}</Text>
      </View>

      <View className="min-w-0 flex-1 gap-1">
        <Text className="text-[13px] font-semibold text-textMain">{title}</Text>
        <Text className="text-[12px] leading-[18px] text-muted">
          {description}
        </Text>
      </View>
    </View>
  );
}

export function CrewBulkUploadStartSessionSection({
  isWeb,
  file,
  selectedVessel,
  vessels,
  vesselsLoading,
  vesselsError,
  localError,
  uploadError,
  templateError,
  uploading,
  templateLoading,
  onRetryVessels,
  onDownloadTemplate,
  onPickWorkbook,
  onCreateSession,
  onSelectVessel,
}: Props) {
  if (vesselsError && vessels.length === 0) {
    return <ErrorState message={vesselsError} onRetry={onRetryVessels} />;
  }

  const workbookReady = Boolean(file);
  const sessionHelperText = workbookReady
    ? "The workbook will be parsed immediately and reopened as a persistent review session."
    : "Select a workbook first to enable session creation.";

  return (
    <RegistryWorkspaceSection
      title="Start a new session"
      subtitle="Upload once, review later. The workbook is parsed immediately and the session stays available until commit or discard."
      actions={
        <Button
          variant="softAccent"
          size="pillSm"
          className="rounded-full border-accent/45 bg-accent/14 px-5"
          onPress={onDownloadTemplate}
          loading={templateLoading}
          disabled={!isWeb}
          rightIcon={
            <Ionicons name="download-outline" size={15} className="text-accent" />
          }
        >
          Download template
        </Button>
      }
    >
      <View className="gap-4 web:items-start web:xl:flex-row">
        <View className="min-w-0 flex-[1.3] gap-4">
          <View className="gap-5 rounded-[24px] border border-shellLine bg-shellCanvas p-5">
            <View className="gap-2">
              <Text className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
                Session intake
              </Text>
              <Text className="text-[24px] leading-[30px] font-semibold text-textMain">
                Build one review session and keep it alive until commit or discard.
              </Text>
              <Text className="max-w-[720px] text-[13px] leading-[20px] text-muted">
                Use the approved workbook, pin a vessel only when rows need help,
                then move the same session into review without losing its place in
                the queue.
              </Text>
            </View>

            <View className="gap-4 rounded-[20px] border border-shellLine bg-shellPanel p-4">
              <View className="gap-1">
                <Text className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                  Workbook baseline
                </Text>
                <Text className="text-[18px] font-semibold text-textMain">
                  {file?.name ?? "No workbook selected yet"}
                </Text>
                <Text className="text-[12px] leading-[18px] text-muted">
                  {file?.mimeType ?? "Accepts .xlsx or .csv files from the official template."}
                </Text>
              </View>

              {workbookReady ? (
                <View className="flex-row flex-wrap items-center gap-3">
                  <Button
                    variant="softAccent"
                    size="lg"
                    className="rounded-full"
                    onPress={onPickWorkbook}
                  >
                    Change workbook
                  </Button>

                  <Button
                    variant="default"
                    size="lg"
                    className="rounded-full"
                    onPress={onCreateSession}
                    loading={uploading}
                  >
                    Upload and create session
                  </Button>
                </View>
              ) : (
                <Button
                  variant="default"
                  size="lg"
                  className="self-start rounded-full"
                  onPress={onPickWorkbook}
                >
                  Select workbook
                </Button>
              )}

              <Text className="text-[12px] leading-[18px] text-muted">
                {sessionHelperText}
              </Text>
            </View>

            <View className="gap-4 rounded-[20px] border border-shellLine bg-shellPanel p-4">
              <View className="gap-1">
                <Text className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                  Session baseline
                </Text>
                <Text className="text-[14px] font-semibold text-textMain">
                  Default vessel only fills workbook rows that arrive without IMO or license context.
                </Text>
              </View>

              {vessels.length > 1 ? (
                <SearchableVesselSelect
                  label="Default vessel"
                  placeholder="Choose a vessel for rows without IMO/license"
                  vessels={vessels}
                  value={selectedVessel}
                  onChange={onSelectVessel}
                  disabled={vesselsLoading}
                />
              ) : selectedVessel ? (
                <View className="rounded-[18px] border border-shellLine bg-shellCanvas p-4">
                  <Text className="text-[12px] text-muted">Default vessel</Text>
                  <Text className="mt-1 font-semibold text-textMain">
                    {selectedVessel.name}
                  </Text>
                  <Text className="mt-1 text-[12px] leading-[18px] text-muted">
                    The current project only has one vessel, so it will be applied
                    automatically.
                  </Text>
                </View>
              ) : null}

              <Text className="text-[12px] leading-[18px] text-muted">
                Leave this optional when the workbook already carries enough vessel
                identity to match rows confidently.
              </Text>
            </View>

            <View className="gap-3">
              {localError ? (
                <SessionFeedback tone="danger" message={localError} />
              ) : null}
              {uploadError ? (
                <SessionFeedback tone="danger" message={uploadError} />
              ) : null}
              {templateError ? (
                <SessionFeedback tone="warn" message={templateError} />
              ) : null}
              {vesselsError ? (
                <SessionFeedback tone="warn" message={vesselsError} />
              ) : null}
            </View>
          </View>
        </View>

        <View className="min-w-0 flex-1 gap-4">
          <RegistrySummaryStrip
            size="compact"
            items={[
              {
                label: "Persistence",
                value: "ON",
                helper: "sessions survive navigation until commit or discard",
                tone: "ok",
              },
              {
                label: "Certificates sheet",
                value: "Preview",
                helper: "validated now, not committed in foundation scope",
                tone: "warn",
              },
              {
                label: "Default vessel",
                value: selectedVessel ? "Pinned" : "Optional",
                helper: "used only for rows without IMO/license",
                tone: selectedVessel ? "accent" : "info",
              },
              {
                label: "Template",
                value: isWeb ? "Web ready" : "Browser only",
                helper: "official workbook download lives in web for now",
                tone: isWeb ? "ok" : "warn",
              },
            ]}
          />

          <View className="gap-4 rounded-[22px] border border-shellLine bg-shellPanelSoft p-5">
            <View className="gap-1">
              <Text className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                Session rules
              </Text>
              <Text className="text-[18px] font-semibold text-textMain">
                Review first, then decide what becomes real crew data.
              </Text>
              <Text className="text-[13px] leading-[20px] text-muted">
                `Critical before commit` only counts sessions still open for review,
                not historical ones already committed or discarded.
              </Text>
            </View>

            <View className="gap-3">
              <SessionRule
                step="1"
                title="Use the approved template"
                description="Download the official workbook when the client needs a clean starting point. Browser download remains the supported path for now."
              />
              <SessionRule
                step="2"
                title="Keep corrections in the same session"
                description="If the workbook comes back corrected, replace it later in the same session so revision history and review context stay intact."
              />
              <SessionRule
                step="3"
                title="Commit only the crew sheet"
                description="Certificate rows stay visible for validation, but this foundation lane only applies crew roster changes after review."
              />
            </View>
          </View>
        </View>
      </View>
    </RegistryWorkspaceSection>
  );
}
