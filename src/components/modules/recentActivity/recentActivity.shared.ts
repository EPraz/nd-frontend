import type {
  AuditAction,
  AuditEventDto,
  AuditModuleKey,
} from "@/src/contracts/audit.contract";
import { toneClasses, type Tone } from "@/src/components/ui/toneClasses/ToneClasses";

type EnabledModuleFn = (moduleKey: string) => boolean;

const MODULE_LABELS: Record<AuditModuleKey, string> = {
  PROJECTS: "Project",
  VESSELS: "Vessels",
  CERTIFICATES: "Certificates",
  CREW: "Crew",
  CREW_CERTIFICATES: "Crew Certificates",
  MAINTENANCE: "Maintenance",
  FUEL: "Fuel",
  ADMIN: "Admin",
};

function entitlementKeyForModule(moduleKey: AuditModuleKey): string | null {
  switch (moduleKey) {
    case "VESSELS":
      return "vessels";
    case "CERTIFICATES":
      return "certificates";
    case "CREW":
    case "CREW_CERTIFICATES":
      return "crew";
    case "MAINTENANCE":
      return "maintenance";
    case "FUEL":
      return "fuel";
    case "PROJECTS":
    case "ADMIN":
    default:
      return null;
  }
}

export function filterVisibleAuditEvents(
  events: AuditEventDto[],
  isModuleEnabled?: EnabledModuleFn,
) {
  if (!isModuleEnabled) {
    return events;
  }

  return events.filter((event) => {
    const entitlementKey = entitlementKeyForModule(event.moduleKey);
    return entitlementKey ? isModuleEnabled(entitlementKey) : true;
  });
}

export function auditModuleLabel(moduleKey: AuditModuleKey) {
  return MODULE_LABELS[moduleKey];
}

export function auditTone(action: AuditAction): Tone {
  switch (action) {
    case "SOFT_DELETE":
    case "REJECT":
      return "fail";
    case "APPROVE":
    case "CONFIRM":
      return "ok";
    case "CONFIGURE":
    case "REFRESH":
    case "ATTACHMENT_REMOVE":
      return "warn";
    case "CREATE":
    case "UPDATE":
    default:
      return "info";
  }
}

export function auditToneClasses(action: AuditAction) {
  return toneClasses(auditTone(action));
}

export function formatAuditTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

