import { getBaseUrl } from "@/src/api/baseUrl";
import { apiClient } from "@/src/api/client";
import { getToken } from "@/src/helpers/tokenStore";
import { Platform } from "react-native";
import type {
  CreateCrewBulkUploadSessionInput,
  CrewBulkUploadSessionDto,
  CrewBulkUploadSessionSummaryDto,
} from "../contracts/crewBulkUpload.contract";

function appendUploadFile(
  formData: FormData,
  input: CreateCrewBulkUploadSessionInput,
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

  if (input.defaultAssetId?.trim()) {
    formData.append("defaultAssetId", input.defaultAssetId.trim());
  }
}

export async function fetchCrewBulkUploadSessions(
  projectId: string,
): Promise<CrewBulkUploadSessionSummaryDto[]> {
  return apiClient.get<CrewBulkUploadSessionSummaryDto[]>(
    `/projects/${projectId}/crew-bulk-upload-sessions`,
  );
}

export async function fetchCrewBulkUploadSessionById(
  projectId: string,
  sessionId: string,
): Promise<CrewBulkUploadSessionDto> {
  return apiClient.get<CrewBulkUploadSessionDto>(
    `/projects/${projectId}/crew-bulk-upload-sessions/${sessionId}`,
  );
}

export async function createCrewBulkUploadSession(
  projectId: string,
  input: CreateCrewBulkUploadSessionInput,
): Promise<CrewBulkUploadSessionDto> {
  const formData = new FormData();
  appendUploadFile(formData, input);

  return apiClient.post<CrewBulkUploadSessionDto>(
    `/projects/${projectId}/crew-bulk-upload-sessions`,
    formData,
  );
}

export async function commitCrewBulkUploadSession(
  projectId: string,
  sessionId: string,
): Promise<CrewBulkUploadSessionDto> {
  return apiClient.post<CrewBulkUploadSessionDto>(
    `/projects/${projectId}/crew-bulk-upload-sessions/${sessionId}/commit`,
  );
}

export async function reuploadCrewBulkUploadSession(
  projectId: string,
  sessionId: string,
  input: CreateCrewBulkUploadSessionInput,
): Promise<CrewBulkUploadSessionDto> {
  const formData = new FormData();
  appendUploadFile(formData, input);

  return apiClient.post<CrewBulkUploadSessionDto>(
    `/projects/${projectId}/crew-bulk-upload-sessions/${sessionId}/reupload`,
    formData,
  );
}

export async function discardCrewBulkUploadSession(
  projectId: string,
  sessionId: string,
): Promise<CrewBulkUploadSessionDto> {
  return apiClient.post<CrewBulkUploadSessionDto>(
    `/projects/${projectId}/crew-bulk-upload-sessions/${sessionId}/discard`,
  );
}

export async function downloadCrewBulkUploadTemplate(
  projectId: string,
): Promise<void> {
  if (Platform.OS !== "web" || typeof window === "undefined") {
    throw new Error(
      "Template download is currently available on web. Open ARXIS in the browser to download the official workbook.",
    );
  }

  const token = await getToken();
  const response = await fetch(
    `${getBaseUrl()}/projects/${projectId}/crew-bulk-upload-template`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      credentials: "include",
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to download template");
  }

  const buffer = await response.arrayBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "arxis-crew-bulk-upload-template.xlsx";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}
