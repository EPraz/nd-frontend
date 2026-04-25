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
import {
  CertificateTypeCombobox,
  type CertificateTypeDto,
} from "@/src/features/certificates/shared";
import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { View } from "react-native";
import { CertificateFormValues } from "@/src/features/certificates/shared";

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

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-4 rounded-[24px] border border-shellLine bg-shellPanel p-5">
      <View className="gap-1">
        <Text className="text-[14px] font-semibold text-textMain">{title}</Text>
        <Text className="text-[12px] leading-[18px] text-muted">
          {description}
        </Text>
      </View>
      {children}
    </View>
  );
}

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
    <Card className="overflow-hidden rounded-[28px] bg-shellPanel shadow-sm shadow-black/10 web:shadow-black/30">
      <CardHeaderRow className="items-start border-b border-shellLine px-5 py-4">
        <View className="gap-1">
          <Text className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
            Record Intake
          </Text>
          <CardTitle className="text-[18px] text-textMain">
            Certificate Record
          </CardTitle>
          <Text className="text-muted text-[13px] leading-[19px]">
            Capture the structured certificate baseline the compliance
            workspace, quick view, and approval flow will read.
          </Text>
        </View>
      </CardHeaderRow>

      <CardContent className="px-5 py-5">
        <View className="gap-5">
          <Section
            title="1. Assign the record"
            description="Choose the vessel and certificate type first. That assignment is what anchors this record to compliance."
          >

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

            <CertificateTypeCombobox
              certificateTypes={certificateTypes}
              certificateTypesLoading={certificateTypesLoading}
              certificateTypesError={certificateTypesError}
              selectedType={values.selectedCertificateType}
              selectedTypeId={values.certificateTypeId}
              onSelect={(type) =>
                onChange({
                  certificateTypeId: type.id,
                  selectedCertificateType: type,
                })
              }
              onClear={() =>
                onChange({
                  certificateTypeId: null,
                  selectedCertificateType: null,
                })
              }
              disabled={disabled}
            />
          </Section>

          <Section
            title="2. Add record details"
            description="Capture certificate number, issuer, and validity dates. Notes stay optional and operational."
          >

            <View className="gap-4 web:flex-row">
              <View className="flex-1">
                <Field
                  label="Number"
                  placeholder="e.g. CERT-12345"
                  value={values.number}
                  onChangeText={(value) => onChange({ number: value })}
                  editable={!disabled}
                  surfaceTone="raised"
                />
              </View>
              <View className="flex-1">
                <Field
                  label="Issuer"
                  placeholder="e.g. Class Society / Flag"
                  value={values.issuer}
                  onChangeText={(value) => onChange({ issuer: value })}
                  editable={!disabled}
                  surfaceTone="raised"
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
                  disabled={disabled}
                  surfaceTone="raised"
                />
              </View>
              <View className="flex-1">
                <DateField
                  label="Expiry Date"
                  placeholder="Select expiry date"
                  value={values.expiryDate}
                  onChange={(value) => onChange({ expiryDate: value })}
                  disabled={disabled}
                  surfaceTone="raised"
                />
              </View>
            </View>

            <Field
              label="Notes"
              placeholder="Optional operational notes"
              value={values.notes}
              onChangeText={(value) => onChange({ notes: value })}
              editable={!disabled}
              multiline
              surfaceTone="raised"
            />
          </Section>

          {showFilesNextHint ? (
            <View className="rounded-[20px] border border-dashed border-shellLine bg-shellCanvas p-4 gap-2">
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
            <Text className="text-[13px] text-destructive">{localError}</Text>
          ) : null}
          {apiError ? (
            <Text className="text-[13px] text-destructive">{apiError}</Text>
          ) : null}
        </View>
      </CardContent>
    </Card>
  );
}


