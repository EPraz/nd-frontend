import React, { createContext, useContext, useMemo } from "react";
import { CrewDto } from "../contracts/crew.contract";
import { MaintenanceDto } from "../contracts/maintenance.contract";
import { CertificateDto } from "../features/certificates/contracts/certificates.contract";
import { useCertificatesByProject } from "../features/certificates/hooks/useCertificatesByProject";
import { useCrewByProject } from "../features/crew/hooks/useCrewByProject";
import { FuelDto } from "../features/fuel/contracts/fuel.contract";
import { useFuelByProject } from "../features/fuel/hooks/useFuelByProject";
import { useMaintenanceByProject } from "../features/maintenance/hooks/useMaintenanceByProject";
import { useProjectContext } from "./ProjectProvider";

// Tipos: ajusta imports si ya tienes DTOs tipados

type ProjectDataContextValue = {
  certificates: CertificateDto[];
  crew: CrewDto[];
  fuel: FuelDto[];
  maintenance: MaintenanceDto[];

  loading: {
    certificates: boolean;
    crew: boolean;
    fuel: boolean;
    maintenance: boolean;
  };

  error: {
    certificates: string | null;
    crew: string | null;
    fuel: string | null;
    maintenance: string | null;
  };

  refresh: {
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

  const certs = useCertificatesByProject(projectId);
  const crew = useCrewByProject(projectId);
  const fuel = useFuelByProject(projectId);
  const maintenance = useMaintenanceByProject(projectId);

  const value = useMemo<ProjectDataContextValue>(
    () => ({
      certificates: certs.certificates ?? [],
      crew: crew.crew ?? [],
      fuel: fuel.fuelLogs ?? [],
      maintenance: maintenance.maintenance ?? [],

      loading: {
        certificates: certs.loading,
        crew: crew.loading,
        fuel: fuel.loading,
        maintenance: maintenance.loading,
      },

      error: {
        certificates: certs.error,
        crew: crew.error,
        fuel: fuel.error,
        maintenance: maintenance.error,
      },

      refresh: {
        certificates: certs.refresh,
        crew: crew.refresh,
        fuel: fuel.refresh,
        maintenance: maintenance.refresh,
        all: () => {
          certs.refresh();
          crew.refresh();
          fuel.refresh();
          maintenance.refresh();
        },
      },
    }),
    [
      certs.certificates,
      certs.loading,
      certs.error,
      certs.refresh,

      crew.crew,
      crew.loading,
      crew.error,
      crew.refresh,

      fuel.fuelLogs,
      fuel.loading,
      fuel.error,
      fuel.refresh,

      maintenance.maintenance,
      maintenance.loading,
      maintenance.error,
      maintenance.refresh,
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
