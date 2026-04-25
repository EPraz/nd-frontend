import { Button, OperationalEditorHeader } from "@/src/components";
import { useToast } from "@/src/context/ToastProvider";
import type { AssetDto } from "@/src/contracts/assets.contract";
import type { UploadFileInput } from "@/src/contracts/uploads.contract";
import { useVessels } from "@/src/features/vessels/core";
import { pickImageUpload } from "@/src/helpers/pickImageUpload";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { uploadCrewPhoto } from "../../api/crew.api";
import CrewEditorPreviewRail from "../../components/crewEditorPreviewRail/CrewEditorPreviewRail";
import CrewFormCard from "../../components/crewFormCard/CrewFormCard";
import {
  emptyCrewFormValues,
  toCreateCrewInput,
  type CrewFormValues,
} from "../../components/crewFormTypes";
import { useCreateCrew } from "../../hooks/useCreateCrew";

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
  const [pendingPhoto, setPendingPhoto] = useState<UploadFileInput | null>(
    null,
  );

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
  const isBusy = loading;
  const photoPreviewUrl = pendingPhoto?.previewUri ?? pendingPhoto?.uri ?? null;

  const canSubmit = useMemo(() => {
    if (isBusy) return false;
    if (!effectiveAssetId) return false;
    if (values.fullName.trim().length < 3) return false;
    return true;
  }, [isBusy, effectiveAssetId, values.fullName]);

  function patch(patchValue: Partial<CrewFormValues>) {
    setValues((prev) => ({ ...prev, ...patchValue }));
  }

  async function handlePickPhoto() {
    const file = await pickImageUpload();
    if (!file) return;
    setPendingPhoto(file);
  }

  function handleRemovePhoto() {
    setPendingPhoto(null);
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
          await uploadCrewPhoto(
            pid,
            effectiveAssetId,
            created.id,
            pendingPhoto,
          );
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
    <View className="flex-1">
      <ScrollView
        contentContainerClassName="p-4 pb-10 web:p-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="mx-auto w-full max-w-[1480px] gap-5">
          <OperationalEditorHeader
            title="Add Crew Member"
            description="Create the operational crew baseline, vessel assignment, and live profile signals the crew workspace and quick views will read."
            backLabel="Back to crew"
            onBack={() => router.replace(crewHref)}
            disabled={isBusy}
            actions={
              <>
                <Button
                  variant="outline"
                  size="pillSm"
                  onPress={() => router.replace(crewHref)}
                  disabled={isBusy}
                >
                  Cancel
                </Button>

                <Button
                  variant="default"
                  size="pillSm"
                  onPress={onCreate}
                  disabled={!canSubmit}
                  rightIcon={
                    <Ionicons
                      name="save-outline"
                      size={15}
                      className="text-textMain"
                    />
                  }
                >
                  {isBusy ? "Saving..." : "Save crew"}
                </Button>
              </>
            }
          />

          <View className="gap-5 web:xl:flex-row web:xl:items-start">
            <View className="flex-1 gap-4">
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
                localError={localError}
                apiError={error}
                disabled={isBusy}
              />
            </View>

            <View className="gap-4 web:xl:w-[430px]">
              <CrewEditorPreviewRail
                values={{
                  ...values,
                  assetId: effectiveAssetId,
                  selectedVessel: fixedAssetId
                    ? currentVessel
                    : values.selectedVessel,
                }}
                photoPreviewUrl={photoPreviewUrl}
                pendingPhotoName={pendingPhoto?.name ?? null}
                onSelectPhoto={handlePickPhoto}
                onRemovePhoto={handleRemovePhoto}
                canManagePhoto={!isBusy}
                photoBusy={isBusy}
                disabled={isBusy}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
