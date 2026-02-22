import { useProjectData } from "@/src/context";
import { useMemo } from "react";

export type AlertSeverity = "CRITICAL" | "WARNING";

export type AlertItem = {
  id: string;
  type: "CERTIFICATE" | "MAINTENANCE";
  title: string;
  subtitle: string;
  severity: AlertSeverity;
  date?: string | null;
};

export function useAlertsFeedData() {
  const { certificates, maintenance, loading, error, refresh } =
    useProjectData();

  const data = useMemo<AlertItem[]>(() => {
    const alerts: AlertItem[] = [];
    const now = Date.now();
    const in7days = now + 7 * 24 * 60 * 60 * 1000;

    for (const c of certificates) {
      if (c.status === "EXPIRED") {
        alerts.push({
          id: `cert-${c.id}`,
          type: "CERTIFICATE",
          title: c.name,
          subtitle: c.assetName,
          severity: "CRITICAL",
          date: c.expiryDate,
        });
      }

      if (c.status === "EXPIRING_SOON") {
        alerts.push({
          id: `cert-${c.id}`,
          type: "CERTIFICATE",
          title: c.name,
          subtitle: c.assetName,
          severity: "WARNING",
          date: c.expiryDate,
        });
      }
    }

    for (const m of maintenance) {
      if (!m.dueDate) continue;

      const due = new Date(m.dueDate).getTime();

      if (m.status !== "DONE") {
        if (due < now) {
          alerts.push({
            id: `mnt-${m.id}`,
            type: "MAINTENANCE",
            title: m.title,
            subtitle: m.asset.name,
            severity: "CRITICAL",
            date: m.dueDate,
          });
        } else if (due <= in7days) {
          alerts.push({
            id: `mnt-${m.id}`,
            type: "MAINTENANCE",
            title: m.title,
            subtitle: m.asset.name,
            severity: "WARNING",
            date: m.dueDate,
          });
        }
      }
    }

    return alerts.sort((a, b) => {
      if (a.severity === b.severity) {
        const da = a.date ? new Date(a.date).getTime() : Infinity;
        const db = b.date ? new Date(b.date).getTime() : Infinity;
        return da - db;
      }
      return a.severity === "CRITICAL" ? -1 : 1;
    });
  }, [certificates, maintenance]);

  return {
    data,
    isLoading: loading.certificates || loading.maintenance,
    error: error.certificates ?? error.maintenance,
    refetch: refresh.all,
  };
}
