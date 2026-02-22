import { AssetDto } from "@/src/contracts/assets.contract";

export type CertificateFormValues = {
  assetId: string | null;
  selectedVessel: AssetDto | null;

  name: string;
  number: string;
  issuer: string;
  issueDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
};

export function emptyCertificateFormValues(): CertificateFormValues {
  return {
    assetId: null,
    selectedVessel: null,
    name: "",
    number: "",
    issuer: "",
    issueDate: "",
    expiryDate: "",
  };
}
