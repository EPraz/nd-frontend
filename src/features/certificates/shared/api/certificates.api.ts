import { apiClient } from "@/src/api/client";
import type { PaginationRequest } from "@/src/contracts/pagination.contract";
import { buildPaginationQuery } from "@/src/contracts/pagination.contract";
import {
  CertificateDto,
  CertificateIngestionDto,
  CertificatePageDto,
  CertificateRequirementDto,
  CertificateRequirementPageDto,
  CertificateTypeDto,
  ConfirmCertificateIngestionInput,
  ConfirmCertificateIngestionResultDto,
  CreateCertificateIngestionInput,
  GenerateRequirementsResult,
} from "@/src/features/certificates/shared";

type CertificateTableQuery = PaginationRequest & {
  sort?: string;
  search?: string;
  status?: string;
  workflowStatus?: string;
  assetId?: string;
  category?: string;
  dateWindow?: string;
  dateFrom?: string;
  dateTo?: string;
};

export async function fetchCertificateTypes(
  projectId: string,
): Promise<CertificateTypeDto[]> {
  return apiClient.get<CertificateTypeDto[]>(
    `/projects/${projectId}/certificate-types`,
  );
}

export async function fetchCertificatesByProject(
  projectId: string,
): Promise<CertificateDto[]> {
  return apiClient.get<CertificateDto[]>(`/projects/${projectId}/certificates`);
}

export async function fetchCertificatePageByProject(
  projectId: string,
  params: CertificateTableQuery,
): Promise<CertificatePageDto> {
  return apiClient.get<CertificatePageDto>(
    `/projects/${projectId}/certificates${buildPaginationQuery(params)}`,
  );
}

export async function fetchCertificatesByAsset(
  projectId: string,
  assetId: string,
): Promise<CertificateDto[]> {
  return apiClient.get<CertificateDto[]>(
    `/projects/${projectId}/assets/${assetId}/certificates`,
  );
}

export async function fetchCertificatePageByAsset(
  projectId: string,
  assetId: string,
  params: CertificateTableQuery,
): Promise<CertificatePageDto> {
  return apiClient.get<CertificatePageDto>(
    `/projects/${projectId}/assets/${assetId}/certificates${buildPaginationQuery(params)}`,
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

export async function fetchCertificateRequirementsByProject(
  projectId: string,
): Promise<CertificateRequirementDto[]> {
  return apiClient.get<CertificateRequirementDto[]>(
    `/projects/${projectId}/certificate-requirements`,
  );
}

export async function fetchCertificateRequirementPageByProject(
  projectId: string,
  params: CertificateTableQuery,
): Promise<CertificateRequirementPageDto> {
  return apiClient.get<CertificateRequirementPageDto>(
    `/projects/${projectId}/certificate-requirements${buildPaginationQuery(params)}`,
  );
}

export async function fetchCertificateRequirementsByAsset(
  projectId: string,
  assetId: string,
): Promise<CertificateRequirementDto[]> {
  return apiClient.get<CertificateRequirementDto[]>(
    `/projects/${projectId}/assets/${assetId}/certificate-requirements`,
  );
}

export async function fetchCertificateRequirementPageByAsset(
  projectId: string,
  assetId: string,
  params: CertificateTableQuery,
): Promise<CertificateRequirementPageDto> {
  return apiClient.get<CertificateRequirementPageDto>(
    `/projects/${projectId}/assets/${assetId}/certificate-requirements${buildPaginationQuery(params)}`,
  );
}

export async function generateCertificateRequirementsByProject(
  projectId: string,
): Promise<GenerateRequirementsResult> {
  return apiClient.post<GenerateRequirementsResult>(
    `/projects/${projectId}/certificate-requirements/generate`,
  );
}

export async function generateCertificateRequirementsByAsset(
  projectId: string,
  assetId: string,
): Promise<GenerateRequirementsResult> {
  return apiClient.post<GenerateRequirementsResult>(
    `/projects/${projectId}/assets/${assetId}/certificate-requirements/generate`,
  );
}

function appendUploadFile(formData: FormData, input: CreateCertificateIngestionInput) {
  const normalizedType = input.file.mimeType || "application/octet-stream";

  if (input.file.file) {
    formData.append("file", input.file.file as Blob, input.file.name);
  } else {
    formData.append("file", {
      uri: input.file.uri,
      name: input.file.name,
      type: normalizedType,
    } as never);
  }

  if (input.notes?.trim()) formData.append("notes", input.notes.trim());
  if (input.certificateTypeId?.trim()) {
    formData.append("certificateTypeId", input.certificateTypeId.trim());
  }
}

export async function createRequirementIngestion(
  projectId: string,
  assetId: string,
  requirementId: string,
  input: CreateCertificateIngestionInput,
): Promise<CertificateIngestionDto> {
  const formData = new FormData();
  appendUploadFile(formData, input);

  return apiClient.post<CertificateIngestionDto>(
    `/projects/${projectId}/assets/${assetId}/certificate-requirements/${requirementId}/ingestions`,
    formData,
  );
}

export async function createExtraCertificateIngestion(
  projectId: string,
  assetId: string,
  input: CreateCertificateIngestionInput,
): Promise<CertificateIngestionDto> {
  const formData = new FormData();
  appendUploadFile(formData, input);

  return apiClient.post<CertificateIngestionDto>(
    `/projects/${projectId}/assets/${assetId}/certificate-ingestions/extra`,
    formData,
  );
}

export async function fetchCertificateIngestionById(
  projectId: string,
  assetId: string,
  ingestionId: string,
): Promise<CertificateIngestionDto> {
  return apiClient.get<CertificateIngestionDto>(
    `/projects/${projectId}/assets/${assetId}/certificate-ingestions/${ingestionId}`,
  );
}

export async function confirmCertificateIngestion(
  projectId: string,
  assetId: string,
  ingestionId: string,
  input: ConfirmCertificateIngestionInput,
): Promise<ConfirmCertificateIngestionResultDto> {
  return apiClient.post<ConfirmCertificateIngestionResultDto>(
    `/projects/${projectId}/assets/${assetId}/certificate-ingestions/${ingestionId}/confirm`,
    input,
  );
}

export async function cancelCertificateIngestion(
  projectId: string,
  assetId: string,
  ingestionId: string,
): Promise<CertificateIngestionDto> {
  return apiClient.post<CertificateIngestionDto>(
    `/projects/${projectId}/assets/${assetId}/certificate-ingestions/${ingestionId}/cancel`,
  );
}

export async function approveCertificate(
  projectId: string,
  assetId: string,
  certificateId: string,
): Promise<CertificateDto> {
  return apiClient.post<CertificateDto>(
    `/projects/${projectId}/assets/${assetId}/certificates/${certificateId}/approve`,
  );
}

export async function rejectCertificate(
  projectId: string,
  assetId: string,
  certificateId: string,
): Promise<CertificateDto> {
  return apiClient.post<CertificateDto>(
    `/projects/${projectId}/assets/${assetId}/certificates/${certificateId}/reject`,
  );
}

export async function deleteCertificate(
  projectId: string,
  assetId: string,
  certificateId: string,
): Promise<CertificateDto> {
  return apiClient.delete<CertificateDto>(
    `/projects/${projectId}/assets/${assetId}/certificates/${certificateId}`,
  );
}

export async function deleteCertificateAttachment(
  projectId: string,
  assetId: string,
  certificateId: string,
  attachmentId: string,
): Promise<CertificateDto> {
  return apiClient.delete<CertificateDto>(
    `/projects/${projectId}/assets/${assetId}/certificates/${certificateId}/attachments/${attachmentId}`,
  );
}

