import { apiClient } from "@/src/api/client";
import {
  UpdateVesselProfileInput,
  VesselSummaryDto,
} from "../contracts/vessel.contract";

export async function fetchVesselProfile(projectId: string, assetId: string) {
  return apiClient.get(
    `/projects/${projectId}/assets/${assetId}/vessel-profile`,
  );
}

export async function patchVesselProfile(
  projectId: string,
  assetId: string,
  input: UpdateVesselProfileInput,
) {
  return apiClient.patch(
    `/projects/${projectId}/assets/${assetId}/vessel-profile`,
    input,
  );
}

export function fetchVesselSummary(projectId: string, assetId: string) {
  return apiClient.get<VesselSummaryDto>(
    `/projects/${projectId}/assets/${assetId}/summary`,
  );
}
