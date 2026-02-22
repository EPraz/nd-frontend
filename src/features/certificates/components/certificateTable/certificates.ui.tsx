import { Text } from "@/src/components";
import type { CertificateStatus } from "@/src/features/certificates/contracts/certificates.contract";
import { View } from "react-native";

export function CertificateStatusPill(props: { status: CertificateStatus }) {
  const s = props.status;

  const pillBg: Record<CertificateStatus, string> = {
    VALID: "bg-success/15",
    EXPIRING_SOON: "bg-warning/15",
    EXPIRED: "bg-destructive/15",
    PENDING: "bg-muted/15",
  };

  const pillText: Record<CertificateStatus, string> = {
    VALID: "text-success",
    EXPIRING_SOON: "text-warning",
    EXPIRED: "text-destructive",
    PENDING: "text-info",
  };

  return (
    <View className={`px-3 py-1 rounded-full w-fit ${pillBg[s]}`}>
      <Text className={`text-xs font-medium ${pillText[s]}`}>{s}</Text>
    </View>
  );
}
