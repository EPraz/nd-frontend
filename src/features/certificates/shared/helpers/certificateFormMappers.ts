import {
  CertificateDto,
  CertificateIngestionDto,
  CertificateFormValues,
  CertificateTypeDto,
  ConfirmCertificateIngestionInput,
  UpdateCertificateInput,
} from "@/src/features/certificates/shared";
import { toDateOnly } from "./certificates.form";

export function certificateFormFromIngestion(
  ingestion: CertificateIngestionDto,
  certificateTypes: CertificateTypeDto[] = [],
): Omit<CertificateFormValues, "selectedVessel"> {
  const selectedCertificateType =
    certificateTypes.find((type) => type.id === ingestion.certificateTypeId) ??
    null;
  const expiryDate =
    selectedCertificateType?.requiresExpiry === false
      ? ""
      : toDateOnly(ingestion.candidateExpiryDate);

  return {
    assetId: ingestion.assetId ?? null,
    certificateTypeId: ingestion.certificateTypeId ?? null,
    selectedCertificateType,
    parentCertificateId: null,
    number: ingestion.candidateNumber ?? "",
    issuer: ingestion.candidateIssuer ?? "",
    issueDate: toDateOnly(ingestion.candidateIssueDate),
    expiryDate,
    notes: ingestion.candidateNotes ?? "",
  };
}

export function toConfirmCertificateIngestionInput(
  values: CertificateFormValues & { certificateTypeId: string },
): ConfirmCertificateIngestionInput {
  return {
    certificateTypeId: values.certificateTypeId,
    parentCertificateId: values.parentCertificateId,
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

export type CertificateMetadataFormValues = Pick<
  CertificateFormValues,
  "number" | "issuer" | "issueDate" | "expiryDate" | "notes"
>;

export function certificateMetadataFormFromCertificate(
  certificate: CertificateDto,
): CertificateMetadataFormValues {
  return {
    number: certificate.number ?? "",
    issuer: certificate.issuer ?? "",
    issueDate: toDateOnly(certificate.issueDate),
    expiryDate: toDateOnly(certificate.expiryDate),
    notes: certificate.notes ?? "",
  };
}

export function toUpdateCertificateInput(
  values: CertificateMetadataFormValues,
): UpdateCertificateInput {
  return {
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
