export type CertificateStatus =
  | "VALID"
  | "EXPIRED"
  | "EXPIRING_SOON"
  | "PENDING";

export type CertificateDto = {
  id: string;
  assetId: string;
  assetName: string;
  name: string;
  number: string | null;
  issuer: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  status: CertificateStatus;
  createdAt: string;
};

export type CreateCertificateInput = {
  name: string;
  number?: string;
  issuer?: string;
  issueDate?: string;
  expiryDate?: string;
  status?: CertificateStatus;
  assetId: string;
};

export type UpdateCertificateInput = {
  // opcional si NO quieres permitir moverlo de vessel en edit:
  assetId?: string;

  name?: string;
  number?: string | null;
  issuer?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  status?: CertificateStatus;
};
