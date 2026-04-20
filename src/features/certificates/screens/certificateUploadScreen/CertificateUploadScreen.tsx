import {
  Button,
  Card,
  CardContent,
  CardHeaderRow,
  CardTitle,
  Loading,
  PageHeader,
  StatCard,
  Text,
} from "@/src/components";
import { EmptyVesselsState } from "@/src/components/ui/forms/EmptyVesselsState";
import { Field } from "@/src/components/ui/forms/Field";
import { SearchableVesselSelect } from "@/src/components/ui/forms/SearchableVesselSelect";
import { VesselPill } from "@/src/components/ui/forms/VesselPill";
import { useToast } from "@/src/context/ToastProvider";
import { useVessels } from "@/src/features/vessels/hooks/useVessels";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { useCertificateRequirementsByAsset } from "../../hooks/useCertificateRequirementsByAsset";
import { useCreateExtraCertificateIngestion } from "../../hooks/useCreateExtraCertificateIngestion";
import { useCreateRequirementIngestion } from "../../hooks/useCreateRequirementIngestion";

type CertificateUploadFormValues = {
  selectedVesselId: string | null;
  notes: string;
};

function FlowRow({
  icon,
  title,
  description,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}) {
  return (
    <View className="flex-row items-start gap-3">
      <View className="mt-0.5 h-9 w-9 items-center justify-center rounded-[12px] border border-shellLine bg-shellPanelSoft">
        <Ionicons name={icon} size={16} className="text-accent" />
      </View>
      <View className="flex-1 gap-1">
        <Text className="text-[13px] font-semibold text-textMain">{title}</Text>
        <Text className="text-[12px] leading-[18px] text-muted">
          {description}
        </Text>
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

  const { setValue, watch } = useForm<CertificateUploadFormValues>({
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

  return (
    <View className="flex-1 bg-shellCanvas">
      <ScrollView
        contentContainerClassName="gap-6 p-4 pb-10 web:p-6"
        showsVerticalScrollIndicator={false}
      >
        <PageHeader
          title={
            isRequirementFlow
              ? "Upload Requirement Document"
              : "Add Extra Certificate"
          }
          subTitle="Upload the source document first so ARXIS can extract a candidate, then confirm the real certificate after review."
          actions={
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onPress={() => router.replace(`/projects/${pid}/certificates`)}
            >
              Back to Certificate Compliance
            </Button>
          }
        />

        <View className="gap-2 xl:gap-5 flex flex-row flex-wrap items-center justify-start xl:justify-between">
          <StatCard
            iconName="folder-open-outline"
            iconLib="ion"
            title="Flow"
            value={isRequirementFlow ? "Requirement" : "Extra"}
            suffix={
              isRequirementFlow
                ? "bound to an existing certificate requirement"
                : "outside the current rule set"
            }
          />
          <StatCard
            iconName="boat-outline"
            iconLib="ion"
            title="Vessel context"
            value={selectedVessel ? "Ready" : "Pending"}
            suffix={
              selectedVessel
                ? selectedVessel.name
                : "select the vessel before upload"
            }
          />
          <StatCard
            iconName="document-attach-outline"
            iconLib="ion"
            title="Source document"
            value={file ? "Attached" : "Missing"}
            suffix={file?.name ?? "pick PDF or image"}
          />
        </View>

        <View className="rounded-[20px] border border-shellLine bg-shellGlass px-4 py-4">
          <View className="flex-row flex-wrap items-start justify-between gap-4">
            <View className="max-w-[720px] gap-1">
              <Text className="text-[12px] uppercase tracking-[1.6px] text-muted">
                Evidence-first flow
              </Text>
              <Text className="text-[13px] leading-[20px] text-textMain">
                Upload only creates an ingestion candidate. The final structured
                certificate appears after the review screen confirms certificate
                type, dates, issuer, and notes.
              </Text>
            </View>
            <View className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5">
              <Text className="text-[10px] font-semibold uppercase tracking-[1.5px] text-accent">
                Review required
              </Text>
            </View>
          </View>
        </View>

        <View className="gap-5 web:xl:flex-row">
          <View className="flex-[1.2] gap-5">
            <Card className="gap-0 overflow-hidden p-0">
              <CardHeaderRow>
                <View className="gap-1">
                  <CardTitle className="text-[16px] text-textMain">
                    Upload package
                  </CardTitle>
                  <Text className="text-[13px] text-muted">
                    Keep the upload anchored to the right vessel and document
                    before the candidate is extracted.
                  </Text>
                </View>
              </CardHeaderRow>

              <CardContent className="px-6">
                <View className="gap-5">
                  <View className="gap-3">
                    <Text className="text-[13px] font-semibold text-textMain">
                      Vessel context
                    </Text>

                    {fixedAssetId ? (
                      selectedVessel ? (
                        <VesselPill vessel={selectedVessel} />
                      ) : (
                        <Loading />
                      )
                    ) : vessels.length === 0 && !vesselsLoading ? (
                      <EmptyVesselsState
                        onCreateVessel={() =>
                          router.push(`/projects/${pid}/vessels/new`)
                        }
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
                      <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft p-4 gap-1">
                        <Text className="text-[12px] text-muted">Requirement</Text>
                        <Text className="text-textMain font-semibold">
                          {requirement.certificateName} ({requirement.certificateCode})
                        </Text>
                        <Text className="text-[12px] text-muted">
                          Current status: {requirement.status}
                        </Text>
                      </View>
                    ) : (
                      <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft p-4 gap-1">
                        <Text className="text-[12px] text-muted">
                          Extra certificate mode
                        </Text>
                        <Text className="text-[13px] leading-[20px] text-textMain">
                          This file sits outside the current requirement
                          baseline, so the reviewer chooses the final
                          certificate type after extraction.
                        </Text>
                      </View>
                    )}
                  </View>

                  <View className="h-px bg-shellLine" />

                  <View className="gap-4">
                    <View className="flex-row flex-wrap items-center gap-3">
                      <Button
                        variant="outline"
                        size="lg"
                        onPress={pickDocument}
                        className="rounded-full"
                      >
                        {file ? "Change document" : "Pick PDF or image"}
                      </Button>

                      {file ? (
                        <View className="rounded-full border border-success/30 bg-success/10 px-3 py-1.5">
                          <Text className="text-[10px] font-semibold uppercase tracking-[1.5px] text-success">
                            Ready for review
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft p-4 gap-1">
                      <Text className="text-[12px] text-muted">Selected file</Text>
                      <Text className="text-textMain font-semibold">
                        {file?.name ?? "No file selected yet"}
                      </Text>
                      <Text className="text-[12px] text-muted">
                        {file?.mimeType ?? "PDF, JPG, JPEG, PNG"}
                      </Text>
                    </View>

                    <Field
                      label="Notes for reviewer (optional)"
                      placeholder="Context before we create the candidate"
                      value={notes}
                      onChangeText={(value) =>
                        setValue("notes", value, {
                          shouldDirty: true,
                          shouldTouch: true,
                        })
                      }
                      multiline
                      hint="Capture context the reviewer should see before confirming the candidate."
                    />

                    {localError ? (
                      <Text className="text-[12px] text-destructive">
                        {localError}
                      </Text>
                    ) : null}
                    {uploadError ? (
                      <Text className="text-[12px] text-destructive">
                        {uploadError}
                      </Text>
                    ) : null}

                    <Button
                      variant="default"
                      size="lg"
                      onPress={onUpload}
                      loading={uploading}
                      disabled={!canUpload}
                      className="self-start rounded-full"
                      rightIcon={
                        <Ionicons
                          name="arrow-forward-outline"
                          size={16}
                          className="text-textMain"
                        />
                      }
                    >
                      Upload and extract candidate
                    </Button>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>

          <View className="flex-1 gap-5">
            <Card className="gap-0 overflow-hidden p-0">
              <CardHeaderRow>
                <View className="gap-1">
                  <CardTitle className="text-[16px] text-textMain">
                    What happens next
                  </CardTitle>
                  <Text className="text-[13px] text-muted">
                    The flow stays aligned with the current compliance model and
                    never jumps straight from file to approved record.
                  </Text>
                </View>
              </CardHeaderRow>

              <CardContent className="px-6">
                <View className="gap-4">
                  <FlowRow
                    icon="cloud-upload-outline"
                    title="Upload evidence"
                    description="Store the original document and create a candidate for review."
                  />
                  <FlowRow
                    icon="search-outline"
                    title="Review the candidate"
                    description="Check certificate type, dates, issuer, and extracted notes before confirming."
                  />
                  <FlowRow
                    icon="checkmark-circle-outline"
                    title="Create the real record"
                    description="Only the reviewed candidate becomes a structured certificate inside the project."
                  />
                </View>
              </CardContent>
            </Card>

            <Card className="gap-0 overflow-hidden p-0">
              <CardHeaderRow>
                <View className="gap-1">
                  <CardTitle className="text-[16px] text-textMain">
                    Review checkpoint
                  </CardTitle>
                  <Text className="text-[13px] text-muted">
                    This protects compliance from creating records that were not
                    reviewed against the source document.
                  </Text>
                </View>
              </CardHeaderRow>

              <CardContent className="px-6">
                <View className="gap-3 rounded-[18px] border border-shellLine bg-shellPanelSoft p-4">
                  <Text className="text-[13px] font-semibold text-textMain">
                    Candidate first, record second
                  </Text>
                  <Text className="text-[12px] leading-[18px] text-muted">
                    After upload, ARXIS routes you to the review screen. That is
                    where the team confirms the extracted candidate before the
                    certificate record becomes part of compliance.
                  </Text>
                </View>
              </CardContent>
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
