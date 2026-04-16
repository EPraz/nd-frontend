import { Button } from "@/src/components/ui/button/Button";
import { EmptyVesselsState } from "@/src/components/ui/forms/EmptyVesselsState";
import { Field } from "@/src/components/ui/forms/Field";
import { SearchableVesselSelect } from "@/src/components/ui/forms/SearchableVesselSelect";
import { VesselPill } from "@/src/components/ui/forms/VesselPill";
import Loading from "@/src/components/ui/loading/Loading";
import { Text } from "@/src/components/ui/text/Text";
import { useToast } from "@/src/context/ToastProvider";
import { useVessels } from "@/src/features/vessels/hooks/useVessels";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, ScrollView, View } from "react-native";
import {
  useCertificateRequirementsByAsset,
} from "../../hooks/useCertificateRequirementsByAsset";
import { useCreateExtraCertificateIngestion } from "../../hooks/useCreateExtraCertificateIngestion";
import { useCreateRequirementIngestion } from "../../hooks/useCreateRequirementIngestion";

type CertificateUploadFormValues = {
  selectedVesselId: string | null;
  notes: string;
};

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
      vessels.find(
        (vessel) => vessel.id === (selectedVesselId ?? fixedAssetId),
      ) ?? null,
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
        contentContainerClassName="gap-5 p-4 web:p-6 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3">
          <Pressable
            onPress={() => router.replace(`/projects/${pid}/certificates`)}
            className="self-start"
          >
            <Text className="text-accent font-semibold">
              Back to Certificate Compliance
            </Text>
          </Pressable>

          <View className="gap-1">
            <Text className="text-textMain text-[34px] web:text-[44px] font-semibold leading-[110%]">
              {isRequirementFlow
                ? "Upload Requirement Document"
                : "Add Extra Certificate"}
            </Text>
            <Text className="text-muted text-[14px]">
              The file uploads first so the backend can extract a candidate. The
              official certificate record is created only after review.
            </Text>
          </View>
        </View>

        <View className="w-full web:max-w-[980px] self-center gap-5">
          <View className="rounded-[20px] border border-shellLine bg-shellPanelSoft p-4 gap-3">
            <Text className="text-textMain font-semibold text-[13px]">
              1. Choose the vessel context
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
              <Text className="text-muted text-[12px] leading-[18px]">
                Extra certificates are documents outside the current rule set.
                You will choose the final certificate type during review.
              </Text>
            )}
          </View>

          <View className="rounded-[24px] border border-shellLine bg-shellPanel p-5 gap-4">
            <Text className="text-textMain text-[18px] font-semibold">
              2. Upload source document
            </Text>

            <Button
              variant="outline"
              size="lg"
              onPress={pickDocument}
              className="rounded-full self-start"
            >
              {file ? "Change document" : "Pick PDF or image"}
            </Button>

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
            />

            {localError ? (
              <Text className="text-[12px] text-destructive">{localError}</Text>
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
              disabled={!file || !effectiveAssetId}
              className="rounded-full self-start"
            >
              Upload and extract candidate
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
