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
  type CertificateDto,
  type CertificateTypeDto,
  type CertificateFormValues,
  documentKindLabel,
  hasIneligibleParentCertificateCandidates,
  isParentTypeConfigurationMissing,
  parentCertificateOptionsForType,
  requiresParentCertificate,
} from "@/src/features/certificates/shared";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { CertificateFormSection } from "./CertificateFormSection";
import { ParentCertificateSelector } from "./ParentCertificateSelector";

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
  parentCertificateOptions?: CertificateDto[];
  parentCertificatesLoading?: boolean;
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
  parentCertificateOptions = [],
  parentCertificatesLoading = false,
  values,
  onChange,
  localError,
  apiError,
  disabled = false,
  showFilesNextHint = true,
}: Props) {
  const selectedType = values.selectedCertificateType;
  const shouldSelectParent = requiresParentCertificate(selectedType);
  const parentConfigurationMissing =
    isParentTypeConfigurationMissing(selectedType);
  const parentOptions = parentCertificateOptionsForType(
    parentCertificateOptions,
    selectedType,
  );
  const hasIneligibleParentCandidates = hasIneligibleParentCertificateCandidates(
    parentCertificateOptions,
    selectedType,
  );
  const selectedParent =
    parentOptions.find(
      (certificate) => certificate.id === values.parentCertificateId,
    ) ?? null;

  return (
    <Card className="overflow-hidden rounded-[28px] bg-shellPanel shadow-sm shadow-black/10 web:shadow-black/30">
      <CardHeaderRow className="items-start border-b border-shellLine px-5 py-4">
        <View className="gap-1">
          <Text className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
            Record Intake
          </Text>
          <CardTitle className="text-[18px] text-textMain">
            Document record
          </CardTitle>
          <Text className="text-muted text-[13px] leading-[19px]">
            Capture the structured document baseline the compliance
            workspace, quick view, and approval flow will read.
          </Text>
        </View>
      </CardHeaderRow>

      <CardContent className="px-5 py-5">
        <View className="gap-5">
          <CertificateFormSection
            title="1. Assign the record"
            description="Choose the vessel and document type first. That assignment is what anchors this record to compliance."
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
                  parentCertificateId: null,
                  expiryDate:
                    type.requiresExpiry === false ? "" : values.expiryDate,
                })
              }
              onClear={() =>
                onChange({
                  certificateTypeId: null,
                  selectedCertificateType: null,
                  parentCertificateId: null,
                })
              }
              disabled={disabled}
            />

            {shouldSelectParent ? (
              <ParentCertificateSelector
                options={parentOptions}
                selectedParent={selectedParent}
                selectedTypeName={selectedType?.name ?? "this document"}
                selectedDocumentKind={
                  selectedType
                    ? documentKindLabel(selectedType.documentKind)
                    : "Document"
                }
                configurationMissing={parentConfigurationMissing}
                hasIneligibleCandidates={hasIneligibleParentCandidates}
                loading={parentCertificatesLoading}
                disabled={disabled}
                onSelect={(certificate) =>
                  onChange({ parentCertificateId: certificate.id })
                }
                onClear={() => onChange({ parentCertificateId: null })}
              />
            ) : null}
          </CertificateFormSection>

          <CertificateFormSection
            title="2. Add record details"
            description="Capture document number, issuer, and validity dates. Notes stay optional and operational."
          >
            <View className="gap-4 md:flex-row">
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

            <View className="gap-4 md:flex-row">
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
                  label={
                    selectedType?.requiresExpiry === false
                      ? "Expiry Date (optional)"
                      : "Expiry Date"
                  }
                  placeholder={
                    selectedType?.requiresExpiry === false
                      ? "Leave blank when not required"
                      : "Select expiry date"
                  }
                  value={values.expiryDate}
                  onChange={(value) => onChange({ expiryDate: value })}
                  disabled={disabled}
                  surfaceTone="raised"
                />
                {selectedType?.requiresExpiry === false ? (
                  <Text className="mt-2 text-[11px] leading-[16px] text-muted">
                    This document type does not require expiry. Keep this blank
                    unless the source document carries a specific validity date.
                  </Text>
                ) : null}
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
          </CertificateFormSection>

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
                This fallback flow creates the document record without a
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


