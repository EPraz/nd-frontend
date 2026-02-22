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
import { CertificateFormValues } from "../../contracts";

type Props = {
  // vessel
  fixedAssetId?: string | null;
  currentVessel?: AssetDto | null;

  vessels: AssetDto[];
  vesselsLoading: boolean;
  vesselsError: string | null;
  onCreateVessel: () => void;

  // form
  values: CertificateFormValues;
  onChange: (patch: Partial<CertificateFormValues>) => void;

  // errors
  localError?: string | null;
  apiError?: string | null;

  disabled?: boolean;
};

export default function CertificateFormCard({
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
  return (
    <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
      <CardHeaderRow>
        <View className="gap-1">
          <CardTitle className="text-[16px] text-textMain">
            Certificate Details
          </CardTitle>
          <Text className="text-muted text-[13px]">
            Base information for the certificate.
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
            label="Certificate Name *"
            placeholder="e.g. International Tonnage Certificate"
            value={values.name}
            onChangeText={(v) => onChange({ name: v })}
          />

          <View className="gap-4 web:flex-row">
            <View className="flex-1">
              <Field
                label="Number"
                placeholder="e.g. CERT-12345"
                value={values.number}
                onChangeText={(v) => onChange({ number: v })}
              />
            </View>
            <View className="flex-1">
              <Field
                label="Issuer"
                placeholder="e.g. Class Society / Flag"
                value={values.issuer}
                onChangeText={(v) => onChange({ issuer: v })}
              />
            </View>
          </View>

          <View className="gap-4 web:flex-row">
            <View className="flex-1">
              <Field
                label="Issue Date (YYYY-MM-DD)"
                placeholder="e.g. 2026-01-31"
                value={values.issueDate}
                onChangeText={(v) => onChange({ issueDate: v })}
              />
            </View>
            <View className="flex-1">
              <Field
                label="Expiry Date (YYYY-MM-DD)"
                placeholder="e.g. 2027-01-31"
                value={values.expiryDate}
                onChangeText={(v) => onChange({ expiryDate: v })}
              />
            </View>
          </View>

          {/* File placeholder */}
          <View className="rounded-[18px] border border-border bg-baseBg/35 p-4 gap-2">
            <Text className="text-textMain font-semibold">
              Certificate File
            </Text>
            <Text className="text-muted text-[12px] leading-[16px]">
              Upload and manage certificate files (PDF/JPG/PNG) in a future
              update.
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
