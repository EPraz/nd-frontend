import {
  Button,
  Card,
  CardContent,
  CardHeaderRow,
  CardTitle,
  Field,
  Text,
} from "@/src/components";
import type { CreateAssetInput } from "@/src/contracts/assets.contract";
import type { UploadFileInput } from "@/src/contracts/uploads.contract";
import { useToast } from "@/src/context";
import { pickImageUpload } from "@/src/helpers/pickImageUpload";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, Switch, View } from "react-native";
import { patchVesselProfile, uploadVesselImage } from "../../api/vessel-profile.api";
import { VesselImagePanel } from "../../components";
import { useCreateVessel } from "../../hooks/useCreateVessel";

function normalize(value: string) {
  return value.trim();
}

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

export default function NewVesselScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const pid = String(projectId);
  const { submit, loading, error } = useCreateVessel(pid);

  const [name, setName] = useState("");
  const [flag, setFlag] = useState("PA");
  const [email, setEmail] = useState("");
  const [useLicense, setUseLicense] = useState(false);
  const [imo, setImo] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [pendingImage, setPendingImage] = useState<UploadFileInput | null>(null);
  const [finishingCreate, setFinishingCreate] = useState(false);

  const isBusy = loading || finishingCreate;

  const canSubmit = useMemo(() => {
    if (!normalize(name)) return false;
    if (useLicense) return Boolean(normalize(licenseNumber));
    return Boolean(normalize(imo));
  }, [imo, licenseNumber, name, useLicense]);

  const identifierPreview = useLicense
    ? normalize(licenseNumber)
      ? `LIC ${normalize(licenseNumber)}`
      : "-"
    : normalize(imo)
      ? `IMO ${normalize(imo)}`
      : "-";

  async function handleSelectImage() {
    const file = await pickImageUpload();
    if (!file) return;
    setPendingImage(file);
  }

  function handleRemoveImage() {
    setPendingImage(null);
  }

  function goBack() {
    if (router.canGoBack?.()) {
      router.back();
      return;
    }

    router.replace(`/projects/${pid}/vessels`);
  }

  async function handleCreate() {
    const input: CreateAssetInput = useLicense
      ? {
          type: "VESSEL",
          name: normalize(name),
          identifierType: "LICENSE",
          licenseNumber: normalize(licenseNumber),
          flag: normalize(flag) || undefined,
        }
      : {
          type: "VESSEL",
          name: normalize(name),
          identifierType: "IMO",
          imo: normalize(imo),
          flag: normalize(flag) || undefined,
        };

    try {
      const created = await submit(input);
      if (!created?.id) {
        throw new Error("Create vessel succeeded but response is missing id");
      }

      setFinishingCreate(true);

      const followUpFailures: string[] = [];

      if (normalize(email)) {
        try {
          await patchVesselProfile(pid, created.id, { email: normalize(email) });
        } catch {
          followUpFailures.push("email");
        }
      }

      if (pendingImage) {
        try {
          await uploadVesselImage(pid, created.id, pendingImage);
        } catch {
          followUpFailures.push("image");
        }
      }

      if (followUpFailures.length > 0) {
        show(
          "Vessel created, but the contact email or image still needs review from edit mode.",
          "error",
        );
        router.replace(`/projects/${pid}/vessels/${created.id}/edit`);
        return;
      }

      show("Vessel created", "success");
      router.replace(`/projects/${pid}/vessels/${created.id}`);
    } catch {
      // hook exposes the main API error
    } finally {
      setFinishingCreate(false);
    }
  }

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
              Back to vessels
            </Button>

            <Text className="text-[34px] font-semibold leading-[110%] text-textMain">
              Add Vessel
            </Text>
            <Text className="max-w-[760px] text-[14px] leading-[22px] text-muted">
              Create the vessel identity first, then persist the operational
              contact and uploaded image in the same flow so the shell and quick
              view start from a real baseline.
            </Text>
          </View>

          <View className="flex-row flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="lg"
              onPress={goBack}
              disabled={isBusy}
              className="rounded-full"
            >
              Cancel
            </Button>

            <Button
              variant="default"
              size="lg"
              onPress={handleCreate}
              disabled={!canSubmit || isBusy}
              className="rounded-full"
              rightIcon={
                <Ionicons
                  name="save-outline"
                  size={16}
                  className="text-textMain"
                />
              }
            >
              {isBusy ? "Saving..." : "Save vessel"}
            </Button>
          </View>
        </View>

        <View className="gap-5 web:lg:flex-row">
          <Card className="flex-1 rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
            <CardHeaderRow>
              <View className="gap-1">
                <CardTitle className="text-[16px] text-textMain">
                  Vessel Details
                </CardTitle>
                <Text className="text-[13px] text-muted">
                  Define the main identifier and the operating contact details
                  that QA requested for the vessel profile.
                </Text>
              </View>
            </CardHeaderRow>

            <CardContent className="px-6">
              <View className="gap-5">
                <Field
                  label="Vessel Name *"
                  placeholder="e.g. MV Navigate One"
                  value={name}
                  onChangeText={setName}
                  editable={!isBusy}
                />

                <View className="gap-4 rounded-[18px] border border-shellLine bg-shellPanelSoft p-4">
                  <View className="flex-row items-center justify-between gap-4">
                    <View className="flex-1 gap-1">
                      <Text className="font-semibold text-textMain">
                        Identifier
                      </Text>
                      <Text className="text-[12px] leading-[18px] text-muted">
                        Use IMO when available. Fall back to license only when
                        the vessel has no IMO.
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-3">
                      <Text className="text-[12px] text-muted">
                        Use license
                      </Text>
                      <Switch
                        value={useLicense}
                        onValueChange={(value) => {
                          setUseLicense(value);
                          setImo("");
                          setLicenseNumber("");
                        }}
                        disabled={isBusy}
                      />
                    </View>
                  </View>

                  {useLicense ? (
                    <Field
                      label="License Number *"
                      placeholder="e.g. LIC-PA-001"
                      value={licenseNumber}
                      onChangeText={setLicenseNumber}
                      editable={!isBusy}
                    />
                  ) : (
                    <Field
                      label="IMO *"
                      placeholder="e.g. 9876543"
                      value={imo}
                      onChangeText={setImo}
                      keyboardType="numeric"
                      editable={!isBusy}
                    />
                  )}

                  <Field
                    label="Flag"
                    placeholder="e.g. PA"
                    value={flag}
                    onChangeText={setFlag}
                    editable={!isBusy}
                  />
                </View>

                <Field
                  label="Vessel Email"
                  placeholder="e.g. master@vesselmail.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  editable={!isBusy}
                />

                {error ? <Text className="text-destructive">{error}</Text> : null}
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
                  The selected image becomes the visual baseline for vessel
                  overview and quick view once the create flow completes.
                </Text>
              </View>
            </CardHeaderRow>

            <CardContent className="px-6">
              <View className="gap-5">
                <View className="gap-3 rounded-[18px] border border-shellLine bg-shellPanelSoft p-4">
                  <PreviewRow label="Name" value={normalize(name) || "-"} />
                  <PreviewRow label="Identifier" value={identifierPreview} />
                  <PreviewRow label="Flag" value={normalize(flag) || "-"} />
                  <PreviewRow
                    label="Vessel Email"
                    value={normalize(email) || "-"}
                  />
                </View>

                <VesselImagePanel
                  imagePreviewUrl={pendingImage?.uri ?? null}
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
