import { Text } from "@/src/components";
import type { CertificateTypeDto } from "@/src/features/certificates/contracts";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import type { CrewCertificateFormValues } from "../helpers";

const MAX_VISIBLE_TYPES = 6;

type Props = {
  certificateTypes: CertificateTypeDto[];
  certificateTypesLoading: boolean;
  certificateTypesError: string | null;
  values: CrewCertificateFormValues;
  onChange: (patch: Partial<CrewCertificateFormValues>) => void;
  disabled: boolean;
};

export function CrewCertificateTypePicker({
  certificateTypes,
  certificateTypesLoading,
  certificateTypesError,
  values,
  onChange,
  disabled,
}: Props) {
  const [typeQuery, setTypeQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  function clearTypeSelection() {
    setTypeQuery("");
    setIsDropdownOpen(false);
    onChange({
      certificateTypeId: null,
      selectedCertificateType: null,
    });
  }

  function clearSelectedTypeOnly() {
    onChange({
      certificateTypeId: null,
      selectedCertificateType: null,
    });
  }

  function handleTypeQueryChange(nextValue: string) {
    setTypeQuery(nextValue);
    setIsDropdownOpen(true);

    if (selectedType && nextValue.trim() !== selectedType.name) {
      clearSelectedTypeOnly();
    }
  }

  function selectType(type: CertificateTypeDto) {
    setTypeQuery(type.name);
    setIsDropdownOpen(false);
    onChange({
      certificateTypeId: type.id,
      selectedCertificateType: type,
    });
  }

  const matchLabel = typeQuery.trim()
    ? `Top ${filteredTypes.length} match${filteredTypes.length === 1 ? "" : "es"}`
    : "Suggested certificate types";

  return (
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
        <Text className="text-textMain/80 text-sm font-medium">Find type</Text>

        <View className="rounded-2xl border border-shellLine bg-shellPanelSoft px-4">
          <View className="flex-row items-center gap-3">
            <Ionicons name="search" size={16} color="rgba(221,230,237,0.65)" />
            <TextInput
              value={typeQuery}
              onChangeText={handleTypeQueryChange}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Search by name, code, or alias"
              placeholderTextColor="rgba(221,230,237,0.35)"
              className="flex-1 h-12 text-textMain"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!disabled}
            />
            <Pressable
              onPress={() => setIsDropdownOpen((currentValue) => !currentValue)}
              disabled={disabled}
              className="py-2"
            >
              <Ionicons
                name={isDropdownOpen ? "chevron-up" : "chevron-down"}
                size={16}
                color="rgba(221,230,237,0.75)"
              />
            </Pressable>
          </View>
        </View>

        {isDropdownOpen ? (
          <View className="rounded-[18px] border border-shellLine bg-shellPanel p-2 gap-1">
            {filteredTypes.length === 0 ? (
              <View className="px-3 py-4">
                <Text className="text-muted text-[12px]">
                  No certificate types match that search.
                </Text>
              </View>
            ) : (
              <>
                <Text className="px-3 pt-1 text-muted text-[12px]">
                  {matchLabel}
                </Text>

                {filteredTypes.map((type) => (
                  <CrewCertificateTypeOption
                    key={type.id}
                    type={type}
                    selected={values.certificateTypeId === type.id}
                    disabled={disabled}
                    onPress={() => selectType(type)}
                  />
                ))}
              </>
            )}
          </View>
        ) : null}
      </View>

      {selectedType ? (
        <SelectedCrewCertificateTypeCard
          type={selectedType}
          disabled={disabled}
          onClear={clearTypeSelection}
        />
      ) : null}

      {!isDropdownOpen && !selectedType ? (
        <Text className="text-muted text-[12px]">
          Start typing to search certificate types.
        </Text>
      ) : null}
    </View>
  );
}

type CrewCertificateTypeOptionProps = {
  type: CertificateTypeDto;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
};

function CrewCertificateTypeOption({
  type,
  selected,
  disabled,
  onPress,
}: CrewCertificateTypeOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={[
        "rounded-[16px] border px-4 py-3",
        selected ? "border-accent bg-accent/10" : "border-transparent bg-shellGlass",
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
        {type.authority ? (
          <Text className="text-muted text-[11px]">{type.authority}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

type SelectedCrewCertificateTypeCardProps = {
  type: CertificateTypeDto;
  disabled: boolean;
  onClear: () => void;
};

function SelectedCrewCertificateTypeCard({
  type,
  disabled,
  onClear,
}: SelectedCrewCertificateTypeCardProps) {
  return (
    <View className="rounded-[18px] border border-accent/30 bg-accent/10 p-4 gap-2">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text className="text-textMain font-semibold text-[14px]">
            {type.name}
          </Text>
          <Text className="text-muted text-[12px]">
            {type.code} - {type.category}
          </Text>
        </View>

        <Pressable
          onPress={onClear}
          disabled={disabled}
          className="rounded-full border border-accent/30 px-3 py-1"
        >
          <Text className="text-accent text-[12px] font-semibold">Clear</Text>
        </Pressable>
      </View>

      {type.description ? (
        <Text className="text-muted text-[12px] leading-[18px]">
          {type.description}
        </Text>
      ) : null}
    </View>
  );
}
