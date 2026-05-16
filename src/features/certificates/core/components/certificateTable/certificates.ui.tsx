import { RegistryTablePill } from "@/src/components/ui/table/RegistryTablePill";
import { humanizeTechnicalLabel } from "@/src/helpers";
import type {
  CertificateDocumentKind,
  CertificateStatus,
  CertificateWorkflowStatus,
  RequirementStatus,
} from "@/src/features/certificates/shared/contracts/certificates.contract";
import {
  documentKindLabel,
  documentKindTone,
  requirementStatusTone,
} from "@/src/features/certificates/shared";

export function CertificateStatusPill(props: { status: CertificateStatus }) {
  const s = props.status;

  const tone: Record<CertificateStatus, "ok" | "warn" | "danger" | "info"> = {
    VALID: "ok",
    EXPIRING_SOON: "warn",
    EXPIRED: "danger",
    PENDING: "info",
  };

  return <RegistryTablePill label={humanizeTechnicalLabel(s)} tone={tone[s]} />;
}

export function WorkflowStatusPill(props: { status: CertificateWorkflowStatus }) {
  const tone: Record<
    CertificateWorkflowStatus,
    "info" | "accent" | "ok" | "danger" | "neutral"
  > = {
    DRAFT: "info",
    SUBMITTED: "accent",
    APPROVED: "ok",
    REJECTED: "danger",
    ARCHIVED: "neutral",
  };

  return (
    <RegistryTablePill
      label={humanizeTechnicalLabel(props.status)}
      tone={tone[props.status]}
    />
  );
}

export function RequirementStatusPill(props: {
  status?: RequirementStatus | null;
}) {
  if (!props.status) {
    return <RegistryTablePill label="N/A" tone="info" />;
  }

  return (
    <RegistryTablePill
      label={humanizeTechnicalLabel(props.status)}
      tone={requirementStatusTone(props.status)}
    />
  );
}

export function DocumentKindPill(props: { kind: CertificateDocumentKind }) {
  return (
    <RegistryTablePill
      label={documentKindLabel(props.kind)}
      tone={documentKindTone(props.kind)}
    />
  );
}

export function ExpiryRequirementPill(props: { requiresExpiry: boolean }) {
  return props.requiresExpiry ? (
    <RegistryTablePill label="Expiry tracked" tone="warn" />
  ) : (
    <RegistryTablePill label="No expiry required" tone="neutral" />
  );
}

export function DocumentStatePill(props: {
  state:
    | "MISSING"
    | "CANDIDATE"
    | "APPROVED"
    | "SUBMITTED"
    | "REJECTED"
    | "PARENT_BLOCKED"
    | "ARCHIVED"
    | "DRAFT";
}) {
  const tone: Record<
    typeof props.state,
    "danger" | "accent" | "ok" | "neutral" | "info"
  > = {
    MISSING: "danger",
    CANDIDATE: "accent",
    APPROVED: "ok",
    SUBMITTED: "accent",
    REJECTED: "danger",
    PARENT_BLOCKED: "danger",
    ARCHIVED: "neutral",
    DRAFT: "info",
  };

  return (
    <RegistryTablePill
      label={humanizeTechnicalLabel(props.state)}
      tone={tone[props.state]}
    />
  );
}

