import { Button, QuickViewModalFrame, Text } from "@/src/components";
import { formatDate, MiniPill, Stat } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { CertificateDto, CertificateStatus } from "../../contracts";

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

function statusTone(status: CertificateStatus) {
  switch (status) {
    case "VALID":
      return { bg: "bg-success/15", text: "text-success", label: "Valid" };
    case "EXPIRING_SOON":
      return {
        bg: "bg-warning/15",
        text: "text-warning",
        label: "Expiring soon",
      };
    case "EXPIRED":
      return {
        bg: "bg-destructive/15",
        text: "text-destructive",
        label: "Expired",
      };
    case "PENDING":
    default:
      return { bg: "bg-info/15", text: "text-info", label: "Pending" };
  }
}

export default function CertificateQuickViewModal({
  certificate,
  projectId,
  onClose,
}: Props) {
  const router = useRouter();

  const tone = statusTone(certificate.status);

  const exp = formatDate(certificate.expiryDate);
  const iss = formatDate(certificate.issueDate);

  const d = daysUntil(certificate.expiryDate);
  const expiryMeta =
    d === null
      ? "—"
      : d < 0
        ? `${Math.abs(d)} day(s) overdue`
        : `${d} day(s) remaining`;

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

  // Placeholder
  const handleDelete = () => {
    // TODO: confirm dialog + delete endpoint
  };

  const handleEdit = () => {
    onClose();
    router.push(
      `/projects/${projectId}/vessels/${certificate.assetId}/certificates/${certificate.id}/edit`,
    );
  };

  return (
    <QuickViewModalFrame
      portalName={certificate.name}
      open={true}
      onClose={onClose}
      title="Certificate Details"
      subtitle="Quick compliance snapshot. Open the vessel certificates page for full management."
      headerActions={
        <>
          <Button
            variant="softDestructive"
            size="pillSm"
            onPress={handleDelete}
            leftIcon={
              <Ionicons
                name="trash-outline"
                size={16}
                className="text-destructive"
              />
            }
          >
            Delete
          </Button>

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
            Edit Vessel
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
      {/* Top content */}
      <View className="mt-1 gap-5 web:flex-row">
        {/* Left info */}
        <View className="flex-1 gap-2">
          <Text className="text-textMain text-[22px] font-semibold">
            {certificate.name}
          </Text>

          <View className="flex-row flex-wrap items-center gap-2">
            <View className={`rounded-full px-3 py-1 ${tone.bg}`}>
              <Text className={`text-[12px] font-semibold ${tone.text}`}>
                {tone.label}
              </Text>
            </View>

            <MiniPill>{`Certificate ID: ${certificate.id}`}</MiniPill>
            <MiniPill>{`Vessel: ${certificate.assetName}`}</MiniPill>
          </View>

          <Text className="text-textMain/55 text-[13px] leading-[18px]">
            Monitor validity and expiry. Use the vessel page for renewals and
            document management.
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

        {/* Right preview placeholder */}
        <View className="w-full web:w-[360px] shrink-0">
          <View className="h-[260px] w-full overflow-hidden rounded-[22px] border border-border bg-baseBg/35 items-center justify-center">
            <Text className="text-textMain text-[20px] font-semibold">
              PDF Preview
            </Text>
            <Text className="text-muted text-[12px] mt-1">(upload later)</Text>
          </View>
        </View>
      </View>

      {/* Main stats */}
      <View className="mt-2 gap-4 flex-col web:flex-row">
        <View className="flex-1 rounded-[22px] border border-border bg-baseBg/35 p-4">
          <Text className="text-textMain font-semibold mb-3">Validity</Text>

          <View className="gap-4 web:flex-row">
            <Stat label="Issue Date" value={iss} />
            <Stat label="Expiry Date" value={exp} />
            <Stat label="Expiry Window" value={expiryMeta} />
          </View>
        </View>

        <View className="flex-1 rounded-[22px] border border-border bg-baseBg/35 p-4">
          <Text className="text-textMain font-semibold mb-3">Metadata</Text>

          <View className="gap-4 web:flex-row">
            <Stat label="Issuer" value={certificate.issuer ?? "—"} />
            <Stat label="Number" value={certificate.number ?? "—"} />
            <Stat label="Status" value={tone.label} />
          </View>
        </View>
      </View>
    </QuickViewModalFrame>
  );
}
