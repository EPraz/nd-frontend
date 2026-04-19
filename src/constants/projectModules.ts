export type ProjectSubmoduleCatalogEntry = {
  key: string;
  label: string;
  description: string;
  defaultEnabled: boolean;
};

export type ProjectModuleCatalogEntry = {
  key: string;
  label: string;
  description: string;
  defaultEnabled: boolean;
  submodules: ProjectSubmoduleCatalogEntry[];
};

export const PROJECT_MODULE_CATALOG: ProjectModuleCatalogEntry[] = [
  {
    key: "vessels",
    label: "Vessels",
    description:
      "Core vessel workspace and overview entry point. Other vessel sections inherit from their project modules.",
    defaultEnabled: true,
    submodules: [],
  },
  {
    key: "certificates",
    label: "Certificates",
    description:
      "Certificate compliance and structured records across project and vessel contexts.",
    defaultEnabled: true,
    submodules: [],
  },
  {
    key: "crew",
    label: "Crew",
    description:
      "Crew roster, profiles, and crew certificate workflows across project and vessel contexts.",
    defaultEnabled: true,
    submodules: [],
  },
  {
    key: "maintenance",
    label: "Maintenance",
    description: "Maintenance workflows across project and vessel contexts.",
    defaultEnabled: true,
    submodules: [],
  },
  {
    key: "fuel",
    label: "Fuel",
    description: "Fuel logs and consumption tracking across the project workspace.",
    defaultEnabled: false,
    submodules: [],
  },
];
