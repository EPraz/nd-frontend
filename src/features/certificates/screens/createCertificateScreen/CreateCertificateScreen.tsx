import { Button, Text } from "@/src/components";
import { isIsoDateOnly } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

import { useVessels } from "@/src/features/vessels/hooks/useVessels";
import { useCreateCertificate } from "@/src/hooks";
import { CertificateFormCard, CertificatePreviewCard } from "../../components";
import { emptyCertificateFormValues } from "../../contracts";
import { toCreateCertificateInput } from "../../helpers";

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

  const [values, setValues] = useState(() => emptyCertificateFormValues());
  const [localError, setLocalError] = useState<string | null>(null);

  // si vienes con assetId fijo, lo seteamos una sola vez
  useEffect(() => {
    if (!fixedAssetId) return;
    setValues((prev) => {
      if (prev.assetId === fixedAssetId) return prev;
      return { ...prev, assetId: fixedAssetId };
    });
  }, [fixedAssetId]);

  const effectiveAssetId = values.assetId ?? values.selectedVessel?.id ?? null;

  const certificatesHref = effectiveAssetId
    ? `/projects/${pid}/vessels/${effectiveAssetId}/certificates`
    : `/projects/${pid}/certificates`;

  const createVesselHref = `/projects/${pid}/vessels/new`;

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (!effectiveAssetId) return false;
    if (values.name.trim().length < 2) return false;
    return true;
  }, [loading, effectiveAssetId, values.name]);

  function patch(p: Partial<typeof values>) {
    setLocalError(null);
    setValues((prev) => ({ ...prev, ...p }));
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
    if (values.name.trim().length < 2) {
      setLocalError("Certificate Name es requerido.");
      return;
    }
    if (values.issueDate.trim() && !isIsoDateOnly(values.issueDate)) {
      setLocalError("Issue date inválido. Usa formato YYYY-MM-DD.");
      return;
    }
    if (values.expiryDate.trim() && !isIsoDateOnly(values.expiryDate)) {
      setLocalError("Expiry date inválido. Usa formato YYYY-MM-DD.");
      return;
    }

    try {
      const input = toCreateCertificateInput({
        ...values,
        assetId: effectiveAssetId,
      });

      await submit(input);
      router.replace(certificatesHref);
    } catch {
      // error string ya lo maneja el hook
    }
  }

  return (
    <View className="flex-1 bg-baseBg">
      <ScrollView
        contentContainerClassName="gap-5 p-4 web:p-6 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
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
                Add New Certificate
              </Text>
              <Text className="text-muted text-[14px]">
                Create a certificate and assign it to a vessel.
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

        {/* Content grid */}
        <View className="gap-5 web:lg:flex-row">
          {/* Left */}
          <View className="flex-1 gap-5 web:lg:w-[60%]">
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
              values={{
                ...values,
                // si viene fijo, forzamos assetId para consistencia
                assetId: fixedAssetId ?? values.assetId,
              }}
              onChange={patch}
              localError={localError}
              apiError={error}
              disabled={loading}
            />
          </View>

          {/* Right */}
          <View className="flex-1 gap-5 web:lg:w-[40%]">
            <CertificatePreviewCard values={values} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
