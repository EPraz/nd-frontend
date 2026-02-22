import { Field, Text } from "@/src/components";
import type { CreateAssetInput } from "@/src/contracts/assets.contract";
import { useCreateVessel } from "@/src/features/vessels/hooks/useCreateVessel";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Switch, View } from "react-native";

export default function NewVesselScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const pid = String(projectId);

  const { submit, loading, error } = useCreateVessel(pid);

  const [name, setName] = useState("");
  const [flag, setFlag] = useState("PA");
  const [noImo, setNoImo] = useState(false);
  const [imo, setImo] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const isBusy = loading;

  const canSubmit = useMemo(() => {
    if (!name.trim()) return false;
    if (!noImo) return Boolean(imo.trim());
    return Boolean(licenseNumber.trim());
  }, [name, noImo, imo, licenseNumber]);

  const backHref = `/projects/${pid}/vessels`; // AJUSTA
  const successHref = (assetId: string) =>
    `/projects/${pid}/vessels/${assetId}`; // tu actual

  function goBackOrTo(fallbackHref: string) {
    if (router.canGoBack?.()) return router.back();
    router.replace(fallbackHref);
  }

  function onToggleNoImo(next: boolean) {
    setNoImo(next);
    setImo("");
    setLicenseNumber("");
  }

  async function onCreate() {
    const input: CreateAssetInput = noImo
      ? {
          type: "VESSEL",
          name: name.trim(),
          identifierType: "LICENSE",
          licenseNumber: licenseNumber.trim(),
          flag: flag.trim() || undefined,
        }
      : {
          type: "VESSEL",
          name: name.trim(),
          identifierType: "IMO",
          imo: imo.trim(),
          flag: flag.trim() || undefined,
        };

    try {
      const created = await submit(input);
      if (!created?.id)
        throw new Error("Create vessel succeeded but response is missing id");
      router.replace(successHref(created.id));
    } catch {
      // hook sets error
    }
  }

  return (
    <View className="flex-1">
      <ScrollView
        contentContainerClassName="gap-5 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex flex-col gap-4 web:flex-row web:items-center web:justify-between">
          <View className="gap-2">
            <Pressable
              onPress={() => goBackOrTo(backHref)}
              disabled={isBusy}
              className={[
                "flex-row items-center gap-2",
                isBusy ? "opacity-50" : "hover:opacity-90",
              ].join(" ")}
            >
              <Ionicons name="arrow-back" size={18} color="white" />
              <Text className="text-textMain/80">Back to Vessels</Text>
            </Pressable>

            <Text className="text-textMain text-[34px] web:text-[44px] font-semibold leading-[110%]">
              Add New Vessel
            </Text>

            <Text className="text-textMain/60 text-[13px]">
              Create a vessel and set its identifier (IMO or License).
            </Text>
          </View>

          <View className="flex-row items-center justify-end gap-3">
            <Pressable
              onPress={() => goBackOrTo(backHref)}
              disabled={isBusy}
              className={[
                "rounded-full border border-accent/40 bg-surface px-6 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.25)]",
                "active:opacity-80",
                isBusy ? "opacity-50" : "hover:scale-105",
              ].join(" ")}
            >
              <Text className="text-textMain">Cancel</Text>
            </Pressable>

            <Pressable
              onPress={onCreate}
              disabled={!canSubmit || isBusy}
              className={[
                "flex-row items-center gap-2 rounded-full px-6 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.25)]",
                "bg-accent active:opacity-90",
                !canSubmit || isBusy ? "opacity-50" : "hover:scale-105",
              ].join(" ")}
            >
              <Ionicons name="save-outline" size={18} color="#27374D" />
              <Text className="text-baseBg font-bold">
                {isBusy ? "Saving..." : "Save"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Grid */}
        <View className="gap-5 web:lg:flex-row">
          {/* Left */}
          <View className="flex-1 rounded-3xl border border-white/10 bg-surface p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] web:lg:w-[60%]">
            <View className="mb-4">
              <Text className="text-textMain text-[18px] font-semibold">
                Vessel Details
              </Text>
              <Text className="text-textMain/60 text-[13px]">
                Basic information for the vessel.
              </Text>
            </View>

            <View className="gap-4">
              <Field
                label="Vessel Name *"
                placeholder="e.g. MV Navigate One"
                value={name}
                onChangeText={setName}
              />

              <View className="rounded-3xl border border-white/10 bg-black/10 p-4 gap-4">
                <View className="flex-row items-center justify-between">
                  <View className="gap-1">
                    <Text className="text-textMain font-semibold">
                      Identifier
                    </Text>
                    <Text className="text-textMain/60 text-[12px]">
                      Use IMO when available. Otherwise use License.
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-3">
                    <Text className="text-textMain/70 text-[12px]">
                      Use License
                    </Text>
                    <Switch
                      value={noImo}
                      onValueChange={onToggleNoImo}
                      disabled={isBusy}
                    />
                  </View>
                </View>

                {!noImo ? (
                  <Field
                    label="IMO *"
                    placeholder="e.g. 1234567"
                    value={imo}
                    onChangeText={setImo}
                    keyboardType="numeric"
                  />
                ) : (
                  <Field
                    label="License Number *"
                    placeholder="e.g. LIC-PA-001"
                    value={licenseNumber}
                    onChangeText={setLicenseNumber}
                  />
                )}
              </View>

              <Field
                label="Flag (optional)"
                placeholder="e.g. PA"
                value={flag}
                onChangeText={setFlag}
              />

              {error ? <Text className="text-destructive">{error}</Text> : null}
            </View>
          </View>

          {/* Right */}
          <View className="flex-1 rounded-3xl border border-white/10 bg-surface p-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] web:lg:w-[40%]">
            <View className="mb-4">
              <Text className="text-textMain text-[18px] font-semibold">
                Preview
              </Text>
              <Text className="text-textMain/60 text-[13px]">
                Quick summary before saving.
              </Text>
            </View>

            <View className="rounded-3xl border border-white/10 bg-black/10 p-4 gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-textMain/70 text-[12px]">Name</Text>
                <Text className="text-textMain font-semibold">
                  {name.trim() || "—"}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-textMain/70 text-[12px]">Identifier</Text>
                <Text className="text-textMain font-semibold">
                  {!noImo
                    ? imo.trim()
                      ? `IMO ${imo.trim()}`
                      : "—"
                    : licenseNumber.trim()
                      ? `LIC ${licenseNumber.trim()}`
                      : "—"}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <Text className="text-textMain/70 text-[12px]">Flag</Text>
                <Text className="text-textMain font-semibold">
                  {flag.trim() || "—"}
                </Text>
              </View>
            </View>

            <View className="mt-4 rounded-3xl border border-white/10 bg-black/10 p-4">
              <Text className="text-textMain/60 text-[12px]">
                Tip: keep identifiers consistent to improve compliance workflows
                later.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
