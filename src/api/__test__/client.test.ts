import { authEvents } from "@/src/events/session/authEvents";
import { clearToken, getToken } from "@/src/helpers/tokenStore";
import { apiClient, ApiError } from "../client";

jest.mock("../baseUrl", () => ({
  getBaseUrl: () => "https://api.navigate.test",
}));

jest.mock("@/src/helpers/tokenStore", () => ({
  clearToken: jest.fn(),
  getToken: jest.fn(),
}));

jest.mock("@/src/events/session/authEvents", () => ({
  authEvents: {
    emitUnauthorized: jest.fn(),
  },
}));

const fetchMock = jest.fn();

globalThis.fetch = fetchMock;

function mockJsonResponse(status: number, payload: unknown) {
  fetchMock.mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: jest.fn().mockResolvedValue(JSON.stringify(payload)),
  });
}

describe("apiClient auth handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getToken as jest.Mock).mockResolvedValue(null);
  });

  it("GIVEN invalid login credentials WHEN the API returns 401 SHOULD reject without emitting a global unauthorized event", async () => {
    mockJsonResponse(401, { message: "Invalid credentials" });

    await expect(
      apiClient.post("/auth/login", {
        email: "viewer@navigate.test",
        password: "wrong-password",
      }),
    ).rejects.toThrow(ApiError);

    expect(clearToken).not.toHaveBeenCalled();
    expect(authEvents.emitUnauthorized).not.toHaveBeenCalled();
  });

  it("GIVEN an expired session token WHEN a protected endpoint returns 401 SHOULD clear session state globally", async () => {
    (getToken as jest.Mock).mockResolvedValue("expired-token");
    mockJsonResponse(401, { message: "Unauthorized" });

    await expect(apiClient.get("/projects")).rejects.toThrow(ApiError);

    expect(clearToken).toHaveBeenCalledTimes(1);
    expect(authEvents.emitUnauthorized).toHaveBeenCalledTimes(1);
  });
});
