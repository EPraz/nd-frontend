import { RegistryTablePill } from "@/src/components";
import { humanizeTechnicalLabel } from "@/src/helpers";
import { MaintenancePriority, MaintenanceStatus } from "../../../shared/contracts";

export function MaintenanceStatusPill(props: {
  status: MaintenanceStatus;
  overdue?: boolean;
}) {
  const { status, overdue } = props;

  const isOverdue = overdue && status !== "DONE";

  if (isOverdue) {
    return <RegistryTablePill label="Overdue" tone="danger" />;
  }

  const tone: Record<MaintenanceStatus, "danger" | "warn" | "ok"> = {
    OPEN: "danger",
    IN_PROGRESS: "warn",
    DONE: "ok",
    OVERDUE: "danger",
  };

  return (
    <RegistryTablePill
      label={humanizeTechnicalLabel(status)}
      tone={tone[status]}
    />
  );
}

export function MaintenancePriorityPill(props: {
  priority: MaintenancePriority;
}) {
  const p = props.priority;

  const tone: Record<MaintenancePriority, "info" | "warn" | "danger"> = {
    LOW: "info",
    MEDIUM: "warn",
    HIGH: "danger",
  };

  return (
    <RegistryTablePill
      label={humanizeTechnicalLabel(p)}
      tone={tone[p]}
    />
  );
}
