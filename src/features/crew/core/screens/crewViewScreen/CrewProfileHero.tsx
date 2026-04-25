import { Button, Text } from "@/src/components";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, View } from "react-native";
import { CrewStatusPill } from "../../components/crewTable/crew.ui";
import type { CrewDto } from "../../contracts";
import CrewProfileFactTile from "./CrewProfileFactTile";
import {
  crewIdentityLine,
  formatDate,
  formatMedicalState,
} from "./crewView.helpers";

type Props = {
  crew: CrewDto;
  assignedVesselName: string;
  onBack: () => void;
  onRefresh: () => void;
  onOpenVessel: () => void;
  onEdit: () => void;
  onOpenCertificates: () => void;
  onDelete: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  deleting?: boolean;
};

export default function CrewProfileHero({
  crew,
  assignedVesselName,
  onBack,
  onRefresh,
  onOpenVessel,
  onEdit,
  onOpenCertificates,
  onDelete,
  canEdit = true,
  canDelete = true,
  deleting = false,
}: Props) {
  return (
    <View className="gap-4 overflow-hidden">
      <Pressable
        onPress={onBack}
        className="self-start flex-row items-center gap-2"
      >
        <Ionicons name="chevron-back" size={16} className="text-accent" />
        <Text className="font-semibold text-accent">Back to crew</Text>
      </Pressable>

      <View className="gap-4">
        <View className="flex-row flex-wrap items-start justify-between gap-4">
          <View className="min-w-[280px] flex-1 gap-3">
            <View className="gap-1">
              <Text className="text-[10px] font-semibold uppercase tracking-[0.24em] text-shellHighlight">
                Operational profile
              </Text>
              <Text className="text-[34px] leading-[1.05] font-semibold tracking-tight text-textMain">
                {crew.fullName}
              </Text>
              <Text className="text-[13px] leading-6 text-muted">
                {crewIdentityLine(crew)}
              </Text>
            </View>

            <Text className="max-w-[760px] text-[13px] leading-[19px] text-muted">
              Keep this profile current so the crew workspace, quick views, and
              certificate lanes read a stable operational baseline.
            </Text>
          </View>

          <View className="min-w-[260px] items-end gap-2">
            <View className="flex-row flex-wrap items-center justify-end gap-2">
              <Button
                variant="outline"
                size="pillSm"
                onPress={onOpenVessel}
              >
                Open vessel
              </Button>

              <Button
                variant="outline"
                size="pillSm"
                onPress={onOpenCertificates}
              >
                Certificates
              </Button>

              {canDelete ? (
                <Button
                  variant="softDestructive"
                  size="pillSm"
                  onPress={onDelete}
                  disabled={deleting}
                  rightIcon={
                    <Ionicons
                      name="trash-outline"
                      size={15}
                      className="text-destructive"
                    />
                  }
                >
                  Delete
                </Button>
              ) : null}

              {canEdit ? (
                <Button
                  variant="default"
                  size="pillSm"
                  onPress={onEdit}
                  rightIcon={
                    <Ionicons
                      name="create-outline"
                      size={15}
                      className="text-textMain"
                    />
                  }
                >
                  Edit
                </Button>
              ) : null}

              <Button
                variant="iconAccent"
                size="icon"
                onPress={onRefresh}
                accessibilityLabel="Refresh crew profile"
                className="rounded-full"
                leftIcon={
                  <Ionicons
                    name="refresh-outline"
                    size={16}
                    className="text-textMain"
                  />
                }
              />
            </View>

            <Text className="text-[11px] text-muted">
              Profile refreshed from live crew data
            </Text>
          </View>
        </View>

        <View className="flex-row flex-wrap items-center gap-2">
          <CrewStatusPill
            status={crew.status}
            inactiveReason={crew.inactiveReason}
          />
        </View>

        <View className="grid gap-3 web:grid web:grid-cols-2 xl:grid-cols-4">
          <CrewProfileFactTile
            label="Assigned vessel"
            value={
              <Pressable onPress={onOpenVessel}>
                <Text className="text-[15px] font-semibold text-accent">
                  {assignedVesselName}
                </Text>
              </Pressable>
            }
            helper="Current operating context"
            tone="accent"
          />
          <CrewProfileFactTile
            label="Nationality"
            value={crew.nationality ?? "Not set"}
            helper="Country of record"
            tone={crew.nationality ? "info" : "neutral"}
          />
          <CrewProfileFactTile
            label="Personal email"
            value={crew.personalEmail ?? "Not set"}
            helper="Direct crew contact"
            tone={crew.personalEmail ? "ok" : "neutral"}
          />
          <CrewProfileFactTile
            label="Medical expiry"
            value={formatDate(crew.medicalCertificateExpirationDate)}
            helper={formatMedicalState(crew.medicalCertificateValid)}
            tone={
              crew.medicalCertificateValid === true
                ? "ok"
                : crew.medicalCertificateValid === false
                  ? "danger"
                  : "neutral"
            }
          />
        </View>
      </View>

      <View className="h-px bg-shellLine" />
    </View>
  );
}
