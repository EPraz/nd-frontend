import { useLocalSearchParams } from "expo-router";
import { render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { useVessels } from "@/src/features/vessels/core";
import MaintenanceByProjectScreen from "../MaintenanceByProjectScreen";
import { useMaintenancePageData } from "../../../hooks";

const mockReactNative = jest.requireActual("react-native");

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
}));

jest.mock("../../../hooks", () => ({
  useMaintenancePageData: jest.fn(),
}));

jest.mock("@/src/features/vessels/core", () => ({
  useVessels: jest.fn(),
}));

jest.mock("@/src/components/ui/button/Button", () => ({
  Button: ({ children }: { children: ReactNode }) => {
    const { Text } = mockReactNative;
    return <Text>{children}</Text>;
  },
}));

jest.mock("@/src/components/ui/text/Text", () => ({
  Text: ({ children }: { children: ReactNode }) => {
    const { Text } = mockReactNative;
    return <Text>{children}</Text>;
  },
}));

jest.mock("@/src/components/ui/forms/ToolbarSelect", () => ({
  ToolbarSelect: ({
    renderLabel,
    value,
  }: {
    renderLabel: (value: string) => string;
    value: string;
  }) => {
    const { Text } = mockReactNative;
    return <Text>{renderLabel(value)}</Text>;
  },
}));

jest.mock("../../../components", () => ({
  MaintenanceTable: ({
    title,
    subtitleRight,
    headerActions,
  }: {
    title: string;
    subtitleRight?: string;
    headerActions?: ReactNode;
  }) => {
    const { View, Text } = mockReactNative;
    return (
      <View>
        <Text>{title}</Text>
        {subtitleRight ? <Text>{subtitleRight}</Text> : null}
        {headerActions}
      </View>
    );
  },
}));

jest.mock("../../maintenanceQuickViewModal", () => ({
  MaintenanceQuickViewModal: () => null,
}));

describe("MaintenanceByProjectScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
    });
    (useMaintenancePageData as jest.Mock).mockReturnValue({
      stats: {
        total: 8,
        open: 3,
        inProgress: 2,
        done: 3,
        highPriorityOpen: 1,
      },
      list: [{ id: "task-1", title: "Inspect pump" }],
      filterStatus: "ALL",
      sort: "DUE_ASC",
      setFilterStatus: jest.fn(),
      setSort: jest.fn(),
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    (useVessels as jest.Mock).mockReturnValue({
      vessels: [
        {
          id: "asset-1",
          name: "MV Navigate One",
        },
      ],
      loading: false,
      error: null,
      refresh: jest.fn(),
    });
  });

  it("GIVEN the maintenance workspace opens WHEN rendered SHOULD expose the read-only task registry without create actions", () => {
    render(<MaintenanceByProjectScreen />);

    expect(screen.getByText("Maintenance")).toBeOnTheScreen();
    expect(screen.getByText("Project maintenance registry")).toBeOnTheScreen();
    expect(screen.getByText("Task queue")).toBeOnTheScreen();
    expect(screen.getByText("All status")).toBeOnTheScreen();
    expect(screen.getByText("Next due")).toBeOnTheScreen();
    expect(screen.queryByText("Add Task")).toBeNull();
  });
});
