import {
  Card,
  CardContent,
  CardHeaderRow,
  CardTitle,
  DateField,
  Field,
  MiniPill,
  Text,
} from "@/src/components";
import type { CertificateTypeDto } from "@/src/features/certificates/shared";
import { View } from "react-native";
import type { CrewDto } from "@/src/features/crew/core/contracts";
import type { CrewCertificateFormValues } from "../helpers";
import { CrewCertificateTypePicker } from "./CrewCertificateTypePicker";

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
    <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
      <CardHeaderRow>
        <View className="gap-1">
          <CardTitle className="text-[16px] text-textMain">
            Crew Certificate Record
          </CardTitle>
          <Text className="text-muted text-[13px]">
            Confirm the crew member, choose the certificate type, and validate
            the dates before submission.
          </Text>
        </View>
      </CardHeaderRow>

      <CardContent className="px-6">
        <View className="gap-5">
          <View className="rounded-[20px] border border-shellLine bg-shellPanelSoft p-4 gap-4">
            <View className="gap-1">
              <Text className="text-textMain font-semibold text-[14px]">
                1. Crew context
              </Text>
              <Text className="text-muted text-[12px] leading-[18px]">
                This record belongs to one crew member. The type selected here
                is what connects the upload to compliance by rank.
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-2">
              <MiniPill>{`Crew: ${crew?.fullName ?? "Loading..."}`}</MiniPill>
              <MiniPill>{`Vessel: ${crew?.assetName ?? crew?.asset?.name ?? "â€”"}`}</MiniPill>
              {crew?.rank ? <MiniPill>{`Rank: ${crew.rank}`}</MiniPill> : null}
              {crew?.department ? (
                <MiniPill>{`Department: ${crew.department}`}</MiniPill>
              ) : null}
            </View>

            <CrewCertificateTypePicker
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
                2. Confirm metadata
              </Text>
              <Text className="text-muted text-[12px] leading-[18px]">
                Add the certificate number, issuer, and dates. Notes are
                optional and should stay operational.
              </Text>
            </View>

            <View className="gap-4 web:flex-row">
              <View className="flex-1">
                <Field
                  label="Number"
                  placeholder="e.g. COC-12345"
                  value={values.number}
                  onChangeText={(value) => onChange({ number: value })}
                />
              </View>
              <View className="flex-1">
                <Field
                  label="Issuer"
                  placeholder="e.g. Flag / Authority / Maritime Academy"
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

          {localError ? <Text className="text-destructive">{localError}</Text> : null}
          {apiError ? <Text className="text-destructive">{apiError}</Text> : null}
        </View>
      </CardContent>
    </Card>
  );
}
