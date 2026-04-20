import { fireEvent, render, screen } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { useSessionContext } from "@/src/context/SessionProvider";
import { useProjects } from "@/src/hooks/useProjects";
import ProjectsScreen from "./ProjectsScreen";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/src/context/SessionProvider", () => ({
  useSessionContext: jest.fn(),
}));

jest.mock("@/src/hooks/useProjects", () => ({
  useProjects: jest.fn(),
}));

jest.mock("lucide-react-native", () => ({
  ChevronRight: () => null,
  LogOut: () => null,
  RefreshCw: () => null,
  Search: () => null,
}));

const routerPush = jest.fn();
const signOut = jest.fn();
const refresh = jest.fn();

describe("ProjectsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: routerPush });
    (useSessionContext as jest.Mock).mockReturnValue({
      signOut,
      session: {
        role: "ADMIN",
        name: "Admin User",
        company: { id: "company-1", name: "Navigate Marine" },
      },
    });
    (useProjects as jest.Mock).mockReturnValue({
      projects: [
        {
          id: "project-atlantic",
          name: "Atlantic Ops",
          companyId: "company-1",
          status: "ACTIVE",
          kind: "MARITIME",
          createdAt: "2026-04-10T12:00:00.000Z",
        },
      ],
      loading: false,
      error: null,
      refresh,
    });
  });

  it("GIVEN available workspaces WHEN the screen renders SHOULD show the operational directory", () => {
    render(<ProjectsScreen />);

    expect(screen.getByText("Workspace directory")).toBeOnTheScreen();
    expect(screen.getAllByText("Atlantic Ops").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Maritime").length).toBeGreaterThan(0);
  });

  it("GIVEN a workspace row WHEN pressed SHOULD open the project dashboard", () => {
    render(<ProjectsScreen />);

    fireEvent.press(screen.getAllByText("Atlantic Ops")[0]);

    expect(routerPush).toHaveBeenCalledWith("/projects/project-atlantic/dashboard");
  });
});
