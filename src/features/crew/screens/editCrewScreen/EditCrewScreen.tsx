import { Button, ErrorState, Loading, Text } from "@/src/components";
import { useToast } from "@/src/context";
import type { AssetDto } from "@/src/contracts/assets.contract";
import type { UploadFileInput } from "@/src/contracts/uploads.contract";
import { pickImageUpload } from "@/src/helpers/pickImageUpload";
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
import { deleteCrewPhoto, uploadCrewPhoto } from "../../api/crew.api";
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
  const [pendingPhoto, setPendingPhoto] = useState<UploadFileInput | null>(null);
  const [removeStoredPhoto, setRemoveStoredPhoto] = useState(false);

  useEffect(() => {
    if (!crew || dirty) return;
    setValues(crewFormFromDto(crew));
  }, [crew, dirty]);

  const currentVessel = useMemo<AssetDto | null>(() => {
    const effective = values.assetId ?? vid;
    return vessels.find((v) => v.id === effective) ?? null;
  }, [vessels, values.assetId, vid]);

  const effectiveAssetId = values.assetId ?? vid;
  const photoChanged = Boolean(pendingPhoto || removeStoredPhoto);

  const canSubmit = useMemo(() => {
    if (saving) return false;
    if (!effectiveAssetId) return false;
    if (values.fullName.trim().length < 3) return false;
    if (!dirty && !photoChanged) return false;
    return true;
  }, [saving, effectiveAssetId, values.fullName, dirty, photoChanged]);

  function patch(p: Partial<CrewFormValues>) {
    setLocalError(null);
    setDirty(true);
    setValues((prev) => ({ ...prev, ...p }));
  }

  async function handlePickPhoto() {
    const file = await pickImageUpload();
    if (!file) return;
    setPendingPhoto(file);
    setRemoveStoredPhoto(false);
  }

  function handleRemovePhoto() {
    setPendingPhoto(null);
    if (crew?.photoUrl) {
      setRemoveStoredPhoto(true);
    }
  }

  function goBackOrTo(fallbackHref: string) {
    try {
      router.back();
    } catch {
      router.replace(fallbackHref);
    }
  }

  const viewHref = `/projects/${pid}/vessels/${effectiveAssetId}/crew/${cid}`;
  const crewListHref = `/projects/${pid}/vessels/${effectiveAssetId}/crew`;

  async function onSave() {
    setLocalError(null);

    if (values.fullName.trim().length < 3) {
      setLocalError("Full Name debe tener al menos 3 caracteres.");
      return;
    }

    if (!effectiveAssetId) {
      setLocalError("Selecciona un vessel.");
      return;
    }

    try {
      const input = toUpdateCrewInput({
        values,
        fixedAssetId: effectiveAssetId,
      });

      await submit(input);

      if (removeStoredPhoto) {
        await deleteCrewPhoto(pid, effectiveAssetId, cid);
      }

      if (pendingPhoto) {
        await uploadCrewPhoto(pid, effectiveAssetId, cid, pendingPhoto);
      }

      show("Crew member updated successfully", "success");
      router.replace(viewHref);
    } catch {
      show("Failed to update crew member", "error");
    }
  }

  if (loading) return <Loading fullScreen />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!crew) {
    return <ErrorState message="Crew member not found." onRetry={refresh} />;
  }

  return (
    <View className="flex-1 bg-shellCanvas">
      <ScrollView
        contentContainerClassName="gap-5 p-4 pb-10 web:p-6"
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
            <Text className="font-semibold text-accent">Back</Text>
          </Pressable>

          <View className="gap-4 web:flex-row web:items-start web:justify-between">
            <View className="flex-1 gap-1">
              <Text className="text-[34px] font-semibold leading-[110%] text-textMain web:text-[44px]">
                Edit Crew Member
              </Text>
              <Text className="text-[14px] text-muted">
                Update profile information, operational status, and the real
                portrait used across quick views.
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

        <View className="gap-5 web:lg:flex-row">
          <View className="flex-1 gap-5 web:lg:w-[60%]">
            <CrewFormCard
              fixedAssetId={null}
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
              photoPreviewUrl={
                pendingPhoto?.uri ??
                (removeStoredPhoto ? null : crew.photoUrl)
              }
              photoFileName={removeStoredPhoto ? null : crew.photoFileName}
              pendingPhotoName={pendingPhoto?.name ?? null}
              onSelectPhoto={handlePickPhoto}
              onRemovePhoto={handleRemovePhoto}
              canManagePhoto={!saving}
              photoBusy={saving}
              localError={localError}
              apiError={saveError}
              disabled={saving}
            />

            <Pressable
              onPress={() => router.replace(crewListHref)}
              className="self-start"
            >
              <Text className="font-semibold text-accent">
                Go to vessel crew list →
              </Text>
            </Pressable>
          </View>

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
