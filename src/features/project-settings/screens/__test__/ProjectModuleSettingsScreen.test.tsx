import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { useProjectContext } from "@/src/context/ProjectProvider";
import { useProjectEntitlements } from "@/src/context/ProjectEntitlementsProvider";
import { useSessionContext } from "@/src/context/SessionProvider";
import { useToast } from "@/src/context/ToastProvider";
import type { ProjectModuleEntitlementsDto } from "@/src/contracts/project-entitlements.contract";
import ProjectModuleSettingsScreen from "../ProjectModuleSettingsScreen";

jest.mock("@/src/context/ProjectProvider", () => ({
  useProjectContext: jest.fn(),
}));

jest.mock("@/src/context/ProjectEntitlementsProvider", () => ({
  useProjectEntitlements: jest.fn(),
}));

jest.mock("@/src/context/SessionProvider", () => ({
  useSessionContext: jest.fn(),
}));

jest.mock("@/src/context/ToastProvider", () => ({
  useToast: jest.fn(),
}));

const save = jest.fn();
const refresh = jest.fn();
const show = jest.fn();

const entitlements: ProjectModuleEntitlementsDto = {
  projectId: "project-1",
  modules: [
    {
      key: "certificates",
      label: "Certificates",
      description:
        "Certificate compliance and structured records across project and vessel contexts.",
      enabled: true,
      submodules: [],
    },
  ],
};

function mockAdminSession(role: "ADMIN" | "OPS" = "ADMIN") {
  (useSessionContext as jest.Mock).mockReturnValue({
    session: {
      role,
    },
  });
}

function mockEntitlementsState(
  overrides: Partial<ReturnType<typeof useProjectEntitlements>> = {},
) {
  (useProjectEntitlements as jest.Mock).mockReturnValue({
    entitlements,
    loading: false,
    saving: false,
    error: null,
    save,
    refresh,
    ...overrides,
  });
}

describe("ProjectModuleSettingsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useProjectContext as jest.Mock).mockReturnValue({
      projectName: "Atlantic Ops",
    });
    (useToast as jest.Mock).mockReturnValue({ show });
    mockAdminSession();
    mockEntitlementsState();
    save.mockResolvedValue(undefined);
  });

  it("GIVEN a non-admin user WHEN the settings screen renders SHOULD show restricted access", () => {
    mockAdminSession("OPS");

    render(<ProjectModuleSettingsScreen />);

    expect(screen.getByText("Access restricted")).toBeOnTheScreen();
  });

  it("GIVEN project entitlements WHEN the settings screen renders SHOULD explain inherited vessel access instead of submodule toggles", () => {
    render(<ProjectModuleSettingsScreen />);

    expect(screen.getByText("Availability by project")).toBeOnTheScreen();
    expect(screen.getByText("Inheritance")).toBeOnTheScreen();
    expect(screen.queryByText("Submodules")).toBeNull();
  });

  it("GIVEN a module change WHEN saving SHOULD send project-level modules with empty submodule arrays", async () => {
    render(<ProjectModuleSettingsScreen />);

    fireEvent.press(screen.getByText("Enabled"));
    fireEvent.press(screen.getByText("Save changes"));

    await waitFor(() => {
      expect(save).toHaveBeenCalledWith({
        modules: [
          {
            key: "certificates",
            enabled: false,
            submodules: [],
          },
        ],
      });
    });

    expect(show).toHaveBeenCalledWith("Project settings saved", "success");
  });
});
