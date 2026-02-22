import { Button, ErrorState, Loading, Text } from "@/src/components";
import { useToast } from "@/src/context";
import type { AssetDto } from "@/src/contracts/assets.contract";
import { useVessels } from "@/src/features/vessels";
import { isIsoDateOnly } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { CertificateFormCard, CertificatePreviewCard } from "../../components";
import { emptyCertificateFormValues } from "../../contracts";
import {
  certificateFormFromDto,
  toUpdateCertificateInput,
} from "../../helpers";
import { useCertificatesById, useUpdateCertificate } from "../../hooks";

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

  const [values, setValues] = useState(() => emptyCertificateFormValues());
  const [dirty, setDirty] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // hydrate form cuando llega certificate
  useEffect(() => {
    if (!certificate) return;
    if (dirty) return;

    setValues((prev) => ({
      ...prev,
      ...certificateFormFromDto(certificate),
      // selectedVessel se resuelve con lista de vessels (si ya llegó)
      selectedVessel:
        vessels.find((v) => v.id === (certificate.assetId ?? vid)) ?? null,
    }));
  }, [certificate, dirty, vessels, vid]);

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
    if (values.name.trim().length < 2) return false;
    if (!dirty) return false;
    return true;
  }, [saving, effectiveAssetId, values.name, dirty]);

  function patch(p: Partial<typeof values>) {
    setLocalError(null);
    setDirty(true);
    setValues((prev) => ({ ...prev, ...p }));
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
      const input = toUpdateCertificateInput({
        values: { ...values, assetId: assetIdToUse },
        allowMoveVessel: false, // pon false si NO quieres permitir mover de vessel
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
    <View className="flex-1 bg-baseBg">
      <ScrollView
        contentContainerClassName="gap-5 p-4 web:p-6 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
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
                Edit Certificate - ascascascascasc asc asc asc asc asc ascasc
                asc asc asc asc asc asc asc asc asc asc adsfcdscvsdvsdsd
              </Text>
              <Text className="text-muted text-[14px]">
                Update certificate details and vessel assignment.
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
                variant="default"
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

        {/* Content grid */}
        <View className="gap-5 web:lg:flex-row">
          {/* Left */}
          <View className="flex-1 gap-5 web:lg:w-[60%]">
            <CertificateFormCard
              fixedAssetId={vid}
              currentVessel={currentVessel}
              vessels={vessels}
              vesselsLoading={vesselsLoading}
              vesselsError={vesselsError}
              onCreateVessel={() => router.push(createVesselHref)}
              values={values}
              onChange={patch}
              localError={localError}
              apiError={saveError}
              disabled={saving}
            />

            {/* quick link */}
            <Pressable
              onPress={() => router.replace(listHref)}
              className="self-start"
            >
              <Text className="text-accent font-semibold">
                Go to vessel certificates list →
              </Text>
            </Pressable>
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
