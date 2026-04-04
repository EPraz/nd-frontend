import { Button, MiniPill, QuickViewModalFrame, Text } from "@/src/components";
import { useToast } from "@/src/context";
import { formatDate, Stat } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Platform, Pressable, View } from "react-native";
import type { CrewDto, CrewStatus } from "../../contracts";
import { useDeleteCrew } from "../../hooks";

type Props = {
  crew: CrewDto;
  projectId: string;
  onClose: () => void;
};

function statusTone(status: CrewStatus) {
  switch (status) {
    case "ACTIVE":
      return { bg: "bg-success/15", text: "text-success", label: "Active" };
    case "INACTIVE":
    default:
      return { bg: "bg-muted/25", text: "text-muted", label: "Inactive" };
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
  const tone = statusTone(crew.status);
  const { submit: deleteCrew, loading: deleting } = useDeleteCrew(
    projectId,
    crew.assetId,
    crew.id,
  );

  const handleOpenVesselCrew = () => {
    onClose();
    router.push(`/projects/${projectId}/vessels/${crew.assetId}/crew`);
  };

  const handleOpenVessel = () => {
    onClose();
    router.push(`/projects/${projectId}/vessels/${crew.assetId}`);
  };

  const handleOpenCertificates = () => {
    onClose();
    router.push(`/projects/${projectId}/vessels/${crew.assetId}/crew/${crew.id}/certificates`);
  };

  async function confirmDelete(): Promise<boolean> {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      return window.confirm(
        "Delete this crew member? This is intended for cleanup and cannot be undone.",
      );
    }

    return new Promise((resolve) => {
      Alert.alert(
        "Delete crew member",
        "This is intended for cleanup and cannot be undone.",
        [
          { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => resolve(true),
          },
        ],
      );
    });
  }

  const handleDelete = async () => {
    const confirmed = await confirmDelete();
    if (!confirmed) return;

    try {
      await deleteCrew();
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
      subtitle="Quick crew snapshot. Open the full profile to manage contract, familiarization, and medical details."
      headerActions={
        <>
          <Button
            variant="softDestructive"
            size="pillSm"
            onPress={handleDelete}
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

          <Button variant="softAccent" size="pillSm" onPress={handleOpenCertificates}>
            Certificates
          </Button>

          <Pressable
            onPress={handleOpenVesselCrew}
            className="rounded-full bg-accent px-5 py-2.5 active:opacity-90"
          >
            <Text className="text-baseBg font-bold">Open Vessel Crew</Text>
          </Pressable>
        </>
      }
      scroll
      maxWidth={980}
    >
      <View className="mt-1 gap-5 web:flex-row">
        <View className="flex-1 gap-2">
          <Text className="text-textMain text-[22px] font-semibold">
            {crew.fullName}
          </Text>

          <View className="flex-row flex-wrap items-center gap-2">
            <View className={`rounded-full px-3 py-1 ${tone.bg}`}>
              <Text className={`text-[12px] font-semibold ${tone.text}`}>
                {tone.label}
              </Text>
            </View>

            <MiniPill>{`Vessel: ${crew.assetName ?? crew.asset?.name ?? "—"}`}</MiniPill>
            {crew.rank ? <MiniPill>{`Rank: ${crew.rank}`}</MiniPill> : null}
            {crew.department ? (
              <MiniPill>{`Department: ${crew.department}`}</MiniPill>
            ) : null}
          </View>

          <Text className="text-textMain/55 text-[13px] leading-[18px]">
            Use this view for a quick operational snapshot before opening the
            full crew profile.
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
              Crew Photo
            </Text>
            <Text className="text-muted text-[12px] mt-1">
              {crew.photoUrl ? "URL available" : "Photo upload comes later"}
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-2 gap-4 flex-col web:flex-row">
        <View className="flex-1 rounded-[22px] border border-border bg-baseBg/35 p-4">
          <Text className="text-textMain font-semibold mb-3">Identity</Text>

          <View className="gap-4 web:flex-row">
            <Stat label="Nationality" value={crew.nationality ?? "—"} />
            <Stat label="Passport" value={crew.passportNumber ?? "—"} />
            <Stat label="Seafarer ID" value={crew.seafarerId ?? "—"} />
          </View>
        </View>

        <View className="flex-1 rounded-[22px] border border-border bg-baseBg/35 p-4">
          <Text className="text-textMain font-semibold mb-3">Operational</Text>

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

      <View className="mt-4 rounded-[22px] border border-border bg-baseBg/35 p-4">
        <Text className="text-textMain font-semibold mb-3">Contract Snapshot</Text>
        <View className="gap-4 web:flex-row">
          <Stat label="Contract" value={crew.contractType ?? "—"} />
          <Stat label="Company" value={crew.operatingCompany ?? "—"} />
          <Stat label="Agency" value={crew.crewManagementAgency ?? "—"} />
          <Stat label="Created" value={formatDate(crew.createdAt)} />
        </View>
      </View>
    </QuickViewModalFrame>
  );
}
