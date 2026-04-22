import { render, screen } from "@testing-library/react-native";
import { usePathname, useRouter } from "expo-router";
import type { ReactNode } from "react";
import { useProjectEntitlements } from "@/src/context/ProjectEntitlementsProvider";
import { useProjectContext } from "@/src/context/ProjectProvider";
import { VesselShellLayout } from "../VesselShellLayout";
import { useVesselShell } from "../../context/VesselShellProvider";

const mockReactNative = jest.requireActual("react-native");

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock("@/src/context/ProjectEntitlementsProvider", () => ({
  useProjectEntitlements: jest.fn(),
}));

jest.mock("@/src/context/ProjectProvider", () => ({
  useProjectContext: jest.fn(),
}));

jest.mock("../../context/VesselShellProvider", () => ({
  useVesselShell: jest.fn(),
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
  ErrorState: ({ message }: { message: string }) => {
    const { Text } = mockReactNative;
    return <Text>{message}</Text>;
  },
  Loading: () => {
    const { Text } = mockReactNative;
    return <Text>Loading</Text>;
  },
  Text: ({ children }: { children: ReactNode }) => {
    const { Text } = mockReactNative;
    return <Text>{children}</Text>;
  },
}));

jest.mock("expo-image", () => ({
  Image: () => {
    const { View } = mockReactNative;
    return <View />;
  },
}));

describe("VesselShellLayout", () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push });
    (usePathname as jest.Mock).mockReturnValue(
      "/projects/project-atlantic/vessels/asset-1",
    );
    (useProjectContext as jest.Mock).mockReturnValue({
      projectName: "Atlantic Ops",
    });
    (useProjectEntitlements as jest.Mock).mockReturnValue({
      isModuleEnabled: jest.fn(() => true),
      loading: false,
    });
    (useVesselShell as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
      assetId: "asset-1",
      vessel: {
        id: "asset-1",
        projectId: "project-atlantic",
        type: "VESSEL",
        name: "MV Navigate One",
        imageUrl: null,
        imageFileName: null,
        status: "ACTIVE",
        isDeleted: false,
        deletedAt: null,
        deletedByUserId: null,
        deletedByUserName: null,
        createdAt: "2026-04-01T00:00:00.000Z",
        vessel: {
          identifierType: "IMO",
          imo: "9876543",
          licenseNumber: null,
          flag: "PA",
          email: "ops@mvone.test",
          callSign: null,
          mmsi: null,
          homePort: "Panama",
          vesselType: "OFFSHORE_SUPPLY_VESSEL",
          classSociety: "ABS",
          builder: null,
          yearBuilt: null,
          loaM: null,
          beamM: null,
          draftM: null,
          grossTonnage: null,
          deadweightTonnage: null,
          maxSpeedKn: null,
          propulsionType: null,
          mainEngineModel: null,
        },
      },
      summary: {
        assetId: "asset-1",
        certificates: {
          total: 5,
          valid: 3,
          pending: 1,
          expired: 0,
          expiringSoon: 2,
        },
        crew: { total: 12, active: 10, inactive: 2 },
        maintenance: { total: 7, open: 2, inProgress: 1, done: 4, overdue: 1 },
        fuel: { total: 4, lastEventAt: null, lastEventType: "BUNKERING" },
        updatedAt: "2026-04-21T12:00:00.000Z",
      },
      loading: false,
      vesselError: null,
      summaryError: null,
      refresh: jest.fn(),
    });
  });

  it("renders the review shell framing with module rail", () => {
    render(
      <VesselShellLayout>
        <mockReactNative.Text>Module body</mockReactNative.Text>
      </VesselShellLayout>,
    );

    expect(screen.getAllByText("Operational profile").length).toBeGreaterThan(0);
    expect(screen.getByText("Overview")).toBeOnTheScreen();
    expect(screen.getByText("Certificates")).toBeOnTheScreen();
    expect(screen.getByText("Crew")).toBeOnTheScreen();
    expect(screen.getByText("Module body")).toBeOnTheScreen();
    expect(screen.queryByText("Current layout")).toBeNull();
    expect(screen.queryByText("Review layout")).toBeNull();
  });
});
