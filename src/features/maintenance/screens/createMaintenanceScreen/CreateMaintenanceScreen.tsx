import { Button, Text } from "@/src/components";
import { useVessels } from "@/src/features/vessels";
import { isIsoDateOnly } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { MaintenanceFormCard, MaintenancePreviewCard } from "../../components";
import {
  emptyMaintenanceFormValues,
  toCreateMaintenanceInput,
} from "../../helpers";
import { useCreateMaintenance } from "../../hooks";

export default function CreateMaintenanceScreen() {
  const router = useRouter();
  const { projectId, assetId } = useLocalSearchParams<{
    projectId: string;
    assetId?: string;
  }>();

  const pid = String(projectId);
  const fixedAssetId = assetId ? String(assetId) : null;

  const { submit, loading, error } = useCreateMaintenance(
    pid,
    fixedAssetId ?? "",
  );

  const {
    vessels,
    loading: vesselsLoading,
    error: vesselsError,
  } = useVessels(pid);

  const [values, setValues] = useState(() => emptyMaintenanceFormValues());
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!fixedAssetId) return;
    setValues((prev) =>
      prev.assetId === fixedAssetId ? prev : { ...prev, assetId: fixedAssetId },
    );
  }, [fixedAssetId]);

  const effectiveAssetId = values.assetId ?? values.selectedVessel?.id ?? null;

  const listHref = effectiveAssetId
    ? `/projects/${pid}/vessels/${effectiveAssetId}/maintenance`
    : `/projects/${pid}/maintenance`;

  const createVesselHref = `/projects/${pid}/vessels/new`;

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (!effectiveAssetId) return false;
    if (values.title.trim().length < 2) return false;
    return true;
  }, [loading, effectiveAssetId, values.title]);

  function patch(p: Partial<typeof values>) {
    setLocalError(null);
    setValues((prev) => ({ ...prev, ...p }));
  }

  async function onCreate() {
    setLocalError(null);

    if (!effectiveAssetId) return setLocalError("Selecciona un vessel.");
    if (values.title.trim().length < 2)
      return setLocalError("Title es requerido.");
    if (values.dueDate.trim() && !isIsoDateOnly(values.dueDate)) {
      return setLocalError("Due date inválido. Usa formato YYYY-MM-DD.");
    }

    try {
      const input = toCreateMaintenanceInput({
        values,
        assetId: effectiveAssetId,
        allowDefaults: true,
      });

      await submit(input);
      router.replace(listHref);
    } catch {
      // error lo maneja el hook
    }
  }

  return (
    <View className="flex-1 bg-baseBg">
      <ScrollView
        contentContainerClassName="gap-5 p-4 web:p-6 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-3">
          <Pressable
            onPress={() => router.replace(listHref)}
            disabled={loading}
            className={[
              "self-start flex-row items-center gap-2",
              loading ? "opacity-50" : "web:hover:opacity-90",
            ].join(" ")}
          >
            <Ionicons name="chevron-back" size={16} className="text-accent" />
            <Text className="text-accent font-semibold">
              Back to Maintenance
            </Text>
          </Pressable>

          <View className="web:flex-row web:items-start web:justify-between gap-4">
            <View className="gap-1 flex-1">
              <Text className="text-textMain text-[34px] web:text-[44px] font-semibold leading-[110%]">
                Add Maintenance Task
              </Text>
              <Text className="text-muted text-[14px]">
                Create a maintenance task and assign it to a vessel.
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <Button
                variant="outline"
                size="lg"
                onPress={() => router.replace(listHref)}
                disabled={loading}
                className="rounded-full"
              >
                Cancel
              </Button>

              <Button
                variant="default"
                size="lg"
                onPress={onCreate}
                disabled={!canSubmit}
                className="rounded-full"
                rightIcon={
                  loading ? (
                    <ActivityIndicator />
                  ) : (
                    <Ionicons
                      name="save-outline"
                      size={16}
                      className="text-textMain"
                    />
                  )
                }
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </View>
          </View>
        </View>

        <View className="gap-5 web:lg:flex-row">
          <View className="flex-1 gap-5 web:lg:w-[60%]">
            <MaintenanceFormCard
              fixedAssetId={fixedAssetId}
              currentVessel={
                fixedAssetId
                  ? (vessels.find((v) => v.id === fixedAssetId) ?? null)
                  : null
              }
              vessels={vessels}
              vesselsLoading={vesselsLoading}
              vesselsError={vesselsError}
              onCreateVessel={() => router.push(createVesselHref)}
              values={{ ...values, assetId: fixedAssetId ?? values.assetId }}
              onChange={patch}
              localError={localError}
              apiError={error}
              disabled={loading}
              allowEditStatusPriority={false}
            />
          </View>

          <View className="flex-1 gap-5 web:lg:w-[40%]">
            <MaintenancePreviewCard values={values} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
