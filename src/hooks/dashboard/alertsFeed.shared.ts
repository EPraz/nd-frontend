import type { CertificateDto } from "@/src/features/certificates/contracts/certificates.contract";
import type { MaintenanceDto } from "@/src/features/maintenance/contracts";

export type AlertSeverity = "CRITICAL" | "WARNING";

export type AlertItem = {
  id: string;
  type: "CERTIFICATE" | "MAINTENANCE";
  title: string;
  subtitle: string;
  severity: AlertSeverity;
  date?: string | null;
};

export function buildAlertsFeedItems(
  certificates: CertificateDto[],
  maintenance: MaintenanceDto[],
): AlertItem[] {
  const alerts: AlertItem[] = [];
  const now = Date.now();
  const in7Days = now + 7 * 24 * 60 * 60 * 1000;

  for (const certificate of certificates) {
    if (certificate.status === "EXPIRED") {
      alerts.push({
        id: `cert-${certificate.id}`,
        type: "CERTIFICATE",
        title: certificate.certificateName,
        subtitle: certificate.assetName,
        severity: "CRITICAL",
        date: certificate.expiryDate,
      });
    }

    if (certificate.status === "EXPIRING_SOON") {
      alerts.push({
        id: `cert-${certificate.id}`,
        type: "CERTIFICATE",
        title: certificate.certificateName,
        subtitle: certificate.assetName,
        severity: "WARNING",
        date: certificate.expiryDate,
      });
    }
  }

  for (const task of maintenance) {
    if (!task.dueDate || task.status === "DONE") continue;

    const due = new Date(task.dueDate).getTime();

    if (due < now) {
      alerts.push({
        id: `mnt-${task.id}`,
        type: "MAINTENANCE",
        title: task.title,
        subtitle: task.asset?.name ?? "Unknown asset",
        severity: "CRITICAL",
        date: task.dueDate,
      });
      continue;
    }

    if (due <= in7Days) {
      alerts.push({
        id: `mnt-${task.id}`,
        type: "MAINTENANCE",
        title: task.title,
        subtitle: task.asset?.name ?? "Unknown asset",
        severity: "WARNING",
        date: task.dueDate,
      });
    }
  }

  return alerts.sort((left, right) => {
    if (left.severity === right.severity) {
      const leftDate = left.date ? new Date(left.date).getTime() : Infinity;
      const rightDate = right.date ? new Date(right.date).getTime() : Infinity;
      return leftDate - rightDate;
    }

    return left.severity === "CRITICAL" ? -1 : 1;
  });
}
