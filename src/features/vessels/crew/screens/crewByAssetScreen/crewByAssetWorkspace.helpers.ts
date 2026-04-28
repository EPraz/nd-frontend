import type { RegistrySummaryItem } from "@/src/components/ui/registryWorkspace";
import type { CrewDto, CrewListStatsDto } from "@/src/features/crew/core";

type CrewByAssetSummaryStats = Pick<
  CrewListStatsDto,
  "total" | "active" | "inactive" | "medicalAttention"
>;

function medicalAttentionTone(count: number) {
  return count > 0 ? ("warn" as const) : ("ok" as const);
}

function inactiveTone(count: number) {
  return count > 0 ? ("warn" as const) : ("ok" as const);
}

export function getCrewByAssetStatsFromRows(
  crew: CrewDto[],
): CrewByAssetSummaryStats {
  return {
    total: crew.length,
    active: crew.filter((member) => member.status === "ACTIVE").length,
    inactive: crew.filter((member) => member.status === "INACTIVE").length,
    medicalAttention: crew.filter(
      (member) => member.medicalCertificateValid !== true,
    ).length,
  };
}

export function getCrewByAssetSummaryItems(
  stats: CrewByAssetSummaryStats,
): RegistrySummaryItem[] {
  return [
    {
      label: "Crew in scope",
      value: String(stats.total),
      helper: "assigned to this vessel",
      tone: "accent",
    },
    {
      label: "Active",
      value: String(stats.active),
      helper: "currently active onboard",
      tone: "ok",
    },
    {
      label: "Inactive",
      value: String(stats.inactive),
      helper: "not currently active",
      tone: inactiveTone(stats.inactive),
    },
    {
      label: "Medical attention",
      value: String(stats.medicalAttention),
      helper: "invalid or unknown medical state",
      tone: medicalAttentionTone(stats.medicalAttention),
    },
  ];
}
