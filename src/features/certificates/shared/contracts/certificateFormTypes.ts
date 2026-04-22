import { AssetDto } from "@/src/contracts/assets.contract";
import { CertificateTypeDto } from "./certificates.contract";

export type CertificateFormValues = {
  assetId: string | null;
  selectedVessel: AssetDto | null;
  certificateTypeId: string | null;
  selectedCertificateType: CertificateTypeDto | null;
  number: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  notes: string;
};

export function emptyCertificateFormValues(): CertificateFormValues {
  return {
    assetId: null,
    selectedVessel: null,
    certificateTypeId: null,
    selectedCertificateType: null,
    number: "",
    issuer: "",
    issueDate: "",
    expiryDate: "",
    notes: "",
  };
}
