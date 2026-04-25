import { Button, Field, Loading, Text } from "@/src/components";
import { EmptyVesselsState } from "@/src/components/ui/forms/EmptyVesselsState";
import { SearchableVesselSelect } from "@/src/components/ui/forms/SearchableVesselSelect";
import { VesselPill } from "@/src/components/ui/forms/VesselPill";
import {
  RegistryHeaderActionButton,
  RegistrySummaryStrip,
  RegistryWorkspaceHeader,
  RegistryWorkspaceSection,
  type RegistrySummaryItem,
} from "@/src/components/ui/registryWorkspace";
import { RegistryTablePill } from "@/src/components/ui/table";
import { useToast } from "@/src/context/ToastProvider";
import { Ionicons } from "@expo/vector-icons";
import { useVessels } from "@/src/features/vessels/core";
import { humanizeTechnicalLabel } from "@/src/helpers/humanizeTechnicalLabel";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { useCertificateRequirementsByAsset } from "@/src/features/certificates/requirements/hooks/useCertificateRequirementsByAsset";
import {
  documentStateTone,
  requirementStatusLabel,
  requirementTone,
} from "../certificateTask.helpers";
import { useCreateExtraCertificateIngestion } from "../../hooks/useCreateExtraCertificateIngestion";
import { useCreateRequirementIngestion } from "../../hooks/useCreateRequirementIngestion";

type CertificateUploadFormValues = {
  selectedVesselId: string | null;
  notes: string;
};

type FlowStepProps = {
  step: string;
  title: string;
  description: string;
  tone: "accent" | "info" | "ok";
};

function flowStepClasses(tone: FlowStepProps["tone"]) {
  switch (tone) {
    case "ok":
      return {
        rail: "bg-emerald-300",
        badge: "border-emerald-400/25 bg-emerald-400/10 text-emerald-100",
      };
    case "info":
      return {
        rail: "bg-sky-300",
        badge: "border-sky-400/25 bg-sky-400/10 text-sky-100",
      };
    case "accent":
    default:
      return {
        rail: "bg-accent",
        badge: "border-accent/30 bg-accent/12 text-accent",
      };
  }
}

