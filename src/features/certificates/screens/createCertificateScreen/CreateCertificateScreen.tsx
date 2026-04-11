import { Button, Text } from "@/src/components";
import { useCertificateTypes } from "@/src/features/certificates";
import { isIsoDateOnly } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

import { useVessels } from "@/src/features/vessels/hooks/useVessels";
import { useCreateCertificate } from "@/src/hooks";
import { CertificateFormCard } from "../../components";
import {
  CertificateFormValues,
  emptyCertificateFormValues,
} from "../../contracts";
import {
  applyCertificateFormPatch,
  toCreateCertificateInput,
} from "../../helpers";

export default function CreateCertificateScreen() {
  const router = useRouter();

  const { projectId, assetId } = useLocalSearchParams<{
    projectId: string;
    assetId?: string;
  }>();

  const pid = String(projectId);
  const fixedAssetId = assetId ? String(assetId) : null;

  const { submit, loading, error } = useCreateCertificate(pid);

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

  const { setValue, watch } = useForm<CertificateFormValues>({
    defaultValues: emptyCertificateFormValues(),
  });
  const values = watch();
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!fixedAssetId) return;
    if (values.assetId === fixedAssetId) return;

    setValue("assetId", fixedAssetId, {
      shouldDirty: false,
      shouldTouch: false,
    });
  }, [fixedAssetId, setValue, values.assetId]);

  const effectiveAssetId = values.assetId ?? values.selectedVessel?.id ?? null;

  const certificatesHref = effectiveAssetId
    ? `/projects/${pid}/vessels/${effectiveAssetId}/certificates`
    : `/projects/${pid}/certificates`;

  const createVesselHref = `/projects/${pid}/vessels/new`;

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (!effectiveAssetId) return false;
    if (!values.certificateTypeId) return false;
    return true;
  }, [loading, effectiveAssetId, values.certificateTypeId]);

  function patch(patchValues: Partial<CertificateFormValues>) {
    setLocalError(null);
    applyCertificateFormPatch(setValue, patchValues);
  }

  function goBackOrTo(fallbackHref: string) {
    if (router.canGoBack?.()) {
      router.back();
      return;
    }
    router.replace(fallbackHref);
  }

  async function onCreate() {
    setLocalError(null);

    if (!effectiveAssetId) {
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
      const input = toCreateCertificateInput({
        ...values,
        assetId: effectiveAssetId,
        certificateTypeId: values.certificateTypeId,
      });

      await submit(input);
      router.replace(certificatesHref);
    } catch {
      // Hook already exposes the error string.
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
            onPress={() => goBackOrTo(certificatesHref)}
            disabled={loading}
            className={[
              "self-start flex-row items-center gap-2",
              loading ? "opacity-50" : "web:hover:opacity-90",
            ].join(" ")}
          >
            <Ionicons name="chevron-back" size={16} className="text-accent" />
            <Text className="text-accent font-semibold">
              Back to Certificates
            </Text>
          </Pressable>

          <View className="web:flex-row web:items-start web:justify-between gap-4">
            <View className="gap-1 flex-1">
              <Text className="text-textMain text-[34px] web:text-[44px] font-semibold leading-[110%]">
                Manual Certificate Entry
              </Text>
              <Text className="text-muted text-[14px]">
                Fallback flow for backlog cleanup or exceptions. The primary
                path is now to upload the document from a requirement.
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <Button
                variant="outline"
                size="lg"
                onPress={() => goBackOrTo(certificatesHref)}
                disabled={loading}
                className="rounded-full"
              >
                Cancel
              </Button>

              <Button
                variant="default"
                size="lg"
                onPress={onCreate}
                disabled={!canSubmit}
                className="rounded-full"
                rightIcon={
                  loading ? (
                    <ActivityIndicator />
                  ) : (
                    <Ionicons
                      name="save-outline"
                      size={16}
                      className="text-textMain"
                    />
                  )
                }
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </View>
          </View>
        </View>

        <View className="w-full web:max-w-[980px] self-center gap-5">
          <View className="rounded-[20px] border border-shellLine bg-shellPanelSoft p-4">
            <Text className="text-textMain font-semibold text-[13px]">
              Secondary workflow
            </Text>
            <Text className="text-muted text-[12px] leading-[18px] mt-1">
              Use this only when the vessel requirement cannot start from a
              document upload yet.
            </Text>
          </View>

          <CertificateFormCard
            fixedAssetId={fixedAssetId}
            currentVessel={
              fixedAssetId
                ? (vessels.find((v) => v.id === fixedAssetId) ?? null)
                : null
            }
            vessels={vessels}
            vesselsLoading={vesselsLoading}
            vesselsError={vesselsError}
            onCreateVessel={() => router.push(createVesselHref)}
            certificateTypes={certificateTypes}
            certificateTypesLoading={certificateTypesLoading}
            certificateTypesError={certificateTypesError}
            values={{
              ...values,
              assetId: fixedAssetId ?? values.assetId,
            }}
            onChange={patch}
            localError={localError}
            apiError={error}
            disabled={loading}
          />
        </View>
      </ScrollView>
    </View>
  );
}
