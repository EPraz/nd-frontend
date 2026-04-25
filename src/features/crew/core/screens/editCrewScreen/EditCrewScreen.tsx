import {
  Button,
  ConfirmModal,
  ErrorState,
  Loading,
  OperationalEditorHeader,
  Text,
} from "@/src/components";
import { useSessionContext } from "@/src/context/SessionProvider";
import { useToast } from "@/src/context/ToastProvider";
import type { AssetDto } from "@/src/contracts/assets.contract";
import type { UploadFileInput } from "@/src/contracts/uploads.contract";
import { useVessels } from "@/src/features/vessels/core";
import { pickImageUpload } from "@/src/helpers/pickImageUpload";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { deleteCrewPhoto, uploadCrewPhoto } from "../../api/crew.api";
import { canUser } from "@/src/security/rolePermissions";
import CrewEditorPreviewRail from "../../components/crewEditorPreviewRail/CrewEditorPreviewRail";
import CrewFormCard from "../../components/crewFormCard/CrewFormCard";
import {
  crewFormFromDto,
  emptyCrewFormValues,
  toUpdateCrewInput,
  type CrewFormValues,
} from "../../components/crewFormTypes";
import { useCrewById } from "../../hooks/useCrewById";
import { useDeleteCrew } from "../../hooks/useDeleteCrew";
import { useUpdateCrew } from "../../hooks/useUpdateCrew";

export default function EditCrewScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { session } = useSessionContext();
  const { projectId, assetId, crewId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
    crewId: string;
  }>();

  const pid = String(projectId);
  const vid = String(assetId);
  const cid = String(crewId);
  const backHref = `/projects/${pid}/vessels/${vid}/crew/${cid}`;
  const canEditCrew = canUser(session, "OPERATIONAL_WRITE");
  const canDeleteCrew = canUser(session, "OPERATIONAL_SOFT_DELETE");

  const { crew, loading, error, refresh } = useCrewById(pid, vid, cid);
  const {
    submit,
    loading: saving,
    error: saveError,
  } = useUpdateCrew(pid, vid, cid);
  const {
    submit: deleteCrew,
    loading: deleting,
    error: deleteError,
  } = useDeleteCrew(pid, vid, cid);

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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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
  const isBusy = saving || deleting;
  const photoPreviewUrl =
    pendingPhoto?.previewUri ??
    pendingPhoto?.uri ??
    (removeStoredPhoto ? null : crew?.photoUrl ?? null);

  const canSubmit = useMemo(() => {
    if (isBusy) return false;
    if (!effectiveAssetId) return false;
    if (values.fullName.trim().length < 3) return false;
    if (!dirty && !photoChanged) return false;
    return true;
  }, [isBusy, effectiveAssetId, values.fullName, dirty, photoChanged]);

  function patch(patchValue: Partial<CrewFormValues>) {
    setLocalError(null);
    setDirty(true);
    setValues((prev) => ({ ...prev, ...patchValue }));
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

  function handleReset() {
    if (!crew) return;
    setValues(crewFormFromDto(crew));
    setDirty(false);
    setLocalError(null);
    setPendingPhoto(null);
    setRemoveStoredPhoto(false);
  }

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
      router.replace(`/projects/${pid}/vessels/${effectiveAssetId}/crew/${cid}`);
    } catch {
      show("Failed to update crew member", "error");
    }
  }

  async function handleDelete() {
    try {
      await deleteCrew();
      setIsDeleteOpen(false);
      show("Crew member deleted", "success");
      router.replace(`/projects/${pid}/vessels/${effectiveAssetId}/crew`);
    } catch {
      show("Failed to delete crew member", "error");
    }
  }

  if (loading) return <Loading fullScreen />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!crew) {
    return <ErrorState message="Crew member not found." onRetry={refresh} />;
  }

  if (!canEditCrew) {
    return (
      <View className="flex-1 p-4 web:p-6">
        <View className="mx-auto w-full max-w-[960px] gap-5 rounded-[24px] border border-shellLine bg-shellPanel p-6">
          <View className="gap-2">
            <Text className="text-[11px] font-semibold uppercase tracking-[0.22em] text-shellHighlight">
              Permission required
            </Text>
            <Text className="text-2xl font-semibold text-textMain">
              Crew editing is restricted
            </Text>
            <Text className="text-[13px] leading-6 text-muted">
              Your role can view this crew member, but cannot edit operational
              records. Backend policy also denies direct update requests.
            </Text>
          </View>
          <Button
            variant="outline"
            size="pillSm"
            className="self-start rounded-full"
            onPress={() => router.replace(backHref)}
          >
            Back to crew member
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <ScrollView
        contentContainerClassName="p-4 pb-10 web:p-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="mx-auto w-full max-w-[1480px] gap-5">
          <OperationalEditorHeader
            title={`Edit ${crew.fullName || "Crew Member"}`}
            description="Keep assignment, contract status, and portrait current so the operational crew baseline stays reliable."
            backLabel="Back to crew member"
            onBack={() => router.replace(backHref)}
            disabled={isBusy}
            actions={
              <>
                <Button
                  variant="icon"
                  size="icon"
                  onPress={refresh}
                  disabled={isBusy}
                  leftIcon={
                    <Ionicons
                      name="refresh"
                      size={16}
                      className="text-textMain"
                    />
                  }
                  accessibilityLabel="Refresh crew member"
                />

                <Button
                  variant="outline"
                  size="pillSm"
                  onPress={handleReset}
                  disabled={(!dirty && !photoChanged) || isBusy}
                >
                  Reset
                </Button>

                {canDeleteCrew ? (
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
                ) : null}

                <Button
                  variant="default"
                  size="pillSm"
                  onPress={onSave}
                  disabled={!canSubmit}
                  rightIcon={
                    <Ionicons
                      name="save-outline"
                      size={15}
                      className="text-textMain"
                    />
                  }
                >
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </>
            }
          />

          <View className="gap-5 web:xl:flex-row web:xl:items-start">
            <View className="flex-1 gap-4">
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
                localError={localError}
                apiError={saveError}
                disabled={isBusy}
              />
            </View>

            <View className="gap-4 web:xl:w-[430px]">
              <CrewEditorPreviewRail
                values={{
                  ...values,
                  assetId: effectiveAssetId,
                  selectedVessel: values.selectedVessel ?? currentVessel,
                }}
                photoPreviewUrl={photoPreviewUrl}
                photoFileName={removeStoredPhoto ? null : crew.photoFileName}
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

      {deleteError ? <Text className="text-destructive">{deleteError}</Text> : null}

      <ConfirmModal
        visible={isDeleteOpen}
        title="Delete crew member"
        message={`Are you sure you want to delete ${crew.fullName}?`}
        confirmLabel="Delete crew member"
        cancelLabel="Keep crew member"
        variant="destructive"
        loading={deleting}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </View>
  );
}