function FlowStep({ step, title, description, tone }: FlowStepProps) {
  const ui = flowStepClasses(tone);

  return (
    <View className="relative pl-8">
      <View className="absolute left-[7px] top-[8px] h-4 w-4 items-center justify-center rounded-full border border-shellLine bg-shellPanel">
        <View className={["h-2.5 w-2.5 rounded-full", ui.rail].join(" ")} />
      </View>
      <View className="absolute bottom-0 left-[14px] top-[24px] w-px bg-shellLine" />

      <View className="gap-2 pb-4">
        <View className={["self-start rounded-full border px-2.5 py-1", ui.badge].join(" ")}>
          <Text className="text-[10px] font-semibold uppercase tracking-[0.14em]">
            {step}
          </Text>
        </View>
        <View className="gap-1">
          <Text className="text-[13px] font-semibold text-textMain">{title}</Text>
          <Text className="text-[12px] leading-[18px] text-muted">
            {description}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function CertificateUploadScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { projectId, assetId, requirementId } = useLocalSearchParams<{
    projectId: string;
    assetId?: string;
    requirementId?: string;
  }>();

  const pid = String(projectId);
  const fixedAssetId = assetId ? String(assetId) : null;
  const rid = requirementId ? String(requirementId) : null;
  const isRequirementFlow = Boolean(fixedAssetId && rid);

  const {
    vessels,
    loading: vesselsLoading,
    error: vesselsError,
  } = useVessels(pid);
  const { requirements, loading: requirementsLoading } =
    useCertificateRequirementsByAsset(pid, fixedAssetId ?? "");

  const requirement = useMemo(() => {
    if (!rid) return null;
    return requirements.find((row) => row.id === rid) ?? null;
  }, [requirements, rid]);

  const { handleSubmit, setValue, watch } = useForm<CertificateUploadFormValues>({
    defaultValues: {
      selectedVesselId: fixedAssetId,
      notes: "",
    },
  });

  const selectedVesselId = watch("selectedVesselId");
  const notes = watch("notes");
  const [localError, setLocalError] = useState<string | null>(null);
  const [file, setFile] = useState<{
    uri: string;
    name: string;
    mimeType: string;
    file?: unknown;
  } | null>(null);

  useEffect(() => {
    if (!fixedAssetId) return;
    if (selectedVesselId === fixedAssetId) return;

    setValue("selectedVesselId", fixedAssetId, {
      shouldDirty: false,
      shouldTouch: false,
    });
  }, [fixedAssetId, selectedVesselId, setValue]);

  const selectedVessel = useMemo(
    () =>
      vessels.find((vessel) => vessel.id === (selectedVesselId ?? fixedAssetId)) ??
      null,
    [fixedAssetId, selectedVesselId, vessels],
  );

  const effectiveAssetId = fixedAssetId ?? selectedVesselId;
  const requirementUpload = useCreateRequirementIngestion(
    pid,
    fixedAssetId ?? "",
    rid ?? "",
  );
  const extraUpload = useCreateExtraCertificateIngestion(
    pid,
    effectiveAssetId ?? "",
  );

  const uploading =
    requirementUpload.loading || extraUpload.loading || requirementsLoading;
  const uploadError = requirementUpload.error ?? extraUpload.error;
  const canUpload = Boolean(file && effectiveAssetId && !uploading);

  const summaryItems = useMemo<RegistrySummaryItem[]>(
    () => [
      {
        label: "Intake",
        value: isRequirementFlow ? "Requirement document" : "Supporting document",
        helper: isRequirementFlow
          ? "linked to an active certificate requirement"
          : "reviewed before creating a structured record",
        tone: isRequirementFlow ? "accent" : "info",
      },
      {
        label: "Vessel",
        value: selectedVessel?.name ?? "Pending",
        helper: selectedVessel ? "current certificate context" : "select the vessel before upload",
        tone: selectedVessel ? "ok" : "neutral",
      },
      {
        label: "Target",
        value: requirement?.certificateName ?? "Reviewer decides",
        helper: requirement?.certificateCode ?? "final certificate type is confirmed after review",
        tone: requirement ? requirementTone(requirement.status) : "info",
      },
      {
        label: "Document",
        value: file ? "Selected" : "Pending",
        helper: file?.name ?? "PDF, JPG, JPEG, or PNG",
        tone: documentStateTone(Boolean(file)),
      },
    ],
    [file, isRequirementFlow, requirement, selectedVessel],
  );

  function goBack() {
    router.replace(`/projects/${pid}/certificates`);
  }

  function openVessel() {
    if (!selectedVessel) return;
    router.push(`/projects/${pid}/vessels/${selectedVessel.id}`);
  }

  async function pickDocument() {
    setLocalError(null);

    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/jpeg", "image/png"],
      multiple: false,
      copyToCacheDirectory: true,
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

  async function onUpload() {
    setLocalError(null);

    if (!effectiveAssetId) {
      setLocalError("Select a vessel first.");
      return;
    }

    if (!file) {
      setLocalError("Choose a PDF or image first.");
      return;
    }

    try {
      const ingestion = isRequirementFlow
        ? await requirementUpload.submit({
            file,
            notes: notes.trim() || undefined,
          })
        : await extraUpload.submit({
            file,
            notes: notes.trim() || undefined,
          });

      show(
        "Document uploaded. Review the extracted candidate next.",
        "success",
      );
      router.replace({
        pathname: "/projects/[projectId]/certificates/review",
        params: {
          projectId: pid,
          assetId: effectiveAssetId,
          ingestionId: ingestion.id,
        },
      });
    } catch {
      show("Upload failed", "error");
    }
  }

  if (fixedAssetId && vesselsLoading && !selectedVessel) return <Loading fullScreen />;

  return (
    <ScrollView
      contentContainerClassName="gap-5 p-4 web:p-6 pb-10"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-4">
        <RegistryWorkspaceHeader
          title={
            isRequirementFlow
              ? "Upload certificate evidence"
              : "Add supporting certificate"
          }
          eyebrow="Certificate intake task"
          subtitle="Upload the source document first so ARXIS can create a review candidate. The structured certificate record appears only after that review is confirmed."
          actions={
            <>
              <RegistryHeaderActionButton
                variant="soft"
                iconName="chevron-back-outline"
                iconSide="left"
                onPress={goBack}
              >
                Certificate compliance
              </RegistryHeaderActionButton>

              {selectedVessel ? (
                <RegistryHeaderActionButton
                  variant="outline"
                  iconName="boat-outline"
                  iconSide="right"
                  onPress={openVessel}
                >
                  Open vessel
                </RegistryHeaderActionButton>
              ) : null}
            </>
          }
        />

        <RegistrySummaryStrip items={summaryItems} />
      </View>

      <View className="gap-5 web:xl:flex-row web:xl:items-start">
        <View className="min-w-0 flex-[1.35] gap-5">
          <RegistryWorkspaceSection
            title="Source document"
            subtitle="Use one PDF or image as the source of truth for this intake. Upload creates the review candidate, not the final certificate record."
          >
            <View className="gap-5">
              <View className="gap-3">
                <Text className="text-[13px] font-semibold text-textMain">
                  Vessel context
                </Text>

                {fixedAssetId ? (
                  selectedVessel ? (
                    <VesselPill vessel={selectedVessel} />
                  ) : vesselsError ? (
                    <Text className="text-[12px] text-destructive">
                      {vesselsError}
                    </Text>
                  ) : (
                    <Loading />
                  )
                ) : vessels.length === 0 && !vesselsLoading ? (
                  <EmptyVesselsState
                    onCreateVessel={() => router.push(`/projects/${pid}/vessels/new`)}
                  />
                ) : (
                  <View className="gap-2">
                    <SearchableVesselSelect
                      vessels={vessels}
                      value={selectedVessel}
                      onChange={(vessel) =>
                        setValue("selectedVesselId", vessel?.id ?? null, {
                          shouldDirty: true,
                          shouldTouch: true,
                        })
                      }
                      disabled={vesselsLoading}
                    />
                    {vesselsError ? (
                      <Text className="text-[12px] text-destructive">
                        {vesselsError}
                      </Text>
                    ) : null}
                  </View>
                )}

                {isRequirementFlow && requirement ? (
                  <View className="rounded-[20px] border border-accent/25 bg-accent/10 p-4">
                    <View className="flex-row flex-wrap items-start justify-between gap-4">
                      <View className="min-w-[220px] flex-1 gap-1">
                        <Text className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent/80">
                          Requirement target
                        </Text>
                        <Text className="text-[14px] font-semibold text-textMain">
                          {requirement.certificateName} ({requirement.certificateCode})
                        </Text>
                        <Text className="text-[12px] leading-[18px] text-muted">
                          This upload can satisfy the active vessel certificate requirement after review.
                        </Text>
                      </View>

                      <RegistryTablePill
                          label={requirementStatusLabel(requirement.status)}
                          tone={requirementTone(requirement.status)}
                        />
                    </View>
                  </View>
                ) : null}
              </View>

              <View className="rounded-[20px] border border-shellLine bg-shellPanelSoft p-4">
                <View className="flex-row flex-wrap items-start justify-between gap-4">
                  <View className="min-w-[220px] flex-1 gap-2">
                    <View className="flex-row items-center gap-2">
                      <View className="h-9 w-9 items-center justify-center rounded-[12px] border border-shellLine bg-shellCanvas">
                        <Ionicons
                          name={file ? "document-text-outline" : "cloud-upload-outline"}
                          size={16}
                          className="text-accent"
                        />
                      </View>
                      <View className="gap-0.5">
                        <Text className="text-[13px] font-semibold text-textMain">
                          {file ? "Selected document" : "No document selected yet"}
                        </Text>
                        <Text className="text-[12px] leading-[18px] text-muted">
                          {file?.name ?? "Pick PDF, JPG, JPEG, or PNG before upload."}
                        </Text>
                      </View>
                    </View>

                    <Text className="text-[12px] leading-[18px] text-muted">
                      {file?.mimeType ?? "Accepted formats: application/pdf, image/jpeg, image/png"}
                    </Text>
                  </View>

                  <RegistryTablePill
                    label={humanizeTechnicalLabel(
                      file ? "READY_TO_EXTRACT" : "PENDING_FILE",
                    )}
                    tone={file ? "ok" : "warn"}
                  />
                </View>
              </View>

              <View className="flex-row flex-wrap items-center gap-2">
                <Button
                  variant={file ? "softAccent" : "default"}
                  size="pillSm"
                  className="rounded-full"
                  onPress={pickDocument}
                >
                  {file ? "Change document" : "Select document"}
                </Button>

                {file ? (
                  <Button
                    variant="default"
                    size="pillSm"
                    className="rounded-full"
                    onPress={handleSubmit(onUpload)}
                    loading={uploading}
                    disabled={!canUpload}
                    rightIcon={
                      <Ionicons
                        name="arrow-forward-outline"
                        size={15}
                        className="text-textMain"
                      />
                    }
                  >
                    Upload and extract candidate
                  </Button>
                ) : null}
              </View>

              <Field
                label="Notes for reviewer (optional)"
                placeholder="Capture context before the candidate is reviewed"
                value={notes}
                onChangeText={(value) =>
                  setValue("notes", value, {
                    shouldDirty: true,
                    shouldTouch: true,
                  })
                }
                multiline
                surfaceTone="raised"
                hint="Keep notes operational. The reviewer sees this context before confirming the structured certificate."
              />

              {localError ? (
                <Text className="text-[12px] text-destructive">{localError}</Text>
              ) : null}
              {uploadError ? (
                <Text className="text-[12px] text-destructive">{uploadError}</Text>
              ) : null}
            </View>
          </RegistryWorkspaceSection>
        </View>

        <View className="min-w-0 flex-1 gap-5 web:xl:max-w-[400px]">
          <RegistryWorkspaceSection
            title="What happens next"
            subtitle="The lane stays aligned with compliance work. ARXIS never jumps straight from file to approved record."
          >
            <View className="gap-1">
              <FlowStep
                step="01"
                title="Upload the source document"
                description="Store the original PDF or image and create one review candidate from it."
                tone="accent"
              />
              <FlowStep
                step="02"
                title="Review the extracted candidate"
                description="Confirm certificate type, dates, issuer, and notes against the source document."
                tone="info"
              />
              <FlowStep
                step="03"
                title="Create the submitted record"
                description="Only the reviewed candidate becomes the structured certificate inside the registry."
                tone="ok"
              />
            </View>
          </RegistryWorkspaceSection>

        </View>
      </View>
    </ScrollView>
  );
}

