import { getBaseUrl } from "@/src/api/baseUrl";
import { Button } from "@/src/components/ui/button/Button";
import ErrorState from "@/src/components/ui/errorState/ErrorState";
import Loading from "@/src/components/ui/loading/Loading";
import { Text } from "@/src/components/ui/text/Text";
import { useToast } from "@/src/context/ToastProvider";
import type { AssetDto } from "@/src/contracts/assets.contract";
import { useCertificateTypes } from "@/src/features/certificates/core/hooks/useCertificateTypes";
import { useVessels } from "@/src/features/vessels/core";
import { isIsoDateOnly } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Linking, Pressable, ScrollView, View } from "react-native";
import CertificateFormCard from "@/src/features/certificates/core/components/certificateFormCard/CertificateFormCard";
import {
  CertificateFormValues,
  emptyCertificateFormValues,
  applyCertificateFormPatch,
  certificateFormFromIngestion,
  toConfirmCertificateIngestionInput,
} from "@/src/features/certificates/shared";
import { useCertificateWorkflowActions } from "../../hooks/useCertificateWorkflowActions";
import { useCertificateIngestionById } from "../../hooks/useCertificateIngestionById";
import { useConfirmCertificateIngestion } from "../../hooks/useConfirmCertificateIngestion";

export default function CertificateIngestionReviewScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { projectId, assetId, ingestionId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
    ingestionId: string;
  }>();

  const pid = String(projectId);
  const aid = String(assetId);
  const iid = String(ingestionId);

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
    <View className="flex-1 bg-shellCanvas">
      <ScrollView
        contentContainerClassName="gap-5 p-4 web:p-6 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3">
          <Pressable
            onPress={() => router.replace(`/projects/${pid}/certificates`)}
            disabled={confirming}
            className="self-start flex-row items-center gap-2"
          >
            <Ionicons name="chevron-back" size={16} className="text-accent" />
            <Text className="text-accent font-semibold">
              Back to compliance
            </Text>
          </Pressable>

          <View className="web:flex-row web:items-start web:justify-between gap-4">
            <View className="gap-1 flex-1">
              <Text className="text-textMain text-[34px] web:text-[44px] font-semibold leading-[110%]">
                Review Candidate
              </Text>
              <Text className="text-muted text-[14px]">
                Confirm the extracted fields for {ingestion.fileName}. This step
                creates the official certificate record in `SUBMITTED`.
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
                disabled={!values.certificateTypeId || confirming || workflowLoading}
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
              Method: {ingestion.extractionMethod} | Confidence:{" "}
              {ingestion.extractionConfidence}
            </Text>
            {ingestion.extractionWarnings.map((warning) => (
              <Text key={warning} className="text-warning text-[12px]">
                {warning}
              </Text>
            ))}
            <Text className="text-muted text-[12px]">
              File: <Text className="text-textMain">{ingestion.fileName}</Text>
            </Text>
            {(ingestion.certificateName || ingestion.certificateCode) ? (
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
              Open uploaded file
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
                This file uploaded correctly, but the extractor could not
                confidently prefill the main certificate fields. Review the
                text preview below and complete the metadata manually.
              </Text>
            )}

            {ingestion.extractedTextPreview ? (
              <View className="rounded-[16px] border border-shellLine bg-shellPanelSoft p-3 gap-2">
                <Text className="text-muted text-[12px]">Extracted text preview</Text>
                <Text className="text-textMain text-[12px] leading-[18px]">
                  {ingestion.extractedTextPreview}
                </Text>
              </View>
            ) : null}
          </View>

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
            disabled={confirming}
            showFilesNextHint={false}
          />
        </View>
      </ScrollView>
    </View>
  );
}


