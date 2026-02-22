import { Button, QuickViewModalFrame, Text } from "@/src/components";
import { formatDate, MiniPill, Stat, StatSlot } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { FuelEventPill, FuelTypePill } from "../../components";
import type { FuelDto } from "../../contracts";
import { fuelDisplayTitle } from "../../helpers";

type Props = {
  fuel: FuelDto;
  projectId: string;
  onClose: () => void;
};

export default function FuelQuickViewModal({
  fuel,
  projectId,
  onClose,
}: Props) {
  const router = useRouter();

  const handleOpenVesselFuel = () => {
    onClose();
    router.push(`/projects/${projectId}/vessels/${fuel.assetId}/fuel`);
  };

  const handleOpenVessel = () => {
    onClose();
    router.push(`/projects/${projectId}/vessels/${fuel.assetId}`);
  };

  const handleEdit = () => {
    onClose();
    router.push(
      `/projects/${projectId}/vessels/${fuel.assetId}/fuel/${fuel.id}/edit`,
    );
  };

  const handleOpenView = () => {
    onClose();
    router.push(
      `/projects/${projectId}/vessels/${fuel.assetId}/fuel/${fuel.id}`,
    );
  };

  const handleDelete = () => {
    // TODO confirm + delete endpoint
  };

  return (
    <QuickViewModalFrame
      portalName={`Fuel-${fuel.id}`}
      open
      onClose={onClose}
      title={`Fuel Event - ${fuelDisplayTitle(fuel)}`}
      subtitle="Quick snapshot. Open the view page for full details."
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
            disabled
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

          <Pressable
            onPress={handleOpenView}
            className="rounded-full bg-accent px-5 py-2.5 active:opacity-90"
          >
            <Text className="text-baseBg font-bold">Open Fuel View</Text>
          </Pressable>
        </>
      }
      scroll
      maxWidth={980}
    >
      <View className="mt-1 gap-5 web:flex-row">
        <View className="flex-1 gap-2">
          <Text className="text-textMain text-[22px] font-semibold">
            {fuel.eventType} · {fuel.quantity} {fuel.unit}
          </Text>

          <View className="flex-row flex-wrap items-center gap-2">
            <MiniPill>{`Fuel ID: ${fuel.id}`}</MiniPill>
            <MiniPill>{`Vessel: ${fuel.asset?.name ?? fuel.assetId}`}</MiniPill>
            <MiniPill>{`Date: ${formatDate(fuel.date)}`}</MiniPill>
          </View>

          <Text className="text-textMain/55 text-[13px] leading-[18px]">
            Quickly review the fuel event metadata. Use the full view to see
            attachments later.
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

            <Pressable
              onPress={handleOpenVesselFuel}
              className="flex-row items-center gap-2 rounded-full border border-border bg-baseBg/35 px-4 py-2 active:opacity-80"
            >
              <Ionicons
                name="flame-outline"
                size={16}
                className="text-textMain"
              />
              <Text className="text-textMain font-semibold">
                Open Vessel Fuel
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="w-full web:w-[360px] shrink-0">
          <View className="h-[260px] w-full overflow-hidden rounded-[22px] border border-border bg-baseBg/35 items-center justify-center">
            <Text className="text-textMain text-[20px] font-semibold">
              Receipt/BDN
            </Text>
            <Text className="text-muted text-[12px] mt-1">(upload later)</Text>
          </View>
        </View>
      </View>

      <View className="mt-2 gap-4 flex-col web:flex-row">
        <View className="flex-1 rounded-[22px] border border-border bg-baseBg/35 p-4">
          <Text className="text-textMain font-semibold mb-3">Event</Text>
          <View className="gap-4 web:flex-row">
            <StatSlot
              label="Event Type"
              value={<FuelEventPill type={fuel.eventType} />}
            />
            <StatSlot
              label="Fuel Type"
              value={<FuelTypePill fuelType={fuel.fuelType} />}
            />
            <Stat label="Quantity" value={`${fuel.quantity} ${fuel.unit}`} />
          </View>
        </View>

        <View className="flex-1 rounded-[22px] border border-border bg-baseBg/35 p-4">
          <Text className="text-textMain font-semibold mb-3">
            Cost / Location
          </Text>
          <View className="gap-4 web:flex-row">
            <Stat label="Price" value={fuel.price ?? "—"} />
            <Stat label="Currency" value={fuel.currency ?? "—"} />
            <Stat label="Location" value={fuel.location ?? "—"} />
          </View>
        </View>
      </View>

      <View className="mt-4 rounded-[22px] border border-border bg-baseBg/35 p-4">
        <Text className="text-textMain font-semibold mb-2">Note</Text>
        <Text className="text-textMain/70 text-[13px] leading-[18px]">
          {fuel.note?.trim() ? fuel.note : "—"}
        </Text>
      </View>
    </QuickViewModalFrame>
  );
}
