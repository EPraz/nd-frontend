import { Text } from "@/src/components";
import type {
  CertificateStatus,
  CertificateWorkflowStatus,
  RequirementStatus,
} from "@/src/features/certificates/contracts/certificates.contract";
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

export function WorkflowStatusPill(props: { status: CertificateWorkflowStatus }) {
  const tone: Record<CertificateWorkflowStatus, string> = {
    DRAFT: "bg-muted/15 text-muted",
    SUBMITTED: "bg-info/15 text-info",
    APPROVED: "bg-success/15 text-success",
    REJECTED: "bg-destructive/15 text-destructive",
    ARCHIVED: "bg-secondary/20 text-secondary-foreground",
  };

  return (
    <View className={`px-3 py-1 rounded-full w-fit ${tone[props.status]}`}>
      <Text className="text-xs font-medium">{props.status}</Text>
    </View>
  );
}

export function RequirementStatusPill(props: {
  status?: RequirementStatus | null;
}) {
  if (!props.status) {
    return (
      <View className="px-3 py-1 rounded-full w-fit bg-muted/10">
        <Text className="text-xs font-medium text-muted">N/A</Text>
      </View>
    );
  }

  const tone: Record<RequirementStatus, string> = {
    REQUIRED: "bg-warning/15 text-warning",
    MISSING: "bg-destructive/15 text-destructive",
    UNDER_REVIEW: "bg-info/15 text-info",
    PROVIDED: "bg-success/15 text-success",
    EXPIRED: "bg-destructive/15 text-destructive",
    EXEMPT: "bg-secondary/20 text-secondary-foreground",
  };

  return (
    <View className={`px-3 py-1 rounded-full w-fit ${tone[props.status]}`}>
      <Text className="text-xs font-medium">{props.status}</Text>
    </View>
  );
}
