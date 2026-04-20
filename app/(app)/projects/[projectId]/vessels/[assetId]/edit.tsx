import {
  Button,
  Card,
  CardContent,
  CardHeaderRow,
  CardTitle,
  ErrorState,
  Field,
  Loading,
  Text,
} from "@/src/components";
import type { UploadFileInput } from "@/src/contracts/uploads.contract";
import { useToast } from "@/src/context";
import { pickImageUpload } from "@/src/helpers/pickImageUpload";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Switch, View } from "react-native";
import { removeVesselImage, uploadVesselImage } from "@/src/features/vessels/api/vessel-profile.api";
import { VesselImagePanel } from "@/src/features/vessels/components";
import type { UpdateVesselProfileInput } from "@/src/features/vessels/contracts/vessel.contract";
import {
  useUpdateVesselProfile,
  useVessel,
  useVesselProfile,
} from "@/src/features/vessels/hooks";
import {
  getVesselEmailError,
  normalizeVesselApiErrorMessage,
  normalizeVesselValue,
  VESSEL_FORM_ERROR_TOAST_MESSAGE,
} from "@/src/features/vessels/helpers/vesselFormValidation";

type FormState = {
  identifierType: "IMO" | "LICENSE";
  imo: string;
  licenseNumber: string;
  flag: string;
  email: string;
  callSign: string;
  mmsi: string;
  homePort: string;
  vesselType: string;
  classSociety: string;
  builder: string;
  yearBuilt: string;
};

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between gap-4">
      <Text className="text-[12px] text-muted">{label}</Text>
      <Text className="text-right text-[13px] font-semibold text-textMain">
        {value}
      </Text>
    </View>
  );
}

