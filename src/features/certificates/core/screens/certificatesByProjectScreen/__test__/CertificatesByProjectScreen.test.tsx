import { fireEvent, render, screen } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { ReactNode } from "react";
import { useToast } from "@/src/context/ToastProvider";
import { useVessels } from "@/src/features/vessels/core";
import CertificatesByProjectScreen from "../CertificatesByProjectScreen";
import { useCertificateRequirementsByProject } from "@/src/features/certificates/requirements/hooks/useCertificateRequirementsByProject";
import { useCertificatesByProject } from "@/src/features/certificates/core/hooks/useCertificatesByProject";
import { useGenerateCertificateRequirements } from "@/src/features/certificates/requirements/hooks/useGenerateCertificateRequirements";

const mockReactNative = jest.requireActual("react-native");

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("@/src/context/ToastProvider", () => ({
  useToast: jest.fn(),
}));

jest.mock("@/src/features/vessels/core", () => ({
  useVessels: jest.fn(),
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
  ToolbarSelect: ({ renderLabel, value }: { renderLabel: (value: string) => string; value: string }) => {
    const { Text } = mockReactNative;
    return <Text>{renderLabel(value)}</Text>;
  },
}));

jest.mock("@/src/features/certificates/requirements/hooks/useCertificateRequirementsByProject", () => ({
  useCertificateRequirementsByProject: jest.fn(),
}));

jest.mock("@/src/features/certificates/core/hooks/useCertificatesByProject", () => ({
  useCertificatesByProject: jest.fn(),
}));

jest.mock("@/src/features/certificates/requirements/hooks/useGenerateCertificateRequirements", () => ({
  useGenerateCertificateRequirements: jest.fn(),
}));

jest.mock("@/src/features/certificates/requirements/components/certificateRequirementsTable/CertificateRequirementsTable", () => ({
  CertificateRequirementsTable: ({
    title,
    subtitleRight,
    headerActions,
  }: {
    title: string;
    subtitleRight?: string;
    headerActions?: ReactNode;
  }) => {
    const { Text, View } = mockReactNative;
    return (
      <View>
        <Text>{title}</Text>
        {subtitleRight ? <Text>{subtitleRight}</Text> : null}
        {headerActions}
      </View>
    );
  },
}));

jest.mock("@/src/features/certificates/core/components/certificateTable/CertificatesTable", () => ({
  CertificatesTable: ({
    title,
    subtitleRight,
    headerActions,
  }: {
    title: string;
    subtitleRight?: string;
    headerActions?: ReactNode;
  }) => {
    const { Text, View } = mockReactNative;
    return (
      <View>
        <Text>{title}</Text>
        {subtitleRight ? <Text>{subtitleRight}</Text> : null}
        {headerActions}
      </View>
    );
  },
}));

describe("CertificatesByProjectScreen", () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push });
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
    });
    (useToast as jest.Mock).mockReturnValue({
      show: jest.fn(),
    });
    (useCertificateRequirementsByProject as jest.Mock).mockReturnValue({
      requirements: [
        {
          id: "req-1",
          status: "MISSING",
          assetName: "MV Navigate One",
          assetId: "asset-1",
        },
        {
          id: "req-2",
          status: "PROVIDED",
          assetName: "MV Navigate Two",
          assetId: "asset-2",
        },
      ],
      loading: false,
      error: null,
      refresh: jest.fn(),
    });
    (useCertificatesByProject as jest.Mock).mockReturnValue({
      certificates: [
        {
          id: "cert-1",
          status: "VALID",
          assetName: "MV Navigate One",
        },
      ],
      loading: false,
      error: null,
      refresh: jest.fn(),
    });
    (useGenerateCertificateRequirements as jest.Mock).mockReturnValue({
      generateProject: jest.fn(),
      loading: false,
      error: null,
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

  it("GIVEN the certificates workspace opens WHEN rendered SHOULD default to project certificate records", () => {
    render(<CertificatesByProjectScreen />);

    expect(screen.getByText("Certificates")).toBeOnTheScreen();
    expect(screen.getByText("Project compliance registry")).toBeOnTheScreen();
    expect(screen.getByText("Overview")).toBeOnTheScreen();
    expect(screen.getAllByText("Requirements").length).toBeGreaterThan(0);
    expect(screen.queryByText("Fleet registry")).not.toBeOnTheScreen();
    expect(screen.getByText("Project Records")).toBeOnTheScreen();
  });

  it("GIVEN the requirements tab is pressed WHEN the user changes mode SHOULD show the requirements table", () => {
    render(<CertificatesByProjectScreen />);

    fireEvent.press(screen.getAllByText("Requirements")[0]);

    expect(screen.getByText("Vessel Requirements")).toBeOnTheScreen();
  });
});


