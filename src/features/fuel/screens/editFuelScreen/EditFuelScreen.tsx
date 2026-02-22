import { Button, ErrorState, Loading, Text } from "@/src/components";
import { useToast } from "@/src/context";
import { isIsoDateOnly } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { FuelFormCard, FuelPreviewCard } from "../../components";
import { emptyFuelFormValues, FuelFormValues } from "../../contracts";
import {
  fuelDisplayTitle,
  fuelFormFromDto,
  isPositiveDecimal,
  toUpdateFuelInput,
} from "../../helpers";
import { useFuelById, useUpdateFuel } from "../../hooks";

export default function EditFuelScreen() {
  const router = useRouter();
  const { show } = useToast();

  const { projectId, assetId, fuelId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
    fuelId: string;
  }>();

  const pid = String(projectId);
  const vid = String(assetId); // fijo
  const fid = String(fuelId);

  const { fuel, loading, error, refresh } = useFuelById(pid, vid, fid);

  const {
    submit,
    loading: saving,
    error: saveError,
  } = useUpdateFuel(pid, vid, fid);

  const [values, setValues] = useState<FuelFormValues>(() => ({
    ...emptyFuelFormValues(),
    assetId: vid,
  }));
  const [dirty, setDirty] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // hydrate form cuando llega fuel
  useEffect(() => {
    if (!fuel) return;
    if (dirty) return;

    setValues((prev) => ({
      ...prev,
      ...fuelFormFromDto(fuel),
      assetId: vid, // fijo por ruta
    }));
  }, [fuel, dirty, vid]);

  const viewHref = `/projects/${pid}/vessels/${vid}/fuel/${fid}`;
  const listHref = `/projects/${pid}/vessels/${vid}/fuel`;

  const canSubmit = useMemo(() => {
    if (saving) return false;
    if (!dirty) return false;
    if (!values.date.trim() || !isIsoDateOnly(values.date)) return false;
    if (!isPositiveDecimal(values.quantity)) return false;
    return true;
  }, [saving, dirty, values.date, values.quantity]);

  function patch(p: Partial<FuelFormValues>) {
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

    if (!values.date.trim() || !isIsoDateOnly(values.date)) {
      setLocalError("Date inválido. Usa formato YYYY-MM-DD.");
      return;
    }
    if (!isPositiveDecimal(values.quantity)) {
      setLocalError(
        "Quantity inválido. Usa un número positivo (ej: 1200 o 1200.5).",
      );
      return;
    }

    try {
      const input = toUpdateFuelInput(values);
      await submit(input);
      show("Fuel log updated successfully", "success");
      router.replace(viewHref);
    } catch {
      show("Failed to update fuel log", "error");
    }
  }

  if (loading) return <Loading fullScreen />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!fuel)
    return <ErrorState message="Fuel log not found." onRetry={refresh} />;

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
                Edit Fuel Log - {fuelDisplayTitle(fuel)}
              </Text>
              <Text className="text-muted text-[14px]">
                Update fuel entry details for this vessel.
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
            <FuelFormCard
              values={values}
              onChange={patch}
              localError={localError}
              apiError={saveError}
              disabled={saving}
              allowEditTypes={true}
            />

            {/* quick link */}
            <Pressable
              onPress={() => router.replace(listHref)}
              className="self-start"
            >
              <Text className="text-accent font-semibold">
                Go to fuel list →
              </Text>
            </Pressable>
          </View>

          {/* Right */}
          <View className="flex-1 gap-5 web:lg:w-[40%]">
            <FuelPreviewCard values={values} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
