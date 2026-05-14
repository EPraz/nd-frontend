import { renderHook, waitFor } from "@testing-library/react-native";
import { getToken } from "@/src/helpers/tokenStore";
import { useAuthenticatedImageSource } from "../useAuthenticatedImageSource";

jest.mock("@/src/helpers/tokenStore", () => ({
  getToken: jest.fn(),
}));

const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;

describe("useAuthenticatedImageSource", () => {
  beforeEach(() => {
    mockGetToken.mockReset();
  });

  it("GIVEN a public image URL WHEN resolved SHOULD not attach auth headers", () => {
    const { result } = renderHook(() =>
      useAuthenticatedImageSource("https://example.test/vessel.jpg"),
    );

    expect(result.current).toEqual({
      uri: "https://example.test/vessel.jpg",
    });
    expect(mockGetToken).not.toHaveBeenCalled();
  });

  it("GIVEN a protected storage URL WHEN token exists SHOULD attach bearer header", async () => {
    mockGetToken.mockResolvedValue("token-123");

    const { result } = renderHook(() =>
      useAuthenticatedImageSource(
        "https://api.example.test/storage/object?ref=vessel-images/example.jpg",
      ),
    );

    expect(result.current).toBeNull();

    await waitFor(() =>
      expect(result.current).toEqual({
        uri: "https://api.example.test/storage/object?ref=vessel-images/example.jpg",
        headers: {
          Authorization: "Bearer token-123",
        },
      }),
    );
  });

  it("GIVEN a protected storage URL WHEN token is missing SHOULD avoid an unauthenticated image request", async () => {
    mockGetToken.mockResolvedValue(null);

    const { result } = renderHook(() =>
      useAuthenticatedImageSource(
        "https://api.example.test/storage/object?ref=vessel-images/example.jpg",
      ),
    );

    await waitFor(() => expect(mockGetToken).toHaveBeenCalledTimes(1));
    expect(result.current).toBeNull();
  });
});
