import { apiClient } from "@/src/api/client";
import {
  ConfirmCrewCertificateIngestionInput,
  ConfirmCrewCertificateIngestionResultDto,
  CreateCrewCertificateIngestionInput,
  CrewCertificateDto,
  CrewCertificateIngestionDto,
  CrewCertificateRequirementDto,
  CrewRequirementGenerationResult,
} from "../contracts";

function appendUploadFile(
  formData: FormData,
  input: CreateCrewCertificateIngestionInput,
) {
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

export async function fetchCrewCertificateRequirementsByProject(
  projectId: string,
): Promise<CrewCertificateRequirementDto[]> {
  return apiClient.get<CrewCertificateRequirementDto[]>(
    `/projects/${projectId}/crew-certificate-requirements`,
  );
}

export async function fetchCrewCertificateRequirementsByCrew(
  projectId: string,
  assetId: string,
  crewId: string,
): Promise<CrewCertificateRequirementDto[]> {
  return apiClient.get<CrewCertificateRequirementDto[]>(
    `/projects/${projectId}/assets/${assetId}/crew/${crewId}/certificate-requirements`,
  );
}

export async function generateCrewCertificateRequirementsByProject(
  projectId: string,
): Promise<CrewRequirementGenerationResult> {
  return apiClient.post<CrewRequirementGenerationResult>(
    `/projects/${projectId}/crew-certificate-requirements/generate`,
  );
}

export async function generateCrewCertificateRequirementsByCrew(
  projectId: string,
  assetId: string,
  crewId: string,
): Promise<CrewRequirementGenerationResult> {
  return apiClient.post<CrewRequirementGenerationResult>(
    `/projects/${projectId}/assets/${assetId}/crew/${crewId}/certificate-requirements/generate`,
  );
}

export async function fetchCrewCertificatesByCrew(
  projectId: string,
  assetId: string,
  crewId: string,
): Promise<CrewCertificateDto[]> {
  return apiClient.get<CrewCertificateDto[]>(
    `/projects/${projectId}/assets/${assetId}/crew/${crewId}/certificates`,
  );
}

export async function fetchCrewCertificateById(
  projectId: string,
  assetId: string,
  crewId: string,
  certificateId: string,
): Promise<CrewCertificateDto> {
  return apiClient.get<CrewCertificateDto>(
    `/projects/${projectId}/assets/${assetId}/crew/${crewId}/certificates/${certificateId}`,
  );
}

export async function createCrewRequirementIngestion(
  projectId: string,
  assetId: string,
  crewId: string,
  requirementId: string,
  input: CreateCrewCertificateIngestionInput,
): Promise<CrewCertificateIngestionDto> {
  const formData = new FormData();
  appendUploadFile(formData, input);

  return apiClient.post<CrewCertificateIngestionDto>(
    `/projects/${projectId}/assets/${assetId}/crew/${crewId}/certificate-requirements/${requirementId}/ingestions`,
    formData,
  );
}

export async function createExtraCrewCertificateIngestion(
  projectId: string,
  assetId: string,
  crewId: string,
  input: CreateCrewCertificateIngestionInput,
): Promise<CrewCertificateIngestionDto> {
  const formData = new FormData();
  appendUploadFile(formData, input);

  return apiClient.post<CrewCertificateIngestionDto>(
    `/projects/${projectId}/assets/${assetId}/crew/${crewId}/certificate-ingestions/extra`,
    formData,
  );
}

export async function fetchCrewCertificateIngestionById(
  projectId: string,
  assetId: string,
  crewId: string,
  ingestionId: string,
): Promise<CrewCertificateIngestionDto> {
  return apiClient.get<CrewCertificateIngestionDto>(
    `/projects/${projectId}/assets/${assetId}/crew/${crewId}/certificate-ingestions/${ingestionId}`,
  );
}

export async function confirmCrewCertificateIngestion(
  projectId: string,
  assetId: string,
  crewId: string,
  ingestionId: string,
  input: ConfirmCrewCertificateIngestionInput,
): Promise<ConfirmCrewCertificateIngestionResultDto> {
  return apiClient.post<ConfirmCrewCertificateIngestionResultDto>(
    `/projects/${projectId}/assets/${assetId}/crew/${crewId}/certificate-ingestions/${ingestionId}/confirm`,
    input,
  );
}

export async function cancelCrewCertificateIngestion(
  projectId: string,
  assetId: string,
  crewId: string,
  ingestionId: string,
): Promise<CrewCertificateIngestionDto> {
  return apiClient.post<CrewCertificateIngestionDto>(
    `/projects/${projectId}/assets/${assetId}/crew/${crewId}/certificate-ingestions/${ingestionId}/cancel`,
  );
}

export async function approveCrewCertificate(
  projectId: string,
  assetId: string,
  crewId: string,
  certificateId: string,
): Promise<CrewCertificateDto> {
  return apiClient.post<CrewCertificateDto>(
    `/projects/${projectId}/assets/${assetId}/crew/${crewId}/certificates/${certificateId}/approve`,
  );
}

export async function rejectCrewCertificate(
  projectId: string,
  assetId: string,
  crewId: string,
  certificateId: string,
): Promise<CrewCertificateDto> {
  return apiClient.post<CrewCertificateDto>(
    `/projects/${projectId}/assets/${assetId}/crew/${crewId}/certificates/${certificateId}/reject`,
  );
}

export async function deleteCrewCertificateAttachment(
  projectId: string,
  assetId: string,
  crewId: string,
  certificateId: string,
  attachmentId: string,
): Promise<CrewCertificateDto> {
  return apiClient.delete<CrewCertificateDto>(
    `/projects/${projectId}/assets/${assetId}/crew/${crewId}/certificates/${certificateId}/attachments/${attachmentId}`,
  );
}

export async function deleteCrewCertificate(
  projectId: string,
  assetId: string,
  crewId: string,
  certificateId: string,
): Promise<CrewCertificateDto> {
  return apiClient.delete<CrewCertificateDto>(
    `/projects/${projectId}/assets/${assetId}/crew/${crewId}/certificates/${certificateId}`,
  );
}
