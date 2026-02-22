import { createContext, useContext } from "react";
import { useSession } from "../hooks";

const SessionCtx = createContext<ReturnType<typeof useSession> | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const session = useSession();
  return <SessionCtx.Provider value={session}>{children}</SessionCtx.Provider>;
}

export function useSessionContext() {
  const ctx = useContext(SessionCtx);
  if (!ctx)
    throw new Error("useSessionContext must be used within SessionProvider");
  return ctx;
}
