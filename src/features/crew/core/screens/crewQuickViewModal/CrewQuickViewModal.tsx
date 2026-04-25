import {
  QuickViewFooterActions,
  QuickViewHeaderActions,
  QuickViewLeadSection,
  QuickViewMediaPanel,
  QuickViewModalFrame,
  QuickViewSummaryBadge,
  Text,
} from "@/src/components";
import { ConfirmModal } from "@/src/components/ui/modal/ConfirmModal";
import {
  RegistrySummaryStrip,
  type RegistrySummaryItem,
} from "@/src/components/ui/registryWorkspace";
import { useSessionContext } from "@/src/context/SessionProvider";
import { useToast } from "@/src/context/ToastProvider";
import { formatDate } from "@/src/helpers";
import { canUser } from "@/src/security/rolePermissions";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import type { CrewDto } from "../../contracts";
import CrewPhotoMedia from "../../components/crewPhotoMedia/CrewPhotoMedia";
import { useDeleteCrew } from "../../hooks/useDeleteCrew";

type Props = {
  crew: CrewDto;
  projectId: string;
  onClose: () => void;
};

function crewStatusLabel(crew: CrewDto) {
  if (crew.status === "INACTIVE" && crew.inactiveReason) {
    return crew.inactiveReason;
  }
  return crew.status;
}

