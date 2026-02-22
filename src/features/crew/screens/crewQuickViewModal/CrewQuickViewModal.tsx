import { Button, QuickViewModalFrame, Text } from "@/src/components";
import { formatDate, MiniPill, Stat } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import type { CrewDto, CrewStatus } from "../../contracts";

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

export default function CrewQuickViewModal({
  crew,
  projectId,
  onClose,
}: Props) {
  const router = useRouter();

  const tone = statusTone(crew.status);

  const handleOpenVesselCrew = () => {
    onClose();
    router.push(`/projects/${projectId}/vessels/${crew.assetId}/crew`);
  };

  const handleOpenVessel = () => {
    onClose();
    router.push(`/projects/${projectId}/vessels/${crew.assetId}`);
  };

  // Placeholder: luego conectas DELETE real
  const handleDelete = () => {
    // TODO: confirm dialog + delete endpoint
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
      subtitle="Quick crew snapshot. Open vessel crew page for full management."
      headerActions={
        <>
          {/* Optional edit (deja comentado hasta que exista ruta) */}
          {/* <Pressable
            onPress={handleEdit}
            className="flex-row items-center gap-2 rounded-full border border-accent/35 bg-accent/12 px-4 py-2 active:opacity-80"
          >
            <Ionicons name="create-outline" size={16} className="text-accent" />
            <Text className="text-accent font-semibold">Edit</Text>
          </Pressable> */}

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
      {/* Top content */}
      <View className="mt-1 gap-5 web:flex-row">
        {/* Left info */}
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

            <MiniPill>{`Crew ID: ${crew.id}`}</MiniPill>

            <MiniPill>
              {`Vessel: ${crew.assetName ?? crew.asset?.name ?? crew.assetId}`}
            </MiniPill>

            {crew.rank ? <MiniPill>{`Rank: ${crew.rank}`}</MiniPill> : null}
          </View>

          <Text className="text-textMain/55 text-[13px] leading-[18px]">
            View crew details quickly. Use the vessel crew module to assign,
            update status, or manage documents.
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

        {/* Right image placeholder */}
        <View className="w-full web:w-[360px] shrink-0">
          <View className="h-[260px] w-full overflow-hidden rounded-[22px] border border-border bg-baseBg/35 items-center justify-center">
            <Text className="text-textMain text-[20px] font-semibold">
              Image Here
            </Text>
            <Text className="text-muted text-[12px] mt-1">(upload later)</Text>
          </View>
        </View>
      </View>

      {/* Main stats */}
      <View className="mt-2 gap-4 flex-col web:flex-row">
        <View className="flex-1 rounded-[22px] border border-border bg-baseBg/35 p-4">
          <Text className="text-textMain font-semibold mb-3">Identity</Text>

          <View className="gap-4 web:flex-row">
            <Stat label="Nationality" value={crew.nationality ?? "—"} />
            <Stat label="Document ID" value={crew.documentId ?? "—"} />
            <Stat label="Created" value={formatDate(crew.createdAt)} />
          </View>
        </View>

        <View className="flex-1 rounded-[22px] border border-border bg-baseBg/35 p-4">
          <Text className="text-textMain font-semibold mb-3">Assignment</Text>

          <View className="gap-4 web:flex-row">
            <Stat label="Status" value={tone.label} />
            <Stat label="Rank" value={crew.rank ?? "—"} />
            <Stat
              label="Vessel"
              value={crew.assetName ?? crew.asset?.name ?? "—"}
            />
          </View>
        </View>
      </View>
    </QuickViewModalFrame>
  );
}
