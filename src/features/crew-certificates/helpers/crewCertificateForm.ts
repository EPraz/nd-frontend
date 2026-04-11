import type { CertificateTypeDto } from "@/src/features/certificates/contracts";
import type { UseFormSetValue } from "react-hook-form";
import type {
  ConfirmCrewCertificateIngestionInput,
  CrewCertificateDto,
  CrewCertificateIngestionDto,
} from "../contracts";

export type CrewCertificateFormValues = {
  certificateTypeId: string | null;
  selectedCertificateType: CertificateTypeDto | null;
  number: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  notes: string;
};

export function emptyCrewCertificateFormValues(): CrewCertificateFormValues {
  return {
    certificateTypeId: null,
    selectedCertificateType: null,
    number: "",
    issuer: "",
    issueDate: "",
    expiryDate: "",
    notes: "",
  };
}

export function applyCrewCertificateFormPatch(
  setValue: UseFormSetValue<CrewCertificateFormValues>,
  patchValues: Partial<CrewCertificateFormValues>,
) {
  for (const key of Object.keys(patchValues) as (keyof CrewCertificateFormValues)[]) {
    const value = patchValues[key];
    if (value === undefined) continue;

    setValue(key, value as never, {
      shouldDirty: true,
      shouldTouch: true,
    });
  }
}

function toDateOnly(value?: string | null): string {
  return value ? value.slice(0, 10) : "";
}

export function crewCertificateFormFromIngestion(
  ingestion: CrewCertificateIngestionDto,
  certificateTypes: CertificateTypeDto[] = [],
): CrewCertificateFormValues {
  const selectedCertificateType =
    certificateTypes.find((type) => type.id === ingestion.certificateTypeId) ??
    null;

  return {
    certificateTypeId: ingestion.certificateTypeId ?? null,
    selectedCertificateType,
    number: ingestion.candidateNumber ?? "",
    issuer: ingestion.candidateIssuer ?? "",
    issueDate: toDateOnly(ingestion.candidateIssueDate),
    expiryDate: toDateOnly(ingestion.candidateExpiryDate),
    notes: ingestion.candidateNotes ?? "",
  };
}

export function crewCertificateFormFromDto(
  certificate: CrewCertificateDto,
  certificateTypes: CertificateTypeDto[] = [],
): CrewCertificateFormValues {
  const selectedCertificateType =
    certificateTypes.find((type) => type.id === certificate.certificateTypeId) ??
    null;

  return {
    certificateTypeId: certificate.certificateTypeId,
    selectedCertificateType,
    number: certificate.number ?? "",
    issuer: certificate.issuer ?? "",
    issueDate: toDateOnly(certificate.issueDate),
    expiryDate: toDateOnly(certificate.expiryDate),
    notes: certificate.notes ?? "",
  };
}

export function toConfirmCrewCertificateIngestionInput(
  values: CrewCertificateFormValues & { certificateTypeId: string },
): ConfirmCrewCertificateIngestionInput {
  return {
    certificateTypeId: values.certificateTypeId,
    number: values.number.trim() ? values.number.trim() : null,
    issuer: values.issuer.trim() ? values.issuer.trim() : null,
    issueDate: values.issueDate.trim()
      ? `${values.issueDate.trim()}T00:00:00.000Z`
      : null,
    expiryDate: values.expiryDate.trim()
      ? `${values.expiryDate.trim()}T00:00:00.000Z`
      : null,
    notes: values.notes.trim() ? values.notes.trim() : null,
  };
}
