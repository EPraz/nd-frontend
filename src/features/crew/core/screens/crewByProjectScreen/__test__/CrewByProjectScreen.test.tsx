import { useLocalSearchParams, useRouter } from "expo-router";
import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";
import CrewByProjectScreen from "../CrewByProjectScreen";
import { useCrewPageData } from "../../../hooks/useCrewPageData";

const mockReactNative = jest.requireActual("react-native");

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
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

jest.mock("../../../hooks/useCrewPageData", () => ({
  useCrewPageData: jest.fn(),
}));

jest.mock("../../../components/crewTable/CrewTable", () => ({
  CrewTable: ({
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

jest.mock("../../crewQuickViewModal/CrewQuickViewModal", () => () => null);
jest.mock("../../../../certificates/components/CrewCertificatesProjectWorkspaceSection", () => ({
  CrewCertificatesProjectWorkspaceSection: () => {
    const { Text } = mockReactNative;
    return <Text>Crew certificate compliance</Text>;
  },
}));
jest.mock("../../../../certificates/components/CrewCertificatesProjectTabHeaderActions", () => ({
  CrewCertificatesProjectTabHeaderActions: () => null,
}));
jest.mock("../../../../bulk-upload/components/CrewBulkUploadWorkspaceSection", () => ({
  CrewBulkUploadWorkspaceSection: () => {
    const { Text } = mockReactNative;
    return <Text>Crew bulk upload</Text>;
  },
}));
jest.mock("../../../../bulk-upload/components/CrewBulkUploadTabHeaderActions", () => ({
  CrewBulkUploadTabHeaderActions: () => null,
}));

describe("CrewByProjectScreen", () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push });
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
    });
    (useCrewPageData as jest.Mock).mockReturnValue({
      stats: {
        total: 24,
        active: 20,
        inactive: 4,
        vesselsWithCrew: 2,
        vacationDueNext30Days: 3,
      },
      list: [
        { id: "crew-1", fullName: "Maria Lopez" },
        { id: "crew-2", fullName: "Daniel Cruz" },
      ],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it("GIVEN the crew workspace opens WHEN rendered SHOULD expose the roster and crew workflow tabs", () => {
    render(<CrewByProjectScreen />);

    expect(screen.getByText("Crew")).toBeOnTheScreen();
    expect(screen.getByText("Project crew registry")).toBeOnTheScreen();
    expect(screen.getByText("Overview")).toBeOnTheScreen();
    expect(screen.getByText("Certificates")).toBeOnTheScreen();
    expect(screen.getByText("Bulk Upload")).toBeOnTheScreen();
    expect(screen.getByText("Crew roster")).toBeOnTheScreen();
    expect(screen.getByText("24")).toBeOnTheScreen();
    expect(screen.getByText("Active first")).toBeOnTheScreen();
  });

  it("GIVEN the action buttons are shown WHEN the user opens a next-step route SHOULD navigate correctly", () => {
    render(<CrewByProjectScreen />);

    fireEvent.press(screen.getByText("New Crew"));

    expect(push).toHaveBeenCalledWith("/projects/project-atlantic/crew/new");
  });

  it("GIVEN the certificates tab is selected WHEN the user changes mode SHOULD show crew certificate compliance inline", () => {
    render(<CrewByProjectScreen />);

    fireEvent.press(screen.getByText("Certificates"));

    expect(screen.getByText("Crew certificate compliance")).toBeOnTheScreen();
  });

  it("GIVEN the route opens with tab=certificates WHEN the screen renders SHOULD default to the certificates tab", () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
      tab: "certificates",
    });

    render(<CrewByProjectScreen />);

    expect(screen.getByText("Crew certificate compliance")).toBeOnTheScreen();
  });

  it("GIVEN the route opens with tab=bulk-upload WHEN the screen renders SHOULD default to the bulk upload tab", () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
      tab: "bulk-upload",
    });

    render(<CrewByProjectScreen />);

    expect(screen.getByText("Crew bulk upload")).toBeOnTheScreen();
  });
});
