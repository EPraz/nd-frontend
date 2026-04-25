import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { useSessionContext } from "@/src/context/SessionProvider";
import { useToast } from "@/src/context/ToastProvider";
import { fakeAdminProject, fakeAdminUser } from "@/src/test/fakes/admin";
import { useAdminWorkspace } from "../../hooks/useAdminWorkspace";
import SuperAdminWorkspaceScreen from "../SuperAdminWorkspaceScreen";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/src/context/SessionProvider", () => ({
  useSessionContext: jest.fn(),
}));

jest.mock("@/src/context/ToastProvider", () => ({
  useToast: jest.fn(),
}));

jest.mock("../../hooks/useAdminWorkspace", () => ({
  useAdminWorkspace: jest.fn(),
}));

const routerReplace = jest.fn();
const routerPush = jest.fn();
const showToast = jest.fn();
const createProject = jest.fn();
const saveProjectModules = jest.fn();
const createUser = jest.fn();
const saveProjectUsers = jest.fn();
const refresh = jest.fn();

const project = fakeAdminProject();
const user = fakeAdminUser();
const viewer = fakeAdminUser({
  id: "user-viewer",
  name: "Viewer User",
  email: "viewer@navigate.test",
  role: "VIEWER",
  assignedProjectIds: [],
});

function mockAdminSession(role: "ADMIN" | "OPS" | "VIEWER" = "ADMIN") {
  (useSessionContext as jest.Mock).mockReturnValue({
    session: {
      role,
      name: "Admin User",
      email: "admin@navigate.test",
      company: { id: "company-1", name: "Navigate Marine" },
    },
  });
}

function mockAdminWorkspace(
  overrides: Partial<ReturnType<typeof useAdminWorkspace>> = {},
) {
  (useAdminWorkspace as jest.Mock).mockReturnValue({
    projects: [project],
    users: [user, viewer],
    loading: false,
    error: null,
    refresh,
    createProject,
    saveProjectModules,
    createUser,
    saveProjectUsers,
    savingProject: false,
    savingProjectModules: false,
    savingUser: false,
    savingAccess: null,
    ...overrides,
  });
}

describe("SuperAdminWorkspaceScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: routerPush,
      replace: routerReplace,
    });
    (useToast as jest.Mock).mockReturnValue({ show: showToast });
    createProject.mockResolvedValue(project);
    saveProjectModules.mockResolvedValue({ projectId: project.id, modules: [] });
    createUser.mockResolvedValue(user);
    saveProjectUsers.mockResolvedValue(project);
    mockAdminSession();
    mockAdminWorkspace();
  });

  it("GIVEN a non-admin user WHEN the admin screen renders SHOULD show restricted access", () => {
    mockAdminSession("OPS");
    mockAdminWorkspace({ projects: [], users: [] });

    render(<SuperAdminWorkspaceScreen />);

    expect(screen.getByText("Access restricted")).toBeOnTheScreen();
    expect(
      screen.getByText("Only admin users can access the super admin workspace."),
    ).toBeOnTheScreen();
  });

  it("GIVEN admin data WHEN rendered SHOULD expose workspace directories and project actions", () => {
    render(<SuperAdminWorkspaceScreen />);

    expect(screen.getByText("Admin workspace")).toBeOnTheScreen();
    expect(screen.getAllByText("Atlantic Ops").length).toBeGreaterThan(0);
    expect(screen.getByText("1 project")).toBeOnTheScreen();
    expect(screen.getAllByText("Projects").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Users").length).toBeGreaterThan(0);
    expect(screen.getByText("Setup")).toBeOnTheScreen();
    expect(screen.getByText("Open")).toBeOnTheScreen();
    expect(screen.getByText("Settings")).toBeOnTheScreen();
    expect(screen.getByText("Access")).toBeOnTheScreen();
  });

  it("GIVEN project search text WHEN no project matches SHOULD show the project empty state", async () => {
    render(<SuperAdminWorkspaceScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText("Search by project, status, kind, or user"),
      "Pacific",
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          "No projects matched this filter. Create a workspace or adjust the search.",
        ),
      ).toBeOnTheScreen();
    });
  });

  it("GIVEN a role filter WHEN selecting viewer SHOULD show only viewer users in the user table", () => {
    render(<SuperAdminWorkspaceScreen />);

    fireEvent.press(screen.getAllByText("Users").at(-1)!);
    fireEvent.press(screen.getAllByText("Viewer")[0]);

    expect(screen.getByText("viewer@navigate.test")).toBeOnTheScreen();
    expect(screen.queryByText("ops@navigate.test")).toBeNull();
  });

  it("GIVEN an empty project name WHEN creating a project SHOULD warn and skip the API call", async () => {
    render(<SuperAdminWorkspaceScreen />);

    fireEvent.press(screen.getByText("Setup"));
    fireEvent.press(screen.getAllByText("Create project").at(-1)!);

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        "Project name is required",
        "warning",
      );
    });
    expect(createProject).not.toHaveBeenCalled();
  });

  it("GIVEN a valid project name WHEN creating a project SHOULD send the expected payload", async () => {
    createProject.mockResolvedValue(
      fakeAdminProject({ id: "project-pacific", name: "Pacific Fleet" }),
    );
    render(<SuperAdminWorkspaceScreen />);

    fireEvent.press(screen.getByText("Setup"));
    fireEvent.changeText(
      screen.getByPlaceholderText("Example: Pacific Fleet Expansion"),
      " Pacific Fleet ",
    );
    fireEvent.press(screen.getAllByText("Create project").at(-1)!);

    await waitFor(() => {
      expect(createProject).toHaveBeenCalledWith({
        name: "Pacific Fleet",
        kind: "MARITIME",
      });
    });
    expect(saveProjectModules).toHaveBeenCalledWith("project-pacific", {
      modules: [
        { key: "vessels", enabled: true, submodules: [] },
        { key: "certificates", enabled: true, submodules: [] },
        { key: "crew", enabled: true, submodules: [] },
        { key: "maintenance", enabled: true, submodules: [] },
        { key: "fuel", enabled: false, submodules: [] },
      ],
    });
    expect(showToast).toHaveBeenCalledWith(
      "Project created: Pacific Fleet",
      "success",
    );
  });

  it("GIVEN a valid user form WHEN creating a user SHOULD include selected project access", async () => {
    render(<SuperAdminWorkspaceScreen />);

    fireEvent.press(screen.getByText("Setup"));
    fireEvent.press(screen.getByText("Create user"));

    fireEvent.changeText(
      screen.getByPlaceholderText("Example: Juan Perez"),
      "Juan Perez",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("juan.perez@client.test"),
      "juan.perez@client.test",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("Use a clear but strong password"),
      "ClientPass-2026",
    );
    fireEvent.press(screen.getByLabelText("Project access selector"));
    fireEvent.press(screen.getByLabelText("Atlantic Ops Maritime"));
    fireEvent.press(screen.getAllByText("Create user").at(-1)!);

    await waitFor(() => {
      expect(createUser).toHaveBeenCalledWith({
        name: "Juan Perez",
        email: "juan.perez@client.test",
        password: "ClientPass-2026",
        role: "OPS",
        projectIds: ["project-atlantic"],
      });
    });
    expect(showToast).toHaveBeenCalledWith(
      "User created: ops@navigate.test",
      "success",
    );
  });

  it("GIVEN a project access modal WHEN changing assigned users SHOULD save the updated access list", async () => {
    render(<SuperAdminWorkspaceScreen />);

    fireEvent.press(screen.getByText("Access"));
    fireEvent.press(screen.getAllByText("Viewer User").at(-1)!);
    fireEvent.press(screen.getByText("Save access"));

    await waitFor(() => {
      expect(saveProjectUsers).toHaveBeenCalledWith("project-atlantic", [
        "user-ops",
        "user-viewer",
      ]);
    });
  });
});
