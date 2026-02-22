import { Button, ErrorState, Loading, Text } from "@/src/components";
import { useToast } from "@/src/context";
import type { AssetDto } from "@/src/contracts/assets.contract";
import { useVessels } from "@/src/features/vessels";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import {
  CrewFormCard,
  crewFormFromDto,
  CrewFormValues,
  CrewPreviewCard,
  emptyCrewFormValues,
  toUpdateCrewInput,
} from "../../components";
import { useCrewById } from "../../hooks";
import { useUpdateCrew } from "../../hooks/useUpdateCrew";

export default function EditCrewScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { projectId, assetId, crewId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
    crewId: string;
  }>();

  const pid = String(projectId);
  const vid = String(assetId);
  const cid = String(crewId);

  const { crew, loading, error, refresh } = useCrewById(pid, vid, cid);
  const {
    submit,
    loading: saving,
    error: saveError,
  } = useUpdateCrew(pid, vid, cid);

  const {
    vessels,
    loading: vesselsLoading,
    error: vesselsError,
  } = useVessels(pid);

  const [values, setValues] = useState<CrewFormValues>(emptyCrewFormValues());
  const [dirty, setDirty] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // hydrate form cuando llega crew
  useEffect(() => {
    if (!crew) return;
    // Si el user ya editó algo, no sobre-escribimos
    if (dirty) return;

    setValues(crewFormFromDto(crew));
  }, [crew, dirty]);

  // resolve current vessel from vessels list (para pill/preview)
  const currentVessel = useMemo<AssetDto | null>(() => {
    const effective = values.assetId ?? vid;
    return vessels.find((v) => v.id === effective) ?? null;
  }, [vessels, values.assetId, vid]);

  const effectiveAssetId = values.assetId ?? vid;

  const canSubmit = useMemo(() => {
    if (saving) return false;
    if (!effectiveAssetId) return false;
    if (values.fullName.trim().length < 3) return false;
    if (!dirty) return false; // evita submit si no cambió nada (opcional)
    return true;
  }, [saving, effectiveAssetId, values.fullName, dirty]);

  function patch(p: Partial<CrewFormValues>) {
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
  const nextAssetId = effectiveAssetId;
  const viewHref = `/projects/${pid}/vessels/${nextAssetId}/crew/${cid}`;
  const crewListHref = `/projects/${pid}/vessels/${effectiveAssetId}/crew`;

  async function onSave() {
    setLocalError(null);

    if (values.fullName.trim().length < 3) {
      setLocalError("Full Name debe tener al menos 3 caracteres.");
      return;
    }
    if (!(effectiveAssetId ?? values.assetId)) {
      setLocalError("Selecciona un vessel.");
      return;
    }

    try {
      const input = toUpdateCrewInput({
        values,
        fixedAssetId: effectiveAssetId,
      });

      await submit(input);
      show("Crew member updated successfully", "success");
      router.replace(viewHref);
    } catch {
      show("Failed to update crew member", "error");
    }
  }

  if (loading) return <Loading fullScreen />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!crew)
    return <ErrorState message="Crew member not found." onRetry={refresh} />;

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
                Edit Crew Member
              </Text>
              <Text className="text-muted text-[14px]">
                Update profile information, vessel assignment and status.
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
            <CrewFormCard
              fixedAssetId={
                null /* edit permite mover de vessel, si quieres bloquearlo pon vid */
              }
              currentVessel={currentVessel}
              vessels={vessels}
              vesselsLoading={vesselsLoading}
              vesselsError={vesselsError}
              onCreateVessel={() => router.push(`/projects/${pid}/vessels/new`)}
              values={{
                ...values,
                assetId: effectiveAssetId,
                selectedVessel: values.selectedVessel ?? currentVessel,
              }}
              onChange={patch}
              localError={localError}
              apiError={saveError}
              disabled={saving}
            />

            {/* Extra: acciones rápidas */}
            <Pressable
              onPress={() => router.replace(crewListHref)}
              className="self-start"
            >
              <Text className="text-accent font-semibold">
                Go to vessel crew list →
              </Text>
            </Pressable>
          </View>

          {/* Right: Preview */}
          <View className="flex-1 gap-5 web:lg:w-[40%]">
            <CrewPreviewCard
              values={{
                ...values,
                assetId: effectiveAssetId,
                selectedVessel: values.selectedVessel ?? currentVessel,
              }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
