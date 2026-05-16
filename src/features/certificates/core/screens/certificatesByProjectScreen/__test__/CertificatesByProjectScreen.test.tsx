import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
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
    data,
    onUpload,
  }: {
    title: string;
    subtitleRight?: string;
    headerActions?: ReactNode;
    data?: { id: string; assetId: string }[];
    onUpload?: (row: { id: string; assetId: string }) => void;
  }) => {
    const { Pressable, Text, View } = mockReactNative;
    return (
      <View>
        <Text>{title}</Text>
        {subtitleRight ? <Text>{subtitleRight}</Text> : null}
        {headerActions}
        {data?.[0] && onUpload ? (
          <Pressable onPress={() => onUpload(data[0])}>
            <Text>Open project requirement upload</Text>
          </Pressable>
        ) : null}
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
  const showToast = jest.fn();
  const generateProject = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push });
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
    });
    (useToast as jest.Mock).mockReturnValue({ show: showToast });
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
      stats: {
        total: 2,
        missing: 1,
        underReview: 0,
        provided: 1,
        expired: 0,
        exempt: 0,
      },
      refresh: jest.fn(),
    });
    (useCertificatesByProject as jest.Mock).mockReturnValue({
      certificates: [
        {
          id: "cert-1",
          status: "VALID",
          workflowStatus: "APPROVED",
          assetName: "MV Navigate One",
        },
      ],
      loading: false,
      error: null,
      stats: {
        total: 1,
        valid: 1,
        expiringSoon: 0,
        expired: 0,
        pending: 0,
        draft: 0,
        submitted: 0,
        approved: 1,
        rejected: 0,
      },
      refresh: jest.fn(),
    });
    generateProject.mockResolvedValue({ processedAssets: 1 });
    (useGenerateCertificateRequirements as jest.Mock).mockReturnValue({
      generateProject,
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

  it("GIVEN the certificates workspace opens WHEN rendered SHOULD default to project records overview", () => {
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

  it("GIVEN a project requirement row WHEN upload is triggered SHOULD route without vessel return context", () => {
    render(<CertificatesByProjectScreen />);

    fireEvent.press(screen.getAllByText("Requirements")[0]);
    fireEvent.press(screen.getByText("Open project requirement upload"));

    expect(push).toHaveBeenCalledWith({
      pathname: "/projects/[projectId]/certificates/upload",
      params: {
        projectId: "project-atlantic",
        assetId: "asset-1",
        requirementId: "req-1",
      },
    });
  });

  it("GIVEN project certificates extra upload WHEN pressed SHOULD route to project intake", () => {
    render(<CertificatesByProjectScreen />);

    fireEvent.press(screen.getByText("Add Certificate"));

    expect(push).toHaveBeenCalledWith({
      pathname: "/projects/[projectId]/certificates/upload",
      params: {
        projectId: "project-atlantic",
      },
    });
  });

  it("GIVEN requirement refresh fails WHEN backend returns reason SHOULD show backend reason", async () => {
    generateProject.mockRejectedValueOnce(
      new Error("Certificate catalog is not available for this project."),
    );

    render(<CertificatesByProjectScreen />);

    fireEvent.press(screen.getByText("Refresh"));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        "Certificate catalog is not available for this project.",
        "error",
      );
    });
  });

  it("GIVEN rejected records exist WHEN rendered SHOULD show a correction-needed summary separate from missing", () => {
    (useCertificatesByProject as jest.Mock).mockReturnValue({
      certificates: [
        {
          id: "cert-1",
          status: "PENDING",
          workflowStatus: "REJECTED",
          assetName: "MV Navigate One",
        },
      ],
      loading: false,
      error: null,
      stats: {
        total: 1,
        valid: 0,
        expiringSoon: 0,
        expired: 0,
        pending: 1,
        draft: 0,
        submitted: 0,
        approved: 0,
        rejected: 1,
      },
      refresh: jest.fn(),
    });

    render(<CertificatesByProjectScreen />);

    expect(screen.getByText("Correction needed")).toBeOnTheScreen();
    expect(screen.getByText("records sent back")).toBeOnTheScreen();
    expect(screen.getByText("open requirement gaps")).toBeOnTheScreen();
  });
});


