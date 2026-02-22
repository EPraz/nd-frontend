import { useProjectData } from "@/src/context";
import { useMemo } from "react";

export type ProjectHealthStatus = "HEALTHY" | "ATTENTION_REQUIRED" | "CRITICAL";

export type ProjectHealthData = {
  status: ProjectHealthStatus;
  reasons: string[];
};

export function useProjectHealthData() {
  const { certificates, maintenance, crew, loading, error, refresh } =
    useProjectData();

  const data = useMemo<ProjectHealthData>(() => {
    const reasons: string[] = [];
    let status: ProjectHealthStatus = "HEALTHY";

    const now = Date.now();
    const in7days = now + 7 * 24 * 60 * 60 * 1000;

    const expiredCerts = certificates.filter((c) => c.status === "EXPIRED");

    const expiringCerts = certificates.filter(
      (c) => c.status === "EXPIRING_SOON",
    );

    const overdueMaintenance = maintenance.filter(
      (m) =>
        m.status !== "DONE" && m.dueDate && new Date(m.dueDate).getTime() < now,
    );

    const upcomingMaintenance = maintenance.filter(
      (m) =>
        m.status !== "DONE" &&
        m.dueDate &&
        new Date(m.dueDate).getTime() <= in7days,
    );

    const vesselSet = new Set(certificates.map((c) => c.assetId));
    const vesselWithActiveCrew = new Set(
      crew.filter((c) => c.status === "ACTIVE").map((c) => c.assetId),
    );

    const vesselsWithoutCrew = [...vesselSet].filter(
      (id) => !vesselWithActiveCrew.has(id),
    );

    // CRITICAL
    if (expiredCerts.length > 0) {
      status = "CRITICAL";
      reasons.push(`${expiredCerts.length} expired certificates`);
    }

    if (overdueMaintenance.length > 0) {
      status = "CRITICAL";
      reasons.push(`${overdueMaintenance.length} overdue maintenance tasks`);
    }

    if (vesselsWithoutCrew.length > 0) {
      status = "CRITICAL";
      reasons.push(`${vesselsWithoutCrew.length} vessels without active crew`);
    }

    // ATTENTION
    if (status !== "CRITICAL") {
      if (expiringCerts.length > 0) {
        status = "ATTENTION_REQUIRED";
        reasons.push(`${expiringCerts.length} certificates expiring soon`);
      }

      if (upcomingMaintenance.length > 0) {
        status = "ATTENTION_REQUIRED";
        reasons.push(`${upcomingMaintenance.length} maintenance due soon`);
      }
    }

    if (reasons.length === 0) {
      reasons.push("All operational parameters are within acceptable range.");
    }

    return { status, reasons };
  }, [certificates, maintenance, crew]);

  return {
    data,
    isLoading: loading.certificates || loading.maintenance || loading.crew,
    error: error.certificates ?? error.maintenance ?? error.crew,
    refetch: refresh.all,
  };
}
