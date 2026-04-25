import { RegistryTablePill } from "@/src/components/ui/table";
import { humanizeTechnicalLabel } from "@/src/helpers";
import type { CrewBulkUploadSessionStatus } from "../contracts/crewBulkUpload.contract";

export function CrewBulkUploadStatusPill({
  status,
}: {
  status: CrewBulkUploadSessionStatus;
}) {
  const tone =
    status === "COMMITTED"
      ? ("ok" as const)
      : status === "DISCARDED"
        ? ("danger" as const)
        : ("warn" as const);

  const label = humanizeTechnicalLabel(status);

  return <RegistryTablePill label={label} tone={tone} />;
}

export function CrewBulkUploadIssuePill({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "danger" | "warn" | "info";
}) {
  const resolvedTone = count > 0 ? tone : ("neutral" as const);
  return (
    <RegistryTablePill label={`${count} ${label}`} tone={resolvedTone} />
  );
}
