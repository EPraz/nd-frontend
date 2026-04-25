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
import type { AssetDto } from "@/src/contracts/assets.contract";
import { VesselImageMedia } from "@/src/features/vessels/shared";
import { formatDate } from "@/src/helpers";
import { canUser } from "@/src/security/rolePermissions";
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
  const { session } = useSessionContext();
  const canEditVessel = canUser(session, "OPERATIONAL_WRITE");
  const canDeleteVessel = canUser(session, "OPERATIONAL_SOFT_DELETE");
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
  const lastFuelEvent = formatDate(summary?.fuel.lastEventAt ?? null);
  const profileSummaryItems: RegistrySummaryItem[] = [
    {
      label: "Vessel Email",
      value: profile?.email ?? "-",
      helper: "Operational contact",
      tone: "info" as const,
    },
    {
      label: "Call Sign",
      value: profile?.callSign ?? "-",
      helper: "Primary radio identity",
      tone: "accent" as const,
    },
    {
      label: "Year Built",
      value: profile?.yearBuilt ? String(profile.yearBuilt) : "-",
      helper: "Construction year",
      tone: "warn" as const,
    },
    {
      label: "Identifier",
      value: displayIdentifier(vessel),
      helper: "Registry reference",
      tone: "ok" as const,
    },
  ];
  const operationalInsightItems: RegistrySummaryItem[] = [
    {
      label: "Crew onboard",
      value: summaryLoading ? "..." : String(summary?.crew.active ?? 0),
      helper: "Assigned and active",
      tone: "ok" as const,
    },
    {
      label: "Open maintenance",
      value: summaryLoading
        ? "..."
        : String(
            (summary?.maintenance.open ?? 0) +
              (summary?.maintenance.inProgress ?? 0),
          ),
      helper: "Open + in progress",
      tone: "warn" as const,
    },
    {
      label: "Overdue",
      value: summaryLoading ? "..." : String(summary?.maintenance.overdue ?? 0),
      helper: "Needs attention now",
      tone: summary?.maintenance.overdue ? "danger" : ("info" as const),
    },
  ];
  const complianceSummaryItems: RegistrySummaryItem[] = [
    {
      label: "Certificates",
      value: summaryLoading ? "..." : String(summary?.certificates.total ?? 0),
      helper: "Tracked records",
      tone: "info" as const,
    },
    {
      label: "Expiring soon",
      value: summaryLoading
        ? "..."
        : String(summary?.certificates.expiringSoon ?? 0),
      helper: "Upcoming action",
      tone: summary?.certificates.expiringSoon ? "warn" : ("ok" as const),
    },
    {
      label: "Last fuel event",
      value: summaryLoading ? "..." : lastFuelEvent,
      helper: "Latest logged entry",
      tone: "accent" as const,
    },
  ];

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
      eyebrow=""
      title="Vessel profile"
      subtitle="Identity, readiness, and compliance snapshot for the active vessel."
      headerActions={
        <QuickViewHeaderActions
          onClose={onClose}
          actions={[
            ...(canDeleteVessel
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
            ...(canEditVessel
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
              label: "Open Vessel Shell",
              onPress: handleOpenPage,
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
                    {vessel.name}
                  </Text>
                  <Text className="text-[12px] text-muted">
                    {displayIdentifier(vessel)} | {profile?.flag ?? "-"} |{" "}
                    {profile?.vesselType ?? "Vessel profile"}
                  </Text>
                </View>

                <View className="flex-row flex-wrap items-center gap-1.5">
                  <QuickViewSummaryBadge
                    label={`Status: ${vessel.status ?? "-"}`}
                    tone="ok"
                  />
                  <QuickViewSummaryBadge
                    label={`Home Port: ${profile?.homePort ?? "-"}`}
                    tone="info"
                  />
                  <QuickViewSummaryBadge
                    label={`Last fuel event: ${lastFuelEvent === "-" ? "Not logged" : lastFuelEvent}`}
                    tone="warn"
                  />
                </View>
              </View>

              <Text className="max-w-[620px] text-[12px] leading-[16px] text-muted">
                Use this quick view to confirm the vessel identity, operational
                contact, and current readiness before opening the full vessel
                shell.
              </Text>
            </>
          }
          aside={
            <QuickViewMediaPanel className="h-[128px] web:h-[128px]">
              {vessel.imageUrl ? (
                <VesselImageMedia
                  uri={vessel.imageUrl}
                  stageClassName="rounded-[14px]"
                />
              ) : (
                <View className="h-full flex-1 flex-row items-center gap-3 px-4">
                  <View className="rounded-full border border-shellLine bg-shellPanel px-3 py-3">
                    <Ionicons
                      name="boat-outline"
                      size={30}
                      className="text-textMain"
                    />
                  </View>

                  <View className="min-w-0 flex-1 gap-0.5">
                    <Text className="text-[15px] font-semibold text-textMain">
                      No vessel image
                    </Text>
                    <Text className="text-[11px] leading-[15px] text-muted">
                      Add a vessel image from edit mode to replace this
                      fallback.
                    </Text>
                  </View>
                </View>
              )}
            </QuickViewMediaPanel>
          }
        />

        <View className="gap-1.5 mt-4">
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
            Operational Insight
          </Text>
          <RegistrySummaryStrip
            items={operationalInsightItems}
            size="compact"
            columns={3}
          />
        </View>

        <View className="flex-1 gap-1.5">
          <Text className="text-[14px] font-semibold text-textMain">
            Compliance Snapshot
          </Text>
          <RegistrySummaryStrip
            items={complianceSummaryItems}
            size="compact"
            columns={3}
          />
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
