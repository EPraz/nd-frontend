import { fireEvent, render, screen } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ReactNode } from "react";
import VesselsByProjectScreen from "../VesselsByProjectScreen";
import { useVesselsPageData } from "../../../hooks/useVesselsPageData";

const mockReactNative = jest.requireActual("react-native");

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("@/src/components", () => ({
  Button: ({
    children,
    onPress,
  }: {
    children: ReactNode;
    onPress?: () => void;
  }) => {
    const { Pressable, Text } = mockReactNative;
    return (
      <Pressable onPress={onPress}>
        <Text>{children}</Text>
      </Pressable>
    );
  },
  Text: ({ children }: { children: ReactNode }) => {
    const { Text } = mockReactNative;
    return <Text>{children}</Text>;
  },
}));

jest.mock("../../../hooks/useVesselsPageData", () => ({
  useVesselsPageData: jest.fn(),
}));

jest.mock("../VesselsOverviewWorkspaceSection", () => ({
  VesselsOverviewWorkspaceSection: ({
    projectId,
  }: {
    projectId: string;
  }) => {
    const { Text, View } = mockReactNative;
    return (
      <View>
        <Text>Fleet registry</Text>
        <Text>{projectId}</Text>
      </View>
    );
  },
}));

describe("VesselsByProjectScreen", () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push });
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
    });
    (useVesselsPageData as jest.Mock).mockReturnValue({
      stats: {
        total: 4,
        withProfile: 3,
        withIMO: 2,
        withLicense: 1,
        withFlag: 3,
        missingFlag: 1,
      },
      list: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it("GIVEN the vessels workspace opens WHEN rendered SHOULD expose the project vessel registry", () => {
    render(<VesselsByProjectScreen />);

    expect(screen.getByText("Vessels")).toBeOnTheScreen();
    expect(screen.getAllByText("Fleet registry")).toHaveLength(1);
    expect(screen.getByText("Project vessel registry")).toBeOnTheScreen();
    expect(screen.getByText("In scope")).toBeOnTheScreen();
  });

  it("GIVEN the primary action is pressed WHEN the user wants a new vessel SHOULD navigate to create vessel", () => {
    render(<VesselsByProjectScreen />);

    fireEvent.press(screen.getByText("New Vessel"));

    expect(push).toHaveBeenCalledWith("/projects/project-atlantic/vessels/new");
  });
});
