import type { RegistrySummaryItem } from "@/src/components/ui/registryWorkspace";
import type {
  CertificateDto,
  CertificateRequirementDto,
} from "@/src/features/certificates/shared";

export type AssetCertificatesWorkspaceStats = {
  totalRequirements: number;
  records: number;
  missing: number;
  expired: number;
  underReview: number;
  provided: number;
};

export function getAssetCertificatesWorkspaceStats(
  requirements: CertificateRequirementDto[],
  certificates: CertificateDto[],
): AssetCertificatesWorkspaceStats {
  let missing = 0;
  let expired = 0;
  let underReview = 0;
  let provided = 0;

  for (const row of requirements) {
    switch (row.status) {
      case "MISSING":
        missing += 1;
        break;
      case "EXPIRED":
        expired += 1;
        break;
      case "UNDER_REVIEW":
        underReview += 1;
        break;
      case "PROVIDED":
        provided += 1;
        break;
    }
  }

  return {
    totalRequirements: requirements.length,
    records: certificates.length,
    missing,
    expired,
    underReview,
    provided,
  };
}

export function getAssetCertificatesSummaryItems(
  stats: AssetCertificatesWorkspaceStats,
): RegistrySummaryItem[] {
  return [
    {
      label: "Requirements",
      value: String(stats.totalRequirements),
      helper: "active requirements for this vessel",
      tone: "accent",
    },
    {
      label: "Missing",
      value: String(stats.missing),
      helper: "need fresh evidence",
      tone: stats.missing > 0 ? "danger" : "ok",
    },
    {
      label: "Under review",
      value: String(stats.underReview),
      helper: "uploaded and awaiting confirmation",
      tone: stats.underReview > 0 ? "warn" : "ok",
    },
    {
      label: "Provided",
      value: String(stats.provided),
      helper:
        stats.expired > 0
          ? `${stats.expired} expired`
          : "currently backed by a record",
      tone: stats.expired > 0 ? "danger" : "ok",
    },
  ];
}
