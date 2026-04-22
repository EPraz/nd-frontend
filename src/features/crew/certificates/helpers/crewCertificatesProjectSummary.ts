import type { RegistrySummaryItem } from "@/src/components/ui/registryWorkspace";
import type { CrewCertificateOverviewStats } from "./crewCertificateStats";

export function getCrewCertificatesProjectSummaryItems(
  stats: CrewCertificateOverviewStats,
): RegistrySummaryItem[] {
  return [
    {
      label: "Requirements",
      value: String(stats.totalRequirements),
      helper: "active crew certificate requirements",
      tone: "accent",
    },
    {
      label: "Missing",
      value: String(stats.missingRequirements),
      helper: "need evidence upload",
      tone: stats.missingRequirements > 0 ? "danger" : "ok",
    },
    {
      label: "Under review",
      value: String(stats.underReviewRequirements),
      helper: "awaiting confirmation",
      tone: stats.underReviewRequirements > 0 ? "warn" : "ok",
    },
    {
      label: "Active certificates",
      value: String(stats.activeCertificates),
      helper:
        stats.expiringSoonCertificates > 0
          ? `${stats.expiringSoonCertificates} expiring in 30 days`
          : "currently valid or approved",
      tone: stats.expiringSoonCertificates > 0 ? "warn" : "ok",
    },
  ];
}
