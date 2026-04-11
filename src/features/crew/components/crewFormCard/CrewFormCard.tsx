import {
  Card,
  CardContent,
  CardHeaderRow,
  CardTitle,
  DateField,
  EmptyVesselsState,
  Field,
  SearchableVesselSelect,
  Text,
  VesselPill,
} from "@/src/components";
import type { AssetDto } from "@/src/contracts/assets.contract";
import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { Pressable, Switch, View } from "react-native";
import type { CrewDepartment } from "../../contracts";
import { CrewFormValues } from "../crewFormTypes";

const departmentOptions: {
  value: CrewDepartment;
  label: string;
}[] = [
  { value: "DECK", label: "Deck" },
  { value: "ENGINE", label: "Engine" },
  { value: "CATERING", label: "Catering" },
  { value: "OTHER", label: "Other" },
];

type Props = {
  fixedAssetId?: string | null;
  currentVessel?: AssetDto | null;
  vessels: AssetDto[];
  vesselsLoading: boolean;
  vesselsError: string | null;
  onCreateVessel: () => void;
  values: CrewFormValues;
  onChange: (patch: Partial<CrewFormValues>) => void;
  localError?: string | null;
  apiError?: string | null;
  disabled?: boolean;
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
    <View className="rounded-[20px] border border-shellLine bg-shellPanelSoft p-4 gap-4">
      <View className="gap-1">
        <Text className="text-textMain font-semibold text-[14px]">{title}</Text>
        <Text className="text-muted text-[12px] leading-[18px]">
          {description}
        </Text>
      </View>
      {children}
    </View>
  );
}

