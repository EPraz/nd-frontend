// app/projects/[projectId]/vessels/[assetId]/edit.tsx
import { Field, RowInfo, Text } from "@/src/components";
import { UpdateVesselProfileInput } from "@/src/features/vessels/contracts/vessel.contract";
import { useUpdateVesselProfile } from "@/src/features/vessels/hooks/useUpdateVesselProfile";
import { useVessel } from "@/src/features/vessels/hooks/useVessel"; // ya lo tienes (Asset)
import { useVesselProfile } from "@/src/features/vessels/hooks/useVesselProfile";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Switch, View } from "react-native";

type FormState = {
  name: string; // asset.name (si lo editas aquí, sería otro endpoint; si no, pon readonly)
  identifierType: "IMO" | "LICENSE";
  imo: string;
  licenseNumber: string;
  flag: string;

  callSign: string;
  mmsi: string;
  homePort: string;

  vesselType: string;
  classSociety: string;
  builder: string;
  yearBuilt: string;
};

function norm(v: string) {
  return v.trim();
}

export default function EditVesselScreen() {
  const router = useRouter();
  const { projectId, assetId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
  }>();
  const pid = String(projectId);
  const aid = String(assetId);

  const backHref = `/projects/${pid}/vessels/${aid}`;

  const { vessel, loading: vesselLoading } = useVessel(pid, aid);
  const {
    profile,
    loading: profileLoading,
    error,
    refresh,
  } = useVesselProfile(pid, aid);
  const {
    submit,
    loading: saving,
    error: saveError,
  } = useUpdateVesselProfile(pid, aid);

  const loading = vesselLoading || profileLoading;
  const isBusy = loading || saving;

  const initial = useMemo<FormState>(() => {
    const idType = (profile?.identifierType ?? "IMO") as "IMO" | "LICENSE";
    return {
      name: vessel?.name ?? "",
      identifierType: idType,
      imo: profile?.imo ?? "",
      licenseNumber: profile?.licenseNumber ?? "",
      flag: profile?.flag ?? "",

      callSign: profile?.callSign ?? "",
      mmsi: profile?.mmsi ?? "",
      homePort: profile?.homePort ?? "",

      vesselType: profile?.vesselType ?? "",
      classSociety: profile?.classSociety ?? "",
      builder: profile?.builder ?? "",
      yearBuilt: profile?.yearBuilt ? String(profile.yearBuilt) : "",
    };
  }, [vessel?.name, profile]);

  const [form, setForm] = useState<FormState>(initial);

  // Re-sincroniza cuando llega data (primera carga)
  useMemo(() => {
    setForm(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const useLicense = form.identifierType === "LICENSE";

  const dirty = useMemo(() => {
    const a = JSON.stringify(initial);
    const b = JSON.stringify(form);
    return a !== b;
  }, [initial, form]);

  const canSubmit = useMemo(() => {
    if (isBusy) return false;
    if (!dirty) return false;

    if (useLicense) return Boolean(norm(form.licenseNumber));
    return Boolean(norm(form.imo));
  }, [isBusy, dirty, useLicense, form.licenseNumber, form.imo]);

  function goBackOrTo(fallbackHref: string) {
    if (router.canGoBack?.()) return router.back();
    router.replace(fallbackHref);
  }

  function onToggleIdentifier(nextUseLicense: boolean) {
    setForm((p) => ({
      ...p,
      identifierType: nextUseLicense ? "LICENSE" : "IMO",
      imo: nextUseLicense ? "" : p.imo,
      licenseNumber: nextUseLicense ? p.licenseNumber : "",
    }));
  }

  async function onSave() {
    const input: UpdateVesselProfileInput = {
      identifierType: form.identifierType,
      imo: form.identifierType === "IMO" ? norm(form.imo) : undefined,
      licenseNumber:
        form.identifierType === "LICENSE"
          ? norm(form.licenseNumber)
          : undefined,
      flag: norm(form.flag) || undefined,

      callSign: norm(form.callSign) || undefined,
      mmsi: norm(form.mmsi) || undefined,
      homePort: norm(form.homePort) || undefined,

      vesselType: norm(form.vesselType) || undefined,
      classSociety: norm(form.classSociety) || undefined,
      builder: norm(form.builder) || undefined,
      yearBuilt: form.yearBuilt.trim() ? Number(form.yearBuilt) : undefined,
    };

    try {
      await submit(input);
      router.replace(backHref);
    } catch {
      // hook sets error
    }
  }

  function onReset() {
    setForm(initial);
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
              <Text className="text-textMain/80">Back to Vessel</Text>
            </Pressable>

            <Text className="text-textMain text-[34px] web:text-[44px] font-semibold leading-[110%]">
              Edit {vessel?.name}
            </Text>

            <Text className="text-textMain/60 text-[13px]">
              Update vessel profile and identifiers.
            </Text>
          </View>

          <View className="flex-row items-center justify-end gap-3">
            <Pressable
              onPress={refresh}
              disabled={isBusy}
              className={[
                "h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-surface",
                "shadow-[0_10px_40px_rgba(0,0,0,0.25)]",
                isBusy ? "opacity-50" : "hover:scale-105 active:opacity-80",
              ].join(" ")}
            >
              <Ionicons name="refresh" size={18} color="white" />
            </Pressable>

            <Pressable
              onPress={onReset}
              disabled={isBusy || !dirty}
              className={[
                "rounded-full border border-white/10 bg-surface px-6 py-3",
                "shadow-[0_10px_40px_rgba(0,0,0,0.25)]",
                isBusy || !dirty
                  ? "opacity-50"
                  : "hover:scale-105 active:opacity-80",
              ].join(" ")}
            >
              <Text className="text-textMain">Reset</Text>
            </Pressable>

            <Pressable
              onPress={onSave}
              disabled={!canSubmit}
              className={[
                "flex-row items-center gap-2 rounded-full px-6 py-3 bg-accent",
                "shadow-[0_10px_40px_rgba(0,0,0,0.25)]",
                !canSubmit ? "opacity-50" : "hover:scale-105 active:opacity-90",
              ].join(" ")}
            >
              <Ionicons name="save-outline" size={18} color="#27374D" />
              <Text className="text-baseBg font-bold">
                {saving ? "Saving..." : "Save Changes"}
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
                Core profile fields. (Asset name lives on Asset; profile lives
                on vessel-profile.)
              </Text>
            </View>

            <View className="gap-4">
              {/* Identifier */}
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
                      value={useLicense}
                      onValueChange={onToggleIdentifier}
                      disabled={isBusy}
                    />
                  </View>
                </View>

                {!useLicense ? (
                  <Field
                    label="IMO *"
                    placeholder="e.g. 1234567"
                    value={form.imo}
                    onChangeText={(v) => setForm((p) => ({ ...p, imo: v }))}
                    keyboardType="numeric"
                  />
                ) : (
                  <Field
                    label="License Number *"
                    placeholder="e.g. LIC-PA-001"
                    value={form.licenseNumber}
                    onChangeText={(v) =>
                      setForm((p) => ({ ...p, licenseNumber: v }))
                    }
                  />
                )}

                <Field
                  label="Flag"
                  placeholder="e.g. PA"
                  value={form.flag}
                  onChangeText={(v) => setForm((p) => ({ ...p, flag: v }))}
                />
              </View>

              {/* Operations */}
              <View className="rounded-3xl border border-white/10 bg-black/10 p-4 gap-4">
                <Text className="text-textMain font-semibold">Operational</Text>

                <View className="web:flex-row gap-4">
                  <View className="flex-1">
                    <Field
                      label="Call Sign"
                      placeholder="e.g. HPXY"
                      value={form.callSign}
                      onChangeText={(v) =>
                        setForm((p) => ({ ...p, callSign: v }))
                      }
                    />
                  </View>
                  <View className="flex-1">
                    <Field
                      label="MMSI"
                      placeholder="e.g. 123456789"
                      value={form.mmsi}
                      onChangeText={(v) => setForm((p) => ({ ...p, mmsi: v }))}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <Field
                  label="Home Port"
                  placeholder="e.g. Balboa"
                  value={form.homePort}
                  onChangeText={(v) => setForm((p) => ({ ...p, homePort: v }))}
                />
              </View>

              {/* Technical */}
              <View className="rounded-3xl border border-white/10 bg-black/10 p-4 gap-4">
                <Text className="text-textMain font-semibold">Technical</Text>

                <View className="web:flex-row gap-4">
                  <View className="flex-1">
                    <Field
                      label="Vessel Type"
                      placeholder="e.g. Bulk Carrier"
                      value={form.vesselType}
                      onChangeText={(v) =>
                        setForm((p) => ({ ...p, vesselType: v }))
                      }
                    />
                  </View>
                  <View className="flex-1">
                    <Field
                      label="Class Society"
                      placeholder="e.g. ABS"
                      value={form.classSociety}
                      onChangeText={(v) =>
                        setForm((p) => ({ ...p, classSociety: v }))
                      }
                    />
                  </View>
                </View>

                <View className="web:flex-row gap-4">
                  <View className="flex-1">
                    <Field
                      label="Builder"
                      placeholder="e.g. Hyundai"
                      value={form.builder}
                      onChangeText={(v) =>
                        setForm((p) => ({ ...p, builder: v }))
                      }
                    />
                  </View>
                  <View className="flex-1">
                    <Field
                      label="Year Built"
                      placeholder="e.g. 2009"
                      value={form.yearBuilt}
                      onChangeText={(v) =>
                        setForm((p) => ({ ...p, yearBuilt: v }))
                      }
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {error ? <Text className="text-destructive">{error}</Text> : null}
              {saveError ? (
                <Text className="text-destructive">{saveError}</Text>
              ) : null}
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
              <RowInfo label="Asset" value={vessel?.name ?? "—"} />
              <RowInfo
                label="Identifier"
                value={
                  form.identifierType === "IMO"
                    ? norm(form.imo)
                      ? `IMO ${norm(form.imo)}`
                      : "—"
                    : norm(form.licenseNumber)
                      ? `LIC ${norm(form.licenseNumber)}`
                      : "—"
                }
              />
              <RowInfo label="Flag" value={norm(form.flag) || "—"} />
              <RowInfo label="Call Sign" value={norm(form.callSign) || "—"} />
              <RowInfo label="MMSI" value={norm(form.mmsi) || "—"} />
              <RowInfo label="Home Port" value={norm(form.homePort) || "—"} />
              <RowInfo label="Type" value={norm(form.vesselType) || "—"} />
              <RowInfo label="Class" value={norm(form.classSociety) || "—"} />
              <RowInfo
                label="Year Built"
                value={form.yearBuilt.trim() || "—"}
              />
            </View>

            <View className="mt-4 rounded-3xl border border-white/10 bg-black/10 p-4">
              <Text className="text-textMain/60 text-[12px]">
                Tip: Identifiers consistent → mejores flujos de compliance y
                certificados.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
