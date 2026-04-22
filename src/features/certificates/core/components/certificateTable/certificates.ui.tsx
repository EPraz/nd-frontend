import { RegistryTablePill } from "@/src/components/ui/table/RegistryTablePill";
import { humanizeTechnicalLabel } from "@/src/helpers";
import type {
  CertificateStatus,
  CertificateWorkflowStatus,
  RequirementStatus,
} from "@/src/features/certificates/shared/contracts/certificates.contract";

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

  const tone: Record<
    RequirementStatus,
    "warn" | "danger" | "accent" | "ok" | "neutral"
  > = {
    REQUIRED: "warn",
    MISSING: "danger",
    UNDER_REVIEW: "accent",
    PROVIDED: "ok",
    EXPIRED: "danger",
    EXEMPT: "neutral",
  };

  return (
    <RegistryTablePill
      label={humanizeTechnicalLabel(props.status)}
      tone={tone[props.status]}
    />
  );
}

export function DocumentStatePill(props: {
  state:
    | "MISSING"
    | "CANDIDATE"
    | "APPROVED"
    | "SUBMITTED"
    | "REJECTED"
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
    ARCHIVED: "neutral",
    DRAFT: "info",
  };

  const label: Record<typeof props.state, string> = {
    MISSING: "Missing",
    CANDIDATE: "Candidate",
    APPROVED: "Approved",
    SUBMITTED: "Submitted",
    REJECTED: "Rejected",
    ARCHIVED: "Archived",
    DRAFT: "Draft",
  };

  return (
    <RegistryTablePill label={label[props.state]} tone={tone[props.state]} />
  );
}

