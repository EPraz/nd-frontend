import "@testing-library/react-native/matchers";
import type { ReactNode } from "react";

jest.mock("@expo/vector-icons", () => {
  const MockIcon = () => null;

  return {
    Feather: MockIcon,
    Ionicons: MockIcon,
  };
});

jest.mock("@/src/context/ThemeProvider", () => ({
  useTheme: () => ({
    theme: "dark",
    setTheme: jest.fn(),
    toggleTheme: jest.fn(),
  }),
}));

jest.mock("@/src/context/SessionProvider", () => ({
  SessionProvider: ({ children }: { children: ReactNode }) => children,
  useSessionContext: jest.fn(() => ({
    session: { role: "ADMIN" },
    loading: false,
    status: "authenticated",
    signIn: jest.fn(),
    signOut: jest.fn(),
    refresh: jest.fn(),
  })),
}));