function humanize(value: string | null | undefined, fallback = "-") {
  if (!value) return fallback;
  return value
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function statusTone(
  crew: CrewDto,
): "ok" | "warn" | "danger" | "info" | "neutral" {
  if (crew.status === "ACTIVE") return "ok";
  if (crew.inactiveReason === "VACATION") return "info";
  if (crew.inactiveReason === "INJURED") return "warn";
  return "neutral";
}

function medicalSummary(crew: CrewDto) {
  if (crew.medicalCertificateValid === null) return "Unknown";
  return crew.medicalCertificateValid ? "Valid" : "Needs attention";
}

function medicalTone(crew: CrewDto): "ok" | "warn" | "danger" | "info" {
  if (crew.medicalCertificateValid === true) return "ok";
  if (crew.medicalCertificateValid === false) return "danger";
  return "info";
}

export default function CrewQuickViewModal({
  crew,
  projectId,
  onClose,
}: Props) {
  const router = useRouter();
  const { show } = useToast();
  const { session } = useSessionContext();
  const canEditCrew = canUser(session, "OPERATIONAL_WRITE");
  const canDeleteCrew = canUser(session, "OPERATIONAL_SOFT_DELETE");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { submit: deleteCrew, loading: deleting } = useDeleteCrew(
    projectId,
    crew.assetId,
    crew.id,
  );

  const vesselName = crew.assetName ?? crew.asset?.name ?? "-";
  const label = humanize(crewStatusLabel(crew));

  const profileSummaryItems: RegistrySummaryItem[] = [
    {
      label: "Nationality",
      value: crew.nationality ?? "-",
      helper: "Country of record",
      tone: "info",
    },
    {
      label: "Passport",
      value: crew.passportNumber ?? "-",
      helper: "Travel document",
      tone: "accent",
    },
    {
      label: "Seafarer ID",
      value: crew.seafarerId ?? "-",
      helper: "Registry identity",
      tone: "warn",
    },
    {
      label: "Rank",
      value: crew.rank ?? "-",
      helper: "Current assignment",
      tone: "ok",
    },
  ];

  const readinessSummaryItems: RegistrySummaryItem[] = [
    {
      label: "Medical",
      value: medicalSummary(crew),
      helper: "Medical certificate state",
      tone: medicalTone(crew),
    },
    {
      label: "Embarkation",
      value: formatDate(crew.dateOfEmbarkation),
      helper: crew.portOfEmbarkation ?? "Boarding date",
      tone: "info",
    },
    {
      label: "Disembarkation",
      value: formatDate(crew.expectedDateOfDisembarkation),
      helper: "Expected offboarding",
      tone: "warn",
    },
  ];

  const assignmentSummaryItems: RegistrySummaryItem[] = [
    {
      label: "Department",
      value: humanize(crew.department),
      helper: "Working lane",
      tone: "accent",
    },
    {
      label: "Company",
      value: crew.operatingCompany ?? "-",
      helper: "Operating company",
      tone: "ok",
    },
    {
      label: "Agency",
      value: crew.crewManagementAgency ?? "-",
      helper: "Crew manager",
      tone: "info",
    },
  ];

  const handleOpenProfile = () => {
    onClose();
    router.push(`/projects/${projectId}/vessels/${crew.assetId}/crew/${crew.id}`);
  };

  const handleOpenCertificates = () => {
    onClose();
    router.push(
      `/projects/${projectId}/vessels/${crew.assetId}/crew/${crew.id}/certificates`,
    );
  };

  const handleEdit = () => {
    onClose();
    router.push(
      `/projects/${projectId}/vessels/${crew.assetId}/crew/${crew.id}/edit`,
    );
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

  return (
    <QuickViewModalFrame
      portalName={crew.fullName}
      open
      onClose={onClose}
      title="Crew profile"
      subtitle="Identity, assignment, and readiness snapshot for the active crew member."
      headerActions={
        <QuickViewHeaderActions
          onClose={onClose}
          actions={[
            ...(canDeleteCrew
              ? [
                  {
                    label: "Delete",
                    onPress: () => setIsDeleteOpen(true),
                    variant: "softDestructive" as const,
                    disabled: deleting,
                    leftIcon: (
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        className="text-destructive"
                      />
                    ),
                  },
                ]
              : []),
            ...(canEditCrew
              ? [
                  {
                    label: "Edit",
                    onPress: handleEdit,
                    variant: "softAccent" as const,
                    leftIcon: (
                      <Ionicons
                        name="create-outline"
                        size={16}
                        className="text-accent"
                      />
                    ),
                  },
                ]
              : []),
          ]}
        />
      }
      footer={
        <QuickViewFooterActions
          onClose={onClose}
          actions={[
            {
              label: "Certificates",
              onPress: handleOpenCertificates,
              variant: "softAccent",
            },
            {
              label: "Open Full Profile",
              onPress: handleOpenProfile,
            },
          ]}
        />
      }
      scroll
      maxWidth={860}
    >
      <View className="gap-2.5">
        <QuickViewLeadSection
          asideWidth={280}
          main={
            <>
              <View className="gap-1.5">
                <View className="gap-1">
                  <Text className="text-[24px] font-semibold text-textMain">
                    {crew.fullName}
                  </Text>
                  <Text className="text-[12px] text-muted">
                    {crew.rank ?? "Crew member"} | {humanize(crew.department)} |{" "}
                    {vesselName}
                  </Text>
                </View>

                <View className="flex-row flex-wrap items-center gap-1.5">
                  <QuickViewSummaryBadge
                    label={`Status: ${label}`}
                    tone={statusTone(crew)}
                  />
                  <QuickViewSummaryBadge
                    label={`Medical: ${medicalSummary(crew)}`}
                    tone={medicalTone(crew)}
                  />
                  <QuickViewSummaryBadge
                    label={`Vessel: ${vesselName}`}
                    tone="info"
                  />
                </View>
              </View>

              <Text className="max-w-[620px] text-[12px] leading-[16px] text-muted">
                Use this quick view to confirm identity, vessel assignment, and
                operational readiness before opening the full crew profile.
              </Text>
            </>
          }
          aside={
            <QuickViewMediaPanel className="h-[128px]">
              {crew.photoUrl ? (
                <CrewPhotoMedia
                  uri={crew.photoUrl}
                  stageClassName="rounded-[14px]"
                />
              ) : (
                <View className="h-full flex-row items-center gap-3 px-4">
                  <View className="rounded-full border border-shellLine bg-shellPanel px-3 py-3">
                    <Ionicons
                      name="person-circle-outline"
                      size={30}
                      className="text-textMain"
                    />
                  </View>

                  <View className="min-w-0 flex-1 gap-0.5">
                    <Text className="text-[15px] font-semibold text-textMain">
                      No crew photo
                    </Text>
                    <Text className="text-[11px] leading-[15px] text-muted">
                      Add a portrait from edit mode to replace this fallback.
                    </Text>
                  </View>
                </View>
              )}
            </QuickViewMediaPanel>
          }
        />

        <View className="mt-4 gap-1.5">
          <Text className="text-[14px] font-semibold text-textMain">
            Profile at a glance
          </Text>
          <RegistrySummaryStrip
            items={profileSummaryItems}
            size="compact"
            columns={4}
          />
        </View>
      </View>

      <View className="mt-1 flex-col gap-3 web:flex-row">
        <View className="flex-1 gap-1.5">
          <Text className="text-[14px] font-semibold text-textMain">
            Readiness Snapshot
          </Text>
          <RegistrySummaryStrip
            items={readinessSummaryItems}
            size="compact"
            columns={3}
          />
        </View>

        <View className="flex-1 gap-1.5">
          <Text className="text-[14px] font-semibold text-textMain">
            Assignment Snapshot
          </Text>
          <RegistrySummaryStrip
            items={assignmentSummaryItems}
            size="compact"
            columns={3}
          />
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