function buildInitialForm(profile: ReturnType<typeof useVesselProfile>["profile"]): FormState {
  return {
    identifierType: (profile?.identifierType ?? "IMO") as "IMO" | "LICENSE",
    imo: profile?.imo ?? "",
    licenseNumber: profile?.licenseNumber ?? "",
    flag: profile?.flag ?? "",
    email: profile?.email ?? "",
    callSign: profile?.callSign ?? "",
    mmsi: profile?.mmsi ?? "",
    homePort: profile?.homePort ?? "",
    vesselType: profile?.vesselType ?? "",
    classSociety: profile?.classSociety ?? "",
    builder: profile?.builder ?? "",
    yearBuilt: profile?.yearBuilt ? String(profile.yearBuilt) : "",
  };
}

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

  const loading = vesselState.loading || profileState.loading;
  const initial = useMemo(() => buildInitialForm(profileState.profile), [profileState.profile]);

  const [form, setForm] = useState<FormState>(initial);
  const [pendingImage, setPendingImage] = useState<UploadFileInput | null>(null);
  const [removeStoredImage, setRemoveStoredImage] = useState(false);
  const [mediaBusy, setMediaBusy] = useState(false);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const isBusy = loading || updateState.loading || mediaBusy;
  const useLicense = form.identifierType === "LICENSE";
  const hasStoredImage = Boolean(vesselState.vessel?.imageUrl);
  const emailError = getVesselEmailError(form.email);

  const profileDirty = useMemo(
    () => JSON.stringify(initial) !== JSON.stringify(form),
    [form, initial],
  );
  const dirty = profileDirty || Boolean(pendingImage) || removeStoredImage;

  const canSubmit = useMemo(() => {
    if (isBusy || !dirty) return false;
    if (useLicense) return Boolean(normalizeVesselValue(form.licenseNumber));
    return Boolean(normalizeVesselValue(form.imo));
  }, [dirty, form.imo, form.licenseNumber, isBusy, useLicense]);

  const imagePreviewUrl = pendingImage?.uri ?? (removeStoredImage ? null : vesselState.vessel?.imageUrl ?? null);
  const imageFileName = removeStoredImage ? null : vesselState.vessel?.imageFileName ?? null;

  function goBack() {
    if (router.canGoBack?.()) {
      router.back();
      return;
    }

    router.replace(backHref);
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
    setForm(initial);
    setPendingImage(null);
    setRemoveStoredImage(false);
  }

  async function handleSave() {
    if (emailError) {
      show(VESSEL_FORM_ERROR_TOAST_MESSAGE, "error");
      return;
    }

    const input: UpdateVesselProfileInput = {
      identifierType: form.identifierType,
      imo:
        form.identifierType === "IMO"
          ? normalizeVesselValue(form.imo)
          : undefined,
      licenseNumber:
        form.identifierType === "LICENSE"
          ? normalizeVesselValue(form.licenseNumber)
          : undefined,
      flag: normalizeVesselValue(form.flag) || undefined,
      email: normalizeVesselValue(form.email) || undefined,
      callSign: normalizeVesselValue(form.callSign) || undefined,
      mmsi: normalizeVesselValue(form.mmsi) || undefined,
      homePort: normalizeVesselValue(form.homePort) || undefined,
      vesselType: normalizeVesselValue(form.vesselType) || undefined,
      classSociety: normalizeVesselValue(form.classSociety) || undefined,
      builder: normalizeVesselValue(form.builder) || undefined,
      yearBuilt: form.yearBuilt.trim() ? Number(form.yearBuilt) : undefined,
    };

    try {
      await updateState.submit(input);

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

  if (loading) return <Loading fullScreen />;

  if (!vesselState.vessel || vesselState.error) {
    return (
      <ErrorState
        message={vesselState.error ?? "Vessel not found."}
        onRetry={async () => {
          await Promise.all([vesselState.refresh(), profileState.refresh()]);
        }}
      />
    );
  }

  const identifierPreview = useLicense
    ? normalizeVesselValue(form.licenseNumber)
      ? `LIC ${normalizeVesselValue(form.licenseNumber)}`
      : "-"
    : normalizeVesselValue(form.imo)
      ? `IMO ${normalizeVesselValue(form.imo)}`
      : "-";

  return (
    <View className="flex-1 bg-shellCanvas">
      <ScrollView
        contentContainerClassName="gap-5 p-4 pb-10 web:p-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-4 web:flex-row web:items-start web:justify-between">
          <View className="flex-1 gap-2">
            <Button
              variant="ghost"
              size="sm"
              onPress={goBack}
              disabled={isBusy}
              className="self-start rounded-full px-0"
              leftIcon={
                <Ionicons
                  name="chevron-back"
                  size={16}
                  className="text-accent"
                />
              }
            >
              Back to vessel
            </Button>

            <Text className="text-[34px] font-semibold leading-[110%] text-textMain">
              Edit {vesselState.vessel.name}
            </Text>
            <Text className="max-w-[760px] text-[14px] leading-[22px] text-muted">
              Keep the vessel shell current with the right contact email,
              identifier, and uploaded image. This is the source used by quick
              views and overview presentation.
            </Text>
          </View>

          <View className="flex-row flex-wrap items-center gap-2">
            <Button
              variant="icon"
              size="iconLg"
              onPress={async () => {
                await Promise.all([vesselState.refresh(), profileState.refresh()]);
              }}
              disabled={isBusy}
              leftIcon={
                <Ionicons
                  name="refresh"
                  size={18}
                  className="text-textMain"
                />
              }
              accessibilityLabel="Refresh vessel"
            />

            <Button
              variant="outline"
              size="lg"
              onPress={handleReset}
              disabled={!dirty || isBusy}
              className="rounded-full"
            >
              Reset
            </Button>

            <Button
              variant="default"
              size="lg"
              onPress={handleSave}
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
              {isBusy ? "Saving..." : "Save changes"}
            </Button>
          </View>
        </View>

        <View className="gap-5 web:lg:flex-row">
          <Card className="flex-1 rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
            <CardHeaderRow>
              <View className="gap-1">
                <CardTitle className="text-[16px] text-textMain">
                  Vessel Profile
                </CardTitle>
                <Text className="text-[13px] text-muted">
                  Update the operational details that matter now, without
                  surfacing technical clutter that the client does not need.
                </Text>
              </View>
            </CardHeaderRow>

            <CardContent className="px-6">
              <View className="gap-5">
                <View className="gap-2 rounded-[18px] border border-shellLine bg-shellPanelSoft p-4">
                  <Text className="text-[12px] text-muted">Asset name</Text>
                  <Text className="text-[18px] font-semibold text-textMain">
                    {vesselState.vessel.name}
                  </Text>
                  <Text className="text-[12px] leading-[18px] text-muted">
                    The asset name stays managed at asset level. This screen is
                    focused on vessel profile details.
                  </Text>
                </View>

                <View className="gap-4 rounded-[18px] border border-shellLine bg-shellPanelSoft p-4">
                  <View className="flex-row items-center justify-between gap-4">
                    <View className="flex-1 gap-1">
                      <Text className="font-semibold text-textMain">
                        Identifier
                      </Text>
                      <Text className="text-[12px] leading-[18px] text-muted">
                        Keep the main vessel identifier consistent so
                        compliance, crew, and future integrations can resolve
                        the same asset cleanly.
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-3">
                      <Text className="text-[12px] text-muted">
                        Use license
                      </Text>
                      <Switch
                        value={useLicense}
                        onValueChange={(value) =>
                          setForm((current) => ({
                            ...current,
                            identifierType: value ? "LICENSE" : "IMO",
                            imo: value ? "" : current.imo,
                            licenseNumber: value ? current.licenseNumber : "",
                          }))
                        }
                        disabled={isBusy}
                      />
                    </View>
                  </View>

                  {useLicense ? (
                    <Field
                      label="License Number *"
                      placeholder="e.g. LIC-PA-001"
                      value={form.licenseNumber}
                      onChangeText={(value) =>
                        setForm((current) => ({
                          ...current,
                          licenseNumber: value,
                        }))
                      }
                      editable={!isBusy}
                    />
                  ) : (
                    <Field
                      label="IMO *"
                      placeholder="e.g. 9876543"
                      value={form.imo}
                      onChangeText={(value) =>
                        setForm((current) => ({ ...current, imo: value }))
                      }
                      keyboardType="numeric"
                      editable={!isBusy}
                    />
                  )}

                  <Field
                    label="Flag"
                    placeholder="e.g. PA"
                    value={form.flag}
                    onChangeText={(value) =>
                      setForm((current) => ({ ...current, flag: value }))
                    }
                    editable={!isBusy}
                  />
                </View>

                <View className="gap-4 web:flex-row">
                  <View className="flex-1">
                    <Field
                      label="Vessel Email"
                      placeholder="e.g. master@vesselmail.com"
                      value={form.email}
                      onChangeText={(value) =>
                        setForm((current) => ({ ...current, email: value }))
                      }
                      keyboardType="email-address"
                      editable={!isBusy}
                      error={emailError}
                      hint="Use the operational inbox the team expects to see in the vessel shell."
                    />
                  </View>
                  <View className="flex-1">
                    <Field
                      label="Home Port"
                      placeholder="e.g. Balboa"
                      value={form.homePort}
                      onChangeText={(value) =>
                        setForm((current) => ({ ...current, homePort: value }))
                      }
                      editable={!isBusy}
                    />
                  </View>
                </View>

                <View className="gap-4 web:flex-row">
                  <View className="flex-1">
                    <Field
                      label="Call Sign"
                      placeholder="e.g. HPXY"
                      value={form.callSign}
                      onChangeText={(value) =>
                        setForm((current) => ({ ...current, callSign: value }))
                      }
                      editable={!isBusy}
                    />
                  </View>
                  <View className="flex-1">
                    <Field
                      label="MMSI"
                      placeholder="e.g. 123456789"
                      value={form.mmsi}
                      onChangeText={(value) =>
                        setForm((current) => ({ ...current, mmsi: value }))
                      }
                      keyboardType="numeric"
                      editable={!isBusy}
                    />
                  </View>
                </View>

                <View className="gap-4 web:flex-row">
                  <View className="flex-1">
                    <Field
                      label="Vessel Type"
                      placeholder="e.g. Bulk Carrier"
                      value={form.vesselType}
                      onChangeText={(value) =>
                        setForm((current) => ({
                          ...current,
                          vesselType: value,
                        }))
                      }
                      editable={!isBusy}
                    />
                  </View>
                  <View className="flex-1">
                    <Field
                      label="Class Society"
                      placeholder="e.g. ABS"
                      value={form.classSociety}
                      onChangeText={(value) =>
                        setForm((current) => ({
                          ...current,
                          classSociety: value,
                        }))
                      }
                      editable={!isBusy}
                    />
                  </View>
                </View>

                <View className="gap-4 web:flex-row">
                  <View className="flex-1">
                    <Field
                      label="Builder"
                      placeholder="e.g. Hyundai"
                      value={form.builder}
                      onChangeText={(value) =>
                        setForm((current) => ({ ...current, builder: value }))
                      }
                      editable={!isBusy}
                    />
                  </View>
                  <View className="flex-1">
                    <Field
                      label="Year Built"
                      placeholder="e.g. 2009"
                      value={form.yearBuilt}
                      onChangeText={(value) =>
                        setForm((current) => ({ ...current, yearBuilt: value }))
                      }
                      keyboardType="numeric"
                      editable={!isBusy}
                    />
                  </View>
                </View>

                {profileState.error ? (
                  <Text className="text-destructive">{profileState.error}</Text>
                ) : null}
                {updateState.error ? (
                  <Text className="text-destructive">{updateState.error}</Text>
                ) : null}
              </View>
            </CardContent>
          </Card>

          <Card className="flex-1 rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
            <CardHeaderRow>
              <View className="gap-1">
                <CardTitle className="text-[16px] text-textMain">
                  Preview
                </CardTitle>
                <Text className="text-[13px] text-muted">
                  Keep the quick view and vessel shell aligned with what the
                  client actually sees.
                </Text>
              </View>
            </CardHeaderRow>

            <CardContent className="px-6">
              <View className="gap-5">
                <View className="gap-3 rounded-[18px] border border-shellLine bg-shellPanelSoft p-4">
                  <PreviewRow label="Name" value={vesselState.vessel.name} />
                  <PreviewRow label="Identifier" value={identifierPreview} />
                  <PreviewRow
                    label="Flag"
                    value={normalizeVesselValue(form.flag) || "-"}
                  />
                  <PreviewRow
                    label="Vessel Email"
                    value={normalizeVesselValue(form.email) || "-"}
                  />
                  <PreviewRow
                    label="Home Port"
                    value={normalizeVesselValue(form.homePort) || "-"}
                  />
                  <PreviewRow
                    label="Type"
                    value={normalizeVesselValue(form.vesselType) || "-"}
                  />
                </View>

                <VesselImagePanel
                  imagePreviewUrl={imagePreviewUrl}
                  storedFileName={imageFileName}
                  pendingFileName={pendingImage?.name ?? null}
                  onSelectImage={handleSelectImage}
                  onRemoveImage={handleRemoveImage}
                  canManageImage
                  busy={isBusy}
                  disabled={isBusy}
                />
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
