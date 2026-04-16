import { Button } from "@/src/components/ui/button/Button";
import { ConfirmModal } from "@/src/components/ui/modal/ConfirmModal";
import { MiniPill } from "@/src/components/ui/miniPill/MiniPill";
import { Text } from "@/src/components/ui/text/Text";
import QuickViewModalFrame from "@/src/components/overlays/QuickViewModalFrame";
import { useToast } from "@/src/context/ToastProvider";
import type { AssetDto } from "@/src/contracts/assets.contract";
import { formatDate, Stat } from "@/src/helpers";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { useDeleteVessel } from "../../hooks/useDeleteVessel";
import { useVesselSummary } from "../../hooks/useVesselSummary";

type Props = {
  vessel: AssetDto;
  projectId: string;
  onClose: () => void;
};

function displayIdentifier(vessel: AssetDto) {
  if (vessel.vessel?.identifierType === "LICENSE") {
    return vessel.vessel?.licenseNumber
      ? `License ${vessel.vessel.licenseNumber}`
      : "-";
  }

  return vessel.vessel?.imo ? `IMO ${vessel.vessel.imo}` : "-";
}

export default function VesselQuickViewModal({
  vessel,
  projectId,
  onClose,
}: Props) {
  const router = useRouter();
  const { show } = useToast();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { submit: deleteVessel, loading: deleting } = useDeleteVessel(
    projectId,
    vessel.id,
  );
  const {
    data: summary,
    loading: summaryLoading,
    error: summaryError,
  } = useVesselSummary(projectId, vessel.id);

  const profile = vessel.vessel;

  const handleOpenPage = () => {
    onClose();
    router.push(`/projects/${projectId}/vessels/${vessel.id}`);
  };

  const handleEdit = () => {
    onClose();
    router.push(`/projects/${projectId}/vessels/${vessel.id}/edit`);
  };

  const handleDelete = async () => {
    try {
      await deleteVessel();
      setIsDeleteOpen(false);
      show("Vessel deleted", "success");
      onClose();
      router.replace(`/projects/${projectId}/vessels`);
    } catch {
      show("Failed to delete vessel", "error");
    }
  };

  return (
    <QuickViewModalFrame
      portalName={vessel.name}
      open
      onClose={onClose}
      title="Vessel"
      subtitle="Quick operational snapshot for the vessel profile. Open the full page to work on certificates, crew, maintenance, and the vessel shell."
      headerActions={
        <>
          <Button
            variant="softDestructive"
            size="pillSm"
            onPress={() => setIsDeleteOpen(true)}
            disabled={deleting}
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

          <Button variant="default" size="pillSm" onPress={handleOpenPage}>
            Open Full Page
          </Button>
        </>
      }
      scroll
      maxWidth={980}
    >
      <View className="mt-1 gap-5 web:flex-row">
        <View className="flex-1 gap-3">
          <View className="gap-2">
            <Text className="text-[22px] font-semibold text-textMain">
              {vessel.name}
            </Text>

            <View className="flex-row flex-wrap items-center gap-2">
              <MiniPill>{`Status: ${vessel.status ?? "-"}`}</MiniPill>
              <MiniPill>{`Flag: ${profile?.flag ?? "-"}`}</MiniPill>
              <MiniPill>{displayIdentifier(vessel)}</MiniPill>
              {profile?.vesselType ? (
                <MiniPill>{`Type: ${profile.vesselType}`}</MiniPill>
              ) : null}
            </View>
          </View>

          <Text className="text-[13px] leading-[18px] text-muted">
            Use this quick view to confirm the vessel identity, operational
            contact, and current readiness before opening the full vessel shell.
          </Text>

          <View className="gap-3 rounded-[22px] border border-shellLine bg-shellPanelSoft p-4">
            <Text className="font-semibold text-textMain">Profile at a glance</Text>
            <View className="gap-4 web:flex-row">
              <Stat label="Vessel Email" value={profile?.email ?? "-"} />
              <Stat label="Home Port" value={profile?.homePort ?? "-"} />
              <Stat label="Call Sign" value={profile?.callSign ?? "-"} />
              <Stat
                label="Year Built"
                value={profile?.yearBuilt ? String(profile.yearBuilt) : "-"}
              />
            </View>
          </View>
        </View>

        <View className="w-full shrink-0 web:w-[360px]">
          <View className="h-[260px] w-full overflow-hidden rounded-[22px] border border-shellLine bg-shellPanelSoft">
            {vessel.imageUrl ? (
              <Image
                source={{ uri: vessel.imageUrl }}
                contentFit="cover"
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <View className="flex-1 items-center justify-center gap-2 px-4">
                <Ionicons
                  name="boat-outline"
                  size={48}
                  className="text-muted"
                />
                <Text className="font-semibold text-textMain">
                  No vessel image
                </Text>
                <Text className="text-center text-[12px] leading-[18px] text-muted">
                  Upload a vessel image from edit mode to replace this fallback.
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View className="mt-2 flex-col gap-4 web:flex-row">
        <View className="flex-1 rounded-[22px] border border-shellLine bg-shellPanelSoft p-4">
          <Text className="mb-3 font-semibold text-textMain">
            Operational Insight
          </Text>

          <View className="gap-4 web:flex-row">
            <Stat
              label="Crew onboard"
              value={summaryLoading ? "..." : String(summary?.crew.active ?? 0)}
            />
            <Stat
              label="Open maintenance"
              value={
                summaryLoading
                  ? "..."
                  : String(
                      (summary?.maintenance.open ?? 0) +
                        (summary?.maintenance.inProgress ?? 0),
                    )
              }
            />
            <Stat
              label="Overdue"
              value={
                summaryLoading ? "..." : String(summary?.maintenance.overdue ?? 0)
              }
            />
          </View>
        </View>

        <View className="flex-1 rounded-[22px] border border-shellLine bg-shellPanelSoft p-4">
          <Text className="mb-3 font-semibold text-textMain">
            Compliance Snapshot
          </Text>

          <View className="gap-4 web:flex-row">
            <Stat
              label="Certificates"
              value={summaryLoading ? "..." : String(summary?.certificates.total ?? 0)}
            />
            <Stat
              label="Expiring soon"
              value={
                summaryLoading
                  ? "..."
                  : String(summary?.certificates.expiringSoon ?? 0)
              }
            />
            <Stat
              label="Last fuel event"
              value={
                summaryLoading
                  ? "..."
                  : formatDate(summary?.fuel.lastEventAt ?? null)
              }
            />
          </View>
        </View>
      </View>

      {summaryError ? (
        <Text className="text-destructive">{summaryError}</Text>
      ) : null}

      <ConfirmModal
        visible={isDeleteOpen}
        title="Delete vessel"
        message={`Are you sure you want to delete ${vessel.name}?`}
        confirmLabel="Delete vessel"
        cancelLabel="Keep vessel"
        variant="destructive"
        loading={deleting}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </QuickViewModalFrame>
  );
}
