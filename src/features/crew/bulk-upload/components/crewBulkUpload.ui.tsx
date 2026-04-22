import { RegistryTablePill } from "@/src/components/ui/table";
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
        ? ("neutral" as const)
        : ("warn" as const);

  const label =
    status === "READY_FOR_REVIEW" ? "Ready for review" : humanize(status);

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

function humanize(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((chunk) => chunk[0].toUpperCase() + chunk.slice(1))
    .join(" ");
}
