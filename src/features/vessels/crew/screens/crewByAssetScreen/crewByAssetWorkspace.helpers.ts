import type { RegistrySummaryItem } from "@/src/components/ui/registryWorkspace";
import type { CrewDto } from "@/src/features/crew/core";

function medicalAttentionTone(count: number) {
  return count > 0 ? ("warn" as const) : ("ok" as const);
}

function inactiveTone(count: number) {
  return count > 0 ? ("warn" as const) : ("ok" as const);
}

export function getCrewByAssetSummaryItems(
  crew: CrewDto[],
): RegistrySummaryItem[] {
  const active = crew.filter((member) => member.status === "ACTIVE").length;
  const inactive = crew.filter((member) => member.status === "INACTIVE").length;
  const medicalAttention = crew.filter(
    (member) => member.medicalCertificateValid !== true,
  ).length;

  return [
    {
      label: "Crew in scope",
      value: String(crew.length),
      helper: "assigned to this vessel",
      tone: "accent",
    },
    {
      label: "Active",
      value: String(active),
      helper: "currently active onboard",
      tone: "ok",
    },
    {
      label: "Inactive",
      value: String(inactive),
      helper: "not currently active",
      tone: inactiveTone(inactive),
    },
    {
      label: "Medical attention",
      value: String(medicalAttention),
      helper: "invalid or unknown medical state",
      tone: medicalAttentionTone(medicalAttention),
    },
  ];
}
