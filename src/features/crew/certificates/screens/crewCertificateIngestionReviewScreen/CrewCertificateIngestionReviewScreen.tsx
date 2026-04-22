import { getBaseUrl } from "@/src/api/baseUrl";
import { Button, ErrorState, Loading, Text } from "@/src/components";
import { useToast } from "@/src/context/ToastProvider";
import { useCertificateTypes } from "@/src/features/certificates/core";
import { useCrewById } from "../../../core/hooks/useCrewById";
import { isIsoDateOnly } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Linking, Pressable, ScrollView, View } from "react-native";
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

function getExtractionMethodLabel(method: string) {
  switch (method) {
    case "OCR_TEXT":
      return "OCR text extraction";
    case "PDF_TEXT":
      return "PDF text extraction";
    case "MANUAL_REVIEW":
      return "Manual review";
    default:
      return method;
  }
}

export default function CrewCertificateIngestionReviewScreen() {
  const router = useRouter();
  const { show } = useToast();
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
    try {
      await cancelIngestion();
      show("Upload cancelled", "success");
      router.replace(
        `/projects/${pid}/vessels/${aid}/crew/${cid}/certificates`,
      );
    } catch {
      show("Failed to cancel upload", "error");
    }
  }

  if (loading || crewLoading) return <Loading fullScreen />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (crewError)
    return <ErrorState message={crewError} onRetry={refreshCrew} />;
  if (!ingestion) {
    return (
      <ErrorState
        message="Crew certificate ingestion not found."
        onRetry={refresh}
      />
    );
  }

  return (
    <View className="flex-1 bg-shellCanvas">
      <ScrollView
        contentContainerClassName="gap-5 p-4 web:p-6 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3">
          <Pressable
            onPress={() =>
              router.replace(
                `/projects/${pid}/vessels/${aid}/crew/${cid}/certificates`,
              )
            }
            disabled={confirming}
            className="self-start flex-row items-center gap-2"
          >
            <Ionicons name="chevron-back" size={16} className="text-accent" />
            <Text className="text-accent font-semibold">
              Back to crew certificates
            </Text>
          </Pressable>

          <View className="web:flex-row web:items-start web:justify-between gap-4">
            <View className="gap-1 flex-1">
              <Text className="text-textMain text-[34px] web:text-[44px] font-semibold leading-[110%]">
                Review Candidate
              </Text>
              <Text className="text-muted text-[14px]">
                Confirm the extracted fields for {ingestion.fileName}. This step
                creates the official crew certificate record in `SUBMITTED`.
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <Button
                variant="outline"
                size="lg"
                onPress={onCancelIngestion}
                disabled={confirming || workflowLoading}
                className="rounded-full"
              >
                Cancel upload
              </Button>

              <Button
                variant="default"
                size="lg"
                onPress={onConfirm}
                disabled={
                  !values.certificateTypeId || confirming || workflowLoading
                }
                className="rounded-full"
                rightIcon={
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={16}
                    className="text-textMain"
                  />
                }
              >
                {confirming ? "Creating..." : "Create submitted record"}
              </Button>
            </View>
          </View>
        </View>

        <View className="w-full web:max-w-[980px] self-center gap-5">
          <View className="rounded-[20px] border border-warning/30 bg-warning/10 p-4 gap-2">
            <Text className="text-textMain font-semibold text-[13px]">
              Candidate extraction
            </Text>
            <Text className="text-muted text-[12px] leading-[18px]">
              Crew: {crew?.fullName ?? "Unknown"} | Method:{" "}
              {getExtractionMethodLabel(ingestion.extractionMethod)} {" | "}
              Confidence: {ingestion.extractionConfidence}
            </Text>
            {ingestion.extractionWarnings.map((warning) => (
              <Text key={warning} className="text-warning text-[12px]">
                {warning}
              </Text>
            ))}
            <Text className="text-muted text-[12px]">
              File: <Text className="text-textMain">{ingestion.fileName}</Text>
            </Text>
            <Text className="text-muted text-[12px] leading-[18px]">
              If no expiry date is detected for a crew certificate, the system
              defaults to issue date + 5 years. If the issue date is also
              missing, it uses the upload created date + 5 years.
            </Text>
            {ingestion.certificateName || ingestion.certificateCode ? (
              <Text className="text-muted text-[12px]">
                Detected type:{" "}
                <Text className="text-textMain">
                  {ingestion.certificateName ?? "Unassigned"}
                  {ingestion.certificateCode
                    ? ` (${ingestion.certificateCode})`
                    : ""}
                </Text>
              </Text>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              onPress={openUploadedFile}
              disabled={confirming || !ingestion.url}
              className="rounded-full self-start"
            >
              Open source document
            </Button>
            {!ingestion.url ? (
              <Text className="text-warning text-[12px]">
                File preview is not available yet for this upload.
              </Text>
            ) : null}
          </View>

          <View className="rounded-[20px] border border-shellLine bg-shellPanelSoft p-4 gap-3">
            <Text className="text-textMain font-semibold text-[13px]">
              Extracted candidate preview
            </Text>

            {hasStructuredCandidate ? (
              <View className="gap-2">
                <Text className="text-muted text-[12px]">
                  Number:{" "}
                  <Text className="text-textMain">
                    {ingestion.candidateNumber ?? "Not confidently detected"}
                  </Text>
                </Text>
                <Text className="text-muted text-[12px]">
                  Issuer:{" "}
                  <Text className="text-textMain">
                    {ingestion.candidateIssuer ?? "Not confidently detected"}
                  </Text>
                </Text>
                <Text className="text-muted text-[12px]">
                  Issue date:{" "}
                  <Text className="text-textMain">
                    {ingestion.candidateIssueDate
                      ? ingestion.candidateIssueDate.slice(0, 10)
                      : "Not confidently detected"}
                  </Text>
                </Text>
                <Text className="text-muted text-[12px]">
                  Expiry date:{" "}
                  <Text className="text-textMain">
                    {ingestion.candidateExpiryDate
                      ? ingestion.candidateExpiryDate.slice(0, 10)
                      : "Not confidently detected"}
                  </Text>
                </Text>
              </View>
            ) : (
              <Text className="text-warning text-[12px] leading-[18px]">
                This document was processed, but the extracted fields were not
                confident enough to prefill the certificate metadata. Review the
                text preview below and complete the fields manually if needed.
              </Text>
            )}

            {ingestion.extractedTextPreview ? (
              <View className="rounded-[16px] border border-shellLine bg-shellPanelSoft p-3 gap-2">
                <Text className="text-muted text-[12px]">
                  {ingestion.extractionMethod === "OCR_TEXT"
                    ? "Extracted OCR text"
                    : "Extracted text preview"}
                </Text>
                <Text className="text-textMain text-[12px] leading-[18px]">
                  {ingestion.extractedTextPreview}
                </Text>
              </View>
            ) : null}
          </View>

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
            disabled={confirming}
          />
        </View>
      </ScrollView>
    </View>
  );
}
