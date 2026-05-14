import { getToken } from "@/src/helpers/tokenStore";
import { useEffect, useMemo, useState } from "react";

type AuthenticatedImageSource = {
  uri: string;
  headers?: Record<string, string>;
};

function needsAuthHeader(uri: string): boolean {
  return uri.includes("/storage/object?");
}

export function useAuthenticatedImageSource(
  uri: string | null | undefined,
): AuthenticatedImageSource | null {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    if (!uri || !needsAuthHeader(uri)) {
      setToken(null);
      return () => {
        active = false;
      };
    }

    void getToken()
      .then((storedToken) => {
        if (active) setToken(storedToken);
      })
      .catch(() => {
        if (active) setToken(null);
      });

    return () => {
      active = false;
    };
  }, [uri]);

  return useMemo(() => {
    if (!uri) return null;
    if (!needsAuthHeader(uri)) return { uri };
    if (!token) return null;

    return {
      uri,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }, [token, uri]);
}
