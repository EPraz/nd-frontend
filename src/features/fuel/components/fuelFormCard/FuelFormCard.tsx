import {
  Card,
  CardContent,
  CardHeaderRow,
  CardTitle,
  Field,
  Text,
} from "@/src/components";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { FuelFormValues } from "../../contracts";

type Props = {
  values: FuelFormValues;
  onChange: (patch: Partial<FuelFormValues>) => void;

  localError?: string | null;
  apiError?: string | null;

  disabled?: boolean;
  allowEditTypes?: boolean; // create: false, edit: true (si quieres)
};

export default function FuelFormCard({
  values,
  onChange,
  localError,
  apiError,
  disabled = false,
  allowEditTypes = false,
}: Props) {
  return (
    <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
      <CardHeaderRow>
        <View className="gap-1">
          <CardTitle className="text-[16px] text-textMain">Fuel Log</CardTitle>
          <Text className="text-muted text-[13px]">
            Register bunker/consumption and operational fuel events.
          </Text>
        </View>
      </CardHeaderRow>

      <CardContent className="px-6">
        <View className="gap-4">
          <View className="gap-4 web:flex-row">
            <View className="flex-1">
              <Field
                label="Date (YYYY-MM-DD) *"
                placeholder="e.g. 2026-02-20"
                value={values.date}
                onChangeText={(v) => onChange({ date: v })}
              />
            </View>

            <View className="flex-1">
              <Field
                label="Quantity *"
                placeholder="e.g. 1200.5"
                value={values.quantity}
                onChangeText={(v) => onChange({ quantity: v })}
              />
            </View>
          </View>

          {/* Unit pills */}
          <View className="gap-2">
            <Text className="text-muted text-[13px]">Unit</Text>
            <View className="flex-row gap-2">
              {(["L", "MT"] as const).map((u) => {
                const active = values.unit === u;
                return (
                  <Pressable
                    key={u}
                    disabled={disabled}
                    onPress={() => onChange({ unit: u })}
                    className={[
                      "flex-row items-center gap-2 rounded-full border px-4 py-2",
                      active
                        ? "bg-accent/90 border-accent/40"
                        : "bg-textMain/35 border-textMain/40",
                      disabled ? "opacity-60" : "web:hover:opacity-90",
                    ].join(" ")}
                  >
                    <Ionicons
                      name={u === "L" ? "water-outline" : "cube-outline"}
                      size={16}
                      className={active ? "text-accent" : "text-textMain"}
                    />
                    <Text
                      className={
                        active
                          ? "text-accent font-semibold"
                          : "text-textMain font-semibold"
                      }
                    >
                      {u}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Field
            label="Note"
            placeholder="Optional note…"
            value={values.note}
            onChangeText={(v) => onChange({ note: v })}
            multiline
          />

          {/* Future: price/currency/location */}
          <View className="gap-4 web:flex-row">
            <View className="flex-1">
              <Field
                label="Price (optional)"
                placeholder="e.g. 650.00"
                value={values.price}
                onChangeText={(v) => onChange({ price: v })}
              />
            </View>
            <View className="flex-1">
              <Field
                label="Currency (optional)"
                placeholder="e.g. USD"
                value={values.currency}
                onChangeText={(v) => onChange({ currency: v })}
              />
            </View>
          </View>

          <Field
            label="Location (optional)"
            placeholder="e.g. Balboa, Panama"
            value={values.location}
            onChangeText={(v) => onChange({ location: v })}
          />

          {allowEditTypes ? (
            <View className="rounded-[18px] border border-border bg-baseBg/35 p-4 gap-2">
              <Text className="text-textMain font-semibold">Types (Edit)</Text>
              <Text className="text-muted text-[12px]">
                Wire up selects for eventType/fuelType later (MVP).
              </Text>
            </View>
          ) : null}

          {localError ? (
            <Text className="text-destructive">{localError}</Text>
          ) : null}
          {apiError ? (
            <Text className="text-destructive">{apiError}</Text>
          ) : null}
        </View>
      </CardContent>
    </Card>
  );
}
