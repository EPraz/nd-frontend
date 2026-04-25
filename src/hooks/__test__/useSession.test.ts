import { act, renderHook, waitFor } from "@testing-library/react-native";
import { getSession, login as apiLogin } from "@/src/api/auth.api";
import { authEvents } from "@/src/events/session/authEvents";
import { clearToken, getToken, setToken } from "@/src/helpers/tokenStore";
import { useSession } from "../useSession";

jest.mock("@/src/api/auth.api", () => ({
  getSession: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
}));

jest.mock("@/src/helpers/tokenStore", () => ({
  clearToken: jest.fn(),
  getToken: jest.fn(),
  setToken: jest.fn(),
}));

jest.mock("@/src/events/session/authEvents", () => ({
  authEvents: {
    onUnauthorized: jest.fn(() => jest.fn()),
    resetUnauthorizedLock: jest.fn(),
  },
}));

jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
}));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe("useSession", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getToken as jest.Mock).mockResolvedValue(null);
    (clearToken as jest.Mock).mockResolvedValue(undefined);
    (setToken as jest.Mock).mockResolvedValue(undefined);
  });

  it("GIVEN a failed login attempt WHEN credentials are rejected SHOULD keep bootstrap loading false and expose only signingIn progress", async () => {
    const loginAttempt = deferred<{ accessToken: string }>();
    (apiLogin as jest.Mock).mockReturnValue(loginAttempt.promise);

    const { result } = renderHook(() => useSession());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.status).toBe("unauthenticated");
    });

    let signInPromise!: Promise<void>;
    act(() => {
      signInPromise = result.current.signIn(
        "missing@navigate.test",
        "wrong-password",
      );
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.signingIn).toBe(true);
    });

    await act(async () => {
      loginAttempt.reject(new Error("Invalid credentials"));
      await expect(signInPromise).rejects.toThrow("Invalid credentials");
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.signingIn).toBe(false);
    expect(result.current.status).toBe("unauthenticated");
    expect(getSession).not.toHaveBeenCalled();
    expect(authEvents.resetUnauthorizedLock).not.toHaveBeenCalled();
  });
});
