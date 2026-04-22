import { fireEvent, render, screen } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { VesselOperationalProfileReviewLayout } from "../VesselOperationalProfileReviewLayout";

const mockReactNative = jest.requireActual("react-native");

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("expo-image", () => ({
  Image: () => {
    const { View } = mockReactNative;
    return <View />;
  },
}));

jest.mock("@/src/components/modules/recentActivity", () => ({
  RecentActivityPanel: ({ title }: { title: string }) => {
    const { Text } = mockReactNative;
    return <Text>{title}</Text>;
  },
}));

describe("VesselOperationalProfileReviewLayout", () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push });
  });

  it("renders the operational profile review composition", () => {
    render(
      <VesselOperationalProfileReviewLayout
        projectId="project-atlantic"
        assetId="asset-1"
        projectName="Atlantic Ops"
        vessel={{
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
        }}
        summary={{
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
        }}
        alerts={[
          {
            id: "alert-1",
            title: "International Oil Pollution Prevention Certificate",
            type: "CERTIFICATE",
            severity: "WARNING",
            date: "2026-05-01T00:00:00.000Z",
          },
        ]}
        alertsLoading={false}
        alertsError={null}
        onRetryAlerts={jest.fn()}
        auditState={{
          events: [],
          loading: false,
          error: null,
          refresh: jest.fn(),
        }}
        isModuleEnabled={() => true}
      />,
    );

    expect(screen.getAllByText("Operational profile").length).toBeGreaterThan(0);
    expect(screen.getByText("Compliance pulse")).toBeOnTheScreen();
    expect(screen.getByText("Readiness")).toBeOnTheScreen();
    expect(screen.getByText("Workload")).toBeOnTheScreen();
    expect(screen.getByText("Log context")).toBeOnTheScreen();
    expect(screen.getByText("Recent Activity")).toBeOnTheScreen();
  });

  it("navigates to certificates from the review panel", () => {
    render(
      <VesselOperationalProfileReviewLayout
        projectId="project-atlantic"
        assetId="asset-1"
        projectName="Atlantic Ops"
        vessel={{
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
        }}
        summary={{
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
        }}
        alerts={[]}
        alertsLoading={false}
        alertsError={null}
        onRetryAlerts={jest.fn()}
        auditState={{
          events: [],
          loading: false,
          error: null,
          refresh: jest.fn(),
        }}
        isModuleEnabled={() => true}
      />,
    );

    fireEvent.press(screen.getByText("Open certificates"));

    expect(push).toHaveBeenCalledWith(
      "/projects/project-atlantic/vessels/asset-1/certificates",
    );
  });
});
