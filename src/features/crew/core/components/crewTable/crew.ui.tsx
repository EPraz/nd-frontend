import { RegistryTablePill } from "@/src/components/ui/table/RegistryTablePill";
import { humanizeTechnicalLabel } from "@/src/helpers";
import { CrewInactiveReason, CrewStatus } from "../../contracts";

export function crewStatusLabel(
  status: CrewStatus,
  inactiveReason?: CrewInactiveReason | null,
) {
  if (status === "ACTIVE") return "ACTIVE";
  if (inactiveReason === "VACATION") return "VACATION";
  if (inactiveReason === "INJURED") return "INJURED";
  return "INACTIVE";
}

export function CrewStatusPill(props: {
  status: CrewStatus;
  inactiveReason?: CrewInactiveReason | null;
}) {
  const statusLabel = crewStatusLabel(props.status, props.inactiveReason);
  const label = humanizeTechnicalLabel(statusLabel);

  const tone: Record<typeof statusLabel, "ok" | "accent" | "warn" | "info"> = {
    ACTIVE: "ok",
    VACATION: "accent",
    INJURED: "warn",
    INACTIVE: "info",
  };

  return <RegistryTablePill label={label} tone={tone[statusLabel]} />;
}

export function CrewMedicalPill(props: {
  valid: boolean | null;
}) {
  if (props.valid === null) {
    return <RegistryTablePill label="Unknown" tone="info" />;
  }

  return (
    <RegistryTablePill
      label={props.valid ? "Valid" : "Not Valid"}
      tone={props.valid ? "ok" : "warn"}
    />
  );
}
