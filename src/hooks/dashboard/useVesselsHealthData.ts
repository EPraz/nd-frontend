import { useProjectData } from "@/src/context";
import { useMemo } from "react";

export type VesselHealthStatus = "OK" | "WARNING" | "CRITICAL";

export type VesselHealthRow = {
  assetId: string;
  assetName: string;
  status: VesselHealthStatus;

  expiredCerts: number;
  expiringCerts: number;

  overdueMaintenance: number;
  dueSoonMaintenance: number;

  activeCrew: number;

  reasons: string[]; // top drivers (texto corto)
};

export type VesselsHealthData = {
  status: VesselHealthStatus; // status global (el peor)
  totalVessels: number;
  critical: number;
  warning: number;
  ok: number;
  vessels: VesselHealthRow[];
};

function statusRank(s: VesselHealthStatus) {
  if (s === "CRITICAL") return 0;
  if (s === "WARNING") return 1;
  return 2;
}

export function useVesselsHealthData() {
  const { certificates, maintenance, crew, loading, error, refresh } =
    useProjectData();

  const data = useMemo<VesselsHealthData>(() => {
    const now = Date.now();
    const in7days = now + 7 * 24 * 60 * 60 * 1000;

    // base map por vessel (usamos certificados como fuente de “vessels del proyecto”)
    const map = new Map<string, VesselHealthRow>();

    const ensure = (assetId: string, assetName: string) => {
      if (!map.has(assetId)) {
        map.set(assetId, {
          assetId,
          assetName,
          status: "OK",
          expiredCerts: 0,
          expiringCerts: 0,
          overdueMaintenance: 0,
          dueSoonMaintenance: 0,
          activeCrew: 0,
          reasons: [],
        });
      }
      return map.get(assetId)!;
    };

    // CERTS
    for (const c of certificates) {
      const row = ensure(c.assetId, c.assetName);
      if (c.status === "EXPIRED") row.expiredCerts += 1;
      if (c.status === "EXPIRING_SOON") row.expiringCerts += 1;
    }

    // CREW
    for (const m of crew) {
      const row = ensure(m.assetId, m.asset?.name ?? m.assetName ?? m.assetId);
      if (m.status === "ACTIVE") row.activeCrew += 1;
    }

    // MAINTENANCE (asumo que maintenance tiene assetId y asset.name, ajusta si cambia)
    for (const m of maintenance as any[]) {
      if (!m.assetId || !m.asset?.name) continue;
      const row = ensure(m.assetId, m.asset.name);

      if (m.status !== "DONE" && m.dueDate) {
        const t = new Date(m.dueDate).getTime();
        if (t < now) row.overdueMaintenance += 1;
        else if (t <= in7days) row.dueSoonMaintenance += 1;
      }
    }

    // CALC STATUS + REASONS
    let critical = 0;
    let warning = 0;
    let ok = 0;

    for (const row of map.values()) {
      const reasons: string[] = [];

      // CRITICAL triggers
      if (row.expiredCerts > 0)
        reasons.push(`${row.expiredCerts} expired certs`);
      if (row.overdueMaintenance > 0)
        reasons.push(`${row.overdueMaintenance} overdue maintenance`);
      if (row.activeCrew === 0) reasons.push(`no active crew`);

      // WARNING triggers (solo si no es CRITICAL)
      const hasCritical =
        row.expiredCerts > 0 ||
        row.overdueMaintenance > 0 ||
        row.activeCrew === 0;
      if (!hasCritical) {
        if (row.expiringCerts > 0)
          reasons.push(`${row.expiringCerts} expiring soon`);
        if (row.dueSoonMaintenance > 0)
          reasons.push(`${row.dueSoonMaintenance} due soon`);
      }

      if (hasCritical) row.status = "CRITICAL";
      else if (row.expiringCerts > 0 || row.dueSoonMaintenance > 0)
        row.status = "WARNING";
      else row.status = "OK";

      row.reasons = reasons.length ? reasons : ["All good"];

      if (row.status === "CRITICAL") critical += 1;
      else if (row.status === "WARNING") warning += 1;
      else ok += 1;
    }

    const vessels = Array.from(map.values()).sort((a, b) => {
      const ra = statusRank(a.status);
      const rb = statusRank(b.status);
      if (ra !== rb) return ra - rb;

      // impacto: expired desc, overdue desc
      if (a.expiredCerts !== b.expiredCerts)
        return b.expiredCerts - a.expiredCerts;
      if (a.overdueMaintenance !== b.overdueMaintenance)
        return b.overdueMaintenance - a.overdueMaintenance;

      // warning impact
      if (a.expiringCerts !== b.expiringCerts)
        return b.expiringCerts - a.expiringCerts;
      if (a.dueSoonMaintenance !== b.dueSoonMaintenance)
        return b.dueSoonMaintenance - a.dueSoonMaintenance;

      return a.assetName.localeCompare(b.assetName);
    });

    const globalStatus: VesselHealthStatus =
      critical > 0 ? "CRITICAL" : warning > 0 ? "WARNING" : "OK";

    return {
      status: globalStatus,
      totalVessels: vessels.length,
      critical,
      warning,
      ok,
      vessels,
    };
  }, [certificates, maintenance, crew]);

  return {
    data,
    isLoading: loading.certificates || loading.maintenance || loading.crew,
    error: error.certificates ?? error.maintenance ?? error.crew,
    refetch: refresh.all,
  };
}
