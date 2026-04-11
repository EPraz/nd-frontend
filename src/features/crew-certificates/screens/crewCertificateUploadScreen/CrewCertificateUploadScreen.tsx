import { Button, Field, Loading, Text } from "@/src/components";
import { useToast } from "@/src/context";
import { useCrewById } from "@/src/features/crew";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, ScrollView, View } from "react-native";
import {
  useCreateCrewRequirementIngestion,
  useCreateExtraCrewCertificateIngestion,
  useCrewCertificateRequirementsByCrew,
} from "../../hooks";

type CrewCertificateUploadFormValues = {
  notes: string;
};

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

  const { crew, loading: crewLoading, error: crewError } = useCrewById(
    pid,
    aid,
    cid,
  );
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

  const requirementUpload = useCreateCrewRequirementIngestion(pid, aid, cid, rid ?? "");
  const extraUpload = useCreateExtraCrewCertificateIngestion(pid, aid, cid);

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
        pathname: "/projects/[projectId]/crew-certificates/review",
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

  if (crewLoading) return <Loading fullScreen />;

  return (
    <View className="flex-1 bg-shellCanvas">
      <ScrollView
        contentContainerClassName="gap-5 p-4 web:p-6 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3">
          <Pressable
            onPress={() =>
              router.replace(`/projects/${pid}/vessels/${aid}/crew/${cid}/certificates`)
            }
            className="self-start"
          >
            <Text className="text-accent font-semibold">Back to Crew Certificates</Text>
          </Pressable>

          <View className="gap-1">
            <Text className="text-textMain text-[34px] web:text-[44px] font-semibold leading-[110%]">
              {isRequirementFlow ? "Upload Requirement Document" : "Add Extra Crew Certificate"}
            </Text>
            <Text className="text-muted text-[14px]">
              The file uploads first so the backend can extract a candidate. The
              official crew certificate record is created only after review.
            </Text>
          </View>
        </View>

        <View className="w-full web:max-w-[980px] self-center gap-5">
          <View className="rounded-[20px] border border-shellLine bg-shellPanelSoft p-4 gap-3">
            <Text className="text-textMain font-semibold text-[13px]">
              1. Confirm crew context
            </Text>

            {crewError ? (
              <Text className="text-[12px] text-destructive">{crewError}</Text>
            ) : null}

            <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft p-4 gap-1">
              <Text className="text-[12px] text-muted">Crew member</Text>
              <Text className="text-textMain font-semibold">
                {crew?.fullName ?? "Loading..."}
              </Text>
              <Text className="text-[12px] text-muted">
                {crew?.rank ?? "Rank pending"} · {crew?.assetName ?? crew?.asset?.name ?? "—"}
              </Text>
            </View>

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
                Extra crew certificates are documents outside the current rule set.
                You will confirm the final type during review.
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
              <Text className="text-[12px] text-destructive">{uploadError}</Text>
            ) : null}

            <Button
              variant="default"
              size="lg"
              onPress={handleSubmit(onUpload)}
              loading={uploading}
              disabled={!file}
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
