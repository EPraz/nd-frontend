import { getBaseUrl } from "@/src/api/baseUrl";
import { Button, ErrorState, Loading, Text } from "@/src/components";
import {
  RegistryHeaderActionButton,
  RegistrySummaryStrip,
  RegistryWorkspaceHeader,
  RegistryWorkspaceSection,
  type RegistrySummaryItem,
} from "@/src/components/ui/registryWorkspace";
import { RegistryTablePill } from "@/src/components/ui/table";
import { useSessionContext } from "@/src/context/SessionProvider";
import { useToast } from "@/src/context/ToastProvider";
import type { AssetDto } from "@/src/contracts/assets.contract";
import { useCertificateTypes } from "@/src/features/certificates/core/hooks/useCertificateTypes";
import { useVessels } from "@/src/features/vessels/core";
import { isIsoDateOnly } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Linking, ScrollView, View } from "react-native";
import { canUser } from "@/src/security/rolePermissions";
import CertificateFormCard from "@/src/features/certificates/core/components/certificateFormCard/CertificateFormCard";
import {
  CertificateFormValues,
  emptyCertificateFormValues,
  applyCertificateFormPatch,
  certificateFormFromIngestion,
  toConfirmCertificateIngestionInput,
} from "@/src/features/certificates/shared";
import {
  confidenceLabel,
  confidenceTone,
  extractionMethodLabel,
  formatTaskDateTime,
  ingestionSourceLabel,
  titleCaseToken,
} from "../certificateTask.helpers";
import { useCertificateWorkflowActions } from "../../hooks/useCertificateWorkflowActions";
import { useCertificateIngestionById } from "../../hooks/useCertificateIngestionById";
import { useConfirmCertificateIngestion } from "../../hooks/useConfirmCertificateIngestion";

type CandidateTone = "accent" | "info" | "ok" | "neutral";

