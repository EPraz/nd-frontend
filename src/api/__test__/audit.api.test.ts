import { apiClient } from "../client";
import { fetchAssetAuditEvents, fetchProjectAuditEvents } from "../audit.api";

jest.mock("../client", () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

describe("audit api", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GIVEN a project audit request WHEN a limit is provided SHOULD call the project timeline endpoint with the query", async () => {
    (apiClient.get as jest.Mock).mockResolvedValue([]);

    await fetchProjectAuditEvents("project-1", 15);

    expect(apiClient.get).toHaveBeenCalledWith(
      "/projects/project-1/audit-events?limit=15",
    );
  });

  it("GIVEN an asset audit request WHEN no limit is provided SHOULD call the vessel timeline endpoint without a query", async () => {
    (apiClient.get as jest.Mock).mockResolvedValue([]);

    await fetchAssetAuditEvents("project-1", "asset-1");

    expect(apiClient.get).toHaveBeenCalledWith(
      "/projects/project-1/assets/asset-1/audit-events",
    );
  });
});
