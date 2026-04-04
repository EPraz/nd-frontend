import {
  CertificateIngestionDto,
  CertificateDto,
  CertificateFormValues,
  CertificateTypeDto,
  ConfirmCertificateIngestionInput,
  CreateCertificateInput,
  UpdateCertificateInput,
} from "../contracts";
import { toDateOnly } from "./certificates.form";

export function toUpdateCertificateInput(args: {
  values: CertificateFormValues;
  fixedAssetId?: string | null;
  allowMoveVessel?: boolean;
}): UpdateCertificateInput {
  const { values, fixedAssetId, allowMoveVessel = true } = args;

  const effectiveAssetId =
    fixedAssetId ?? values.assetId ?? values.selectedVessel?.id ?? null;

  if (!effectiveAssetId) throw new Error("assetId is required");
  if (!values.certificateTypeId) throw new Error("certificateTypeId is required");

  return {
    ...(allowMoveVessel ? { assetId: effectiveAssetId } : {}),
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

export function certificateFormFromDto(
  dto: CertificateDto,
  certificateTypes: CertificateTypeDto[] = [],
): Omit<CertificateFormValues, "selectedVessel"> {
  const selectedCertificateType =
    certificateTypes.find((type) => type.id === dto.certificateTypeId) ?? null;

  return {
    assetId: dto.assetId ?? null,
    certificateTypeId: dto.certificateTypeId ?? null,
    selectedCertificateType,
    number: dto.number ?? "",
    issuer: dto.issuer ?? "",
    issueDate: toDateOnly(dto.issueDate),
    expiryDate: toDateOnly(dto.expiryDate),
    notes: dto.notes ?? "",
  };
}

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

export function toCreateCertificateInput(
  values: CertificateFormValues & { assetId: string; certificateTypeId: string },
): CreateCertificateInput {
  return {
    assetId: values.assetId,
    certificateTypeId: values.certificateTypeId,
    number: values.number.trim() || undefined,
    issuer: values.issuer.trim() || undefined,
    issueDate: values.issueDate.trim()
      ? `${values.issueDate.trim()}T00:00:00.000Z`
      : undefined,
    expiryDate: values.expiryDate.trim()
      ? `${values.expiryDate.trim()}T00:00:00.000Z`
      : undefined,
    notes: values.notes.trim() || undefined,
    status: "PENDING",
    workflowStatus: "DRAFT",
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
