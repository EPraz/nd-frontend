import { Button } from "@/src/components/ui/button/Button";
import { Text } from "@/src/components/ui/text/Text";
import { useToast } from "@/src/context/ToastProvider";
import type { AssetDto } from "@/src/contracts/assets.contract";
import type { UploadFileInput } from "@/src/contracts/uploads.contract";
import { pickImageUpload } from "@/src/helpers/pickImageUpload";
import { useVessels } from "@/src/features/vessels/core";
import { useCreateCrew } from "../../hooks/useCreateCrew";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import CrewFormCard from "../../components/crewFormCard/CrewFormCard";
import CrewPreviewCard from "../../components/crewPreviewCard/CrewPreviewCard";
import {
  emptyCrewFormValues,
  toCreateCrewInput,
  type CrewFormValues,
} from "../../components/crewFormTypes";
import { uploadCrewPhoto } from "../../api/crew.api";

export default function CreateCrewScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { projectId, assetId } = useLocalSearchParams<{
    projectId: string;
    assetId?: string;
  }>();

  const pid = String(projectId);
  const fixedAssetId = assetId ? String(assetId) : null;

  const { submit, loading, error } = useCreateCrew(pid);

  const [values, setValues] = useState<CrewFormValues>(emptyCrewFormValues());
  const [localError, setLocalError] = useState<string | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<UploadFileInput | null>(null);

  const {
    vessels,
    loading: vesselsLoading,
    error: vesselsError,
  } = useVessels(pid);

  const currentVessel = useMemo<AssetDto | null>(() => {
    if (!fixedAssetId) return null;
    return vessels.find((v) => v.id === fixedAssetId) ?? null;
  }, [fixedAssetId, vessels]);

  useEffect(() => {
    if (!fixedAssetId) return;
    if (values.assetId === fixedAssetId) return;

    setValues((prev) => ({
      ...prev,
      assetId: fixedAssetId,
      selectedVessel: currentVessel ?? prev.selectedVessel,
    }));
  }, [fixedAssetId, currentVessel, values.assetId]);

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

  async function handlePickPhoto() {
    const file = await pickImageUpload();
    if (!file) return;
    setPendingPhoto(file);
  }

  function handleRemovePhoto() {
    setPendingPhoto(null);
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
      const input = toCreateCrewInput({
        ...values,
        assetId: effectiveAssetId,
      });

      const created = await submit(input);

      if (pendingPhoto) {
        try {
          await uploadCrewPhoto(pid, effectiveAssetId, created.id, pendingPhoto);
        } catch {
          show("Crew profile saved, but the photo upload failed.", "error");
        }
      }

      router.replace(crewHref);
    } catch {
      // hook handles primary error state
    }
  }

  return (
    <View className="flex-1 bg-shellCanvas">
      <ScrollView
        contentContainerClassName="gap-5 p-4 pb-10 web:p-6"
        showsVerticalScrollIndicator={false}
      >
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
            <Text className="font-semibold text-accent">Back to Crew</Text>
          </Pressable>

          <View className="gap-4 web:flex-row web:items-start web:justify-between">
            <View className="flex-1 gap-1">
              <Text className="text-[34px] font-semibold leading-[110%] text-textMain web:text-[44px]">
                Add Crew Member
              </Text>
              <Text className="text-[14px] text-muted">
                Register a crew member, capture their operational status, and
                attach a real portrait from the start.
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

        <View className="gap-5 web:lg:flex-row">
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
                assetId: effectiveAssetId,
              }}
              onChange={(patchValue: Partial<CrewFormValues>) => {
                setLocalError(null);
                patch(patchValue);
              }}
              photoPreviewUrl={pendingPhoto?.uri ?? null}
              pendingPhotoName={pendingPhoto?.name ?? null}
              onSelectPhoto={handlePickPhoto}
              onRemovePhoto={handleRemovePhoto}
              canManagePhoto={!loading}
              photoBusy={loading}
              localError={localError}
              apiError={error}
              disabled={loading}
            />
          </View>

          <View className="flex-1 gap-5 web:lg:w-[40%]">
            <CrewPreviewCard
              values={{
                ...values,
                assetId: effectiveAssetId,
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
