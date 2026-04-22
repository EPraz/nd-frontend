import {
  Card,
  CardContent,
  CardHeaderRow,
  CardTitle,
} from "@/src/components/ui/card/Card";
import { DateField } from "@/src/components/ui/forms/DateField";
import { EmptyVesselsState } from "@/src/components/ui/forms/EmptyVesselsState";
import { Field } from "@/src/components/ui/forms/Field";
import { SearchableVesselSelect } from "@/src/components/ui/forms/SearchableVesselSelect";
import { VesselPill } from "@/src/components/ui/forms/VesselPill";
import { Text } from "@/src/components/ui/text/Text";
import type { AssetDto } from "@/src/contracts/assets.contract";
import type { CertificateTypeDto } from "@/src/features/certificates/shared";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { CertificateFormValues } from "@/src/features/certificates/shared";
import { CertificateTypePicker } from "./CertificateTypePicker";

type Props = {
  fixedAssetId?: string | null;
  currentVessel?: AssetDto | null;
  vessels: AssetDto[];
  vesselsLoading: boolean;
  vesselsError: string | null;
  onCreateVessel: () => void;
  certificateTypes: CertificateTypeDto[];
  certificateTypesLoading: boolean;
  certificateTypesError: string | null;
  values: CertificateFormValues;
  onChange: (patch: Partial<CertificateFormValues>) => void;
  localError?: string | null;
  apiError?: string | null;
  disabled?: boolean;
  showFilesNextHint?: boolean;
};

export default function CertificateFormCard({
  fixedAssetId,
  currentVessel,
  vessels,
  vesselsLoading,
  vesselsError,
  onCreateVessel,
  certificateTypes,
  certificateTypesLoading,
  certificateTypesError,
  values,
  onChange,
  localError,
  apiError,
  disabled = false,
  showFilesNextHint = true,
}: Props) {
  return (
    <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
      <CardHeaderRow>
        <View className="gap-1">
          <CardTitle className="text-[16px] text-textMain">
            Certificate Record
          </CardTitle>
          <Text className="text-muted text-[13px]">
            Pick the vessel and type first, then fill in the validity details.
          </Text>
        </View>
      </CardHeaderRow>

      <CardContent className="px-6">
        <View className="gap-5">
          <View className="rounded-[20px] border border-shellLine bg-shellPanelSoft p-4 gap-4">
            <View className="gap-1">
              <Text className="text-textMain font-semibold text-[14px]">
                1. Assign the record
              </Text>
              <Text className="text-muted text-[12px] leading-[18px]">
                Choose the vessel and the certificate type first. The selected
                type is what connects this record to compliance requirements.
              </Text>
            </View>

            {fixedAssetId ? (
              currentVessel ? (
                <VesselPill vessel={currentVessel} />
              ) : (
                <Text className="text-muted text-[12px]">
                  Loading vessel...
                </Text>
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
                    onChange={(vessel) =>
                      onChange({
                        selectedVessel: vessel,
                        assetId: vessel?.id ?? null,
                      })
                    }
                    disabled={vesselsLoading || disabled}
                  />
                )}

                {vesselsLoading ? (
                  <Text className="text-muted text-[12px]">
                    Loading vessels...
                  </Text>
                ) : null}
              </View>
            )}

            <CertificateTypePicker
              certificateTypes={certificateTypes}
              certificateTypesLoading={certificateTypesLoading}
              certificateTypesError={certificateTypesError}
              values={values}
              onChange={onChange}
              disabled={disabled}
            />
          </View>

          <View className="rounded-[20px] border border-shellLine bg-shellPanelSoft p-4 gap-4">
            <View className="gap-1">
              <Text className="text-textMain font-semibold text-[14px]">
                2. Add validity details
              </Text>
              <Text className="text-muted text-[12px] leading-[18px]">
                Add the certificate number, issuer, and dates. Notes are
                optional.
              </Text>
            </View>

            <View className="gap-4 web:flex-row">
              <View className="flex-1">
                <Field
                  label="Number"
                  placeholder="e.g. CERT-12345"
                  value={values.number}
                  onChangeText={(value) => onChange({ number: value })}
                />
              </View>
              <View className="flex-1">
                <Field
                  label="Issuer"
                  placeholder="e.g. Class Society / Flag"
                  value={values.issuer}
                  onChangeText={(value) => onChange({ issuer: value })}
                />
              </View>
            </View>

            <View className="gap-4 web:flex-row">
              <View className="flex-1">
                <DateField
                  label="Issue Date"
                  placeholder="Select issue date"
                  value={values.issueDate}
                  onChange={(value) => onChange({ issueDate: value })}
                />
              </View>
              <View className="flex-1">
                <DateField
                  label="Expiry Date"
                  placeholder="Select expiry date"
                  value={values.expiryDate}
                  onChange={(value) => onChange({ expiryDate: value })}
                />
              </View>
            </View>

            <Field
              label="Notes"
              placeholder="Optional operational notes"
              value={values.notes}
              onChangeText={(value) => onChange({ notes: value })}
            />
          </View>

          {showFilesNextHint ? (
            <View className="rounded-[20px] border border-dashed border-shellLine bg-shellGlass p-4 gap-2">
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name="cloud-upload-outline"
                  size={16}
                  className="text-textMain"
                />
                <Text className="text-textMain font-semibold text-[13px]">
                  Manual-entry reminder
                </Text>
              </View>
              <Text className="text-muted text-[12px] leading-[18px]">
                This fallback flow creates the certificate record without a
                document upload. Use the requirement upload flow whenever
                possible.
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


