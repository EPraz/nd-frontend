import { Button, QuickViewModalFrame, Text } from "@/src/components";
import { formatDate, MiniPill, Stat } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import type { MaintenanceDto } from "../../contracts";

type Props = {
  task: MaintenanceDto;
  projectId: string;
  onClose: () => void;
};

function priorityTone(priority: MaintenanceDto["priority"]) {
  switch (priority) {
    case "HIGH":
      return {
        bg: "bg-destructive/15",
        text: "text-destructive",
        label: "High",
      };
    case "MEDIUM":
      return { bg: "bg-warning/15", text: "text-warning", label: "Medium" };
    case "LOW":
    default:
      return { bg: "bg-info/15", text: "text-info", label: "Low" };
  }
}

function statusTone(status: MaintenanceDto["status"], overdue: boolean) {
  if (status === "DONE") {
    return { bg: "bg-success/15", text: "text-success", label: "Done" };
  }
  if (overdue) {
    return {
      bg: "bg-destructive/15",
      text: "text-destructive",
      label: "Overdue",
    };
  }
  if (status === "IN_PROGRESS") {
    return { bg: "bg-warning/15", text: "text-warning", label: "In progress" };
  }
  return { bg: "bg-info/15", text: "text-info", label: "Open" };
}

function daysUntil(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;

  const now = new Date();
  const ms = d.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function isOverdue(dueDate: string | null, status: MaintenanceDto["status"]) {
  if (!dueDate) return false;
  if (status === "DONE") return false;

  const t = new Date(dueDate).getTime();
  if (Number.isNaN(t)) return false;

  return t < Date.now();
}

export default function MaintenanceQuickViewModal({
  task,
  projectId,
  onClose,
}: Props) {
  const router = useRouter();

  const overdue = isOverdue(task.dueDate, task.status);
  const st = statusTone(task.status, overdue);
  const pr = priorityTone(task.priority);

  const due = formatDate(task.dueDate);
  const created = formatDate(task.createdAt);

  const d = daysUntil(task.dueDate);
  const dueMeta =
    d === null
      ? "—"
      : d < 0
        ? `${Math.abs(d)} day(s) overdue`
        : `${d} day(s) remaining`;

  const vesselName = task.asset?.name ?? task.assetId;

  const handleOpenTask = () => {
    onClose();
    router.push(
      `/projects/${projectId}/vessels/${task.assetId}/maintenance/${task.id}`,
    );
  };

  const handleOpenVessel = () => {
    onClose();
    router.push(`/projects/${projectId}/vessels/${task.assetId}`);
  };

  const handleEdit = () => {
    onClose();
    router.push(
      `/projects/${projectId}/vessels/${task.assetId}/maintenance/${task.id}/edit`,
    );
  };

  // Placeholder: luego conectas DELETE real
  const handleDelete = () => {
    // TODO: confirm dialog + delete endpoint
  };

  return (
    <QuickViewModalFrame
      portalName={task.title}
      open
      onClose={onClose}
      title="Maintenance Task"
      subtitle="Quick maintenance snapshot. Open the task page for full details and updates."
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

          <Pressable
            onPress={handleOpenTask}
            className="rounded-full bg-accent px-5 py-2.5 active:opacity-90"
          >
            <Text className="text-baseBg font-bold">Open Task</Text>
          </Pressable>
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
              {task.title}
            </Text>
            <Text className="text-accent text-[13px]">{vesselName}</Text>
          </View>

          <View className="mt-2 flex-row flex-wrap gap-2">
            <MiniPill>{`Task ID: ${task.id}`}</MiniPill>
            <MiniPill>{`Vessel: ${vesselName}`}</MiniPill>

            <View className={`rounded-full px-3 py-1 ${st.bg}`}>
              <Text className={`text-[12px] font-semibold ${st.text}`}>
                {st.label}
              </Text>
            </View>

            <View className={`rounded-full px-3 py-1 ${pr.bg}`}>
              <Text className={`text-[12px] font-semibold ${pr.text}`}>
                Priority: {pr.label}
              </Text>
            </View>
          </View>

          <Text className="text-textMain/55 text-[13px] leading-[18px]">
            Track due dates, priority, and execution status. Use the task page
            for updates and detailed notes.
          </Text>

          <View className="mt-1 flex-row gap-2">
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
            <Text className="text-textMain text-[28px] font-semibold">
              Image Here
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom stats */}
      <View className="mt-2 gap-4 flex-col web:flex-row">
        <View className="flex-1 rounded-[22px] border border-border bg-baseBg/35 p-4">
          <Text className="text-textMain font-semibold mb-3">Schedule</Text>

          <View className="gap-4 web:flex-row">
            <Stat label="Due Date" value={due} />
            <Stat label="Due Window" value={dueMeta} />
            <Stat label="Created" value={created} />
          </View>
        </View>

        <View className="flex-1 rounded-[22px] border border-border bg-baseBg/35 p-4">
          <Text className="text-textMain font-semibold mb-3">Details</Text>

          <View className="gap-4 web:flex-row">
            <Stat label="Status" value={st.label} />
            <Stat label="Priority" value={pr.label} />
            <Stat label="Vessel" value={vesselName} />
          </View>
        </View>
      </View>

      {task.description ? (
        <View className="mt-4 rounded-[22px] border border-border bg-baseBg/35 p-4">
          <Text className="text-textMain font-semibold mb-2">Description</Text>
          <Text className="text-textMain/70 text-[13px] leading-[18px]">
            {task.description}
          </Text>
        </View>
      ) : null}
    </QuickViewModalFrame>
  );
}
