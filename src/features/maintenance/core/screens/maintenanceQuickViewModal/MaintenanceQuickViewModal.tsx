import {
  QuickViewFooterActions,
  QuickViewHeaderActions,
  QuickViewLeadSection,
  QuickViewMediaPanel,
  QuickViewModalFrame,
  QuickViewSummaryBadge,
  Text,
} from "@/src/components";
import {
  RegistrySummaryStrip,
  type RegistrySummaryItem,
} from "@/src/components/ui/registryWorkspace";
import { formatDate } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { View } from "react-native";
import type { MaintenanceDto } from "../../../shared/contracts";

type Props = {
  task: MaintenanceDto;
  projectId: string;
  onClose: () => void;
};

function daysUntil(iso: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const now = new Date();
  const ms = date.getTime() - now.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function isOverdue(dueDate: string | null, status: MaintenanceDto["status"]) {
  if (!dueDate || status === "DONE") return false;
  const date = new Date(dueDate);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() < Date.now();
}

function priorityTone(
  priority: MaintenanceDto["priority"],
): "danger" | "warn" | "info" {
  switch (priority) {
    case "HIGH":
      return "danger";
    case "MEDIUM":
      return "warn";
    case "LOW":
    default:
      return "info";
  }
}

function statusTone(
  status: MaintenanceDto["status"],
  overdue: boolean,
): "ok" | "warn" | "danger" | "info" {
  if (status === "DONE") return "ok";
  if (overdue) return "danger";
  if (status === "IN_PROGRESS") return "warn";
  return "info";
}

function humanize(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

export default function MaintenanceQuickViewModal({
  task,
  projectId,
  onClose,
}: Props) {
  const router = useRouter();

  const overdue = isOverdue(task.dueDate, task.status);
  const dueWindow = (() => {
    const days = daysUntil(task.dueDate);
    if (days === null) return "-";
    if (days < 0) return `${Math.abs(days)} day(s) overdue`;
    return `${days} day(s) remaining`;
  })();

  const vesselName = task.asset?.name ?? task.assetId;

  const profileSummaryItems: RegistrySummaryItem[] = [
    {
      label: "Task ID",
      value: task.id,
      helper: "Maintenance reference",
      tone: "info",
    },
    {
      label: "Vessel",
      value: vesselName,
      helper: "Assigned asset",
      tone: "accent",
    },
    {
      label: "Due date",
      value: formatDate(task.dueDate),
      helper: "Planned execution",
      tone: overdue ? "danger" : "warn",
    },
    {
      label: "Created",
      value: formatDate(task.createdAt),
      helper: "Task creation",
      tone: "ok",
    },
  ];

  const executionSummaryItems: RegistrySummaryItem[] = [
    {
      label: "Status",
      value: overdue && task.status !== "DONE" ? "Overdue" : humanize(task.status),
      helper: "Current execution state",
      tone: statusTone(task.status, overdue),
    },
    {
      label: "Priority",
      value: humanize(task.priority),
      helper: "Operational pressure",
      tone: priorityTone(task.priority),
    },
    {
      label: "Due window",
      value: dueWindow,
      helper: "Remaining time",
      tone: overdue ? "danger" : "warn",
    },
  ];

  const contextSummaryItems: RegistrySummaryItem[] = [
    {
      label: "Vessel",
      value: vesselName,
      helper: "Assigned asset",
      tone: "info",
    },
    {
      label: "Description",
      value: task.description?.trim() ? "Available" : "No notes",
      helper: "Task notes",
      tone: task.description?.trim() ? "accent" : "neutral",
    },
    {
      label: "Created",
      value: formatDate(task.createdAt),
      helper: "Original log",
      tone: "ok",
    },
  ];

  const handleOpenTask = () => {
    onClose();
    router.push(`/projects/${projectId}/vessels/${task.assetId}/maintenance/${task.id}`);
  };

  const handleEdit = () => {
    onClose();
    router.push(
      `/projects/${projectId}/vessels/${task.assetId}/maintenance/${task.id}/edit`,
    );
  };

  return (
    <QuickViewModalFrame
      portalName={task.title}
      open
      onClose={onClose}
      title="Maintenance task"
      subtitle="Execution, urgency, and scheduling snapshot for the active maintenance item."
      headerActions={
        <QuickViewHeaderActions
          onClose={onClose}
          actions={[
            {
              label: "Edit",
              onPress: handleEdit,
              variant: "softAccent",
              leftIcon: (
                <Ionicons
                  name="create-outline"
                  size={16}
                  className="text-accent"
                />
              ),
            },
          ]}
        />
      }
      footer={
        <QuickViewFooterActions
          onClose={onClose}
          actions={[
            {
              label: "Open Task",
              onPress: handleOpenTask,
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
                    {task.title}
                  </Text>
                  <Text className="text-[12px] text-muted">
                    {vesselName} | Task #{task.id.slice(0, 8)} |{" "}
                    {formatDate(task.dueDate)}
                  </Text>
                </View>

                <View className="flex-row flex-wrap items-center gap-1.5">
                  <QuickViewSummaryBadge
                    label={`Status: ${overdue && task.status !== "DONE" ? "Overdue" : humanize(task.status)}`}
                    tone={statusTone(task.status, overdue)}
                  />
                  <QuickViewSummaryBadge
                    label={`Priority: ${humanize(task.priority)}`}
                    tone={priorityTone(task.priority)}
                  />
                  <QuickViewSummaryBadge
                    label={`Due window: ${dueWindow}`}
                    tone={overdue ? "danger" : "warn"}
                  />
                </View>
              </View>

              <Text className="max-w-[620px] text-[12px] leading-[16px] text-muted">
                Use this quick view to confirm urgency, vessel context, and due
                pressure before opening the full maintenance task.
              </Text>
            </>
          }
          aside={
            <QuickViewMediaPanel className="h-[128px] justify-center px-4">
              <View className="flex-row items-center gap-3">
                <View className="rounded-full border border-shellLine bg-shellPanel px-3 py-3">
                  <Ionicons
                    name="build-outline"
                    size={30}
                    className="text-textMain"
                  />
                </View>

                <View className="min-w-0 flex-1 gap-0.5">
                  <Text className="text-[15px] font-semibold text-textMain">
                    Task context
                  </Text>
                  <Text className="text-[11px] leading-[15px] text-muted">
                    Open the task page for execution updates, notes, and
                    attachments.
                  </Text>
                </View>
              </View>
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
            Execution Snapshot
          </Text>
          <RegistrySummaryStrip
            items={executionSummaryItems}
            size="compact"
            columns={3}
          />
        </View>

        <View className="flex-1 gap-1.5">
          <Text className="text-[14px] font-semibold text-textMain">
            Task Context
          </Text>
          <RegistrySummaryStrip
            items={contextSummaryItems}
            size="compact"
            columns={3}
          />
        </View>
      </View>
    </QuickViewModalFrame>
  );
}
