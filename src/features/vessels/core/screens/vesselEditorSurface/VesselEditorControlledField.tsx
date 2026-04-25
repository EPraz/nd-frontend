import { Field } from "@/src/components";
import type { ComponentProps } from "react";
import { Controller, type Control } from "react-hook-form";
import type { VesselEditorFormValues } from "./vesselEditor.types";

type Props = Omit<ComponentProps<typeof Field>, "value" | "onChangeText"> & {
  control: Control<VesselEditorFormValues>;
  name: keyof VesselEditorFormValues;
  formatOnChange?: (value: string) => string;
};

export function VesselEditorControlledField({
  control,
  formatOnChange,
  name,
  ...fieldProps
}: Props) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Field
          {...fieldProps}
          value={String(field.value ?? "")}
          onChangeText={(value) =>
            field.onChange(formatOnChange ? formatOnChange(value) : value)
          }
        />
      )}
    />
  );
}
