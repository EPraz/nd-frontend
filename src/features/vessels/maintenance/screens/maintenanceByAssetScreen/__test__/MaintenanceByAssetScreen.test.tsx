import { render, screen } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMaintenanceByAsset } from "@/src/features/maintenance/core/hooks/useMaintenanceByAsset";
import MaintenanceByAssetScreen from "../MaintenanceByAssetScreen";

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock(
  "@/src/features/maintenance/core/hooks/useMaintenanceByAsset",
  () => ({
    useMaintenanceByAsset: jest.fn(),
  }),
);

jest.mock("../MaintenanceByAssetWorkspaceSection", () => ({
  MaintenanceByAssetWorkspaceSection: () => null,
}));

describe("MaintenanceByAssetScreen", () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push });
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
      assetId: "vessel-one",
    });
    (useMaintenanceByAsset as jest.Mock).mockReturnValue({
      maintenance: [
        { id: "task-1", status: "OPEN", priority: "HIGH" },
        { id: "task-2", status: "DONE", priority: "LOW" },
      ],
      loading: false,
      error: null,
      refresh: jest.fn(),
    });
  });

  it("GIVEN a vessel maintenance lane WHEN rendered SHOULD expose the vessel-scoped maintenance registry", () => {
    render(<MaintenanceByAssetScreen />);

    expect(screen.getByText("Maintenance")).toBeOnTheScreen();
    expect(screen.getByText("Vessel maintenance registry")).toBeOnTheScreen();
    expect(screen.getByText("Overview")).toBeOnTheScreen();
    expect(screen.getByText("Tasks in scope")).toBeOnTheScreen();
    expect(screen.getByText("In progress")).toBeOnTheScreen();
  });

  it("GIVEN maintenance create is dormant WHEN rendered SHOULD not expose the create action", () => {
    render(<MaintenanceByAssetScreen />);

    expect(screen.queryByText("Add Task")).toBeNull();
    expect(push).not.toHaveBeenCalled();
  });
});
