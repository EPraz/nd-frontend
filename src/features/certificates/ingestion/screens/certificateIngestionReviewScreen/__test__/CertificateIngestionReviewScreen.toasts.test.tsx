import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useToast } from "@/src/context/ToastProvider";
import { useCertificatesByAsset } from "@/src/features/certificates/core/hooks/useCertificatesByAsset";
import { useCertificateTypes } from "@/src/features/certificates/core/hooks/useCertificateTypes";
import { useVessels } from "@/src/features/vessels/core";
import {
  fakeCertificateIngestion,
  fakeCertificateType,
  fakeVesselAsset,
} from "@/src/test/fakes/certificates";
import { useCertificateIngestionById } from "../../../hooks/useCertificateIngestionById";
import { useCertificateWorkflowActions } from "../../../hooks/useCertificateWorkflowActions";
import { useConfirmCertificateIngestion } from "../../../hooks/useConfirmCertificateIngestion";
import CertificateIngestionReviewScreen from "../CertificateIngestionReviewScreen";

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("@/src/context/ToastProvider", () => ({
  useToast: jest.fn(),
}));

jest.mock("@/src/features/certificates/core/hooks/useCertificateTypes", () => ({
  useCertificateTypes: jest.fn(),
}));

jest.mock("@/src/features/certificates/core/hooks/useCertificatesByAsset", () => ({
  useCertificatesByAsset: jest.fn(),
}));

jest.mock("@/src/features/vessels/core", () => ({
  useVessels: jest.fn(),
}));

jest.mock("../../../hooks/useCertificateIngestionById", () => ({
  useCertificateIngestionById: jest.fn(),
}));

jest.mock("../../../hooks/useCertificateWorkflowActions", () => ({
  useCertificateWorkflowActions: jest.fn(),
}));

jest.mock("../../../hooks/useConfirmCertificateIngestion", () => ({
  useConfirmCertificateIngestion: jest.fn(),
}));

describe("CertificateIngestionReviewScreen toast feedback", () => {
  const showToast = jest.fn();
  const submit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
      assetId: "vessel-one",
      ingestionId: "ingestion-1",
    });
    (useRouter as jest.Mock).mockReturnValue({
      replace: jest.fn(),
      push: jest.fn(),
    });
    (useToast as jest.Mock).mockReturnValue({ show: showToast });
    (useCertificateIngestionById as jest.Mock).mockReturnValue({
      ingestion: fakeCertificateIngestion(),
      loading: false,
      error: null,
      refresh: jest.fn(),
    });
    (useConfirmCertificateIngestion as jest.Mock).mockReturnValue({
      submit,
      loading: false,
      error: null,
    });
    (useCertificateWorkflowActions as jest.Mock).mockReturnValue({
      cancelIngestion: jest.fn(),
      loading: false,
    });
    (useVessels as jest.Mock).mockReturnValue({
      vessels: [fakeVesselAsset()],
      loading: false,
      error: null,
    });
    (useCertificateTypes as jest.Mock).mockReturnValue({
      certificateTypes: [fakeCertificateType()],
      loading: false,
      error: null,
    });
    (useCertificatesByAsset as jest.Mock).mockReturnValue({
      certificates: [],
      loading: false,
      error: null,
      refresh: jest.fn(),
    });
  });

  it("GIVEN backend rejects confirmation WHEN creating submitted record SHOULD show backend reason", async () => {
    submit.mockRejectedValueOnce(
      new Error("Parent certificate must be submitted or approved first."),
    );

    render(<CertificateIngestionReviewScreen />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("IOPP-2026-001")).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByText("Create submitted record"));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        "Parent certificate must be submitted or approved first.",
        "error",
      );
    });
  });
});
