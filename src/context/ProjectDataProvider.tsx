import React, { createContext, useContext, useMemo } from "react";
import type { AssetDto } from "../contracts/assets.contract";
import type { CertificateDto } from "../features/certificates/contracts/certificates.contract";
import { useCertificatesByProject } from "../features/certificates/hooks/useCertificatesByProject";
import type { CrewDto } from "../features/crew/contracts";
import { useCrewByProject } from "../features/crew/hooks/useCrewByProject";
import type { FuelDto } from "../features/fuel/contracts/fuel.contract";
import { useFuelByProject } from "../features/fuel/hooks/useFuelByProject";
import type { MaintenanceDto } from "../features/maintenance/contracts";
import { useMaintenanceByProject } from "../features/maintenance/hooks/useMaintenanceByProject";
import { useVessels } from "../features/vessels/hooks/useVessels";
import { useProjectContext } from "./ProjectProvider";

// Tipos: ajusta imports si ya tienes DTOs tipados

type ProjectDataContextValue = {
  vessels: AssetDto[];
  certificates: CertificateDto[];
  crew: CrewDto[];
  fuel: FuelDto[];
  maintenance: MaintenanceDto[];

  loading: {
    vessels: boolean;
    certificates: boolean;
    crew: boolean;
    fuel: boolean;
    maintenance: boolean;
  };

  error: {
    vessels: string | null;
    certificates: string | null;
    crew: string | null;
    fuel: string | null;
    maintenance: string | null;
  };

  refresh: {
    vessels: () => void;
    certificates: () => void;
    crew: () => void;
    fuel: () => void;
    maintenance: () => void;
    all: () => void;
  };
};

const ProjectDataContext = createContext<ProjectDataContextValue | null>(null);

export function ProjectDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { projectId } = useProjectContext();

  const vessels = useVessels(projectId);
  const certs = useCertificatesByProject(projectId);
  const crew = useCrewByProject(projectId);
  const fuel = useFuelByProject(projectId);
  const maintenance = useMaintenanceByProject(projectId);

  const value = useMemo<ProjectDataContextValue>(
    () => ({
      vessels: vessels.vessels ?? [],
      certificates: certs.certificates ?? [],
      crew: crew.crew ?? [],
      fuel: fuel.fuelLogs ?? [],
      maintenance: maintenance.maintenance ?? [],

      loading: {
        vessels: vessels.loading,
        certificates: certs.loading,
        crew: crew.loading,
        fuel: fuel.loading,
        maintenance: maintenance.loading,
      },

      error: {
        vessels: vessels.error,
        certificates: certs.error,
        crew: crew.error,
        fuel: fuel.error,
        maintenance: maintenance.error,
      },

      refresh: {
        vessels: vessels.refresh,
        certificates: certs.refresh,
        crew: crew.refresh,
        fuel: fuel.refresh,
        maintenance: maintenance.refresh,
        all: () => {
          vessels.refresh();
          certs.refresh();
          crew.refresh();
          fuel.refresh();
          maintenance.refresh();
        },
      },
    }),
    [
      vessels,
      certs,
      crew,
      fuel,
      maintenance,
    ],
  );

  return (
    <ProjectDataContext.Provider value={value}>
      {children}
    </ProjectDataContext.Provider>
  );
}

export function useProjectData() {
  const ctx = useContext(ProjectDataContext);
  if (!ctx)
    throw new Error("useProjectData must be used within ProjectDataProvider");
  return ctx;
}
