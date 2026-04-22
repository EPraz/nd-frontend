import type {
  RegistrySummaryItem,
  RegistrySummaryTone,
} from "@/src/components/ui/registryWorkspace";

type VesselWorkspaceStats = {
  total: number;
  withProfile: number;
  withIMO: number;
  withLicense: number;
  missingFlag: number;
};

function readinessTone(
  registryReady: number,
  total: number,
): RegistrySummaryTone {
  return registryReady === total ? "ok" : "warn";
}

function missingFlagTone(missingFlag: number): RegistrySummaryTone {
  return missingFlag > 0 ? "danger" : "ok";
}

function missingProfilesTone(missingProfiles: number): RegistrySummaryTone {
  return missingProfiles > 0 ? "warn" : "ok";
}

export function getVesselWorkspaceSummaryItems(
  stats: VesselWorkspaceStats,
): RegistrySummaryItem[] {
  const missingProfiles = Math.max(0, stats.total - stats.withProfile);
  const registryReady = stats.withIMO + stats.withLicense;

  return [
    {
      label: "In scope",
      value: String(stats.total),
      helper: "assigned to this project",
      tone: "accent",
    },
    {
      label: "Registry ready",
      value: String(registryReady),
      helper: "IMO or license recorded",
      tone: readinessTone(registryReady, stats.total),
    },
    {
      label: "Flags missing",
      value: String(stats.missingFlag),
      helper: "needs completion",
      tone: missingFlagTone(stats.missingFlag),
    },
    {
      label: "Profiles pending",
      value: String(missingProfiles),
      helper: "still missing profile data",
      tone: missingProfilesTone(missingProfiles),
    },
  ];
}
