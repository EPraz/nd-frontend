import { Button, QuickViewModalFrame, Text } from "@/src/components";
import type { AssetDto } from "@/src/contracts/assets.contract";
import { MiniPill, Stat } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { useVesselSummary } from "../../hooks/useVesselSummary";

type Props = {
  vessel: AssetDto;
  projectId: string;
  onClose: () => void;
};

export default function VesselQuickViewModal({
  vessel,
  projectId,
  onClose,
}: Props) {
  const router = useRouter();

  const {
    data: summary,
    loading: summaryLoading,
    error: summaryError,
  } = useVesselSummary(projectId, vessel.id);

  const handleOpenPage = () => {
    onClose();
    router.push(`/projects/${projectId}/vessels/${vessel.id}`);
  };

  const handleEdit = () => {
    onClose();
    router.push(`/projects/${projectId}/vessels/${vessel.id}/edit`);
  };

  // Placeholder: luego conectas DELETE real
  const handleDelete = () => {
    // TODO: confirm dialog + delete endpoint
  };

  const profile = vessel.vessel;
  const identifier =
    profile?.identifierType === "LICENSE"
      ? profile.licenseNumber
        ? `LIC ${profile.licenseNumber}`
        : "—"
      : profile?.imo
        ? `IMO ${profile.imo}`
        : "—";

  const flag = profile?.flag ?? "—";

  const crewOnboard = summaryLoading ? "…" : String(summary?.crew.active ?? 0);

  const openWorkOrders = summaryLoading
    ? "…"
    : String(
        (summary?.maintenance.open ?? 0) +
          (summary?.maintenance.inProgress ?? 0),
      );

  const overdue = summaryLoading
    ? "…"
    : String(summary?.maintenance.overdue ?? 0);

  const certificates = summaryLoading
    ? "…"
    : String(summary?.certificates.total ?? 0);

  const expiring90 = summaryLoading
    ? "…"
    : String(summary?.certificates.expiringSoon ?? 0);

  const lastFuel = summaryLoading
    ? "…"
    : summary?.fuel.lastEventAt
      ? summary.fuel.lastEventAt.slice(0, 10)
      : "—";

  const stats = {
    crewOnboard,
    openWorkOrders,
    pscRisk: overdue !== "…" && Number(overdue) > 0 ? "ATTN" : "OK",
    certificates,
    expiring90,
    classRemarks: lastFuel,
  };

  return (
    <QuickViewModalFrame
      portalName={vessel.name}
      open={true}
      onClose={onClose}
      title="Vessel Details"
      subtitle="Quick operational snapshot. Use “Open Full Page” for full modules (certificates, crew, maintenance)."
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
      {/* Top content */}
      <View className="mt-1 gap-5 web:flex-row">
        {/* Left info */}
        <View className="flex-1 gap-3 shrink-0">
          <View className="gap-1">
            <Text className="text-textMain text-[24px] font-semibold">
              {vessel.name}
            </Text>
            <Text className="text-accent text-[13px]">
              {profile?.vesselType ?? "Vessel"}
            </Text>
          </View>

          <View className="mt-2 flex-row flex-wrap gap-2">
            <MiniPill>{`Vessel ID: ${vessel.id}`}</MiniPill>
            <MiniPill>{`Status: ${vessel.status ?? "—"}`}</MiniPill>
            <MiniPill>{`Flag: ${flag}`}</MiniPill>
            <MiniPill>{identifier}</MiniPill>
          </View>

          {/* Meta row */}
          <View className="mt-3 flex-row gap-4">
            <View className="flex-1">
              <Text className="text-accent text-[11px]">Identifier Type</Text>
              <Text className="text-textMain/75 text-[13px]">
                {profile?.identifierType ?? "—"}
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-accent text-[11px]">Home Port</Text>
              <Text className="text-textMain/75 text-[13px]">
                {profile?.homePort ?? "—"}
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-accent text-[11px]">Year Built</Text>
              <Text className="text-textMain/75 text-[13px]">
                {profile?.yearBuilt ? String(profile.yearBuilt) : "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* Right image placeholder */}
        <View className="w-full web:w-[360px] shrink-0">
          <View className="h-[260px] w-full overflow-hidden rounded-[22px] border border-border bg-baseBg/35 items-center justify-center">
            <Text className="text-textMain text-[28px] font-semibold">
              Image Here
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom stats */}
      <View className="mt-2 gap-4 flex-col web:flex-row">
        <View className="flex-1 rounded-[22px] border border-border bg-baseBg/35 p-4">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-textMain font-semibold">
              Operational Insight
            </Text>
          </View>

          <View className="gap-4 web:flex-row">
            <Stat label="Crew Onboard" value={stats.crewOnboard} />
            <Stat label="Open Work Orders" value={stats.openWorkOrders} />
            <Stat label="Overdue Maint." value={overdue} />
          </View>
        </View>

        <View className="flex-1 rounded-[22px] border border-border bg-baseBg/35 p-4">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-textMain font-semibold">
              Compliance Performance
            </Text>
          </View>

          <View className="gap-4 web:flex-row">
            <Stat label="Certificates" value={stats.certificates} />
            <Stat label="Expiring (90d)" value={stats.expiring90} />
            <Stat label="Class Remarks" value={stats.classRemarks} />
          </View>
        </View>
      </View>

      {summaryError ? (
        <Text className="text-destructive">{summaryError}</Text>
      ) : null}
    </QuickViewModalFrame>
  );
}
