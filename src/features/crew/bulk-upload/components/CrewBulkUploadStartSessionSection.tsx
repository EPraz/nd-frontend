import { Button, ErrorState } from "@/src/components";
import { SearchableVesselSelect } from "@/src/components/ui/forms/SearchableVesselSelect";
import {
  RegistrySummaryStrip,
  RegistryWorkspaceSection,
} from "@/src/components/ui/registryWorkspace";
import { Text } from "@/src/components/ui/text/Text";
import type { AssetDto } from "@/src/contracts/assets.contract";
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

  return (
    <RegistryWorkspaceSection
      title="Start a new session"
      subtitle="Upload once, review later. The workbook is parsed immediately and the session stays available until commit or discard."
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onPress={onDownloadTemplate}
            loading={templateLoading}
            disabled={!isWeb}
          >
            Download template
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onPress={onPickWorkbook}
          >
            {file ? "Change workbook" : "Select workbook"}
          </Button>
        </>
      }
    >
      <View className="gap-4 web:flex-row">
        <View className="min-w-0 flex-1 gap-4">
          <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft p-4">
            <Text className="text-[12px] text-muted">Selected workbook</Text>
            <Text className="mt-1 font-semibold text-textMain">
              {file?.name ?? "No workbook selected yet"}
            </Text>
            <Text className="mt-1 text-[12px] text-muted">
              {file?.mimeType ?? "Accepts .xlsx or .csv"}
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
            <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft p-4">
              <Text className="text-[12px] text-muted">Default vessel</Text>
              <Text className="mt-1 font-semibold text-textMain">
                {selectedVessel.name}
              </Text>
              <Text className="mt-1 text-[12px] text-muted">
                The current project only has one vessel, so it will be applied
                automatically.
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

          <View className="items-start gap-2">
            <Button
              variant="default"
              size="lg"
              className="rounded-full"
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
        </View>

        <View className="min-w-0 flex-1 gap-4">
          <RegistrySummaryStrip
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

          <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft p-4">
            <Text className="text-[12px] font-semibold uppercase tracking-[0.24em] text-muted">
              How this lane works
            </Text>
            <Text className="mt-3 text-[13px] leading-[20px] text-muted">
              Create a session, review issues, then commit only when the queue
              is clean enough to trust. `Critical before commit` only reflects
              open review sessions, not historical ones already committed or
              discarded.
            </Text>
          </View>
        </View>
      </View>
    </RegistryWorkspaceSection>
  );
}
