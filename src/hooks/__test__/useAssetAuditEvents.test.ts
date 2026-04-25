import { renderHook, waitFor } from "@testing-library/react-native";
import { ApiError } from "@/src/api/client";
import {
  fetchAssetAuditEvents,
  fetchProjectAuditEvents,
} from "@/src/api/audit.api";
import { useAssetAuditEvents } from "../useAssetAuditEvents";
import { useProjectAuditEvents } from "../useProjectAuditEvents";

jest.mock("@/src/api/audit.api", () => ({
  fetchAssetAuditEvents: jest.fn(),
  fetchProjectAuditEvents: jest.fn(),
}));

describe("audit hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GIVEN a missing asset audit endpoint WHEN fetching SHOULD suppress the raw 404 error", async () => {
    (fetchAssetAuditEvents as jest.Mock).mockRejectedValue(
      new ApiError("Cannot GET /projects/project-1/assets/asset-1/audit-events", 404),
    );

    const { result } = renderHook(() =>
      useAssetAuditEvents("project-1", "asset-1", { limit: 6 }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.events).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("GIVEN a missing project audit endpoint WHEN fetching SHOULD suppress the raw 404 error", async () => {
    (fetchProjectAuditEvents as jest.Mock).mockRejectedValue(
      new ApiError("Cannot GET /projects/project-1/audit-events", 404),
    );

    const { result } = renderHook(() =>
      useProjectAuditEvents("project-1", { limit: 6 }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.events).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
