import type { Control, UseFormSetValue } from "react-hook-form";
import { View } from "react-native";
import { getVesselEmailError } from "../../helpers/vesselFormValidation";
import { VesselEditorControlledField } from "./VesselEditorControlledField";
import { VesselEditorSection } from "./VesselEditorSection";
import { VesselEditorYearBuiltField } from "./VesselEditorYearBuiltField";
import type { VesselEditorFormValues } from "./vesselEditor.types";

type ContactSectionProps = {
  control: Control<VesselEditorFormValues>;
  values: VesselEditorFormValues;
  disabled?: boolean;
};

type ProfileDetailsProps = ContactSectionProps & {
  setValue: UseFormSetValue<VesselEditorFormValues>;
  showAdvanced?: boolean;
};

export function VesselEditorContactSection({
  control,
  values,
  disabled,
}: ContactSectionProps) {
  return (
    <VesselEditorSection
      eyebrow="Contact"
      title="Operational contact"
      description="This email appears in the vessel shell and quick views, so it should match the inbox the operations team expects."
    >
      <VesselEditorControlledField
        control={control}
        name="email"
        label="Vessel Email"
        placeholder="e.g. master@vesselmail.com"
        keyboardType="email-address"
        editable={!disabled}
        surfaceTone="raised"
        error={getVesselEmailError(values.email)}
        hint="Use the operational vessel inbox when available."
      />
    </VesselEditorSection>
  );
}

export function VesselEditorProfileDetailsSection({
  control,
  values,
  setValue,
  disabled,
}: ProfileDetailsProps) {
  return (
    <VesselEditorSection
      eyebrow="Profile"
      title="Operational facts"
      description="Facts used by the vessel profile, quick view, and future enrichment work."
    >
      <View className="gap-4 web:flex-row">
        <View className="flex-1">
          <VesselEditorControlledField
            control={control}
            name="homePort"
            label="Home Port"
            placeholder="e.g. Balboa"
            editable={!disabled}
            surfaceTone="raised"
          />
        </View>
        <View className="flex-1">
          <VesselEditorControlledField
            control={control}
            name="callSign"
            label="Call Sign"
            placeholder="e.g. HPXY"
            editable={!disabled}
            surfaceTone="raised"
          />
        </View>
      </View>

      <View className="gap-4 web:flex-row">
        <View className="flex-1">
          <VesselEditorControlledField
            control={control}
            name="mmsi"
            label="MMSI"
            placeholder="e.g. 123456789"
            keyboardType="numeric"
            editable={!disabled}
            surfaceTone="raised"
          />
        </View>
        <View className="flex-1">
          <VesselEditorControlledField
            control={control}
            name="vesselType"
            label="Vessel Type"
            placeholder="e.g. Offshore Supply Vessel"
            editable={!disabled}
            surfaceTone="raised"
          />
        </View>
      </View>

      <View className="gap-4 web:flex-row">
        <View className="flex-1">
          <VesselEditorControlledField
            control={control}
            name="classSociety"
            label="Class Society"
            placeholder="e.g. ABS"
            editable={!disabled}
            surfaceTone="raised"
          />
        </View>
        <View className="flex-1">
          <VesselEditorYearBuiltField
            value={values.yearBuilt}
            onChange={(nextValue) =>
              setValue("yearBuilt", nextValue, {
                shouldDirty: true,
                shouldTouch: true,
              })
            }
            disabled={disabled}
          />
        </View>
      </View>

      <VesselEditorControlledField
        control={control}
        name="builder"
        label="Builder"
        placeholder="e.g. Hyundai"
        editable={!disabled}
        surfaceTone="raised"
      />
    </VesselEditorSection>
  );
}
