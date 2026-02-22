import { createContext, useContext } from "react";
import { ProjectKind } from "../contracts/projects.contract";

export type ProjectContextValue = {
  projectId: string;
  projectName: string;
  projectKind: ProjectKind;
  projectStatus: string;
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({
  value,
  children,
}: {
  value: ProjectContextValue;
  children: React.ReactNode;
}) {
  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const ctx = useContext(ProjectContext);
  if (!ctx)
    throw new Error("useProjectContext must be used within ProjectProvider");
  return ctx;
}
