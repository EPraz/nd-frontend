import { useLocalSearchParams, useRouter } from "expo-router";
import { render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";
import FuelByProjectScreen from "../FuelByProjectScreen";
import { useFuelPageData } from "../../../hooks";

const mockReactNative = jest.requireActual("react-native");

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("../../../hooks", () => ({
  useFuelPageData: jest.fn(),
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
  FuelTable: ({
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

jest.mock("../../fuelQuickViewModal", () => ({
  FuelQuickViewModal: () => null,
}));

describe("FuelByProjectScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
    });
    (useFuelPageData as jest.Mock).mockReturnValue({
      stats: {
        total: 6,
        bunkered: 2,
        consumed: 3,
        transferred: 1,
        adjustments: 0,
        unit: "MT",
        bunkeredQty: "120",
        consumedQty: "70",
        critical: 1,
      },
      list: [{ id: "fuel-1", eventType: "BUNKERED" }],
      filterEventType: "ALL",
      sort: "DATE_DESC",
      setFilterEventType: jest.fn(),
      setSort: jest.fn(),
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it("GIVEN the fuel workspace opens WHEN rendered SHOULD expose the read-only fuel registry without create actions", () => {
    render(<FuelByProjectScreen />);

    expect(screen.getByText("Fuel")).toBeOnTheScreen();
    expect(screen.getByText("Project fuel registry")).toBeOnTheScreen();
    expect(screen.getByText("Fuel log")).toBeOnTheScreen();
    expect(screen.getByText("All events")).toBeOnTheScreen();
    expect(screen.getByText("Latest first")).toBeOnTheScreen();
    expect(screen.queryByText("Add Fuel Log")).toBeNull();
  });
});
