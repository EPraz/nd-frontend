import { Button, ErrorState, Loading, Text } from "@/src/components";
import { ConfirmModal } from "@/src/components/ui/modal/ConfirmModal";
import { useToast } from "@/src/context/ToastProvider";
import type { UploadFileInput } from "@/src/contracts/uploads.contract";
import { pickImageUpload } from "@/src/helpers/pickImageUpload";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import {
  removeVesselImage,
  uploadVesselImage,
} from "../../api/vessel-profile.api";
import {
  getVesselEmailError,
  normalizeVesselApiErrorMessage,
  VESSEL_FORM_ERROR_TOAST_MESSAGE,
} from "../../helpers/vesselFormValidation";
import { useDeleteVessel } from "../../hooks/useDeleteVessel";
import { useUpdateVesselProfile } from "../../hooks/useUpdateVesselProfile";
import { useVessel } from "../../hooks/useVessel";
import { useVesselProfile } from "../../hooks/useVesselProfile";
import {
  buildVesselEditorValues,
  canSubmitVesselEditor,
  emptyVesselEditorValues,
  toUpdateVesselProfileInput,
  VesselEditorContactSection,
  VesselEditorHeader,
  VesselEditorIdentitySection,
  VesselEditorPreviewRail,
  VesselEditorProfileDetailsSection,
  type VesselEditorFormValues,
} from "../vesselEditorSurface";

