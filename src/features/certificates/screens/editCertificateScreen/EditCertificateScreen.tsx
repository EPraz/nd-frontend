import { Button } from "@/src/components/ui/button/Button";
import ErrorState from "@/src/components/ui/errorState/ErrorState";
import Loading from "@/src/components/ui/loading/Loading";
import { Text } from "@/src/components/ui/text/Text";
import { useToast } from "@/src/context/ToastProvider";
import type { AssetDto } from "@/src/contracts/assets.contract";
import { useCertificateTypes } from "@/src/features/certificates/hooks/useCertificateTypes";
import { useVessels } from "@/src/features/vessels/hooks/useVessels";
import { isIsoDateOnly } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Pressable, ScrollView, View } from "react-native";
import CertificateFormCard from "../../components/certificateFormCard/CertificateFormCard";
import {
  CertificateFormValues,
  emptyCertificateFormValues,
} from "../../contracts";
import {
  applyCertificateFormPatch,
  certificateFormFromDto,
  toUpdateCertificateInput,
} from "../../helpers";
import { useCertificatesById } from "../../hooks/useCertificatesById";
import { useUpdateCertificate } from "../../hooks/useUpdateCertificate";

export default function EditCertificateScreen() {
  const router = useRouter();
  const { show } = useToast();

  const { projectId, assetId, certificateId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
    certificateId: string;
  }>();

  const pid = String(projectId);
  const vid = String(assetId);
  const cid = String(certificateId);

  const { certificate, loading, error, refresh } = useCertificatesById(
    pid,
    vid,
    cid,
  );
  const {
    submit,
    loading: saving,
    error: saveError,
  } = useUpdateCertificate(pid, vid, cid);
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
    if (!certificate || isDirty) return;

    reset({
      ...emptyCertificateFormValues(),
      ...certificateFormFromDto(certificate, certificateTypes),
      selectedVessel:
        vessels.find((v) => v.id === (certificate.assetId ?? vid)) ?? null,
    });
  }, [certificate, isDirty, reset, vessels, vid, certificateTypes]);

  const effectiveAssetId = values.assetId ?? vid;
  const currentVessel = useMemo<AssetDto | null>(() => {
    return vessels.find((v) => v.id === effectiveAssetId) ?? null;
  }, [vessels, effectiveAssetId]);

  const viewHref = `/projects/${pid}/vessels/${effectiveAssetId}/certificates/${cid}`;
  const listHref = `/projects/${pid}/vessels/${effectiveAssetId}/certificates`;
  const createVesselHref = `/projects/${pid}/vessels/new`;

  const canSubmit = useMemo(() => {
    if (saving) return false;
    if (!effectiveAssetId) return false;
    if (!values.certificateTypeId) return false;
    if (!isDirty) return false;
    return true;
  }, [saving, effectiveAssetId, values.certificateTypeId, isDirty]);

  function patch(patchValues: Partial<CertificateFormValues>) {
    setLocalError(null);
    applyCertificateFormPatch(setValue, patchValues);
  }

  function goBackOrTo(fallbackHref: string) {
    try {
      router.back();
    } catch {
      router.replace(fallbackHref);
    }
  }

  async function onSave() {
    setLocalError(null);

    const assetIdToUse = values.assetId ?? values.selectedVessel?.id ?? null;
    if (!assetIdToUse) {
      setLocalError("Selecciona un vessel.");
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
      const input = toUpdateCertificateInput({
        values: { ...values, assetId: assetIdToUse },
        allowMoveVessel: false,
      });

      await submit(input);
      show("Certificate updated successfully", "success");
      router.replace(viewHref);
    } catch {
      show("Failed to update certificate", "error");
    }
  }

  if (loading) return <Loading fullScreen />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!certificate)
    return <ErrorState message="Certificate not found." onRetry={refresh} />;

  return (
    <View className="flex-1 bg-shellCanvas">
      <ScrollView
        contentContainerClassName="gap-5 p-4 web:p-6 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3">
          <Pressable
            onPress={() => goBackOrTo(viewHref)}
            disabled={saving}
            className={[
              "self-start flex-row items-center gap-2",
              saving ? "opacity-50" : "web:hover:opacity-90",
            ].join(" ")}
          >
            <Ionicons name="chevron-back" size={16} className="text-accent" />
            <Text className="text-accent font-semibold">Back</Text>
          </Pressable>

          <View className="web:flex-row web:items-start web:justify-between gap-4">
            <View className="gap-1 flex-1">
              <Text className="text-textMain text-[34px] web:text-[44px] font-semibold leading-[110%]">
                Edit Certificate
              </Text>
              <Text className="text-muted text-[14px]">
                Review and correct extracted metadata for {certificate.certificateName} on{" "}
                {certificate.assetName}.
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <Button
                variant="outline"
                size="lg"
                onPress={() => goBackOrTo(viewHref)}
                disabled={saving}
                className="rounded-full"
              >
                Cancel
              </Button>

              <Button
                variant="outline"
                size="lg"
                onPress={onSave}
                disabled={!canSubmit}
                className="rounded-full"
                rightIcon={
                  <Ionicons
                    name="save-outline"
                    size={16}
                    className="text-textMain"
                  />
                }
              >
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </View>
          </View>
        </View>

        <View className="w-full web:max-w-[980px] self-center gap-5">
          <View className="rounded-[20px] border border-warning/30 bg-warning/10 p-4 gap-2">
            <Text className="text-textMain font-semibold text-[13px]">
              Metadata editing
            </Text>
            <Text className="text-muted text-[12px] leading-[18px]">
              Use this screen to correct extracted metadata after the submitted
              record exists. Approval now happens from the certificate view, not
              from inside edit.
            </Text>
          </View>

          <View className="flex-1 gap-5">
            <CertificateFormCard
              fixedAssetId={vid}
              currentVessel={currentVessel}
              vessels={vessels}
              vesselsLoading={vesselsLoading}
              vesselsError={vesselsError}
              onCreateVessel={() => router.push(createVesselHref)}
              certificateTypes={certificateTypes}
              certificateTypesLoading={certificateTypesLoading}
              certificateTypesError={certificateTypesError}
              values={values}
              onChange={patch}
              localError={localError}
              apiError={saveError}
              disabled={saving}
              showFilesNextHint={false}
            />

            <Pressable
              onPress={() => router.replace(listHref)}
              className="self-start"
            >
              <Text className="text-accent font-semibold">
                Go to vessel certificates list
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
