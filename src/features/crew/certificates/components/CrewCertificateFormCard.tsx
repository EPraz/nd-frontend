import { DateField, Field, Text } from "@/src/components";
import {
  CertificateTypeCombobox,
  type CertificateTypeDto,
} from "@/src/features/certificates/shared";
import { View } from "react-native";
import type { CrewDto } from "@/src/features/crew/core/contracts";
import type { CrewCertificateFormValues } from "../helpers";

type Props = {
  crew: CrewDto | null;
  certificateTypes: CertificateTypeDto[];
  certificateTypesLoading: boolean;
  certificateTypesError: string | null;
  values: CrewCertificateFormValues;
  onChange: (patch: Partial<CrewCertificateFormValues>) => void;
  localError?: string | null;
  apiError?: string | null;
  disabled?: boolean;
};

type ContextTone = "accent" | "info" | "ok" | "neutral";

function humanizeDepartment(value: string | null | undefined): string {
  if (!value) return "Not set";

  return value
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function contextTileClasses(tone: ContextTone) {
  switch (tone) {
    case "ok":
      return {
        surface: "border-emerald-400/25 bg-emerald-400/10",
        label: "text-emerald-100/80",
        value: "text-emerald-50",
      };
    case "info":
      return {
        surface: "border-sky-400/25 bg-sky-400/10",
        label: "text-sky-100/80",
        value: "text-sky-50",
      };
    case "neutral":
      return {
        surface: "border-shellLine bg-shellPanelSoft",
        label: "text-muted",
        value: "text-textMain",
      };
    case "accent":
    default:
      return {
        surface: "border-accent/30 bg-accent/12",
        label: "text-accent/80",
        value: "text-accent",
      };
  }
}

function ContextTile({
  label,
  value,
  helper,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  tone: ContextTone;
}) {
  const ui = contextTileClasses(tone);

  return (
    <View
      className={[
        "min-w-[160px] flex-1 gap-1.5 rounded-[18px] border px-4 py-3",
        ui.surface,
      ].join(" ")}
    >
      <Text
        className={[
          "text-[10px] font-semibold uppercase tracking-[0.24em]",
          ui.label,
        ].join(" ")}
      >
        {label}
      </Text>
      <Text className={["text-[14px] font-semibold", ui.value].join(" ")}>
        {value}
      </Text>
      <Text className="text-[12px] leading-[18px] text-muted">{helper}</Text>
    </View>
  );
}

export function CrewCertificateFormCard({
  crew,
  certificateTypes,
  certificateTypesLoading,
  certificateTypesError,
  values,
  onChange,
  localError,
  apiError,
  disabled = false,
}: Props) {
  return (
    <View className="gap-5">
      <View className="flex-row flex-wrap gap-3">
        <ContextTile
          label="Crew member"
          value={crew?.fullName ?? "Loading..."}
          helper="Structured record owner"
          tone="accent"
        />
        <ContextTile
          label="Assigned vessel"
          value={crew?.assetName ?? crew?.asset?.name ?? "Not set"}
          helper="Operational vessel lane"
          tone={crew?.assetName ?? crew?.asset?.name ? "info" : "neutral"}
        />
        <ContextTile
          label="Rank"
          value={crew?.rank ?? "Not set"}
          helper="Current crew role"
          tone={crew?.rank ? "ok" : "neutral"}
        />
        <ContextTile
          label="Department"
          value={humanizeDepartment(crew?.department)}
          helper="Departmental context"
          tone={crew?.department ? "info" : "neutral"}
        />
      </View>

      <View className="rounded-[20px] border border-shellLine bg-shellPanelSoft p-4 gap-4">
        <View className="gap-1">
          <Text className="text-[15px] font-semibold text-textMain">
            Certificate type
          </Text>
          <Text className="text-[12px] leading-[18px] text-muted">
            Choose the structured type this upload should create or satisfy
            inside the crew certificate lane.
          </Text>
        </View>

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
      </View>

      <View className="rounded-[20px] border border-shellLine bg-shellPanelSoft p-4 gap-4">
        <View className="gap-1">
          <Text className="text-[15px] font-semibold text-textMain">
            Certificate metadata
          </Text>
          <Text className="text-[12px] leading-[18px] text-muted">
            Confirm number, issuer, dates, and notes before the record enters
            submitted state.
          </Text>
        </View>

        <View className="gap-4 web:flex-row">
          <View className="flex-1">
            <Field
              label="Number"
              placeholder="e.g. COC-12345"
              value={values.number}
              onChangeText={(value) => onChange({ number: value })}
              surfaceTone="raised"
            />
          </View>
          <View className="flex-1">
            <Field
              label="Issuer"
              placeholder="e.g. Flag / Authority / Maritime Academy"
              value={values.issuer}
              onChangeText={(value) => onChange({ issuer: value })}
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
              surfaceTone="raised"
            />
          </View>
          <View className="flex-1">
            <DateField
              label="Expiry Date"
              placeholder="Select expiry date"
              value={values.expiryDate}
              onChange={(value) => onChange({ expiryDate: value })}
              surfaceTone="raised"
            />
          </View>
        </View>

        <Field
          label="Notes"
          placeholder="Optional operational notes"
          value={values.notes}
          onChangeText={(value) => onChange({ notes: value })}
          surfaceTone="raised"
        />
      </View>

      {localError ? (
        <Text className="text-[12px] leading-[18px] text-destructive">
          {localError}
        </Text>
      ) : null}
      {apiError ? (
        <Text className="text-[12px] leading-[18px] text-destructive">
          {apiError}
        </Text>
      ) : null}
    </View>
  );
}
