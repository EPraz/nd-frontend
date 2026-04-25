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
import { useCertificateTypes } from "@/src/features/certificates/core";
import { isIsoDateOnly } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Linking, ScrollView, View } from "react-native";
import { canUser } from "@/src/security/rolePermissions";
import { useCrewById } from "../../../core/hooks/useCrewById";
import { CrewCertificateFormCard } from "../../components";
import {
  applyCrewCertificateFormPatch,
  CrewCertificateFormValues,
  crewCertificateFormFromIngestion,
  emptyCrewCertificateFormValues,
  toConfirmCrewCertificateIngestionInput,
} from "../../helpers";
import {
  useConfirmCrewCertificateIngestion,
  useCrewCertificateIngestionById,
  useCrewCertificateWorkflowActions,
} from "../../hooks";
import {
  confidenceLabel,
  confidenceTone,
  extractionMethodLabel,
  formatTaskDateTime,
  ingestionSourceLabel,
  titleCaseToken,
} from "../crewCertificateTask.helpers";

type ContextRowProps = {
  label: string;
  value: string;
  helper?: string;
};

function ContextRow({ label, value, helper }: ContextRowProps) {
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

export default function CrewCertificateIngestionReviewScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { session } = useSessionContext();
  const { projectId, assetId, crewId, ingestionId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
    crewId: string;
    ingestionId: string;
  }>();

  const pid = String(projectId);
  const aid = String(assetId);
  const cid = String(crewId);
  const iid = String(ingestionId);
  const canCancelUpload = canUser(session, "DOCUMENT_UPLOAD");
  const canConfirmIngestion = canUser(session, "INGESTION_CONFIRM");

  const {
    crew,
    loading: crewLoading,
    error: crewError,
    refresh: refreshCrew,
  } = useCrewById(pid, aid, cid);
  const { ingestion, loading, error, refresh } =
    useCrewCertificateIngestionById(pid, aid, cid, iid);
  const {
    submit,
    loading: confirming,
    error: confirmError,
  } = useConfirmCrewCertificateIngestion(pid, aid, cid, iid);
  const { cancelIngestion, loading: workflowLoading } =
    useCrewCertificateWorkflowActions(pid, aid, cid, undefined, iid);
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
  } = useForm<CrewCertificateFormValues>({
    defaultValues: emptyCrewCertificateFormValues(),
  });
  const values = watch();
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!ingestion || isDirty) return;
    reset(crewCertificateFormFromIngestion(ingestion, certificateTypes));
  }, [certificateTypes, ingestion, isDirty, reset]);

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
              helper: "candidate text extraction path",
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
                  : "no extraction warnings returned",
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

  async function onConfirm() {
    setLocalError(null);

    if (!canConfirmIngestion) {
      show("Your role cannot confirm crew certificate candidates.", "error");
      return;
    }

    if (!values.certificateTypeId) {
      setLocalError("Select a certificate type.");
      return;
    }
    if (values.issueDate.trim() && !isIsoDateOnly(values.issueDate)) {
      setLocalError("Invalid issue date. Use format YYYY-MM-DD.");
      return;
    }
    if (values.expiryDate.trim() && !isIsoDateOnly(values.expiryDate)) {
      setLocalError("Invalid expiry date. Use format YYYY-MM-DD.");
      return;
    }

    try {
      const result = await submit(
        toConfirmCrewCertificateIngestionInput({
          ...values,
          certificateTypeId: values.certificateTypeId,
        }),
      );
      show(
        "Crew certificate created in submitted state. Approve it when the metadata is ready.",
        "success",
      );
      router.replace(
        `/projects/${pid}/vessels/${aid}/crew/${cid}/certificates/${result.certificate.id}`,
      );
    } catch {
      show("Failed to confirm crew certificate candidate", "error");
    }
  }

  async function onCancelIngestion() {
    if (!canCancelUpload) {
      show("Your role cannot cancel crew certificate uploads.", "error");
      return;
    }

    try {
      await cancelIngestion();
      show("Upload cancelled", "success");
      router.replace(`/projects/${pid}/vessels/${aid}/crew/${cid}/certificates`);
    } catch {
      show("Failed to cancel upload", "error");
    }
  }

  function goBack() {
    router.replace(`/projects/${pid}/vessels/${aid}/crew/${cid}/certificates`);
  }

  if (loading || crewLoading) return <Loading fullScreen />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (crewError) {
    return <ErrorState message={crewError} onRetry={refreshCrew} />;
  }
  if (!ingestion) {
    return (
      <ErrorState
        message="Crew certificate ingestion not found."
        onRetry={refresh}
      />
    );
  }
  if (!crew) {
    return <ErrorState message="Crew member not found." onRetry={refreshCrew} />;
  }

  return (
    <ScrollView
      contentContainerClassName="gap-5 p-4 web:p-6 pb-10"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-4">
        <RegistryWorkspaceHeader
          title="Review extracted crew certificate"
          eyebrow="Crew certificate review lane"
          subtitle={`Confirm the candidate from ${ingestion.fileName}. This review creates the structured crew certificate record in submitted state.`}
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
            subtitle="Inspect the candidate, warnings, and source document before confirming anything into the crew certificate lane."
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
                        This candidate can satisfy the active crew certificate requirement after review.
                      </Text>
                      <Text className="text-[12px] leading-[18px] text-muted">
                        Confirm the final structured type and metadata against the source document before creating the submitted record.
                      </Text>
                    </View>

                    <RegistryTablePill
                      label="REQUIREMENT DOCUMENT"
                      tone="accent"
                    />
                  </View>
                </View>
              ) : null}

              <View className="rounded-[20px] border border-shellLine bg-shellPanelSoft p-4">
                <View className="flex-row flex-wrap items-start justify-between gap-4">
                  <View className="min-w-[220px] flex-1 gap-2">
                    <Text className="text-[16px] font-semibold text-textMain">
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

                <View className="mt-4 flex-row flex-wrap gap-2">
                  <SnapshotMetaTag
                    label={ingestionSourceLabel(ingestion.sourceKind).toUpperCase()}
                    tone={ingestion.sourceKind === "REQUIREMENT" ? "accent" : "info"}
                  />
                  <SnapshotMetaTag
                    label={extractionMethodLabel(ingestion.extractionMethod).toUpperCase()}
                    tone="info"
                  />
                  {ingestion.certificateName || ingestion.certificateCode ? (
                    <SnapshotMetaTag
                      label={`${ingestion.certificateCode ?? "TYPE"} ${ingestion.certificateName ?? ""}`.trim()}
                      tone="ok"
                    />
                  ) : null}
                </View>

                <View className="mt-4 flex-row flex-wrap gap-x-8 gap-y-4">
                  <ContextRow
                    label="Review status"
                    value={titleCaseToken(ingestion.status)}
                  />
                  <ContextRow
                    label="Source mime"
                    value={ingestion.mimeType}
                  />
                  <ContextRow
                    label="Last update"
                    value={formatTaskDateTime(ingestion.updatedAt)}
                  />
                </View>
              </View>

              {ingestion.extractionWarnings.length > 0 ? (
                <View className="gap-3">
                  <Text className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                    Analyst warnings
                  </Text>

                  <View className="gap-2">
                    {ingestion.extractionWarnings.map((warning) => (
                      <View
                        key={warning}
                        className="flex-row items-start gap-3 rounded-[18px] border border-amber-300/25 bg-amber-300/10 px-4 py-3"
                      >
                        <View className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-300" />
                        <Text className="flex-1 text-[12px] leading-[18px] text-amber-100">
                          {warning}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <View className="rounded-[18px] border border-emerald-400/25 bg-emerald-400/10 px-4 py-3">
                  <Text className="text-[12px] leading-[18px] text-emerald-100">
                    No extraction warnings were returned for this candidate.
                  </Text>
                </View>
              )}
            </View>
          </RegistryWorkspaceSection>

          <RegistryWorkspaceSection
            title="Candidate preview"
            subtitle="The extractor prefilled these fields when confidence was high enough. Complete the rest manually if the source document needs interpretation."
          >
            <View className="gap-4">
              {hasStructuredCandidate ? (
                <View className="flex-row flex-wrap gap-3">
                  <CandidateFactTile
                    label="Number"
                    value={ingestion.candidateNumber ?? "Not detected"}
                    helper="Certificate number candidate"
                    tone={ingestion.candidateNumber ? "accent" : "neutral"}
                  />
                  <CandidateFactTile
                    label="Issuer"
                    value={ingestion.candidateIssuer ?? "Not detected"}
                    helper="Issuer candidate"
                    tone={ingestion.candidateIssuer ? "info" : "neutral"}
                  />
                  <CandidateFactTile
                    label="Issue date"
                    value={
                      ingestion.candidateIssueDate
                        ? ingestion.candidateIssueDate.slice(0, 10)
                        : "Not detected"
                    }
                    helper="Issue date candidate"
                    tone={ingestion.candidateIssueDate ? "ok" : "neutral"}
                  />
                  <CandidateFactTile
                    label="Expiry date"
                    value={
                      ingestion.candidateExpiryDate
                        ? ingestion.candidateExpiryDate.slice(0, 10)
                        : "Not detected"
                    }
                    helper="Expiry date candidate"
                    tone={ingestion.candidateExpiryDate ? "ok" : "neutral"}
                  />
                </View>
              ) : (
                <View className="rounded-[18px] border border-amber-300/25 bg-amber-300/10 px-4 py-3">
                  <Text className="text-[12px] leading-[18px] text-amber-100">
                    The document was processed, but the extractor was not
                    confident enough to prefill the main certificate fields. Use
                    the source document to complete the metadata manually.
                  </Text>
                </View>
              )}
            </View>
          </RegistryWorkspaceSection>

          <RegistryWorkspaceSection
            title="Confirm structured record"
            subtitle="Choose the final certificate type, validate dates, and create the submitted crew certificate record."
          >
            <CrewCertificateFormCard
              crew={crew}
              certificateTypes={certificateTypes}
              certificateTypesLoading={certificateTypesLoading}
              certificateTypesError={certificateTypesError}
              values={values}
              onChange={(patch) => {
                setLocalError(null);
                applyCrewCertificateFormPatch(setValue, patch);
              }}
              localError={localError}
              apiError={confirmError}
              disabled={!canConfirmIngestion || confirming}
            />
            {!canConfirmIngestion ? (
              <Text className="mt-3 text-[12px] leading-5 text-muted">
                This candidate is read-only for your role. Backend policy also
                blocks direct confirmation requests.
              </Text>
            ) : null}
          </RegistryWorkspaceSection>
        </View>

        <View className="w-full gap-5 web:xl:w-[380px]">
          <RegistryWorkspaceSection
            title="Review policy"
            subtitle="Keep the review lane anchored to the source document before anything enters compliance."
          >
            <View className="gap-0">
              <ReviewStep
                badge="Check 1"
                title="Validate the type"
                description="Confirm the structured certificate type that best matches the uploaded document and the crew compliance lane."
                tone="accent"
                showConnector
              />
              <ReviewStep
                badge="Check 2"
                title="Validate dates and issuer"
                description="Correct any extracted metadata that is incomplete, ambiguous, or not confidently detected."
                tone="info"
                showConnector
              />
              <ReviewStep
                badge="Rule"
                title="Missing expiry fallback"
                description="If no expiry date is detected, ARXIS defaults to issue date + 5 years. If issue date is also missing, it uses upload created date + 5 years."
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
