import { Button, Text } from "@/src/components";
import type { AssetDto } from "@/src/contracts/assets.contract";
import { useVessels } from "@/src/features/vessels";
import { useCreateCrew } from "@/src/hooks";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import {
  CrewFormCard,
  CrewFormValues,
  CrewPreviewCard,
  emptyCrewFormValues,
  toCreateCrewInput,
} from "../../components";

export default function CreateCrewScreen() {
  const router = useRouter();
  const { projectId, assetId } = useLocalSearchParams<{
    projectId: string;
    assetId?: string;
  }>();

  const pid = String(projectId);
  const fixedAssetId = assetId ? String(assetId) : null;

  const { submit, loading, error } = useCreateCrew(pid);

  const [values, setValues] = useState<CrewFormValues>(emptyCrewFormValues());
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    vessels,
    loading: vesselsLoading,
    error: vesselsError,
  } = useVessels(pid);

  const currentVessel = useMemo<AssetDto | null>(() => {
    if (!fixedAssetId) return null;
    return vessels.find((v) => v.id === fixedAssetId) ?? null;
  }, [fixedAssetId, vessels]);

  // Si vienes en ruta /vessels/:assetId/crew/new => fija el assetId en el form
  useEffect(() => {
    if (!fixedAssetId) return;
    // Si ya está seteado, no re-patches
    if (values.assetId === fixedAssetId) return;

    setValues((prev) => ({
      ...prev,
      assetId: fixedAssetId,
      selectedVessel: currentVessel ?? prev.selectedVessel,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fixedAssetId, currentVessel?.id]);

  const effectiveAssetId = fixedAssetId ?? values.assetId;

  const crewHref = effectiveAssetId
    ? `/projects/${pid}/vessels/${effectiveAssetId}/crew`
    : `/projects/${pid}/crew`;

  const createVesselHref = `/projects/${pid}/vessels/new`;

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (!effectiveAssetId) return false;
    if (values.fullName.trim().length < 3) return false;
    return true;
  }, [loading, effectiveAssetId, values.fullName]);

  function patch(p: Partial<CrewFormValues>) {
    setValues((prev) => ({ ...prev, ...p }));
  }

  function goBackOrTo(fallbackHref: string) {
    try {
      router.back();
    } catch {
      router.replace(fallbackHref);
    }
  }

  async function onCreate() {
    setLocalError(null);

    if (!effectiveAssetId) {
      setLocalError("Selecciona un vessel.");
      return;
    }

    if (values.fullName.trim().length < 3) {
      setLocalError("Full Name debe tener al menos 3 caracteres.");
      return;
    }

    try {
      // asegúrate de que el input use el assetId efectivo
      const input = toCreateCrewInput({
        ...values,
        assetId: effectiveAssetId,
      });

      await submit(input);
      router.replace(crewHref);
    } catch {
      // error ya lo maneja el hook (error string)
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
            onPress={() => goBackOrTo(crewHref)}
            disabled={loading}
            className={[
              "self-start flex-row items-center gap-2",
              loading ? "opacity-50" : "web:hover:opacity-90",
            ].join(" ")}
          >
            <Ionicons name="chevron-back" size={16} className="text-accent" />
            <Text className="text-accent font-semibold">Back to Crew</Text>
          </Pressable>

          <View className="web:flex-row web:items-start web:justify-between gap-4">
            <View className="gap-1 flex-1">
              <Text className="text-textMain text-[34px] web:text-[44px] font-semibold leading-[110%]">
                Add Crew Member
              </Text>
              <Text className="text-muted text-[14px]">
                Register a crew member and assign them to a vessel.
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <Button
                variant="outline"
                size="lg"
                onPress={() => goBackOrTo(crewHref)}
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
                  <Ionicons
                    name="save-outline"
                    size={16}
                    className="text-textMain"
                  />
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
            <CrewFormCard
              fixedAssetId={fixedAssetId}
              currentVessel={currentVessel}
              vessels={vessels}
              vesselsLoading={vesselsLoading}
              vesselsError={vesselsError}
              onCreateVessel={() => router.push(createVesselHref)}
              values={{
                ...values,
                // si estás en ruta con assetId fijo, forzamos assetId en values para consistencia
                assetId: effectiveAssetId,
              }}
              onChange={(p) => {
                setLocalError(null);
                patch(p);
              }}
              localError={localError}
              apiError={error}
              disabled={loading}
            />
          </View>

          {/* Right: Preview */}
          <View className="flex-1 gap-5 web:lg:w-[40%]">
            <CrewPreviewCard
              values={{
                ...values,
                assetId: effectiveAssetId,
                // si viene fijo, preferimos el currentVessel como display
                selectedVessel: fixedAssetId
                  ? currentVessel
                  : values.selectedVessel,
              }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
