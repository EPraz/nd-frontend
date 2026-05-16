import { Text } from "@/src/components/ui/text/Text";
import type { CertificateDto } from "@/src/features/certificates/shared";
import { humanizeTechnicalLabel } from "@/src/helpers/humanizeTechnicalLabel";
import { Pressable, View } from "react-native";

type Props = {
  options: CertificateDto[];
  selectedParent: CertificateDto | null;
  selectedTypeName: string;
  selectedDocumentKind: string;
  configurationMissing: boolean;
  hasIneligibleCandidates: boolean;
  loading: boolean;
  disabled: boolean;
  onSelect: (certificate: CertificateDto) => void;
  onClear: () => void;
};

export function ParentCertificateSelector({
  options,
  selectedParent,
  selectedTypeName,
  selectedDocumentKind,
  configurationMissing,
  hasIneligibleCandidates,
  loading,
  disabled,
  onSelect,
  onClear,
}: Props) {
  const emptyParentMessage = hasIneligibleCandidates
    ? `A matching principal certificate exists for ${selectedTypeName}, but it is not eligible yet.`
    : `No matching parent certificate is loaded for ${selectedTypeName}. Create or confirm the principal certificate first, then return to this document.`;

  return (
    <View className="gap-3 rounded-[20px] border border-info/30 bg-info/10 p-4">
      <View className="gap-1">
        <Text className="text-[13px] font-semibold text-textMain">
          Principal certificate *
        </Text>
        <Text className="text-[12px] leading-[18px] text-muted">
          Link this {selectedDocumentKind.toLowerCase()} to the principal
          certificate it supports.
        </Text>
      </View>

      {configurationMissing ? (
        <View className="gap-1 rounded-[16px] border border-warning/35 bg-warning/12 p-3">
          <Text className="text-[12px] leading-[18px] text-warning">
            Parent document type is not configured for this document type.
          </Text>
          <Text className="text-[12px] leading-[18px] text-muted">
            Update the document catalog before confirming this child document.
          </Text>
        </View>
      ) : loading && options.length === 0 ? (
        <View className="rounded-[16px] border border-info/30 bg-info/10 p-3">
          <Text className="text-[12px] leading-[18px] text-info">
            Loading eligible principal certificates...
          </Text>
        </View>
      ) : options.length === 0 ? (
        <View className="rounded-[16px] border border-warning/35 bg-warning/12 p-3">
          <Text className="text-[12px] leading-[18px] text-warning">
            {emptyParentMessage}
          </Text>
          {hasIneligibleCandidates ? (
            <Text className="mt-1 text-[12px] leading-[18px] text-muted">
              It must be submitted or approved, and valid or expiring soon,
              before confirming this child document.
            </Text>
          ) : null}
        </View>
      ) : (
        <View className="gap-2">
          {options.map((certificate) => {
            const selected = selectedParent?.id === certificate.id;

            return (
              <Pressable
                key={certificate.id}
                disabled={disabled}
                onPress={() => onSelect(certificate)}
                className={[
                  "rounded-[16px] border px-4 py-3",
                  selected
                    ? "border-info bg-info/14"
                    : "border-shellLine bg-shellPanelSoft",
                  disabled ? "opacity-60" : "",
                ].join(" ")}
              >
                <View className="gap-1">
                  <Text className="text-[13px] font-semibold text-textMain">
                    {certificate.certificateName}
                  </Text>
                  <Text className="text-[11px] text-muted">
                    {certificate.certificateCode}
                    {certificate.number ? ` - ${certificate.number}` : ""}
                  </Text>
                  <Text className="text-[11px] text-muted">
                    {humanizeTechnicalLabel(certificate.workflowStatus)} /{" "}
                    {humanizeTechnicalLabel(certificate.status)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {selectedParent ? (
        <Pressable
          disabled={disabled}
          onPress={onClear}
          className="self-start rounded-full border border-info/30 px-3 py-1"
        >
          <Text className="text-[12px] font-semibold text-info">
            Clear parent
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
