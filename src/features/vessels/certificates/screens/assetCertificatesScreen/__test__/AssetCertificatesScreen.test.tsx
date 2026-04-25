import { fireEvent, render, screen } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ReactNode } from "react";
import { useToast } from "@/src/context/ToastProvider";
import AssetCertificatesScreen from "../AssetCertificatesScreen";
import { useAssetCertificatesWorkspace } from "../useAssetCertificatesWorkspace";

const mockReactNative = jest.requireActual("react-native");

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("@/src/context/ToastProvider", () => ({
  useToast: jest.fn(),
}));

jest.mock("@/src/components/ui/button/Button", () => ({
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

jest.mock("../useAssetCertificatesWorkspace", () => ({
  useAssetCertificatesWorkspace: jest.fn(),
}));

jest.mock("../AssetCertificatesOverviewWorkspaceSection", () => ({
  AssetCertificatesOverviewWorkspaceSection: ({
    headerActions,
  }: {
    headerActions?: ReactNode;
  }) => {
    const { Text, View } = mockReactNative;
    return (
      <View>
        <Text>Vessel Records</Text>
        {headerActions}
      </View>
    );
  },
}));

jest.mock("../AssetCertificateRequirementsWorkspaceSection", () => ({
  AssetCertificateRequirementsWorkspaceSection: ({
    headerActions,
  }: {
    headerActions?: ReactNode;
  }) => {
    const { Text, View } = mockReactNative;
    return (
      <View>
        <Text>Vessel Requirements</Text>
        {headerActions}
      </View>
    );
  },
}));

describe("AssetCertificatesScreen", () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push });
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
      assetId: "asset-1",
    });
    (useToast as jest.Mock).mockReturnValue({
      show: jest.fn(),
    });
    (useAssetCertificatesWorkspace as jest.Mock).mockReturnValue({
      requirements: [
        { id: "req-1", status: "MISSING" },
        { id: "req-2", status: "PROVIDED" },
      ],
      requirementsLoading: false,
      requirementsError: null,
      refreshRequirements: jest.fn(),
      certificates: [{ id: "cert-1", status: "VALID" }],
      recordsLoading: false,
      recordsError: null,
      refreshRecords: jest.fn(),
      generateAsset: jest.fn(),
      generating: false,
      generationError: null,
      stats: {
        totalRequirements: 2,
        records: 1,
        missing: 1,
        expired: 0,
        underReview: 0,
        provided: 1,
      },
      summaryItems: [
        {
          label: "Requirements",
          value: "2",
          helper: "active requirements for this vessel",
          tone: "accent",
        },
      ],
      refreshAll: jest.fn(),
    });
  });

  it("GIVEN the vessel certificates lane opens WHEN rendered SHOULD default to certificate records", () => {
    render(<AssetCertificatesScreen />);

    expect(screen.getByText("Certificates")).toBeOnTheScreen();
    expect(screen.getByText("Vessel compliance registry")).toBeOnTheScreen();
    expect(screen.getByText("Overview")).toBeOnTheScreen();
    expect(screen.getAllByText("Requirements").length).toBeGreaterThan(0);
    expect(screen.getByText("Vessel Records")).toBeOnTheScreen();
  });

  it("GIVEN the requirements tab is pressed WHEN rendered SHOULD switch to the requirements workspace", () => {
    render(<AssetCertificatesScreen />);

    fireEvent.press(screen.getAllByText("Requirements")[0]);

    expect(screen.getByText("Vessel Requirements")).toBeOnTheScreen();
  });
});
