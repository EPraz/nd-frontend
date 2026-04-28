import { getBaseUrl } from "@/src/api/baseUrl";
import { apiClient } from "@/src/api/client";
import type { PaginationRequest } from "@/src/contracts/pagination.contract";
import { buildPaginationQuery } from "@/src/contracts/pagination.contract";
import { getToken } from "@/src/helpers/tokenStore";
import { Platform } from "react-native";
import type {
  CreateCrewBulkUploadSessionInput,
  CrewBulkUploadRowPageDto,
  CrewBulkUploadSessionDto,
  CrewBulkUploadSessionPageDto,
  CrewBulkUploadSessionSummaryDto,
} from "../contracts/crewBulkUpload.contract";

type CrewBulkUploadSessionPageQuery = PaginationRequest & {
  sort?: string;
  search?: string;
  status?: string;
  defaultAssetId?: string;
  hasCriticalIssues?: string;
};

type CrewBulkUploadRowPageQuery = PaginationRequest & {
  sort?: string;
  search?: string;
  rowKind?: string;
  proposedAction?: string;
  commitStatus?: string;
  issueSeverity?: string;
};

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

export async function fetchCrewBulkUploadSessionsPage(
  projectId: string,
  params: CrewBulkUploadSessionPageQuery,
): Promise<CrewBulkUploadSessionPageDto> {
  return apiClient.get<CrewBulkUploadSessionPageDto>(
    `/projects/${projectId}/crew-bulk-upload-sessions${buildPaginationQuery(params)}`,
  );
}

export async function fetchCrewBulkUploadSessionById(
  projectId: string,
  sessionId: string,
  includeRows = true,
): Promise<CrewBulkUploadSessionDto> {
  return apiClient.get<CrewBulkUploadSessionDto>(
    `/projects/${projectId}/crew-bulk-upload-sessions/${sessionId}${buildPaginationQuery({ includeRows })}`,
  );
}

export async function fetchCrewBulkUploadSessionRowsPage(
  projectId: string,
  sessionId: string,
  params: CrewBulkUploadRowPageQuery,
): Promise<CrewBulkUploadRowPageDto> {
  return apiClient.get<CrewBulkUploadRowPageDto>(
    `/projects/${projectId}/crew-bulk-upload-sessions/${sessionId}/rows${buildPaginationQuery(params)}`,
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
