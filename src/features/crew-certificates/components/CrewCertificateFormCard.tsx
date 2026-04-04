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
import type { CertificateTypeDto } from "@/src/features/certificates/contracts";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import type { CrewDto } from "@/src/features/crew/contracts";
import type { CrewCertificateFormValues } from "../helpers";

const MAX_VISIBLE_TYPES = 6;

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
  const [typeQuery, setTypeQuery] = useState("");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  const selectedType = values.selectedCertificateType;

  useEffect(() => {
    if (!selectedType) return;
    if (typeQuery.trim()) return;
    setTypeQuery(selectedType.name);
  }, [selectedType, typeQuery]);

  const filteredTypes = useMemo(() => {
    const query = typeQuery.trim().toLowerCase();
    if (!query) return certificateTypes.slice(0, MAX_VISIBLE_TYPES);

    return certificateTypes
      .filter((type) =>
        `${type.name} ${type.code} ${type.aliases.join(" ")}`
          .toLowerCase()
          .includes(query),
      )
      .slice(0, MAX_VISIBLE_TYPES);
  }, [certificateTypes, typeQuery]);

  function handleTypeQueryChange(nextValue: string) {
    setTypeQuery(nextValue);
    setIsTypeDropdownOpen(true);

    if (selectedType && nextValue.trim() !== selectedType.name) {
      onChange({
        certificateTypeId: null,
        selectedCertificateType: null,
      });
    }
  }

  function selectType(type: CertificateTypeDto) {
    setTypeQuery(type.name);
    setIsTypeDropdownOpen(false);
    onChange({
      certificateTypeId: type.id,
      selectedCertificateType: type,
    });
  }

  function clearTypeSelection() {
    setTypeQuery("");
    setIsTypeDropdownOpen(false);
    onChange({
      certificateTypeId: null,
      selectedCertificateType: null,
    });
  }

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
          <View className="rounded-[20px] border border-border bg-baseBg/35 p-4 gap-4">
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
              <MiniPill>{`Vessel: ${crew?.assetName ?? crew?.asset?.name ?? "—"}`}</MiniPill>
              {crew?.rank ? <MiniPill>{`Rank: ${crew.rank}`}</MiniPill> : null}
              {crew?.department ? (
                <MiniPill>{`Department: ${crew.department}`}</MiniPill>
              ) : null}
            </View>

            <View className="gap-3">
              <View className="gap-1">
                <Text className="text-textMain font-semibold text-[13px]">
                  Certificate Type *
                </Text>
                <Text className="text-muted text-[12px]">
                  Search by name, code, or alias and choose one type.
                </Text>
              </View>

              {certificateTypesError ? (
                <Text className="text-destructive">{certificateTypesError}</Text>
              ) : null}

              {certificateTypesLoading ? (
                <Text className="text-muted text-[12px]">
                  Loading certificate types...
                </Text>
              ) : null}

              <View className="gap-2">
                <Text className="text-textMain/80 text-sm font-medium">
                  Find type
                </Text>

                <View className="rounded-2xl border border-white/15 bg-baseBg/40 px-4">
                  <View className="flex-row items-center gap-3">
                    <Ionicons
                      name="search"
                      size={16}
                      color="rgba(221,230,237,0.65)"
                    />
                    <TextInput
                      value={typeQuery}
                      onChangeText={handleTypeQueryChange}
                      onFocus={() => setIsTypeDropdownOpen(true)}
                      placeholder="Search by name, code, or alias"
                      placeholderTextColor="rgba(221,230,237,0.35)"
                      className="flex-1 h-12 text-textMain"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!disabled}
                    />
                    <Pressable
                      onPress={() =>
                        setIsTypeDropdownOpen((currentValue) => !currentValue)
                      }
                      disabled={disabled}
                      className="py-2"
                    >
                      <Ionicons
                        name={isTypeDropdownOpen ? "chevron-up" : "chevron-down"}
                        size={16}
                        color="rgba(221,230,237,0.75)"
                      />
                    </Pressable>
                  </View>
                </View>

                {isTypeDropdownOpen ? (
                  <View className="rounded-[18px] border border-border bg-baseBg/95 p-2 gap-1">
                    {filteredTypes.length === 0 ? (
                      <View className="px-3 py-4">
                        <Text className="text-muted text-[12px]">
                          No certificate types match that search.
                        </Text>
                      </View>
                    ) : (
                      <>
                        <Text className="px-3 pt-1 text-muted text-[12px]">
                          {typeQuery.trim()
                            ? `Top ${filteredTypes.length} match${filteredTypes.length === 1 ? "" : "es"}`
                            : "Suggested certificate types"}
                        </Text>

                        {filteredTypes.map((type) => {
                          const isSelected = values.certificateTypeId === type.id;

                          return (
                            <Pressable
                              key={type.id}
                              onPress={() => selectType(type)}
                              disabled={disabled}
                              className={[
                                "rounded-[16px] border px-4 py-3",
                                isSelected
                                  ? "border-accent bg-accent/10"
                                  : "border-transparent bg-baseBg/20",
                                disabled ? "opacity-60" : "",
                              ].join(" ")}
                            >
                              <View className="gap-1">
                                <Text className="text-textMain font-semibold text-[13px]">
                                  {type.name}
                                </Text>
                                <Text className="text-muted text-[11px]">
                                  {type.code} - {type.category}
                                </Text>
                              </View>
                            </Pressable>
                          );
                        })}
                      </>
                    )}
                  </View>
                ) : null}
              </View>

              {selectedType ? (
                <View className="rounded-[18px] border border-accent/30 bg-accent/10 p-4 gap-2">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1 gap-1">
                      <Text className="text-textMain font-semibold text-[14px]">
                        {selectedType.name}
                      </Text>
                      <Text className="text-muted text-[12px]">
                        {selectedType.code} - {selectedType.category}
                      </Text>
                    </View>

                    <Pressable
                      onPress={clearTypeSelection}
                      disabled={disabled}
                      className="rounded-full border border-accent/30 px-3 py-1"
                    >
                      <Text className="text-accent text-[12px] font-semibold">
                        Clear
                      </Text>
                    </Pressable>
                  </View>

                  {selectedType.description ? (
                    <Text className="text-muted text-[12px] leading-[18px]">
                      {selectedType.description}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          </View>

          <View className="rounded-[20px] border border-border bg-baseBg/35 p-4 gap-4">
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
