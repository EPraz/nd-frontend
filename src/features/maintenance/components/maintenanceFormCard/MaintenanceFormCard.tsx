import {
  Card,
  CardContent,
  CardHeaderRow,
  CardTitle,
  EmptyVesselsState,
  Field,
  SearchableVesselSelect,
  Text,
  VesselPill,
} from "@/src/components";
import type { AssetDto } from "@/src/contracts/assets.contract";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { MaintenanceFormValues } from "../../helpers";

type Props = {
  fixedAssetId?: string | null;
  currentVessel?: AssetDto | null;

  vessels: AssetDto[];
  vesselsLoading: boolean;
  vesselsError: string | null;
  onCreateVessel: () => void;

  values: MaintenanceFormValues;
  onChange: (patch: Partial<MaintenanceFormValues>) => void;

  localError?: string | null;
  apiError?: string | null;

  disabled?: boolean;
  allowEditStatusPriority?: boolean; // create: false, edit: true
};

export default function MaintenanceFormCard({
  fixedAssetId,
  currentVessel,
  vessels,
  vesselsLoading,
  vesselsError,
  onCreateVessel,
  values,
  onChange,
  localError,
  apiError,
  disabled = false,
  allowEditStatusPriority = false,
}: Props) {
  return (
    <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
      <CardHeaderRow>
        <View className="gap-1">
          <CardTitle className="text-[16px] text-textMain">
            Maintenance Details
          </CardTitle>
          <Text className="text-muted text-[13px]">
            Base information for the maintenance task.
          </Text>
        </View>
      </CardHeaderRow>

      <CardContent className="px-6">
        <View className="gap-4">
          {/* Vessel picker */}
          {fixedAssetId ? (
            currentVessel ? (
              <VesselPill vessel={currentVessel} />
            ) : (
              <Text className="text-muted text-[12px]">Loading vessel…</Text>
            )
          ) : (
            <View className="gap-2">
              {vesselsError ? (
                <Text className="text-destructive">{vesselsError}</Text>
              ) : null}

              {!vesselsLoading && !vesselsError && vessels.length === 0 ? (
                <EmptyVesselsState onCreateVessel={onCreateVessel} />
              ) : (
                <SearchableVesselSelect
                  vessels={vessels}
                  value={values.selectedVessel}
                  onChange={(v) =>
                    onChange({ selectedVessel: v, assetId: v?.id ?? null })
                  }
                  disabled={vesselsLoading || disabled}
                />
              )}

              {vesselsLoading ? (
                <Text className="text-muted text-[12px]">Loading vessels…</Text>
              ) : null}
            </View>
          )}

          <Field
            label="Title *"
            placeholder="e.g. Engine oil change"
            value={values.title}
            onChangeText={(v) => onChange({ title: v })}
          />

          <Field
            label="Description"
            placeholder="Optional details…"
            value={values.description}
            onChangeText={(v) => onChange({ description: v })}
            multiline
          />

          <Field
            label="Due Date (YYYY-MM-DD)"
            placeholder="e.g. 2026-02-28"
            value={values.dueDate}
            onChangeText={(v) => onChange({ dueDate: v })}
          />

          {/* (Opcional) status/priority en edit */}
          {allowEditStatusPriority ? (
            <View className="rounded-[18px] border border-border bg-baseBg/35 p-4 gap-2">
              <Text className="text-textMain font-semibold">
                Status & Priority
              </Text>
              <Text className="text-muted text-[12px] leading-[16px]">
                Editable only in edit mode.
              </Text>

              {/* placeholders: conecta a tus selects/pickers */}
              <View className="flex-row gap-2">
                <Pressable
                  disabled={disabled}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-full border border-border bg-baseBg/35 px-4 py-2"
                >
                  <Ionicons
                    name="flag-outline"
                    size={16}
                    className="text-textMain"
                  />
                  <Text className="text-textMain font-semibold">
                    {values.priority}
                  </Text>
                </Pressable>

                <Pressable
                  disabled={disabled}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-full border border-border bg-baseBg/35 px-4 py-2"
                >
                  <Ionicons
                    name="pulse-outline"
                    size={16}
                    className="text-textMain"
                  />
                  <Text className="text-textMain font-semibold">
                    {values.status}
                  </Text>
                </Pressable>
              </View>
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
