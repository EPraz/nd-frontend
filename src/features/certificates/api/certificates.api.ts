import { apiClient } from "@/src/api/client";
import {
  CertificateDto,
  CreateCertificateInput,
  UpdateCertificateInput,
} from "../contracts";

export async function fetchCertificatesByProject(
  projectId: string,
): Promise<CertificateDto[]> {
  return apiClient.get<CertificateDto[]>(`/projects/${projectId}/certificates`);
}

export async function fetchCertificatesByAsset(
  projectId: string,
  assetId: string,
): Promise<CertificateDto[]> {
  return apiClient.get<CertificateDto[]>(
    `/projects/${projectId}/assets/${assetId}/certificates`,
  );
}

export async function fetchCertificatesById(
  projectId: string,
  assetId: string,
  certificateId: string,
): Promise<CertificateDto> {
  return apiClient.get<CertificateDto>(
    `/projects/${projectId}/assets/${assetId}/certificates/${certificateId}`,
  );
}

export async function createCertificate(
  projectId: string,
  input: CreateCertificateInput,
): Promise<CertificateDto> {
  return apiClient.post<CertificateDto>(
    `/projects/${projectId}/certificates`,
    input,
  );
}

export async function updateCertificate(
  projectId: string,
  assetId: string,
  certificateId: string,
  input: UpdateCertificateInput,
): Promise<CertificateDto> {
  return apiClient.patch<CertificateDto>(
    `/projects/${projectId}/assets/${assetId}/certificates/${certificateId}`,
    input,
  );
}
