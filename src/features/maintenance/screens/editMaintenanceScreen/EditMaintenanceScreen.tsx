import { Button, ErrorState, Loading, Text } from "@/src/components";
import { useToast } from "@/src/context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { AssetDto } from "@/src/contracts/assets.contract";
import { useVessels } from "@/src/features/vessels";
import { isIsoDateOnly } from "@/src/helpers";
import { MaintenanceFormCard, MaintenancePreviewCard } from "../../components";
import {
  emptyMaintenanceFormValues,
  maintenanceFormFromDto,
  toUpdateMaintenanceInput,
} from "../../helpers";
import { useMaintenanceById, useUpdateMaintenance } from "../../hooks";

export default function EditMaintenanceScreen() {
  const router = useRouter();
  const { show } = useToast();

  const { projectId, assetId, maintenanceId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
    maintenanceId: string;
  }>();

  const pid = String(projectId);
  const vid = String(assetId); // fixed vessel
  const mid = String(maintenanceId);

  // fetch task
  const { maintenance, loading, error, refresh } = useMaintenanceById(
    pid,
    vid,
    mid,
  );

  // save
  const {
    submit,
    loading: saving,
    error: saveError,
  } = useUpdateMaintenance(pid, vid, mid);

  // vessels list solo para renderizar currentVessel pill
  const {
    vessels,
    loading: vesselsLoading,
    error: vesselsError,
  } = useVessels(pid);

  const [values, setValues] = useState(() => emptyMaintenanceFormValues());
  const [dirty, setDirty] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // hydrate form cuando llega maintenance (solo si no dirty)
  useEffect(() => {
    if (!maintenance) return;
    if (dirty) return;

    setValues((prev) => ({
      ...prev,
      ...maintenanceFormFromDto(maintenance),
      // assetId fijo al vessel de la ruta (no movible)
      assetId: vid,
      // selectedVessel se resuelve con la lista (si ya llegó)
      selectedVessel: vessels.find((v) => v.id === vid) ?? null,
    }));
  }, [maintenance, dirty, vessels, vid]);

  const effectiveAssetId = vid; // fijo

  const currentVessel = useMemo<AssetDto | null>(() => {
    return vessels.find((v) => v.id === effectiveAssetId) ?? null;
  }, [vessels, effectiveAssetId]);

  const viewHref = `/projects/${pid}/vessels/${effectiveAssetId}/maintenance/${mid}`;
  const listHref = `/projects/${pid}/vessels/${effectiveAssetId}/maintenance`;

  const canSubmit = useMemo(() => {
    if (saving) return false;
    if (values.title.trim().length < 2) return false;
    if (!dirty) return false;
    return true;
  }, [saving, values.title, dirty]);

  function patch(p: Partial<typeof values>) {
    setLocalError(null);
    setDirty(true);
    setValues((prev) => ({ ...prev, ...p }));
  }

  function goBackOrTo(fallbackHref: string) {
    try {
      router.back();
    } catch {
      router.replace(fallbackHref);
    }
  }

  async function onSave() {
    setLocalError(null);

    if (values.title.trim().length < 2) {
      setLocalError("Title es requerido.");
      return;
    }
    if (values.dueDate.trim() && !isIsoDateOnly(values.dueDate)) {
      setLocalError("Due date inválido. Usa formato YYYY-MM-DD.");
      return;
    }

    try {
      const input = toUpdateMaintenanceInput({
        values: { ...values, assetId: effectiveAssetId },
        assetId: effectiveAssetId,
        allowMoveVessel: false, // 🔒 no movible
      });

      await submit(input);
      show("Maintenance updated successfully", "success");
      router.replace(viewHref);
    } catch {
      show("Failed to update maintenance", "error");
    }
  }

  if (loading) return <Loading fullScreen />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!maintenance)
    return <ErrorState message="Maintenance not found." onRetry={refresh} />;

  return (
    <View className="flex-1 bg-baseBg">
      <ScrollView
        contentContainerClassName="gap-5 p-4 web:p-6 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
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
            <Text className="text-accent font-semibold">Back</Text>
          </Pressable>

          <View className="web:flex-row web:items-start web:justify-between gap-4">
            <View className="gap-1 flex-1">
              <Text className="text-textMain text-[34px] web:text-[44px] font-semibold leading-[110%]">
                Edit Maintenance
              </Text>
              <Text className="text-muted text-[14px]">
                Update maintenance details (vessel is fixed).
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

        {/* Content grid */}
        <View className="gap-5 web:lg:flex-row">
          {/* Left */}
          <View className="flex-1 gap-5 web:lg:w-[60%]">
            <MaintenanceFormCard
              fixedAssetId={effectiveAssetId} // 🔒 fuerza pill
              currentVessel={currentVessel}
              vessels={vessels} // no se usan para select, pero Props lo requieren
              vesselsLoading={vesselsLoading}
              vesselsError={vesselsError}
              onCreateVessel={() => router.push(`/projects/${pid}/vessels/new`)}
              values={{
                ...values,
                assetId: effectiveAssetId, // consistencia
              }}
              onChange={patch}
              localError={localError}
              apiError={saveError}
              disabled={saving}
              allowEditStatusPriority // en edit sí
            />

            {/* quick link */}
            <Pressable
              onPress={() => router.replace(listHref)}
              className="self-start"
            >
              <Text className="text-accent font-semibold">
                Go to vessel maintenance list →
              </Text>
            </Pressable>
          </View>

          {/* Right */}
          <View className="flex-1 gap-5 web:lg:w-[40%]">
            <MaintenancePreviewCard values={values} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
