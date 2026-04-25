import {
  CertificateIngestionDto,
  CertificateFormValues,
  CertificateTypeDto,
  ConfirmCertificateIngestionInput,
} from "@/src/features/certificates/shared";
import { toDateOnly } from "./certificates.form";

export function certificateFormFromIngestion(
  ingestion: CertificateIngestionDto,
  certificateTypes: CertificateTypeDto[] = [],
): Omit<CertificateFormValues, "selectedVessel"> {
  const selectedCertificateType =
    certificateTypes.find((type) => type.id === ingestion.certificateTypeId) ??
    null;

  return {
    assetId: ingestion.assetId ?? null,
    certificateTypeId: ingestion.certificateTypeId ?? null,
    selectedCertificateType,
    number: ingestion.candidateNumber ?? "",
    issuer: ingestion.candidateIssuer ?? "",
    issueDate: toDateOnly(ingestion.candidateIssueDate),
    expiryDate: toDateOnly(ingestion.candidateExpiryDate),
    notes: ingestion.candidateNotes ?? "",
  };
}

export function toConfirmCertificateIngestionInput(
  values: CertificateFormValues & { certificateTypeId: string },
): ConfirmCertificateIngestionInput {
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

