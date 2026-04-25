import { Button, Text } from "@/src/components";
import { useToast } from "@/src/context/ToastProvider";
import type { UploadFileInput } from "@/src/contracts/uploads.contract";
import { pickImageUpload } from "@/src/helpers/pickImageUpload";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollView, View } from "react-native";
import { uploadVesselImage } from "../../api/vessel-profile.api";
import {
  getVesselEmailError,
  normalizeVesselApiErrorMessage,
  VESSEL_FORM_ERROR_TOAST_MESSAGE,
} from "../../helpers/vesselFormValidation";
import { useCreateVessel } from "../../hooks/useCreateVessel";
import {
  canSubmitVesselEditor,
  emptyVesselEditorValues,
  toCreateVesselInput,
  VesselEditorContactSection,
  VesselEditorHeader,
  VesselEditorIdentitySection,
  VesselEditorPreviewRail,
  VesselEditorProfileDetailsSection,
  type VesselEditorFormValues,
} from "../vesselEditorSurface";

export default function NewVesselScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const pid = String(projectId);
  const { submit, loading, error } = useCreateVessel(pid);

  const { control, setValue, watch } = useForm<VesselEditorFormValues>({
    defaultValues: emptyVesselEditorValues(),
  });
  const values = watch();

  const [pendingImage, setPendingImage] = useState<UploadFileInput | null>(
    null,
  );
  const [finishingCreate, setFinishingCreate] = useState(false);

  const isBusy = loading || finishingCreate;
  const emailError = getVesselEmailError(values.email);

  const canSubmit = useMemo(() => {
    if (isBusy || emailError) return false;
    return canSubmitVesselEditor(values);
  }, [emailError, isBusy, values]);

  async function handleSelectImage() {
    const file = await pickImageUpload();
    if (!file) return;
    setPendingImage(file);
  }

  function handleRemoveImage() {
    setPendingImage(null);
  }

  function goBack() {
    router.replace(`/projects/${pid}/vessels`);
  }

  async function handleCreate() {
    if (emailError) {
      show(VESSEL_FORM_ERROR_TOAST_MESSAGE, "error");
      return;
    }

    try {
      const created = await submit(toCreateVesselInput(values));
      if (!created?.id) {
        throw new Error("Create vessel succeeded but response is missing id");
      }

      setFinishingCreate(true);

      if (pendingImage) {
        try {
          await uploadVesselImage(pid, created.id, pendingImage);
        } catch {
          show(
            "Vessel created, but the image still needs another try from edit mode.",
            "error",
          );
          router.replace(`/projects/${pid}/vessels/${created.id}/edit`);
          return;
        }
      }

      show("Vessel created", "success");
      router.replace(`/projects/${pid}/vessels/${created.id}`);
    } catch (cause) {
      show(
        normalizeVesselApiErrorMessage(
          cause instanceof Error ? cause.message : error,
        ),
        "error",
      );
    } finally {
      setFinishingCreate(false);
    }
  }

  return (
    <View className="flex-1">
      <ScrollView
        contentContainerClassName="p-4 pb-10 web:p-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="mx-auto w-full max-w-[1480px] gap-5">
          <VesselEditorHeader
            title="Add Vessel"
            description="Create the identity, operational contact, and visual baseline that will feed the registry, quick view, and vessel shell."
            backLabel="Back to vessels"
            onBack={goBack}
            disabled={isBusy}
            actions={
              <>
                <Button
                  variant="outline"
                  size="pillSm"
                  onPress={goBack}
                  disabled={isBusy}
                >
                  Cancel
                </Button>

                <Button
                  variant="default"
                  size="pillSm"
                  onPress={handleCreate}
                  disabled={!canSubmit}
                  rightIcon={
                    <Ionicons
                      name="save-outline"
                      size={15}
                      className="text-textMain"
                    />
                  }
                >
                  {isBusy ? "Saving..." : "Save vessel"}
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

              {error ? (
                <Text className="text-[13px] text-destructive">{error}</Text>
              ) : null}
            </View>

            <View className="web:xl:w-[430px]">
              <VesselEditorPreviewRail
                mode="create"
                values={values}
                imagePreviewUrl={pendingImage?.previewUri ?? pendingImage?.uri ?? null}
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
    </View>
  );
}
