import { ProjectKind } from "@/src/contracts/projects.contract";

export const KIND_LABEL: Record<ProjectKind, string> = {
  MARITIME: "Maritime operations",
  STORE: "Retail workspace",
  BARBERSHOP: "Service workspace",
  OTHER: "Operational workspace",
};

export const KIND_SHORT_LABEL: Record<ProjectKind, string> = {
  MARITIME: "Maritime",
  STORE: "Retail",
  BARBERSHOP: "Service",
  OTHER: "General",
};

export function isActiveStatus(status: string) {
  return ["active", "open", "running"].includes(status.toLowerCase());
}

export function statusTone(status: string) {
  const normalizedStatus = status.toLowerCase();

  if (isActiveStatus(status)) {
    return {
      pill: "border-success bg-[#153b30]",
      dot: "bg-success",
      text: "text-success",
    };
  }

  if (["paused", "on_hold", "blocked"].includes(normalizedStatus)) {
    return {
      pill: "border-warning bg-[#3f3322]",
      dot: "bg-warning",
      text: "text-warning",
    };
  }

  return {
    pill: "border-shellLine bg-[#303a4d]",
    dot: "bg-muted",
    text: "text-muted",
  };
}

export function formatWorkspaceDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