export default function EditVesselScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { projectId, assetId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
  }>();

  const pid = String(projectId);
  const aid = String(assetId);
  const backHref = `/projects/${pid}/vessels/${aid}`;

  const vesselState = useVessel(pid, aid);
  const profileState = useVesselProfile(pid, aid);
  const updateState = useUpdateVesselProfile(pid, aid);
  const deleteState = useDeleteVessel(pid, aid);

  const loading = vesselState.loading || profileState.loading;
  const initial = useMemo(
    () =>
      buildVesselEditorValues(
        profileState.profile,
        vesselState.vessel?.name ?? "",
      ),
    [profileState.profile, vesselState.vessel?.name],
  );

  const {
    control,
    formState: { isDirty },
    reset,
    setValue,
    watch,
  } = useForm<VesselEditorFormValues>({
    defaultValues: emptyVesselEditorValues(),
  });
  const values = watch();

  const [pendingImage, setPendingImage] = useState<UploadFileInput | null>(
    null,
  );
  const [removeStoredImage, setRemoveStoredImage] = useState(false);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    reset(initial);
  }, [initial, reset]);

  const isBusy = loading || updateState.loading || mediaBusy || deleteState.loading;
  const hasStoredImage = Boolean(vesselState.vessel?.imageUrl);
  const emailError = getVesselEmailError(values.email);

  const dirty = isDirty || Boolean(pendingImage) || removeStoredImage;
  const canSubmit = useMemo(() => {
    if (isBusy || !dirty || emailError) return false;
    return canSubmitVesselEditor(values);
  }, [dirty, emailError, isBusy, values]);

  const imagePreviewUrl =
    pendingImage?.previewUri ??
    pendingImage?.uri ??
    (removeStoredImage ? null : (vesselState.vessel?.imageUrl ?? null));
  const imageFileName = removeStoredImage
    ? null
    : (vesselState.vessel?.imageFileName ?? null);

  function goBack() {
    router.replace(backHref);
  }

  async function handleRefresh() {
    await Promise.all([vesselState.refresh(), profileState.refresh()]);
  }

  async function handleSelectImage() {
    const file = await pickImageUpload();
    if (!file) return;
    setPendingImage(file);
    setRemoveStoredImage(false);
  }

  function handleRemoveImage() {
    if (pendingImage) {
      setPendingImage(null);
      return;
    }

    if (hasStoredImage) {
      setRemoveStoredImage(true);
    }
  }

  function handleReset() {
    reset(initial);
    setPendingImage(null);
    setRemoveStoredImage(false);
  }

  async function handleSave() {
    if (emailError) {
      show(VESSEL_FORM_ERROR_TOAST_MESSAGE, "error");
      return;
    }

    try {
      await updateState.submit(toUpdateVesselProfileInput(values));

      setMediaBusy(true);

      try {
        if (pendingImage) {
          await uploadVesselImage(pid, aid, pendingImage);
        } else if (removeStoredImage && hasStoredImage) {
          await removeVesselImage(pid, aid);
        }
      } catch {
        show(
          "Vessel profile was saved, but the image update needs another try.",
          "error",
        );
        await Promise.all([vesselState.refresh(), profileState.refresh()]);
        setPendingImage(null);
        setRemoveStoredImage(false);
        return;
      }

      show("Vessel profile updated", "success");
      router.replace(backHref);
    } catch (cause) {
      show(
        normalizeVesselApiErrorMessage(
          cause instanceof Error ? cause.message : updateState.error,
        ),
        "error",
      );
    } finally {
      setMediaBusy(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteState.submit();
      setIsDeleteOpen(false);
      show("Vessel deleted", "success");
      router.replace(`/projects/${pid}/vessels`);
    } catch {
      show("Failed to delete vessel", "error");
    }
  }

  if (loading) return <Loading fullScreen />;

  if (!vesselState.vessel || vesselState.error) {
    return (
      <ErrorState
        message={vesselState.error ?? "Vessel not found."}
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <View className="flex-1">
      <ScrollView
        contentContainerClassName="p-4 pb-10 web:p-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="mx-auto w-full max-w-[1480px] gap-5">
          <VesselEditorHeader
            title={`Edit ${vesselState.vessel.name}`}
            description="Keep the operational profile current with the right contact, identifiers, image, and visible vessel facts."
            backLabel="Back to vessel"
            onBack={goBack}
            disabled={isBusy}
            actions={
              <>
                <Button
                  variant="icon"
                  size="icon"
                  onPress={handleRefresh}
                  disabled={isBusy}
                  leftIcon={
                    <Ionicons
                      name="refresh"
                      size={16}
                      className="text-textMain"
                    />
                  }
                  accessibilityLabel="Refresh vessel"
                />

                <Button
                  variant="outline"
                  size="pillSm"
                  onPress={handleReset}
                  disabled={!dirty || isBusy}
                >
                  Reset
                </Button>

                <Button
                  variant="softDestructive"
                  size="pillSm"
                  onPress={() => setIsDeleteOpen(true)}
                  disabled={isBusy}
                  rightIcon={
                    <Ionicons
                      name="trash-outline"
                      size={15}
                      className="text-destructive"
                    />
                  }
                >
                  Delete
                </Button>

                <Button
                  variant="default"
                  size="pillSm"
                  onPress={handleSave}
                  disabled={!canSubmit}
                  rightIcon={
                    <Ionicons
                      name="save-outline"
                      size={15}
                      className="text-textMain"
                    />
                  }
                >
                  {isBusy ? "Saving..." : "Save changes"}
                </Button>
              </>
            }
          />

          <View className="gap-5 web:xl:flex-row web:xl:items-start">
            <View className="flex-1 gap-4">
              <VesselEditorIdentitySection
                control={control}
                setValue={setValue}
                disabled={isBusy}
                allowNameEdit={false}
              />

              <VesselEditorContactSection
                control={control}
                values={values}
                disabled={isBusy}
              />

              <VesselEditorProfileDetailsSection
                control={control}
                values={values}
                setValue={setValue}
                disabled={isBusy}
              />

              {profileState.error ? (
                <Text className="text-[13px] text-destructive">
                  {profileState.error}
                </Text>
              ) : null}
              {updateState.error ? (
                <Text className="text-[13px] text-destructive">
                  {updateState.error}
                </Text>
              ) : null}
            </View>

            <View className="web:xl:w-[430px]">
              <VesselEditorPreviewRail
                mode="edit"
                values={values}
                imagePreviewUrl={imagePreviewUrl}
                storedFileName={imageFileName}
                pendingFileName={pendingImage?.name ?? null}
                onSelectImage={handleSelectImage}
                onRemoveImage={handleRemoveImage}
                disabled={isBusy}
                busy={isBusy}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <ConfirmModal
        visible={isDeleteOpen}
        title="Delete vessel"
        message={`Are you sure you want to delete ${vesselState.vessel.name}?`}
        confirmLabel="Delete"
        cancelLabel="Keep vessel"
        variant="destructive"
        loading={deleteState.loading}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </View>
  );
}
