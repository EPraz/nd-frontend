import { Text } from "@/src/components";
import { Ionicons } from "@expo/vector-icons";
import {
  Controller,
  type Control,
  type UseFormSetValue,
} from "react-hook-form";
import { Pressable, View } from "react-native";
import { VesselEditorControlledField } from "./VesselEditorControlledField";
import { VesselEditorSection } from "./VesselEditorSection";
import { VesselFlagSelect } from "./VesselFlagSelect";
import type { VesselEditorFormValues } from "./vesselEditor.types";

type Props = {
  control: Control<VesselEditorFormValues>;
  setValue: UseFormSetValue<VesselEditorFormValues>;
  disabled?: boolean;
  allowNameEdit?: boolean;
};

export function VesselEditorIdentitySection({
  control,
  setValue,
  disabled,
  allowNameEdit = true,
}: Props) {
  return (
    <VesselEditorSection
      eyebrow="Identity"
      title="Registry identity"
      description="Keep the vessel resolvable across the shell, compliance records, crew assignment, and future integrations."
    >
      {allowNameEdit ? (
        <VesselEditorControlledField
          control={control}
          name="name"
          label="Vessel Name *"
          placeholder="e.g. MV Navigate One"
          editable={!disabled}
          surfaceTone="raised"
        />
      ) : (
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <View className="gap-2 rounded-[20px] border border-shellLine bg-shellPanel px-4 py-3">
              <Text className="text-[12px] text-muted">Asset name</Text>
              <Text className="text-[18px] font-semibold text-textMain">
                {field.value}
              </Text>
              <Text className="text-[12px] leading-[18px] text-muted">
                The asset name is managed at asset level. This editor updates
                the vessel profile attached to it.
              </Text>
            </View>
          )}
        />
      )}

      <Controller
        control={control}
        name="identifierType"
        render={({ field: identifierField }) => {
          const identifierType = identifierField.value;
          const useLicense = identifierType === "LICENSE";

          function selectIdentifierType(
            nextType: VesselEditorFormValues["identifierType"],
          ) {
            if (disabled || nextType === identifierType) return;

            identifierField.onChange(nextType);
            setValue(nextType === "LICENSE" ? "imo" : "licenseNumber", "", {
              shouldDirty: true,
              shouldTouch: true,
            });
          }

          return (
            <View className="gap-4 rounded-[22px] border border-shellLine bg-shellPanel p-4">
              <View className="gap-4 web:flex-row web:items-center web:justify-between">
                <View className="min-w-0 flex-1 gap-1">
                  <View className="flex-row items-center gap-2">
                    <Ionicons
                      name="finger-print"
                      size={15}
                      className="text-accent"
                    />
                    <Text className="font-semibold text-textMain">
                      Identifier
                    </Text>
                  </View>
                  <Text className="text-[12px] leading-[18px] text-muted">
                    Use IMO when available. Fall back to license only when the
                    vessel does not carry an IMO.
                  </Text>
                </View>

                <View
                  className={[
                    "flex-row rounded-full border border-shellLine bg-shellGlass p-1",
                    disabled ? "opacity-50" : "",
                  ].join(" ")}
                >
                  {(["IMO", "LICENSE"] as const).map((type) => {
                    const isActive = identifierType === type;

                    return (
                      <Pressable
                        key={type}
                        onPress={() => selectIdentifierType(type)}
                        disabled={disabled}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isActive, disabled }}
                        className={[
                          "min-w-20 items-center rounded-full px-4 py-2 ",
                          isActive ? "bg-accent" : "bg-transparent",
                        ].join(" ")}
                      >
                        <Text
                          className={[
                            "text-[12px] font-semibold",
                            isActive ? "text-textMain" : "text-muted",
                          ].join(" ")}
                        >
                          {type === "IMO" ? "IMO" : "License"}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="gap-4 web:flex-row ">
                <View className="flex-1 ">
                  {useLicense ? (
                    <VesselEditorControlledField
                      key="licenseNumber"
                      control={control}
                      name="licenseNumber"
                      label="License Number *"
                      placeholder="e.g. LIC-PA-001"
                      editable={!disabled}
                      surfaceTone="raised"
                    />
                  ) : (
                    <VesselEditorControlledField
                      key="imo"
                      control={control}
                      name="imo"
                      label="IMO *"
                      placeholder="e.g. 9876543"
                      keyboardType="numeric"
                      editable={!disabled}
                      surfaceTone="raised"
                    />
                  )}
                </View>

                <View className="flex-1">
                  <Controller
                    control={control}
                    name="flag"
                    render={({ field: flagField }) => (
                      <VesselFlagSelect
                        value={flagField.value}
                        onChange={(flagCode) => {
                          flagField.onChange(flagCode);
                        }}
                        disabled={disabled}
                      />
                    )}
                  />
                </View>
              </View>
            </View>
          );
        }}
      />
    </VesselEditorSection>
  );
}
