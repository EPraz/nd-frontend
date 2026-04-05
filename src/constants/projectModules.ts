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
    description: "Core vessel workspace, overview page, and vessel-level navigation.",
    defaultEnabled: true,
    submodules: [
      {
        key: "overview",
        label: "Overview",
        description: "Vessel overview and operational snapshot.",
        defaultEnabled: true,
      },
      {
        key: "certificates",
        label: "Certificates",
        description: "Vessel certificate compliance and records inside the vessel shell.",
        defaultEnabled: true,
      },
      {
        key: "crew",
        label: "Crew",
        description: "Crew roster inside the vessel shell.",
        defaultEnabled: true,
      },
      {
        key: "maintenance",
        label: "Maintenance",
        description: "Maintenance work inside the vessel shell.",
        defaultEnabled: true,
      },
      {
        key: "fuel",
        label: "Fuel",
        description: "Fuel tracking inside the vessel shell.",
        defaultEnabled: false,
      },
    ],
  },
  {
    key: "certificates",
    label: "Certificates",
    description: "Project-level certificate compliance and structured records.",
    defaultEnabled: true,
    submodules: [
      {
        key: "requirements",
        label: "Requirements",
        description: "Expected compliance work by vessel.",
        defaultEnabled: true,
      },
      {
        key: "records",
        label: "Records",
        description: "Structured certificate evidence on file.",
        defaultEnabled: true,
      },
    ],
  },
  {
    key: "crew",
    label: "Crew",
    description: "Crew roster, profiles, and crew-level workflows.",
    defaultEnabled: true,
    submodules: [
      {
        key: "members",
        label: "Members",
        description: "Crew list and crew member profiles.",
        defaultEnabled: true,
      },
      {
        key: "certificates",
        label: "Crew Certificates",
        description: "Rank-based crew compliance and certificate records.",
        defaultEnabled: true,
      },
    ],
  },
  {
    key: "maintenance",
    label: "Maintenance",
    description: "Project and vessel maintenance workflows.",
    defaultEnabled: true,
    submodules: [
      {
        key: "tasks",
        label: "Tasks",
        description: "Maintenance task list and task detail flows.",
        defaultEnabled: true,
      },
    ],
  },
  {
    key: "fuel",
    label: "Fuel",
    description: "Fuel logs and consumption tracking.",
    defaultEnabled: false,
    submodules: [
      {
        key: "logs",
        label: "Logs",
        description: "Fuel entries, events, and summaries.",
        defaultEnabled: false,
      },
    ],
  },
];
