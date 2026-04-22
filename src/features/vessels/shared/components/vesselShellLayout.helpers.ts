import { formatDate, humanizeTechnicalLabel } from "@/src/helpers";
import type { AssetDto } from "@/src/contracts/assets.contract";
import type { VesselSummaryDto } from "../../core/contracts";

export type VesselShellNavTone = "success" | "warn" | "fail" | "neutral";

export type VesselShellNavItem = {
  key: "overview" | "certificates" | "crew" | "maintenance" | "fuel";
  label: string;
  href: string;
  helper: string;
  tone: VesselShellNavTone;
};

export function getVesselIdentifier(vessel: AssetDto) {
  if (vessel.vessel?.imo) return `IMO ${vessel.vessel.imo}`;
  if (vessel.vessel?.licenseNumber) return `License ${vessel.vessel.licenseNumber}`;
  return "Identifier pending";
}

export function getVesselMetaFacts(
  vessel: AssetDto,
  summary: VesselSummaryDto,
) {
  return [
    { label: "Status", value: humanizeTechnicalLabel(vessel.status) },
    { label: "Flag", value: vessel.vessel?.flag ?? "Pending" },
    {
      label: "Type",
      value: humanizeTechnicalLabel(vessel.vessel?.vesselType) || "Pending",
    },
    {
      label: "Ops email",
      value: vessel.vessel?.email ?? "Not set",
    },
    { label: "Summary refreshed", value: formatDate(summary.updatedAt) },
  ];
}

export function buildVesselShellNavItems(
  basePath: string,
  summary: VesselSummaryDto,
): VesselShellNavItem[] {
  const certificatesAtRisk =
    summary.certificates.expired + summary.certificates.expiringSoon;
  const maintenanceAttention =
    summary.maintenance.overdue + summary.maintenance.open;

  return [
    {
      key: "overview",
      label: "Overview",
      href: basePath,
      helper: "Operational profile",
      tone: "neutral",
    },
    {
      key: "certificates",
      label: "Certificates",
      href: `${basePath}/certificates`,
      helper:
        certificatesAtRisk > 0
          ? `${certificatesAtRisk} at risk`
          : `${summary.certificates.total} tracked`,
      tone: certificatesAtRisk > 0 ? "fail" : "success",
    },
    {
      key: "crew",
      label: "Crew",
      href: `${basePath}/crew`,
      helper:
        summary.crew.total > 0
          ? `${summary.crew.active}/${summary.crew.total} active`
          : "No crew assigned",
      tone: summary.crew.active > 0 ? "success" : "neutral",
    },
    {
      key: "maintenance",
      label: "Maintenance",
      href: `${basePath}/maintenance`,
      helper:
        summary.maintenance.overdue > 0
          ? `${summary.maintenance.overdue} overdue`
          : maintenanceAttention > 0
            ? `${maintenanceAttention} attention`
            : "Queue stable",
      tone:
        summary.maintenance.overdue > 0
          ? "fail"
          : maintenanceAttention > 0
            ? "warn"
            : "success",
    },
    {
      key: "fuel",
      label: "Fuel",
      href: `${basePath}/fuel`,
      helper:
        summary.fuel.total > 0
          ? `${summary.fuel.total} records`
          : "No records",
      tone: summary.fuel.total > 0 ? "success" : "neutral",
    },
  ];
}

export function isVesselNavItemActive(
  pathname: string,
  href: string,
  key: VesselShellNavItem["key"],
  hasDedicatedActiveSection: boolean,
) {
  if (key === "overview") {
    return (
      !hasDedicatedActiveSection &&
      (pathname === href ||
        pathname === `${href}/` ||
        pathname.startsWith(`${href}/edit`))
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function toneStyle(tone: VesselShellNavTone) {
  switch (tone) {
    case "success":
      return {
        dot: { backgroundColor: "#34d399" },
        text: "text-success",
      };
    case "warn":
      return {
        dot: { backgroundColor: "#fbbf24" },
        text: "text-warning",
      };
    case "fail":
      return {
        dot: { backgroundColor: "#fb7185" },
        text: "text-destructive",
      };
    case "neutral":
    default:
      return {
        dot: { backgroundColor: "#94a3b8" },
        text: "text-muted",
      };
  }
}
