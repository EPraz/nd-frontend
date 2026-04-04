import { Button, MiniPill, QuickViewModalFrame, Stat, Text } from "@/src/components";
import { formatDate } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { CertificateDto, CertificateStatus } from "../../contracts";
import {
  CertificateStatusPill,
  RequirementStatusPill,
  WorkflowStatusPill,
} from "../../components/certificateTable/certificates.ui";

type Props = {
  certificate: CertificateDto;
  projectId: string;
  onClose: () => void;
};

function daysUntil(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;

  const now = new Date();
  const ms = d.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function statusLabel(status: CertificateStatus) {
  switch (status) {
    case "VALID":
      return "Valid";
    case "EXPIRING_SOON":
      return "Expiring soon";
    case "EXPIRED":
      return "Expired";
    case "PENDING":
    default:
      return "Pending";
  }
}

export default function CertificateQuickViewModal({
  certificate,
  projectId,
  onClose,
}: Props) {
  const router = useRouter();
  const expiryMeta = (() => {
    const d = daysUntil(certificate.expiryDate);
    if (d === null) return "—";
    if (d < 0) return `${Math.abs(d)} day(s) overdue`;
    return `${d} day(s) remaining`;
  })();

  const handleOpenVesselCertificates = () => {
    onClose();
    router.push(
      `/projects/${projectId}/vessels/${certificate.assetId}/certificates`,
    );
  };

  const handleOpenVessel = () => {
    onClose();
    router.push(`/projects/${projectId}/vessels/${certificate.assetId}`);
  };

  const handleEdit = () => {
    onClose();
    router.push(
      `/projects/${projectId}/vessels/${certificate.assetId}/certificates/${certificate.id}/edit`,
    );
  };

  return (
    <QuickViewModalFrame
      portalName={certificate.certificateName}
      open={true}
      onClose={onClose}
      title="Certificate Details"
      subtitle="Quick structured snapshot. Open the vessel certificates page for full management."
      headerActions={
        <>
          <Button
            variant="softAccent"
            size="pillSm"
            onPress={handleEdit}
            leftIcon={
              <Ionicons
                name="create-outline"
                size={16}
                className="text-accent"
              />
            }
          >
            Edit
          </Button>

          <Button
            variant="soft"
            size="icon"
            onPress={onClose}
            accessibilityLabel="Close modal"
            leftIcon={
              <Ionicons name="close" size={18} className="text-textMain" />
            }
          />
        </>
      }
      footer={
        <>
          <Button variant="outline" size="pillSm" onPress={onClose}>
            Close
          </Button>

          <Pressable
            onPress={handleOpenVesselCertificates}
            className="rounded-full bg-accent px-5 py-2.5 active:opacity-90"
          >
            <Text className="font-bold">Open Vessel Certificates</Text>
          </Pressable>
        </>
      }
      scroll
      maxWidth={980}
    >
      <View className="mt-1 gap-5 web:flex-row">
        <View className="flex-1 gap-2">
          <Text className="text-textMain text-[22px] font-semibold">
            {certificate.certificateName}
          </Text>

          <View className="flex-row flex-wrap items-center gap-2">
            <CertificateStatusPill status={certificate.status} />
            <WorkflowStatusPill status={certificate.workflowStatus} />
            <RequirementStatusPill status={certificate.requirementStatus ?? null} />
          </View>

          <View className="flex-row flex-wrap gap-2">
            <MiniPill>{`Code: ${certificate.certificateCode}`}</MiniPill>
            <MiniPill>{`Vessel: ${certificate.assetName}`}</MiniPill>
            <MiniPill>{`Attachments: ${certificate.attachmentCount}`}</MiniPill>
          </View>

          <Text className="text-textMain/55 text-[13px] leading-[18px]">
            Structured certificate record with workflow and requirement context.
          </Text>

          <View className="mt-2 flex-row gap-2">
            <Pressable
              onPress={handleOpenVessel}
              className="flex-row items-center gap-2 rounded-full border border-border bg-baseBg/35 px-4 py-2 active:opacity-80"
            >
              <Ionicons
                name="boat-outline"
                size={16}
                className="text-textMain"
              />
              <Text className="text-textMain font-semibold">Open Vessel</Text>
            </Pressable>
          </View>
        </View>

        <View className="w-full web:w-[360px] shrink-0">
          <View className="h-[260px] w-full overflow-hidden rounded-[22px] border border-border bg-baseBg/35 items-center justify-center">
            <Text className="text-textMain text-[20px] font-semibold">
              Attachment Preview
            </Text>
            <Text className="text-muted text-[12px] mt-1">
              {certificate.attachmentCount > 0
                ? `${certificate.attachmentCount} file(s)`
                : "No files yet"}
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-2 gap-4 flex-col web:flex-row">
        <View className="flex-1 rounded-[22px] border border-border bg-baseBg/35 p-4">
          <Text className="text-textMain font-semibold mb-3">Validity</Text>

          <View className="gap-4 web:flex-row">
            <Stat label="Issue Date" value={formatDate(certificate.issueDate)} />
            <Stat label="Expiry Date" value={formatDate(certificate.expiryDate)} />
            <Stat label="Expiry Window" value={expiryMeta} />
          </View>
        </View>

        <View className="flex-1 rounded-[22px] border border-border bg-baseBg/35 p-4">
          <Text className="text-textMain font-semibold mb-3">Metadata</Text>

          <View className="gap-4 web:flex-row">
            <Stat label="Issuer" value={certificate.issuer ?? "—"} />
            <Stat label="Number" value={certificate.number ?? "—"} />
            <Stat label="Status" value={statusLabel(certificate.status)} />
          </View>
        </View>
      </View>
    </QuickViewModalFrame>
  );
}
