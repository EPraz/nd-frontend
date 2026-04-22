import type {
  RegistrySummaryItem,
  RegistrySummaryTone,
} from "@/src/components/ui/registryWorkspace";

type CrewWorkspaceStats = {
  total: number;
  active: number;
  inactive: number;
  vacationDueNext30Days: number;
};

function vacationDueTone(vacationDueNext30Days: number): RegistrySummaryTone {
  return vacationDueNext30Days > 0 ? "warn" : "accent";
}

function inactiveTone(inactive: number): RegistrySummaryTone {
  return inactive > 0 ? "warn" : "ok";
}

export function getCrewWorkspaceSummaryItems(
  stats: CrewWorkspaceStats,
): RegistrySummaryItem[] {
  return [
    {
      label: "Crew in scope",
      value: String(stats.total),
      helper: "assigned to this project",
      tone: "accent",
    },
    {
      label: "Active",
      value: String(stats.active),
      helper: "available onboard or ready",
      tone: "ok",
    },
    {
      label: "Inactive",
      value: String(stats.inactive),
      helper: "vacation, injury, or inactive",
      tone: inactiveTone(stats.inactive),
    },
    {
      label: "Vacation due",
      value: String(stats.vacationDueNext30Days),
      helper: "leave planning next 30 days",
      tone: vacationDueTone(stats.vacationDueNext30Days),
    },
  ];
}
