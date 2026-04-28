import { render, screen } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { CrewCertificatesProjectWorkspaceContent } from "../CrewCertificatesProjectWorkspaceContent";
import type { CrewCertificatesProjectWorkspaceState } from "../../hooks/useCrewCertificatesProjectWorkspace";
import { fakeCrewCertificateRequirement } from "@/src/test/fakes/crewCertificates";

const mockReactNative = jest.requireActual("react-native");

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
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

function makeWorkspace(): CrewCertificatesProjectWorkspaceState {
  return {
    requirements: [
      fakeCrewCertificateRequirement({
        id: "req-1",
        crewMemberName: "Maria Lopez",
        certificateName: "Master CoC",
        status: "MISSING",
      }),
    ],
    pagination: null,
    loading: false,
    error: null,
    stats: {
      totalRequirements: 4,
      missingRequirements: 1,
      underReviewRequirements: 1,
      providedRequirements: 2,
      expiredRequirements: 0,
      exemptRequirements: 0,
      uploadedRequirements: 3,
      activeCertificates: 2,
      expiringSoonCertificates: 1,
    },
    statsLoading: false,
    statsError: null,
    msmcSummaries: [],
    msmcLoading: false,
    msmcError: null,
    refreshMsmc: jest.fn(),
    generateProject: jest.fn().mockResolvedValue({
      processedCrewMembers: 3,
    }),
    generating: false,
    generationError: null,
    refreshAll: jest.fn().mockResolvedValue(undefined),
  };
}

describe("CrewCertificatesProjectWorkspaceContent", () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push });
  });

  it("GIVEN the crew certificates tab opens WHEN it renders SHOULD show summary and requirements table", () => {
    render(
      <CrewCertificatesProjectWorkspaceContent
        projectId="project-atlantic"
        workspace={makeWorkspace()}
        search=""
        statusFilter="ALL"
        assetFilter="ALL"
        vessels={[]}
        crewStateFilter="ALL"
        onSearchChange={jest.fn()}
        onStatusFilterChange={jest.fn()}
        onAssetFilterChange={jest.fn()}
        onCrewStateFilterChange={jest.fn()}
      />,
    );

    expect(screen.getByText("Crew certificate requirements")).toBeOnTheScreen();
    expect(screen.getByText("All status")).toBeOnTheScreen();
    expect(screen.getByText("Priority first")).toBeOnTheScreen();
    expect(screen.getByText("Fleet safe manning overview")).toBeOnTheScreen();
  });
});
