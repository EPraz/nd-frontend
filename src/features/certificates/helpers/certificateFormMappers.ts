import {
  CertificateDto,
  CertificateFormValues,
  CreateCertificateInput,
  UpdateCertificateInput,
} from "../contracts";
import { toDateOnly } from "./certificates.form";

export function toUpdateCertificateInput(args: {
  values: CertificateFormValues;
  fixedAssetId?: string | null; // si quieres bloquear vessel en edit
  allowMoveVessel?: boolean; // default true
}): UpdateCertificateInput {
  const { values, fixedAssetId, allowMoveVessel = true } = args;

  const effectiveAssetId =
    fixedAssetId ?? values.assetId ?? values.selectedVessel?.id ?? null;

  if (!effectiveAssetId) throw new Error("assetId is required");

  return {
    ...(allowMoveVessel ? { assetId: effectiveAssetId } : {}),

    name: values.name.trim(),
    number: values.number.trim() ? values.number.trim() : null,
    issuer: values.issuer.trim() ? values.issuer.trim() : null,
    issueDate: values.issueDate.trim()
      ? `${values.issueDate.trim()}T00:00:00.000Z`
      : null,
    expiryDate: values.expiryDate.trim()
      ? `${values.expiryDate.trim()}T00:00:00.000Z`
      : null,
  };
}

export function certificateFormFromDto(
  dto: CertificateDto,
): Omit<CertificateFormValues, "selectedVessel"> {
  return {
    assetId: dto.assetId ?? null,
    name: dto.name ?? "",
    number: dto.number ?? "",
    issuer: dto.issuer ?? "",
    issueDate: toDateOnly(dto.issueDate),
    expiryDate: toDateOnly(dto.expiryDate),
  };
}

export function toCreateCertificateInput(
  values: CertificateFormValues & { assetId: string },
): CreateCertificateInput {
  return {
    assetId: values.assetId,

    name: values.name.trim(),

    number: values.number.trim() || undefined,
    issuer: values.issuer.trim() || undefined,

    issueDate: values.issueDate.trim()
      ? `${values.issueDate.trim()}T00:00:00.000Z`
      : undefined,

    expiryDate: values.expiryDate.trim()
      ? `${values.expiryDate.trim()}T00:00:00.000Z`
      : undefined,

    status: "PENDING",
  };
}
