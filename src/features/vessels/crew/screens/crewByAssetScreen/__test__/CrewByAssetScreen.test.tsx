import { fireEvent, render, screen } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import CrewByAssetScreen from "../CrewByAssetScreen";
import { useCrewByAsset } from "@/src/features/crew/core";

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("@/src/features/crew/core", () => ({
  useCrewByAsset: jest.fn(),
}));

jest.mock("../CrewByAssetWorkspaceSection", () => ({
  CrewByAssetWorkspaceSection: () => null,
}));

jest.mock("../CrewByAssetCertificatesWorkspaceSection", () => ({
  CrewByAssetCertificatesWorkspaceSection: () => {
    const { Text } = jest.requireActual("react-native");
    return <Text>Certificates workspace</Text>;
  },
}));

jest.mock("../CrewByAssetCertificatesHeaderActions", () => ({
  CrewByAssetCertificatesHeaderActions: () => null,
}));

jest.mock("../useCrewByAssetCertificatesWorkspace", () => ({
  useCrewByAssetCertificatesWorkspace: () => ({
    requirements: [],
    loading: false,
    error: null,
    stats: {
      totalRequirements: 0,
      missingRequirements: 0,
      underReviewRequirements: 0,
      providedRequirements: 0,
      expiredRequirements: 0,
      exemptRequirements: 0,
      uploadedRequirements: 0,
      activeCertificates: 0,
      expiringSoonCertificates: 0,
    },
    statsLoading: false,
    statsError: null,
    summaryItems: [
      {
        label: "Requirements",
        value: "0",
        helper: "active crew certificate requirements",
        tone: "accent",
      },
    ],
    msmcSummary: null,
    msmcLoading: false,
    msmcError: null,
    refreshMsmc: jest.fn(),
    refreshAll: jest.fn(),
  }),
}));

describe("CrewByAssetScreen", () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push });
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
      assetId: "vessel-one",
    });
    (useCrewByAsset as jest.Mock).mockReturnValue({
      crew: [
        {
          id: "crew-1",
          status: "ACTIVE",
          medicalCertificateValid: true,
        },
        {
          id: "crew-2",
          status: "INACTIVE",
          medicalCertificateValid: null,
        },
      ],
      loading: false,
      error: null,
      refresh: jest.fn(),
    });
  });

  it("GIVEN the vessel crew lane opens WHEN rendered SHOULD expose overview and certificate entry points", () => {
    render(<CrewByAssetScreen />);

    expect(screen.getByText("Crew")).toBeOnTheScreen();
    expect(screen.getByText("Vessel crew registry")).toBeOnTheScreen();
    expect(screen.getByText("Overview")).toBeOnTheScreen();
    expect(screen.getByText("Certificates")).toBeOnTheScreen();
    expect(screen.getByText("Crew in scope")).toBeOnTheScreen();
    expect(screen.getByText("Medical attention")).toBeOnTheScreen();
  });

  it("GIVEN the crew create action is pressed WHEN rendered SHOULD navigate to the vessel-scoped create route", () => {
    render(<CrewByAssetScreen />);

    fireEvent.press(screen.getByText("New Crew"));

    expect(push).toHaveBeenCalledWith(
      "/projects/project-atlantic/vessels/vessel-one/crew/new",
    );
  });

  it("GIVEN the certificates tab is pressed WHEN rendered SHOULD show the vessel crew certificates workspace", () => {
    render(<CrewByAssetScreen />);

    fireEvent.press(screen.getByText("Certificates"));

    expect(screen.getByText("Requirements")).toBeOnTheScreen();
    expect(screen.getByText("Certificates workspace")).toBeOnTheScreen();
  });
});
