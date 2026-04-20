import type { AuditEventDto } from "@/src/contracts/audit.contract";
import { apiClient } from "./client";

function toLimitQuery(limit?: number) {
  if (!limit || Number.isNaN(limit) || limit <= 0) {
    return "";
  }

  return `?limit=${encodeURIComponent(String(limit))}`;
}

export async function fetchProjectAuditEvents(
  projectId: string,
  limit?: number,
): Promise<AuditEventDto[]> {
  return apiClient.get<AuditEventDto[]>(
    `/projects/${projectId}/audit-events${toLimitQuery(limit)}`,
  );
}

export async function fetchAssetAuditEvents(
  projectId: string,
  assetId: string,
  limit?: number,
): Promise<AuditEventDto[]> {
  return apiClient.get<AuditEventDto[]>(
    `/projects/${projectId}/assets/${assetId}/audit-events${toLimitQuery(limit)}`,
  );
}
