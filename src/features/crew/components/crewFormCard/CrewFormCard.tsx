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
import { Pressable, Switch, View } from "react-native";
import { CrewFormValues } from "../crewFormTypes";

type Props = {
  // vessel
  fixedAssetId?: string | null;
  currentVessel?: AssetDto | null;

  vessels: AssetDto[];
  vesselsLoading: boolean;
  vesselsError: string | null;
  onCreateVessel: () => void;

  // form
  values: CrewFormValues;
  onChange: (patch: Partial<CrewFormValues>) => void;

  // errors
  localError?: string | null;
  apiError?: string | null;

  disabled?: boolean;
};

export default function CrewFormCard({
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
}: Props) {
  const isActive = values.status === "ACTIVE";

  return (
    <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
      <CardHeaderRow>
        <View className="gap-1">
          <CardTitle className="text-[16px] text-textMain">
            Crew Details
          </CardTitle>
          <Text className="text-muted text-[13px]">
            Base information for the crew member.
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
            label="Full Name *"
            placeholder="e.g. Juan Pérez"
            value={values.fullName}
            onChangeText={(v) => onChange({ fullName: v })}
          />

          <View className="gap-4 web:flex-row">
            <View className="flex-1">
              <Field
                label="Rank"
                placeholder="e.g. Master / Chief Engineer"
                value={values.rank}
                onChangeText={(v) => onChange({ rank: v })}
              />
            </View>
            <View className="flex-1">
              <Field
                label="Nationality"
                placeholder="e.g. PA"
                value={values.nationality}
                onChangeText={(v) => onChange({ nationality: v })}
              />
            </View>
          </View>

          <Field
            label="Primary Document ID (optional)"
            placeholder="e.g. Passport / Seaman Book"
            value={values.documentId}
            onChangeText={(v) => onChange({ documentId: v })}
          />

          {/* Status */}
          <View className="rounded-[18px] border border-border bg-baseBg/35 p-4 flex-row items-center justify-between">
            <View className="gap-1">
              <Text className="text-textMain font-semibold">Status</Text>
              <Text className="text-muted text-[12px]">
                INACTIVE members should not count toward manning.
              </Text>
            </View>

            <View className="flex-row items-center gap-3">
              <Text className="text-muted text-[12px]">
                {isActive ? "ACTIVE" : "INACTIVE"}
              </Text>
              <Switch
                value={isActive}
                onValueChange={(v) =>
                  onChange({ status: v ? "ACTIVE" : "INACTIVE" })
                }
                disabled={disabled}
              />
            </View>
          </View>

          {/* Documents UI (MVP placeholder) */}
          <View className="rounded-[18px] border border-border bg-baseBg/35 p-4 gap-2">
            <Text className="text-textMain font-semibold">Documents</Text>
            <Text className="text-muted text-[12px] leading-[16px]">
              Upload and manage crew documents (passport, seaman book) in a
              future update.
            </Text>

            <Pressable
              disabled
              className="mt-1 flex-row items-center gap-2 rounded-full border border-border bg-baseBg/35 px-4 py-2 opacity-50"
            >
              <Ionicons
                name="cloud-upload-outline"
                size={16}
                className="text-textMain"
              />
              <Text className="text-textMain font-semibold">Upload (soon)</Text>
            </Pressable>
          </View>

          {/* Errors */}
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
