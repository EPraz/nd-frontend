const VESSEL_SECTION_MODULE_MAP = {
  overview: "vessels",
  certificates: "certificates",
  crew: "crew",
  maintenance: "maintenance",
  fuel: "fuel",
} as const;

type VesselSectionKey = keyof typeof VESSEL_SECTION_MODULE_MAP;

type GuardMatch = {
  label: string;
  moduleKey: string;
};

export function resolveVesselSectionModuleKey(
  sectionKey: string,
): string | null {
  return (
    VESSEL_SECTION_MODULE_MAP[sectionKey as VesselSectionKey] ?? null
  );
}

export function getGuardedProjectModule(
  pathname: string,
  projectId: string,
): GuardMatch | null {
  const base = `/projects/${projectId}`;

  const checks: (GuardMatch & { prefix: string })[] = [
    { prefix: `${base}/vessels`, label: "Vessels", moduleKey: "vessels" },
    {
      prefix: `${base}/certificates`,
      label: "Certificates",
      moduleKey: "certificates",
    },
    { prefix: `${base}/crew`, label: "Crew", moduleKey: "crew" },
    {
      prefix: `${base}/maintenance`,
      label: "Maintenance",
      moduleKey: "maintenance",
    },
    { prefix: `${base}/fuel`, label: "Fuel", moduleKey: "fuel" },
  ];

  const match = checks.find(
    (entry) => pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`),
  );

  return match ? { label: match.label, moduleKey: match.moduleKey } : null;
}

export function getGuardedVesselSection(
  pathname: string,
  basePath: string,
): GuardMatch | null {
  const checks: (GuardMatch & { href: string })[] = [
    {
      href: `${basePath}/certificates`,
      label: "Certificates",
      moduleKey: "certificates",
    },
    { href: `${basePath}/crew`, label: "Crew", moduleKey: "crew" },
    {
      href: `${basePath}/maintenance`,
      label: "Maintenance",
      moduleKey: "maintenance",
    },
    { href: `${basePath}/fuel`, label: "Fuel", moduleKey: "fuel" },
    { href: basePath, label: "Overview", moduleKey: "vessels" },
  ];

  const match = checks.find(
    (entry) => pathname === entry.href || pathname.startsWith(`${entry.href}/`),
  );

  return match ? { label: match.label, moduleKey: match.moduleKey } : null;
}
