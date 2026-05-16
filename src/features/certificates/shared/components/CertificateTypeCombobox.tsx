import { Text } from "@/src/components";
import { AnchoredPopover } from "@/src/components/ui/popover";
import { RegistryTablePill } from "@/src/components/ui/table/RegistryTablePill";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { usePlaceholderColor } from "@/src/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import type { CertificateTypeDto } from "../contracts";
import {
  documentKindLabel,
  documentKindTone,
  sourceReferenceLabel,
} from "../helpers";

const MAX_VISIBLE_TYPES = 6;
const DESKTOP_POPOVER_MIN_WIDTH = 440;
const POPOVER_ESTIMATED_HEIGHT = 408;

type Props = {
  certificateTypes: CertificateTypeDto[];
  certificateTypesLoading: boolean;
  certificateTypesError: string | null;
  selectedType: CertificateTypeDto | null;
  selectedTypeId: string | null;
  onSelect: (type: CertificateTypeDto) => void;
  onClear: () => void;
  disabled?: boolean;
};

export function CertificateTypeCombobox({
  certificateTypes,
  certificateTypesLoading,
  certificateTypesError,
  selectedType,
  selectedTypeId,
  onSelect,
  onClear,
  disabled = false,
}: Props) {
  const [typeQuery, setTypeQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const placeholderColor = usePlaceholderColor();
  const debouncedOpenQuery = useDebouncedValue(typeQuery);
  const debouncedTypeQuery = isDropdownOpen ? debouncedOpenQuery : typeQuery;

  useEffect(() => {
    if (isDropdownOpen) return;
    setTypeQuery(selectedType?.name ?? "");
  }, [isDropdownOpen, selectedType]);

  const filteredTypes = useMemo(() => {
    const query = debouncedTypeQuery.trim().toLowerCase();
    if (!query) return certificateTypes.slice(0, MAX_VISIBLE_TYPES);

    return certificateTypes
      .filter((type) => {
        const searchableText = [
          type.name,
          type.code,
          type.documentKind,
          type.convention,
          type.sourceReference,
          type.variantFlag,
          ...type.aliases,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      })
      .slice(0, MAX_VISIBLE_TYPES);
  }, [certificateTypes, debouncedTypeQuery]);

  const matchLabel = debouncedTypeQuery.trim()
    ? `Top ${filteredTypes.length} match${filteredTypes.length === 1 ? "" : "es"}`
    : "Suggested document types";

  function closeDropdown() {
    setIsDropdownOpen(false);
    setTypeQuery(selectedType?.name ?? "");
  }

  function handleDropdownOpenChange(nextOpen: boolean) {
    if (disabled && nextOpen) return;

    if (nextOpen) {
      setIsDropdownOpen(true);
      return;
    }

    closeDropdown();
  }

  function handleTypeQueryChange(nextValue: string) {
    setTypeQuery(nextValue);

    if (selectedType && nextValue.trim() !== selectedType.name) {
      onClear();
    }
  }

  function handleClearQuery() {
    setTypeQuery("");

    if (selectedType) {
      onClear();
    }
  }

  function handleSelect(type: CertificateTypeDto) {
    setTypeQuery(type.name);
    setIsDropdownOpen(false);
    onSelect(type);
  }

  const triggerLabel = selectedType?.name || "Search by name, code, or alias";

  return (
    <View className="gap-3">
      <View className="gap-1">
        <Text className="text-textMain font-semibold text-[13px]">
          Document Type *
        </Text>
        <Text className="text-muted text-[12px]">
          Search by name, code, alias, or source reference and choose one type.
        </Text>
      </View>

      {certificateTypesError ? (
        <Text className="text-destructive">{certificateTypesError}</Text>
      ) : null}

      {certificateTypesLoading ? (
        <Text className="text-muted text-[12px]">
          Loading document types...
        </Text>
      ) : null}

      <View className="gap-2">
        <Text className="text-sm font-medium text-muted">Find type</Text>

        <AnchoredPopover
          open={isDropdownOpen}
          onOpenChange={handleDropdownOpenChange}
          minWidth={DESKTOP_POPOVER_MIN_WIDTH}
          maxWidth={560}
          estimatedHeight={POPOVER_ESTIMATED_HEIGHT}
          backdropClassName="bg-black/45"
          trigger={({ anchorRef, openPopover, isOpen }) => (
            <View ref={anchorRef} collapsable={false}>
              <Pressable
                onPress={openPopover}
                disabled={disabled}
                accessibilityLabel="Open document type selector"
                className={[
                  "h-12 flex-row items-center gap-3 rounded-2xl border border-shellLine bg-shellCanvas px-4",
                  disabled ? "opacity-60" : "",
                ].join(" ")}
              >
                <Ionicons
                  name="search"
                  size={16}
                  className="text-muted"
                />
                <Text
                  numberOfLines={1}
                  className={[
                    "flex-1 text-[14px]",
                    selectedType ? "text-textMain" : "text-muted",
                  ].join(" ")}
                >
                  {triggerLabel}
                </Text>
                <Ionicons
                  name={isOpen ? "chevron-up" : "chevron-down"}
                  size={16}
                  className="text-muted"
                />
              </Pressable>
            </View>
          )}
        >
          <View className="gap-3">
            <View className="flex-row items-center gap-3 rounded-2xl border border-shellLine bg-shellPanel px-4">
              <Ionicons
                name="search"
                size={16}
                className="text-muted"
              />
              <TextInput
                value={typeQuery}
                onChangeText={handleTypeQueryChange}
                placeholder="Search by name, code, alias, or source"
                placeholderTextColor={placeholderColor}
                className="h-12 flex-1 text-textMain web:outline-none"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                editable={!disabled}
              />
              {typeQuery ? (
                <Pressable
                  onPress={handleClearQuery}
                  className="p-1"
                  disabled={disabled}
                >
                  <Ionicons
                    name="close-circle"
                    size={16}
                    className="text-muted"
                  />
                </Pressable>
              ) : null}
              <Pressable onPress={closeDropdown} className="p-1">
                <Ionicons
                  name="close"
                  size={18}
                  className="text-textMain"
                />
              </Pressable>
            </View>

            <View className="rounded-[18px] border border-shellLine bg-shellPanel p-2 gap-1">
              <Text className="px-3 pt-1 text-muted text-[12px]">
                {matchLabel}
              </Text>

              <ScrollView
                className="max-h-[276px]"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View className="gap-1">
                  {filteredTypes.length === 0 ? (
                    <View className="px-3 py-4">
                      <Text className="text-muted text-[12px]">
                        No document types match that search.
                      </Text>
                    </View>
                  ) : (
                    filteredTypes.map((type) => (
                      <CertificateTypeOption
                        key={type.id}
                        type={type}
                        selected={selectedTypeId === type.id}
                        disabled={disabled}
                        onPress={() => handleSelect(type)}
                      />
                    ))
                  )}
                </View>
              </ScrollView>
            </View>
          </View>
        </AnchoredPopover>

        {!selectedType ? (
          <Text className="text-muted text-[12px]">
            Open the selector to search document types.
          </Text>
        ) : null}
      </View>

      {selectedType ? (
        <SelectedCertificateTypeCard
          type={selectedType}
          disabled={disabled}
          onClear={onClear}
        />
      ) : null}
    </View>
  );
}

type CertificateTypeOptionProps = {
  type: CertificateTypeDto;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
};

function CertificateTypeOption({
  type,
  selected,
  disabled,
  onPress,
}: CertificateTypeOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={[
        "rounded-[16px] border px-4 py-3",
        selected
          ? "border-accent bg-accent/10"
          : "border-transparent bg-shellPanelSoft",
        disabled ? "opacity-60" : "",
      ].join(" ")}
    >
      <View className="gap-1">
        <Text className="text-textMain font-semibold text-[13px]">
          {type.name}
        </Text>
        <Text className="text-muted text-[11px]">
          {type.code} - {documentKindLabel(type.documentKind)}
        </Text>
        <View className="mt-1 flex-row flex-wrap gap-1.5">
          <RegistryTablePill
            label={documentKindLabel(type.documentKind)}
            tone={documentKindTone(type.documentKind)}
          />
          <RegistryTablePill
            label={type.requiresExpiry ? "Expiry tracked" : "No expiry"}
            tone={type.requiresExpiry ? "warn" : "neutral"}
          />
          {type.parentCode ? (
            <RegistryTablePill
              label={`Child of ${type.parentCode}`}
              tone="info"
            />
          ) : null}
        </View>
        <Text className="text-muted text-[11px]">
          {sourceReferenceLabel({
            convention: type.convention,
            sourceReference: type.sourceReference,
            variantFlag: type.variantFlag,
          })}
        </Text>
      </View>
    </Pressable>
  );
}

type SelectedCertificateTypeCardProps = {
  type: CertificateTypeDto;
  disabled: boolean;
  onClear: () => void;
};

function SelectedCertificateTypeCard({
  type,
  disabled,
  onClear,
}: SelectedCertificateTypeCardProps) {
  return (
    <View className="rounded-[18px] border border-accent/30 bg-accent/10 p-4 gap-2">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text className="text-textMain font-semibold text-[14px]">
            {type.name}
          </Text>
          <Text className="text-muted text-[12px]">
            {type.code} - {documentKindLabel(type.documentKind)}
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

      <View className="flex-row flex-wrap gap-2">
        <RegistryTablePill
          label={type.requiresExpiry ? "Expiry tracked" : "No expiry required"}
          tone={type.requiresExpiry ? "warn" : "neutral"}
        />
        {type.parentName ? (
          <RegistryTablePill label={`Child of ${type.parentName}`} tone="info" />
        ) : null}
        {type.authority ? (
          <Text className="text-[11px] text-muted">
            Authority: {type.authority}
          </Text>
        ) : null}
        {type.typicalValidityMonths ? (
          <Text className="text-[11px] text-muted">
            Typical validity: {type.typicalValidityMonths} months
          </Text>
        ) : null}
      </View>
      <Text className="text-[11px] text-muted">
        Source:{" "}
        {sourceReferenceLabel({
          convention: type.convention,
          sourceReference: type.sourceReference,
          variantFlag: type.variantFlag,
        })}
      </Text>
    </View>
  );
}
