import { getSession, login as apiLogin, logout as apiLogout } from "@/src/api/auth.api";
import { clearToken, getToken, setToken } from "@/src/helpers/tokenStore";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { authEvents } from "../events/session/authEvents";

type Session = Awaited<ReturnType<typeof getSession>>;
export type UserStatus = "loading" | "authenticated" | "unauthenticated";

export function useSession() {
  const [session, setSessionState] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [status, setStatus] = useState<UserStatus>("loading");

  async function bootstrap() {
    try {
      const token = await getToken();
      if (!token) {
        setSessionState(null);
        setStatus("unauthenticated");
        return;
      }
      const s = await getSession();
      setStatus("authenticated");
      setSessionState(s);
    } catch {
      await clearToken();
      setSessionState(null);
      setStatus("unauthenticated");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    bootstrap();
  }, []);

  useEffect(() => {
    return authEvents.onUnauthorized(async () => {
      await clearToken();
      setSessionState(null);
      setStatus("unauthenticated");
      setLoading(false);
    });
  }, []);

  async function signIn(email: string, password: string) {
    setSigningIn(true);
    try {
      const { accessToken } = await apiLogin(email, password);
      await setToken(accessToken);
      const s = await getSession();
      setStatus("authenticated");
      setSessionState(s);

      authEvents.resetUnauthorizedLock();
    } finally {
      setSigningIn(false);
    }
  }

  async function signOut() {
    try {
      await apiLogout();
    } catch {
      // Local cleanup still wins if the server session was already invalid.
    }
    await clearToken();
    setSessionState(null);
    setStatus("unauthenticated");
    router.replace("/login");
  }

  return {
    session,
    loading,
    signingIn,
    signIn,
    signOut,
    refresh: bootstrap,
    status,
  };
}
