import { render, screen } from "@testing-library/react-native";
import { useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";
import { useProjectAuditEvents } from "../../../hooks/useProjectAuditEvents";
import {
  useProjectContext,
  useProjectEntitlements,
} from "../../../context";
import ProjectDashboardScreen from "../ProjectDashboardScreen";

const mockReactNative = jest.requireActual("react-native");

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
}));

jest.mock("../../../components", () => ({
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

jest.mock("../../../context", () => ({
  DashboardScopeProvider: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
  useProjectContext: jest.fn(),
  useProjectEntitlements: jest.fn(),
}));

jest.mock("../../../hooks/useProjectAuditEvents", () => ({
  useProjectAuditEvents: jest.fn(),
}));

jest.mock("../../../components/dashboard/DashboardSlot", () => ({
  DashboardSlot: ({
    slotTitle,
    children,
  }: {
    slotTitle: string;
    children: ReactNode;
  }) => {
    const { View, Text } = mockReactNative;
    return (
      <View>
        <Text>{slotTitle}</Text>
        {children}
      </View>
    );
  },
}));

jest.mock("../../../components/modules/recentActivity", () => ({
  RecentActivityPanel: ({ title }: { title: string }) => {
    const { Text } = mockReactNative;
    return <Text>{title}</Text>;
  },
}));

jest.mock("../CommandCenterReviewLayout", () => ({
  CommandCenterReviewLayout: () => {
    const { Text } = mockReactNative;
    return <Text>Fleet Command Center review</Text>;
  },
}));

jest.mock("../../../components/modules/alertsFeedModule", () => ({
  AlertsFeedModule: () => {
    const { Text } = mockReactNative;
    return <Text>Alerts Feed module</Text>;
  },
}));

jest.mock("../../../components/modules/crewSummary", () => ({
  CrewSummaryModule: () => {
    const { Text } = mockReactNative;
    return <Text>Crew Summary module</Text>;
  },
}));

jest.mock("../../../components/modules/expiringCertificates", () => ({
  ExpiringCertificatesModule: () => {
    const { Text } = mockReactNative;
    return <Text>Expiring Certificates module</Text>;
  },
}));

jest.mock("../../../components/modules/heroSection", () => ({
  OverviewKpisModule: () => {
    const { Text } = mockReactNative;
    return <Text>Overview KPIs module</Text>;
  },
}));

jest.mock("../../../components/modules/maintenanceOverview", () => ({
  MaintenanceOverviewModule: () => {
    const { Text } = mockReactNative;
    return <Text>Maintenance Overview module</Text>;
  },
}));

jest.mock("../../../components/modules/vesselList", () => ({
  VesselsListModule: () => {
    const { Text } = mockReactNative;
    return <Text>Vessels List module</Text>;
  },
}));

jest.mock("../../../components/modules/vesselsHealth", () => ({
  VesselsHealthModule: () => {
    const { Text } = mockReactNative;
    return <Text>Vessels Health module</Text>;
  },
}));

describe("ProjectDashboardScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
    });
    (useProjectContext as jest.Mock).mockReturnValue({
      projectKind: "MARITIME",
    });
    (useProjectEntitlements as jest.Mock).mockReturnValue({
      isModuleEnabled: () => true,
    });
    (useProjectAuditEvents as jest.Mock).mockReturnValue({
      events: [],
      loading: false,
      error: null,
      refresh: jest.fn(),
    });
  });

  it("GIVEN the dashboard opens WHEN the screen renders SHOULD default to the review layout", () => {
    render(<ProjectDashboardScreen />);

    expect(screen.getByText("ARXIS Dashboard")).toBeOnTheScreen();
    expect(screen.getByText("Fleet Command Center review")).toBeOnTheScreen();
    expect(screen.queryByText("Current layout")).toBeNull();
    expect(screen.queryByText("Review layout")).toBeNull();
  });
});