function candidateTileClasses(tone: CandidateTone) {
  switch (tone) {
    case "ok":
      return {
        surface: "border-emerald-400/25 bg-emerald-400/10",
        label: "text-emerald-100/80",
        value: "text-emerald-50",
      };
    case "info":
      return {
        surface: "border-sky-400/25 bg-sky-400/10",
        label: "text-sky-100/80",
        value: "text-sky-50",
      };
    case "neutral":
      return {
        surface: "border-shellLine bg-shellPanelSoft",
        label: "text-muted",
        value: "text-textMain",
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

function CandidateFactTile({
  label,
  value,
  helper,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  tone: CandidateTone;
}) {
  const ui = candidateTileClasses(tone);

  return (
    <View
      className={[
        "min-w-[180px] flex-1 gap-1.5 rounded-[18px] border px-4 py-3",
        ui.surface,
      ].join(" ")}
    >
      <Text className={["text-[10px] font-semibold uppercase tracking-[0.24em]", ui.label].join(" ")}>
        {label}
      </Text>
      <Text className={["text-[15px] font-semibold", ui.value].join(" ")}>
        {value}
      </Text>
      <Text className="text-[12px] leading-[18px] text-muted">{helper}</Text>
    </View>
  );
}

type SnapshotTagTone = "accent" | "info" | "ok" | "warn";

function snapshotTagClasses(tone: SnapshotTagTone) {
  switch (tone) {
    case "ok":
      return {
        surface: "border-emerald-400/30 bg-emerald-400/12",
        dot: "bg-emerald-300",
        text: "text-emerald-100",
      };
    case "warn":
      return {
        surface: "border-amber-300/30 bg-amber-300/12",
        dot: "bg-amber-300",
        text: "text-amber-100",
      };
    case "info":
      return {
        surface: "border-sky-400/30 bg-sky-400/12",
        dot: "bg-sky-300",
        text: "text-sky-100",
      };
    case "accent":
    default:
      return {
        surface: "border-accent/35 bg-accent/14",
        dot: "bg-accent",
        text: "text-accent",
      };
  }
}

function SnapshotMetaTag({
  label,
  tone,
}: {
  label: string;
  tone: SnapshotTagTone;
}) {
  const ui = snapshotTagClasses(tone);

  return (
    <View
      className={[
        "flex-row items-center gap-2 rounded-full border px-3 py-1.5",
        ui.surface,
      ].join(" ")}
    >
      <View className={["h-2 w-2 rounded-full", ui.dot].join(" ")} />
      <Text
        className={[
          "text-[10px] font-semibold uppercase tracking-[0.16em]",
          ui.text,
        ].join(" ")}
      >
        {label}
      </Text>
    </View>
  );
}

function ContextRow({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <View className="gap-1">
      <Text className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">
        {label}
      </Text>
      <Text className="text-[14px] font-semibold text-textMain">{value}</Text>
      {helper ? (
        <Text className="text-[12px] leading-[18px] text-muted">{helper}</Text>
      ) : null}
    </View>
  );
}

type ReviewStepTone = "accent" | "info" | "ok";

function reviewStepClasses(tone: ReviewStepTone) {
  switch (tone) {
    case "ok":
      return {
        dot: "bg-emerald-300",
        badge: "border-emerald-400/25 bg-emerald-400/10 text-emerald-100",
      };
    case "info":
      return {
        dot: "bg-sky-300",
        badge: "border-sky-400/25 bg-sky-400/10 text-sky-100",
      };
    case "accent":
    default:
      return {
        dot: "bg-accent",
        badge: "border-accent/30 bg-accent/12 text-accent",
      };
  }
}

function ReviewStep({
  badge,
  title,
  description,
  tone,
  showConnector,
}: {
  badge: string;
  title: string;
  description: string;
  tone: ReviewStepTone;
  showConnector: boolean;
}) {
  const ui = reviewStepClasses(tone);

  return (
    <View className="relative pl-8">
      <View className="absolute left-[7px] top-[8px] h-4 w-4 items-center justify-center rounded-full border border-shellLine bg-shellPanel">
        <View className={["h-2.5 w-2.5 rounded-full", ui.dot].join(" ")} />
      </View>

      {showConnector ? (
        <View className="absolute bottom-0 left-[14px] top-[24px] w-px bg-shellLine" />
      ) : null}

      <View className={["gap-2", showConnector ? "pb-4" : ""].join(" ")}>
        <View className={["self-start rounded-full border px-2.5 py-1", ui.badge].join(" ")}>
          <Text className="text-[10px] font-semibold uppercase tracking-[0.14em]">
            {badge}
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

export default function CertificateIngestionReviewScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { session } = useSessionContext();
  const { projectId, assetId, ingestionId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
    ingestionId: string;
  }>();

  const pid = String(projectId);
  const aid = String(assetId);
  const iid = String(ingestionId);
  const canCancelUpload = canUser(session, "DOCUMENT_UPLOAD");
  const canConfirmIngestion = canUser(session, "INGESTION_CONFIRM");

  const { ingestion, loading, error, refresh } = useCertificateIngestionById(
    pid,
    aid,
    iid,
  );
  const {
    submit,
    loading: confirming,
    error: confirmError,
  } = useConfirmCertificateIngestion(pid, aid, iid);
  const {
    cancelIngestion,
    loading: workflowLoading,
  } = useCertificateWorkflowActions(pid, aid, undefined, iid);
  const {
    vessels,
    loading: vesselsLoading,
    error: vesselsError,
  } = useVessels(pid);
  const {
    certificateTypes,
    loading: certificateTypesLoading,
    error: certificateTypesError,
  } = useCertificateTypes(pid);

  const {
    formState: { isDirty },
    reset,
    setValue,
    watch,
  } = useForm<CertificateFormValues>({
    defaultValues: emptyCertificateFormValues(),
  });
  const values = watch();
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!ingestion || isDirty) return;
    reset({
      ...emptyCertificateFormValues(),
      ...certificateFormFromIngestion(ingestion, certificateTypes),
      selectedVessel: vessels.find((vessel) => vessel.id === aid) ?? null,
    });
  }, [aid, certificateTypes, ingestion, isDirty, reset, vessels]);

  const currentVessel = useMemo<AssetDto | null>(() => {
    return vessels.find((vessel) => vessel.id === aid) ?? null;
  }, [aid, vessels]);
  const hasStructuredCandidate = Boolean(
    ingestion?.candidateNumber ||
      ingestion?.candidateIssuer ||
      ingestion?.candidateIssueDate ||
      ingestion?.candidateExpiryDate,
  );

  const summaryItems = useMemo<RegistrySummaryItem[]>(
    () =>
      ingestion
        ? [
            {
              label: "Intake",
              value: ingestionSourceLabel(ingestion.sourceKind),
              helper: ingestion.fileName,
              tone: ingestion.sourceKind === "REQUIREMENT" ? "accent" : "info",
            },
            {
              label: "Method",
              value: extractionMethodLabel(ingestion.extractionMethod),
              helper: "candidate extraction path",
              tone: "info",
            },
            {
              label: "Confidence",
              value: confidenceLabel(ingestion.extractionConfidence),
              helper: "field detection confidence",
              tone: confidenceTone(ingestion.extractionConfidence),
            },
            {
              label: "Warnings",
              value: String(ingestion.extractionWarnings.length),
              helper:
                ingestion.extractionWarnings.length > 0
                  ? "items still worth analyst attention"
                  : "no analyst warnings in this review",
              tone: ingestion.extractionWarnings.length > 0 ? "warn" : "ok",
            },
          ]
        : [],
    [ingestion],
  );

  async function openUploadedFile() {
    const fileUrl = ingestion?.url?.trim();
    if (!fileUrl) {
      show("Uploaded file is not available yet. Try refreshing once.", "error");
      return;
    }

    const absoluteUrl = fileUrl.startsWith("http")
      ? fileUrl
      : `${getBaseUrl()}${fileUrl}`;
    await Linking.openURL(absoluteUrl);
  }

  function goBack() {
    router.replace(`/projects/${pid}/certificates`);
  }

  async function onConfirm() {
    setLocalError(null);

    if (!canConfirmIngestion) {
      show("Your role cannot confirm certificate ingestion candidates.", "error");
      return;
    }

    if (!values.certificateTypeId) {
      setLocalError("Selecciona un certificate type.");
      return;
    }
    if (values.issueDate.trim() && !isIsoDateOnly(values.issueDate)) {
      setLocalError("Issue date invalido. Usa formato YYYY-MM-DD.");
      return;
    }
    if (values.expiryDate.trim() && !isIsoDateOnly(values.expiryDate)) {
      setLocalError("Expiry date invalido. Usa formato YYYY-MM-DD.");
      return;
    }

    try {
      const result = await submit(
        toConfirmCertificateIngestionInput({
          ...values,
          certificateTypeId: values.certificateTypeId,
        }),
      );
      show(
        "Certificate record created in submitted state. Approve it when the metadata is ready.",
        "success",
      );
      router.replace(
        `/projects/${pid}/vessels/${aid}/certificates/${result.certificate.id}`,
      );
    } catch {
      show("Failed to confirm certificate candidate", "error");
    }
  }

  async function onCancelIngestion() {
    if (!canCancelUpload) {
      show("Your role cannot cancel certificate uploads.", "error");
      return;
    }

    try {
      await cancelIngestion();
      show("Upload cancelled", "success");
      router.replace(`/projects/${pid}/certificates`);
    } catch {
      show("Failed to cancel upload", "error");
    }
  }

  if (loading) return <Loading fullScreen />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!ingestion) {
    return (
      <ErrorState
        message="Certificate ingestion not found."
        onRetry={refresh}
      />
    );
  }

  return (
    <ScrollView
      contentContainerClassName="gap-5 p-4 web:p-6 pb-10"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-4">
        <RegistryWorkspaceHeader
          title="Review extracted certificate"
          eyebrow="Certificate review lane"
          subtitle={`Confirm the candidate from ${ingestion.fileName}. This review creates the structured certificate record in submitted state.`}
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

              {ingestion.url ? (
                <RegistryHeaderActionButton
                  variant="outline"
                  iconName="open-outline"
                  iconSide="right"
                  onPress={openUploadedFile}
                >
                  Open source document
                </RegistryHeaderActionButton>
              ) : null}

              {canCancelUpload ? (
                <Button
                  variant="softDestructive"
                  size="pillSm"
                  className="rounded-full"
                  onPress={onCancelIngestion}
                  disabled={confirming || workflowLoading}
                  rightIcon={
                    <Ionicons
                      name="close-outline"
                      size={15}
                      className="text-destructive"
                    />
                  }
                >
                  Cancel upload
                </Button>
              ) : null}

              {canConfirmIngestion ? (
                <Button
                  variant="default"
                  size="pillSm"
                  className="rounded-full"
                  onPress={onConfirm}
                  disabled={
                    !values.certificateTypeId || confirming || workflowLoading
                  }
                  loading={confirming}
                  rightIcon={
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={15}
                      className="text-textMain"
                    />
                  }
                >
                  Create submitted record
                </Button>
              ) : null}
            </>
          }
        />

        <RegistrySummaryStrip items={summaryItems} />
      </View>

      <View className="gap-5 web:xl:flex-row web:xl:items-start">
        <View className="min-w-0 flex-[1.4] gap-5">
          <RegistryWorkspaceSection
            title="Extraction snapshot"
            subtitle="Inspect the candidate, warnings, and source document before confirming anything into the certificate lane."
          >
            <View className="gap-5">
              {ingestion.sourceKind === "REQUIREMENT" ? (
                <View className="rounded-[20px] border border-accent/25 bg-accent/10 p-4">
                  <View className="flex-row flex-wrap items-start justify-between gap-4">
                    <View className="min-w-[220px] flex-1 gap-1">
                      <Text className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent/80">
                        Requirement-linked intake
                      </Text>
                      <Text className="text-[14px] font-semibold text-textMain">
                        {ingestion.certificateName ?? "Requirement document"}
                        {ingestion.certificateCode
                          ? ` (${ingestion.certificateCode})`
                          : ""}
                      </Text>
                      <Text className="text-[12px] leading-[18px] text-muted">
                        This candidate can satisfy the active vessel certificate requirement after review.
                      </Text>
                    </View>

                    <RegistryTablePill label="REQUIREMENT DOCUMENT" tone="accent" />
                  </View>
                </View>
              ) : null}

              <View className="rounded-[20px] border border-shellLine bg-shellPanelSoft p-4">
                <View className="gap-4">
                  <View className="flex-row flex-wrap items-start justify-between gap-4">
                    <View className="min-w-[220px] flex-1 gap-1">
                      <Text className="text-[18px] font-semibold text-textMain">
                        {ingestion.fileName}
                      </Text>
                      <Text className="text-[12px] leading-[18px] text-muted">
                        Uploaded {formatTaskDateTime(ingestion.createdAt)}
                      </Text>
                    </View>

                    <RegistryTablePill
                      label={confidenceLabel(ingestion.extractionConfidence)}
                      tone={confidenceTone(ingestion.extractionConfidence)}
                    />
                  </View>

                  <View className="flex-row flex-wrap gap-2">
                    <SnapshotMetaTag
                      label={ingestionSourceLabel(ingestion.sourceKind).toUpperCase()}
                      tone={ingestion.sourceKind === "REQUIREMENT" ? "accent" : "info"}
                    />
                    <SnapshotMetaTag
                      label={extractionMethodLabel(ingestion.extractionMethod).toUpperCase()}
                      tone="info"
                    />
                    <SnapshotMetaTag
                      label={titleCaseToken(ingestion.status).toUpperCase()}
                      tone="ok"
                    />
                  </View>

                  <View className="grid gap-4 web:grid-cols-3">
                    <ContextRow
                      label="Review status"
                      value={titleCaseToken(ingestion.status)}
                      helper="candidate readiness inside this lane"
                    />
                    <ContextRow
                      label="Source MIME"
                      value={ingestion.mimeType}
                      helper="document type carried by this review"
                    />
                    <ContextRow
                      label="Last update"
                      value={formatTaskDateTime(ingestion.updatedAt)}
                      helper="most recent parsing or workflow change"
                    />
                  </View>
                </View>
              </View>

              {ingestion.extractionWarnings.length > 0 ? (
                <View className="gap-2">
                  <Text className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                    Analyst warnings
                  </Text>
                  {ingestion.extractionWarnings.map((warning) => (
                    <View
                      key={warning}
                      className="rounded-[18px] border border-amber-300/30 bg-amber-300/12 px-4 py-3"
                    >
                      <Text className="text-[12px] leading-[18px] text-amber-100">
                        {warning}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          </RegistryWorkspaceSection>

          <RegistryWorkspaceSection
            title="Candidate preview"
            subtitle="Review the extracted fields first. Complete anything missing or unclear in the structured record below."
          >
            <View className="gap-4">
              <View className="flex-row flex-wrap gap-4">
                <CandidateFactTile
                  label="Number"
                  value={ingestion.candidateNumber ?? "Not detected"}
                  helper="Certificate number candidate"
                  tone="accent"
                />
                <CandidateFactTile
                  label="Issuer"
                  value={ingestion.candidateIssuer ?? "Not detected"}
                  helper="Issuer candidate"
                  tone="info"
                />
                <CandidateFactTile
                  label="Issue date"
                  value={
                    ingestion.candidateIssueDate
                      ? ingestion.candidateIssueDate.slice(0, 10)
                      : "Not detected"
                  }
                  helper="Issue date candidate"
                  tone="ok"
                />
                <CandidateFactTile
                  label="Expiry date"
                  value={
                    ingestion.candidateExpiryDate
                      ? ingestion.candidateExpiryDate.slice(0, 10)
                      : "Not detected"
                  }
                  helper="Expiry date candidate"
                  tone="neutral"
                />
              </View>

              {!hasStructuredCandidate ? (
                <Text className="text-[12px] leading-[18px] text-amber-100">
                  This document uploaded correctly, but ARXIS could not confidently prefill the main certificate metadata. Complete the structured record manually below.
                </Text>
              ) : null}
            </View>
          </RegistryWorkspaceSection>

          <RegistryWorkspaceSection
            title="Confirm structured record"
            subtitle="Choose the final certificate type and correct any metadata before the submitted record is created."
          >
            <CertificateFormCard
              fixedAssetId={aid}
              currentVessel={currentVessel}
              vessels={vessels}
              vesselsLoading={vesselsLoading}
              vesselsError={vesselsError}
              onCreateVessel={() => router.push(`/projects/${pid}/vessels/new`)}
              certificateTypes={certificateTypes}
              certificateTypesLoading={certificateTypesLoading}
              certificateTypesError={certificateTypesError}
              values={values}
              onChange={(patch: Partial<CertificateFormValues>) => {
                setLocalError(null);
                applyCertificateFormPatch(setValue, patch);
              }}
              localError={localError}
              apiError={confirmError}
            disabled={!canConfirmIngestion || confirming}
            showFilesNextHint={false}
          />
          {!canConfirmIngestion ? (
            <Text className="mt-3 text-[12px] leading-5 text-muted">
              This candidate is read-only for your role. Backend policy also
              blocks direct confirmation requests.
            </Text>
          ) : null}
        </RegistryWorkspaceSection>
        </View>

        <View className="min-w-0 flex-1 gap-5 web:xl:max-w-[400px]">
          <RegistryWorkspaceSection
            title="Review flow"
            subtitle="This step keeps the certificate lane aligned with real compliance work instead of turning uploads directly into records."
          >
            <View className="gap-1">
              <ReviewStep
                badge="01"
                title="Compare the candidate with the source"
                description="Validate the extracted number, issuer, and dates against the uploaded document."
                tone="accent"
                showConnector
              />
              <ReviewStep
                badge="02"
                title="Confirm the structured certificate type"
                description="Choose the real registry type if the intake came in as a supporting document."
                tone="info"
                showConnector
              />
              <ReviewStep
                badge="03"
                title="Create the submitted record"
                description="The record enters the certificate workspace in submitted state and can be approved separately."
                tone="ok"
                showConnector={false}
              />
            </View>
          </RegistryWorkspaceSection>

        </View>
      </View>
    </ScrollView>
  );
}

