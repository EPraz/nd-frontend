import { Button } from "@/src/components/ui/button/Button";
import { ConfirmModal } from "@/src/components/ui/modal/ConfirmModal";
import { MiniPill } from "@/src/components/ui/miniPill/MiniPill";
import { Text } from "@/src/components/ui/text/Text";
import QuickViewModalFrame from "@/src/components/overlays/QuickViewModalFrame";
import { useToast } from "@/src/context/ToastProvider";
import { formatDate, Stat } from "@/src/helpers";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import type { CrewDto } from "../../contracts";
import { useDeleteCrew } from "../../hooks/useDeleteCrew";
import { crewStatusLabel } from "../../components/crewTable/crew.ui";

type Props = {
  crew: CrewDto;
  projectId: string;
  onClose: () => void;
};

function statusTone(label: string) {
  switch (label) {
    case "ACTIVE":
      return { bg: "bg-success/15", text: "text-success" };
    case "VACATION":
      return { bg: "bg-info/15", text: "text-info" };
    case "INJURED":
      return { bg: "bg-warning/15", text: "text-warning" };
    default:
      return { bg: "bg-muted/25", text: "text-muted" };
  }
}

function medicalLabel(crew: CrewDto): string {
  if (crew.medicalCertificateValid === null) return "Unknown";
  return crew.medicalCertificateValid ? "Valid" : "Not valid";
}

export default function CrewQuickViewModal({
  crew,
  projectId,
  onClose,
}: Props) {
  const router = useRouter();
  const { show } = useToast();
  const label = crewStatusLabel(crew.status, crew.inactiveReason);
  const tone = statusTone(label);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { submit: deleteCrew, loading: deleting } = useDeleteCrew(
    projectId,
    crew.assetId,
    crew.id,
  );

  const handleOpenProfile = () => {
    onClose();
    router.push(`/projects/${projectId}/vessels/${crew.assetId}/crew/${crew.id}`);
  };

  const handleOpenVessel = () => {
    onClose();
    router.push(`/projects/${projectId}/vessels/${crew.assetId}`);
  };

  const handleOpenCertificates = () => {
    onClose();
    router.push(`/projects/${projectId}/vessels/${crew.assetId}/crew/${crew.id}/certificates`);
  };

  const handleDelete = async () => {
    try {
      await deleteCrew();
      setIsDeleteOpen(false);
      show("Crew member deleted", "success");
      onClose();
      router.replace(`/projects/${projectId}/crew`);
    } catch {
      show("Failed to delete crew member", "error");
    }
  };

  const handleEdit = () => {
    onClose();
    router.push(
      `/projects/${projectId}/vessels/${crew.assetId}/crew/${crew.id}/edit`,
    );
  };

  return (
    <QuickViewModalFrame
      portalName={crew.fullName}
      open
      onClose={onClose}
      title="Crew Member"
      subtitle="Quick operational snapshot for the assigned crew member. Open the full profile to manage contract, medical readiness, and leave planning."
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

          <Button
            variant="softAccent"
            size="pillSm"
            onPress={handleOpenCertificates}
          >
            Certificates
          </Button>

          <Pressable
            onPress={handleOpenProfile}
            className="rounded-full bg-accent px-5 py-2.5 active:opacity-90"
          >
            <Text className="font-bold text-baseBg">Open Full Profile</Text>
          </Pressable>
        </>
      }
      scroll
      maxWidth={980}
    >
      <View className="mt-1 gap-5 web:flex-row">
        <View className="flex-1 gap-3">
          <View className="gap-2">
            <Text className="text-[22px] font-semibold text-textMain">
              {crew.fullName}
            </Text>

            <View className="flex-row flex-wrap items-center gap-2">
              <View className={`rounded-full px-3 py-1 ${tone.bg}`}>
                <Text className={`text-[12px] font-semibold ${tone.text}`}>
                  {label}
                </Text>
              </View>

              {crew.rank ? <MiniPill>{`Rank: ${crew.rank}`}</MiniPill> : null}
              {crew.department ? (
                <MiniPill>{`Department: ${crew.department}`}</MiniPill>
              ) : null}
              <MiniPill>{`Vessel: ${crew.assetName ?? crew.asset?.name ?? "—"}`}</MiniPill>
            </View>
          </View>

          <Text className="text-[13px] leading-[18px] text-muted">
            Use this quick view to confirm identity, assignment, and readiness
            before opening the full crew profile.
          </Text>

          <View className="mt-1 flex-row gap-2">
            <Pressable
              onPress={handleOpenVessel}
              className="flex-row items-center gap-2 rounded-full border border-shellLine bg-shellPanelSoft px-4 py-2 active:opacity-80"
            >
              <Ionicons
                name="boat-outline"
                size={16}
                className="text-textMain"
              />
              <Text className="font-semibold text-textMain">Open Vessel</Text>
            </Pressable>
          </View>
        </View>

        <View className="w-full shrink-0 web:w-[360px]">
          <View className="h-[260px] w-full overflow-hidden rounded-[22px] border border-shellLine bg-shellPanelSoft">
            {crew.photoUrl ? (
              <Image
                source={{ uri: crew.photoUrl }}
                contentFit="cover"
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <View className="flex-1 items-center justify-center gap-2 px-4">
                <Ionicons
                  name="person-circle-outline"
                  size={52}
                  className="text-muted"
                />
                <Text className="font-semibold text-textMain">
                  No crew photo
                </Text>
                <Text className="text-center text-[12px] leading-[18px] text-muted">
                  Upload a portrait from the crew profile to replace this
                  fallback.
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View className="mt-2 flex-col gap-4 web:flex-row">
        <View className="flex-1 rounded-[22px] border border-shellLine bg-shellPanelSoft p-4">
          <Text className="mb-3 font-semibold text-textMain">Identity</Text>

          <View className="gap-4 web:flex-row">
            <Stat label="Nationality" value={crew.nationality ?? "—"} />
            <Stat label="Passport" value={crew.passportNumber ?? "—"} />
            <Stat label="Seafarer ID" value={crew.seafarerId ?? "—"} />
          </View>
        </View>

        <View className="flex-1 rounded-[22px] border border-shellLine bg-shellPanelSoft p-4">
          <Text className="mb-3 font-semibold text-textMain">Readiness</Text>

          <View className="gap-4 web:flex-row">
            <Stat label="Medical" value={medicalLabel(crew)} />
            <Stat label="Embarkation" value={formatDate(crew.dateOfEmbarkation)} />
            <Stat
              label="Disembarkation"
              value={formatDate(crew.expectedDateOfDisembarkation)}
            />
          </View>
        </View>
      </View>

      <View className="mt-4 rounded-[22px] border border-shellLine bg-shellPanelSoft p-4">
        <Text className="mb-3 font-semibold text-textMain">Operational Notes</Text>
        <View className="gap-4 web:flex-row">
          <Stat label="Inactive reason" value={crew.inactiveReason ?? "—"} />
          <Stat label="Next vacation" value={formatDate(crew.nextVacationDate)} />
          <Stat label="Company" value={crew.operatingCompany ?? "—"} />
          <Stat label="Agency" value={crew.crewManagementAgency ?? "—"} />
        </View>
      </View>

      <ConfirmModal
        visible={isDeleteOpen}
        title="Delete crew member"
        message={`Are you sure you want to delete ${crew.fullName}?`}
        confirmLabel="Delete crew member"
        cancelLabel="Keep crew member"
        variant="destructive"
        loading={deleting}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </QuickViewModalFrame>
  );
}