function SelectorOption({
  selected,
  label,
  onPress,
  disabled,
}: {
  selected: boolean;
  label: string;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={[
        "rounded-full border px-3 py-2",
        selected ? "border-accent bg-accent/10" : "border-shellLine bg-shellPanelSoft",
        disabled ? "opacity-60" : "",
      ].join(" ")}
    >
      <Text
        className={selected ? "text-accent font-semibold" : "text-textMain"}
      >
        {label}
      </Text>
    </Pressable>
  );
}

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
            Crew Profile
          </CardTitle>
          <Text className="text-muted text-[13px]">
            Capture operational crew data in a way that later supports
            certificates, compliance, and contract visibility.
          </Text>
        </View>
      </CardHeaderRow>

      <CardContent className="px-6">
        <View className="gap-5">
          <Section
            title="1. Assignment"
            description="Assign the crew member to a vessel first. Everything else in this profile depends on that operating context."
          >
            {fixedAssetId ? (
              currentVessel ? (
                <VesselPill vessel={currentVessel} />
              ) : (
                <Text className="text-muted text-[12px]">Loading vessel...</Text>
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
          </Section>

          <Section
            title="2. Basic Info"
            description="Core identity and onboard role data for the crew member."
          >
            <Field
              label="Full Name *"
              placeholder="e.g. Juan Perez"
              value={values.fullName}
              onChangeText={(value) => onChange({ fullName: value })}
              editable={!disabled}
            />

            <View className="gap-4 web:flex-row">
              <View className="flex-1">
                <Field
                  label="Rank"
                  placeholder="e.g. Master"
                  value={values.rank}
                  onChangeText={(value) => onChange({ rank: value })}
                  editable={!disabled}
                />
              </View>
              <View className="flex-1">
                <Field
                  label="Nationality"
                  placeholder="e.g. PA"
                  value={values.nationality}
                  onChangeText={(value) => onChange({ nationality: value })}
                  editable={!disabled}
                />
              </View>
            </View>

            <DateField
              label="Date of Birth"
              value={values.dateOfBirth}
              onChange={(value) => onChange({ dateOfBirth: value })}
              placeholder="Select birth date"
              disabled={disabled}
            />

            <View className="gap-4 web:flex-row">
              <View className="flex-1">
                <Field
                  label="Passport Number"
                  placeholder="e.g. PA-4588123"
                  value={values.passportNumber}
                  onChangeText={(value) => onChange({ passportNumber: value })}
                  editable={!disabled}
                />
              </View>
              <View className="flex-1">
                <Field
                  label="Seafarer ID / Book"
                  placeholder="e.g. SB-PA-22018"
                  value={values.seafarerId}
                  onChangeText={(value) => onChange({ seafarerId: value })}
                  editable={!disabled}
                />
              </View>
            </View>

            <View className="gap-4 web:flex-row">
              <View className="flex-1">
                <Field
                  label="Personal Email"
                  placeholder="e.g. crew.member@email.com"
                  value={values.personalEmail}
                  onChangeText={(value) => onChange({ personalEmail: value })}
                  keyboardType="email-address"
                  editable={!disabled}
                />
              </View>
              <View className="flex-1">
                <Field
                  label="Photo URL"
                  placeholder="Optional photo URL"
                  value={values.photoUrl}
                  onChangeText={(value) => onChange({ photoUrl: value })}
                  editable={!disabled}
                />
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-textMain/80 text-sm font-medium">
                Department
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {departmentOptions.map((option) => (
                  <SelectorOption
                    key={option.value}
                    selected={values.department === option.value}
                    label={option.label}
                    disabled={disabled}
                    onPress={() =>
                      onChange({
                        department:
                          values.department === option.value
                            ? null
                            : option.value,
                      })
                    }
                  />
                ))}
              </View>
            </View>
          </Section>

          <Section
            title="3. Contract"
            description="Track the current embarkation cycle and operating context."
          >
            <View className="gap-4 web:flex-row">
              <View className="flex-1">
                <DateField
                  label="Date of Embarkation"
                  value={values.dateOfEmbarkation}
                  onChange={(value) => onChange({ dateOfEmbarkation: value })}
                  placeholder="Select embarkation date"
                  disabled={disabled}
                />
              </View>
              <View className="flex-1">
                <DateField
                  label="Expected Disembarkation"
                  value={values.expectedDateOfDisembarkation}
                  onChange={(value) =>
                    onChange({ expectedDateOfDisembarkation: value })
                  }
                  placeholder="Select disembarkation date"
                  disabled={disabled}
                />
              </View>
            </View>

            <View className="gap-4 web:flex-row">
              <View className="flex-1">
                <Field
                  label="Port of Embarkation"
                  placeholder="e.g. Panama"
                  value={values.portOfEmbarkation}
                  onChangeText={(value) =>
                    onChange({ portOfEmbarkation: value })
                  }
                  editable={!disabled}
                />
              </View>
              <View className="flex-1">
                <Field
                  label="Contract Type"
                  placeholder="e.g. Rotation 60/30"
                  value={values.contractType}
                  onChangeText={(value) => onChange({ contractType: value })}
                  editable={!disabled}
                />
              </View>
            </View>

            <View className="gap-4 web:flex-row">
              <View className="flex-1">
                <Field
                  label="Operating Company"
                  placeholder="e.g. ARXIS Navigate Marine"
                  value={values.operatingCompany}
                  onChangeText={(value) =>
                    onChange({ operatingCompany: value })
                  }
                  editable={!disabled}
                />
              </View>
              <View className="flex-1">
                <Field
                  label="Crew Management Agency"
                  placeholder="e.g. BlueOcean Crew Panama"
                  value={values.crewManagementAgency}
                  onChangeText={(value) =>
                    onChange({ crewManagementAgency: value })
                  }
                  editable={!disabled}
                />
              </View>
            </View>

            <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft p-4 flex-row items-center justify-between">
              <View className="gap-1">
                <Text className="text-textMain font-semibold">Status</Text>
                <Text className="text-muted text-[12px]">
                  Inactive crew should not count toward available manning.
                </Text>
              </View>

              <View className="flex-row items-center gap-3">
                <Text className="text-muted text-[12px]">
                  {isActive ? "ACTIVE" : "INACTIVE"}
                </Text>
                <Switch
                  value={isActive}
                  onValueChange={(value) =>
                    onChange({ status: value ? "ACTIVE" : "INACTIVE" })
                  }
                  disabled={disabled}
                />
              </View>
            </View>
          </Section>

          <Section
            title="4. Experience"
            description="Keep enough operational context to support later compliance and assignment decisions."
          >
            <View className="gap-4 web:flex-row">
              <View className="flex-1">
                <Field
                  label="Total Sea Experience (years)"
                  placeholder="e.g. 12"
                  value={values.totalSeaExperienceYears}
                  onChangeText={(value) =>
                    onChange({ totalSeaExperienceYears: value })
                  }
                  keyboardType="numeric"
                  editable={!disabled}
                />
              </View>
              <View className="flex-1">
                <Field
                  label="Years in Current Rank"
                  placeholder="e.g. 4"
                  value={values.yearsInCurrentRank}
                  onChangeText={(value) =>
                    onChange({ yearsInCurrentRank: value })
                  }
                  keyboardType="numeric"
                  editable={!disabled}
                />
              </View>
            </View>

            <View className="gap-4 web:flex-row">
              <View className="flex-1">
                <Field
                  label="Vessel Type Experience"
                  placeholder="e.g. Offshore Supply Vessel"
                  value={values.vesselTypeExperience}
                  onChangeText={(value) =>
                    onChange({ vesselTypeExperience: value })
                  }
                  editable={!disabled}
                />
              </View>
              <View className="flex-1">
                <Field
                  label="Time with Current Company (months)"
                  placeholder="e.g. 18"
                  value={values.timeWithCurrentCompanyMonths}
                  onChangeText={(value) =>
                    onChange({ timeWithCurrentCompanyMonths: value })
                  }
                  keyboardType="numeric"
                  editable={!disabled}
                />
              </View>
            </View>

            <Field
              label="Previous Vessels"
              placeholder="e.g. MV Horizon Tide; MV Canal Star"
              value={values.previousVessels}
              onChangeText={(value) => onChange({ previousVessels: value })}
              editable={!disabled}
            />
          </Section>

          <Section
            title="5. Familiarization"
            description="Capture the onboarding and familiarization state without yet going into full document workflows."
          >
            <View className="gap-4 web:flex-row">
              <View className="flex-1">
                <DateField
                  label="Onboard Familiarization Date"
                  value={values.onboardFamiliarizationDate}
                  onChange={(value) =>
                    onChange({ onboardFamiliarizationDate: value })
                  }
                  placeholder="Select familiarization date"
                  disabled={disabled}
                />
              </View>
              <View className="flex-1">
                <Field
                  label="Responsible Officer"
                  placeholder="e.g. Master / Chief Officer"
                  value={values.responsibleOfficer}
                  onChangeText={(value) =>
                    onChange({ responsibleOfficer: value })
                  }
                  editable={!disabled}
                />
              </View>
            </View>

            <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft p-4 flex-row items-center justify-between">
              <View className="gap-1">
                <Text className="text-textMain font-semibold">
                  Familiarization Checklist
                </Text>
                <Text className="text-muted text-[12px]">
                  Mark this when the onboard checklist has been completed.
                </Text>
              </View>

              <Switch
                value={values.familiarizationChecklistCompleted}
                onValueChange={(value) =>
                  onChange({ familiarizationChecklistCompleted: value })
                }
                disabled={disabled}
              />
            </View>

            <Field
              label="Digital Signature URL"
              placeholder="Optional signature URL"
              value={values.crewDigitalSignatureUrl}
              onChangeText={(value) =>
                onChange({ crewDigitalSignatureUrl: value })
              }
              editable={!disabled}
            />
          </Section>

          <Section
            title="6. Medical"
            description="Track medical readiness now; certificate-level detail will come in the crew-certificates branch."
          >
            <View className="gap-2">
              <Text className="text-textMain/80 text-sm font-medium">
                Medical Certificate Status
              </Text>
              <View className="flex-row flex-wrap gap-2">
                <SelectorOption
                  selected={values.medicalCertificateValid === true}
                  label="Valid"
                  disabled={disabled}
                  onPress={() => onChange({ medicalCertificateValid: true })}
                />
                <SelectorOption
                  selected={values.medicalCertificateValid === false}
                  label="Not valid"
                  disabled={disabled}
                  onPress={() => onChange({ medicalCertificateValid: false })}
                />
                <SelectorOption
                  selected={values.medicalCertificateValid === null}
                  label="Unknown"
                  disabled={disabled}
                  onPress={() => onChange({ medicalCertificateValid: null })}
                />
              </View>
            </View>

            <DateField
              label="Medical Certificate Expiration"
              value={values.medicalCertificateExpirationDate}
              onChange={(value) =>
                onChange({ medicalCertificateExpirationDate: value })
              }
              placeholder="Select expiration date"
              disabled={disabled}
            />

            <Field
              label="Medical Restrictions"
              placeholder="Optional restrictions or follow-up notes"
              value={values.medicalRestrictions}
              onChangeText={(value) => onChange({ medicalRestrictions: value })}
              editable={!disabled}
            />
          </Section>

          <Section
            title="7. Notes"
            description="Operational context that does not yet belong to certificates, training, or evaluations."
          >
            <Field
              label="Notes"
              placeholder="Optional operational notes"
              value={values.notes}
              onChangeText={(value) => onChange({ notes: value })}
              multiline
              editable={!disabled}
            />

            <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft p-4 gap-2">
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  className="text-textMain"
                />
                <Text className="text-textMain font-semibold text-[13px]">
                  Next branch reminder
                </Text>
              </View>
              <Text className="text-muted text-[12px] leading-[18px]">
                Crew certificates, training records, evaluations, and document
                uploads are intentionally left for follow-up branches.
              </Text>
            </View>
          </Section>

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
