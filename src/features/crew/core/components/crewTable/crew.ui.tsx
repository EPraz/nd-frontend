import { RegistryTablePill } from "@/src/components/ui/table/RegistryTablePill";
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
  const label = crewStatusLabel(props.status, props.inactiveReason);

  const tone: Record<typeof label, "ok" | "accent" | "warn" | "info"> = {
    ACTIVE: "ok",
    VACATION: "accent",
    INJURED: "warn",
    INACTIVE: "info",
  };

  return <RegistryTablePill label={label} tone={tone[label]} />;
}

export function CrewMedicalPill(props: {
  valid: boolean | null;
}) {
  if (props.valid === null) {
    return <RegistryTablePill label="UNKNOWN" tone="info" />;
  }

  return (
    <RegistryTablePill
      label={props.valid ? "VALID" : "NOT VALID"}
      tone={props.valid ? "ok" : "warn"}
    />
  );
}
