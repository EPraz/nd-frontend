import type { AssetDto } from "@/src/contracts/assets.contract";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import type { VesselSummaryDto } from "../../core/contracts";
import { useVessel, useVesselSummary } from "../../core/hooks";

type VesselShellContextValue = {
  projectId: string;
  assetId: string;
  vessel: AssetDto | null;
  summary: VesselSummaryDto;
  loading: boolean;
  vesselError: string | null;
  summaryError: string | null;
  refresh: () => Promise<void>;
};

const VesselShellContext = createContext<VesselShellContextValue | null>(null);

function createEmptySummary(assetId: string): VesselSummaryDto {
  return {
    assetId,
    certificates: {
      total: 0,
      valid: 0,
      pending: 0,
      expired: 0,
      expiringSoon: 0,
    },
    crew: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    maintenance: {
      total: 0,
      open: 0,
      inProgress: 0,
      done: 0,
      overdue: 0,
    },
    fuel: {
      total: 0,
      lastEventAt: null,
      lastEventType: null,
    },
    updatedAt: new Date(0).toISOString(),
  };
}

export function VesselShellProvider({
  projectId,
  assetId,
  children,
}: {
  projectId: string;
  assetId: string;
  children: React.ReactNode;
}) {
  const vesselState = useVessel(projectId, assetId);
  const summaryState = useVesselSummary(projectId, assetId);

  const refresh = useCallback(async () => {
    await Promise.all([vesselState.refresh(), summaryState.refresh()]);
  }, [summaryState, vesselState]);

  const value = useMemo<VesselShellContextValue>(
    () => ({
      projectId,
      assetId,
      vessel: vesselState.vessel,
      summary: summaryState.data ?? createEmptySummary(assetId),
      loading: vesselState.loading || summaryState.loading,
      vesselError: vesselState.error,
      summaryError: summaryState.error,
      refresh,
    }),
    [assetId, projectId, refresh, summaryState, vesselState],
  );

  return (
    <VesselShellContext.Provider value={value}>
      {children}
    </VesselShellContext.Provider>
  );
}

export function useVesselShell() {
  const ctx = useContext(VesselShellContext);

  if (!ctx) {
    throw new Error("useVesselShell must be used within VesselShellProvider");
  }

  return ctx;
}
