import { Button, Text } from "@/src/components";
import { isIsoDateOnly } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

import { useCreateFuel } from "@/src/hooks";
import { FuelFormCard, FuelPreviewCard } from "../../components";
import { emptyFuelFormValues, FuelFormValues } from "../../contracts";
import { toCreateFuelInput } from "../../helpers/fuel.mappers";
import { isPositiveDecimal } from "../../helpers/fuel.validation";

export default function CreateFuelScreen() {
  const router = useRouter();

  const { projectId, assetId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
  }>();

  const pid = String(projectId);
  const vid = String(assetId); // fijo

  const { submit, loading, error } = useCreateFuel(pid, vid);

  const [values, setValues] = useState<FuelFormValues>(() => ({
    ...emptyFuelFormValues(),
    assetId: vid, // ok: string entra en string|null
  }));
  const [localError, setLocalError] = useState<string | null>(null);

  const listHref = `/projects/${pid}/vessels/${vid}/fuel`;

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (!values.date.trim() || !isIsoDateOnly(values.date)) return false;
    if (!isPositiveDecimal(values.quantity)) return false;
    return true;
  }, [loading, values.date, values.quantity]);

  function patch(p: Partial<FuelFormValues>) {
    setLocalError(null);
    setValues((prev) => ({ ...prev, ...p }));
  }

  function goBackOrTo(fallbackHref: string) {
    if (router.canGoBack?.()) {
      router.back();
      return;
    }
    router.replace(fallbackHref);
  }

  async function onCreate() {
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
      const input = toCreateFuelInput(values);
      await submit(input);
      router.replace(listHref);
    } catch {
      // error lo muestra el hook
    }
  }

  return (
    <View className="flex-1 bg-baseBg">
      <ScrollView
        contentContainerClassName="gap-5 p-4 web:p-6 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="gap-3">
          <Pressable
            onPress={() => goBackOrTo(listHref)}
            disabled={loading}
            className={[
              "self-start flex-row items-center gap-2",
              loading ? "opacity-50" : "web:hover:opacity-90",
            ].join(" ")}
          >
            <Ionicons name="chevron-back" size={16} className="text-accent" />
            <Text className="text-accent font-semibold">Back to Fuel</Text>
          </Pressable>

          <View className="web:flex-row web:items-start web:justify-between gap-4">
            <View className="gap-1 flex-1">
              <Text className="text-textMain text-[34px] web:text-[44px] font-semibold leading-[110%]">
                Add Fuel Log
              </Text>
              <Text className="text-muted text-[14px]">
                Create a fuel entry for this vessel.
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <Button
                variant="outline"
                size="lg"
                onPress={() => goBackOrTo(listHref)}
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

        {/* Content grid */}
        <View className="gap-5 web:lg:flex-row">
          {/* Left */}
          <View className="flex-1 gap-5 web:lg:w-[60%]">
            <FuelFormCard
              values={values}
              onChange={patch}
              localError={localError}
              apiError={error}
              disabled={loading}
              allowEditTypes={false}
            />
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
