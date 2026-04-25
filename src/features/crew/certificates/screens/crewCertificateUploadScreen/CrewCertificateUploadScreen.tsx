import {
  Button,
  ErrorState,
  Field,
  Loading,
  Text,
} from "@/src/components";
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
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { useCrewById } from "../../../core/hooks/useCrewById";
import {
  documentStateTone,
  requirementStatusLabel,
  titleCaseToken,
} from "../crewCertificateTask.helpers";
import {
  useCreateCrewRequirementIngestion,
  useCreateExtraCrewCertificateIngestion,
  useCrewCertificateRequirementsByCrew,
} from "../../hooks";

type CrewCertificateUploadFormValues = {
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
        <View
          className={[
            "self-start rounded-full border px-2.5 py-1",
            ui.badge,
          ].join(" ")}
        >
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

export default function CrewCertificateUploadScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { projectId, assetId, crewId, requirementId, certificateTypeId } =
    useLocalSearchParams<{
      projectId: string;
      assetId: string;
      crewId: string;
      requirementId?: string;
      certificateTypeId?: string;
    }>();

  const pid = String(projectId);
  const aid = String(assetId);
  const cid = String(crewId);
  const rid = requirementId ? String(requirementId) : null;
  const initialCertificateTypeId = certificateTypeId
    ? String(certificateTypeId)
    : null;
  const isRequirementFlow = Boolean(rid);

  const {
    crew,
    loading: crewLoading,
    error: crewError,
    refresh: refreshCrew,
  } = useCrewById(pid, aid, cid);
  const { requirements, loading: requirementsLoading } =
    useCrewCertificateRequirementsByCrew(pid, aid, cid);

  const requirement = useMemo(() => {
    if (!rid) return null;
    return requirements.find((row) => row.id === rid) ?? null;
  }, [requirements, rid]);

  const { handleSubmit, setValue, watch } =
    useForm<CrewCertificateUploadFormValues>({
      defaultValues: {
        notes: "",
      },
    });
  const notes = watch("notes");
  const [localError, setLocalError] = useState<string | null>(null);
  const [file, setFile] = useState<{
    uri: string;
    name: string;
    mimeType: string;
    file?: unknown;
  } | null>(null);

  const requirementUpload = useCreateCrewRequirementIngestion(
    pid,
    aid,
    cid,
    rid ?? "",
  );
  const extraUpload = useCreateExtraCrewCertificateIngestion(pid, aid, cid);

  const uploading =
    requirementUpload.loading || extraUpload.loading || requirementsLoading;
  const uploadError = requirementUpload.error ?? extraUpload.error;
  const assignedVesselName =
    crew?.assetName ?? crew?.asset?.name ?? "Assigned vessel";

  const summaryItems = useMemo<RegistrySummaryItem[]>(
    () => [
      {
        label: "Intake",
        value: isRequirementFlow ? "Requirement document" : "Supporting document",
        helper: isRequirementFlow
          ? "linked to an active crew certificate requirement"
          : "reviewed before creating a structured record",
        tone: isRequirementFlow ? "accent" : "info",
      },
      {
        label: "Crew",
        value: crew?.fullName ?? "Loading...",
        helper: crew?.rank ?? "Crew profile context",
        tone: crew ? "ok" : "neutral",
      },
      {
        label: "Vessel",
        value: assignedVesselName,
        helper: crew?.department
          ? titleCaseToken(crew.department)
          : "Current assigned vessel context",
        tone: crew?.assetId ? "info" : "neutral",
      },
      {
        label: "Document",
        value: file ? "Selected" : "Pending",
        helper: file?.name ?? "PDF, JPG, JPEG, or PNG",
        tone: documentStateTone(Boolean(file)),
      },
    ],
    [assignedVesselName, crew, file, isRequirementFlow],
  );

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

  async function onUpload(values: CrewCertificateUploadFormValues) {
    setLocalError(null);

    if (!file) {
      setLocalError("Choose a PDF or image first.");
      return;
    }

    try {
      const ingestion = isRequirementFlow
        ? await requirementUpload.submit({
            file,
            notes: values.notes.trim() || undefined,
          })
        : await extraUpload.submit({
            file,
            notes: values.notes.trim() || undefined,
            certificateTypeId: initialCertificateTypeId ?? undefined,
          });

      show("Document uploaded. Review the extracted candidate next.", "success");
      router.replace({
        pathname: "/projects/[projectId]/crew/certificates/review",
        params: {
          projectId: pid,
          assetId: aid,
          crewId: cid,
          ingestionId: ingestion.id,
        },
      });
    } catch {
      show("Upload failed", "error");
    }
  }

  function goBack() {
    router.replace(`/projects/${pid}/vessels/${aid}/crew/${cid}/certificates`);
  }

  function openCrewProfile() {
    router.push(`/projects/${pid}/vessels/${aid}/crew/${cid}`);
  }

  if (crewLoading) return <Loading fullScreen />;
  if (crewError) return <ErrorState message={crewError} onRetry={refreshCrew} />;
  if (!crew) {
    return (
      <ErrorState message="Crew member not found." onRetry={refreshCrew} />
    );
  }

  return (
    <ScrollView
      contentContainerClassName="gap-5 p-4 web:p-6 pb-10"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-4">
        <RegistryWorkspaceHeader
          title={
            isRequirementFlow
              ? "Upload crew certificate evidence"
              : "Add extra certificate evidence"
          }
          eyebrow="Crew certificate intake task"
          subtitle={`Upload the source document for ${crew.fullName}. ARXIS creates an extraction candidate first, and the structured certificate record appears only after review.`}
          actions={
            <>
              <RegistryHeaderActionButton
                variant="soft"
                iconName="chevron-back-outline"
                iconSide="left"
                onPress={goBack}
              >
                Crew certificates
              </RegistryHeaderActionButton>

              <RegistryHeaderActionButton
                variant="outline"
                iconName="person-outline"
                iconSide="right"
                onPress={openCrewProfile}
              >
                Crew profile
              </RegistryHeaderActionButton>
            </>
          }
        />

        <RegistrySummaryStrip items={summaryItems} />
      </View>

      <View className="gap-5 web:xl:flex-row web:xl:items-start">
        <View className="min-w-0 flex-[1.35] gap-5">
          <RegistryWorkspaceSection
            title="Source document"
            subtitle="Use one PDF or image as the source of truth for this intake. Upload creates the review candidate, not the final certificate."
          >
            <View className="gap-5">
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
                        This upload can satisfy the active crew certificate requirement after review.
                      </Text>
                    </View>

                    <RegistryTablePill
                      label={requirementStatusLabel(requirement.status).toUpperCase()}
                      tone={requirement.status === "MISSING" ? "warn" : "info"}
                    />
                  </View>
                </View>
              ) : null}

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
                    label={file ? "READY TO EXTRACT" : "PENDING FILE"}
                    tone={file ? "ok" : "warn"}
                  />
                </View>
              </View>

              <View className="flex-row flex-wrap items-center gap-2">
                <Button
                  variant={file ? "outline" : "default"}
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

        <View className="w-full gap-5 web:xl:w-[380px]">
          <RegistryWorkspaceSection
            title="What happens next"
            subtitle="This lane follows the same evidence-first document flow used across compliance."
          >
            <View className="gap-0">
              <FlowStep
                step="Step 1"
                title="Upload source evidence"
                description="Store the original PDF or image and create an extraction candidate tied to this crew member."
                tone="accent"
              />
              <FlowStep
                step="Step 2"
                title="Review the candidate"
                description="Check type, number, issuer, and dates against the source document before anything becomes a structured record."
                tone="info"
              />
              <View className="relative pl-8">
                <View className="absolute left-[7px] top-[8px] h-4 w-4 items-center justify-center rounded-full border border-shellLine bg-shellPanel">
                  <View className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                </View>

                <View className="gap-2">
                  <View className="self-start rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1">
                    <Text className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100">
                      Step 3
                    </Text>
                  </View>
                  <View className="gap-1">
                    <Text className="text-[13px] font-semibold text-textMain">
                      Create submitted record
                    </Text>
                    <Text className="text-[12px] leading-[18px] text-muted">
                      Only the reviewed candidate enters the crew certificate lane
                      as a structured record in submitted state.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </RegistryWorkspaceSection>
        </View>
      </View>
    </ScrollView>
  );
}
