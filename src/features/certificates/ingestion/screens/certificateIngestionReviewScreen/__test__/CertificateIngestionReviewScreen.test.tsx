import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useToast } from "@/src/context/ToastProvider";
import { useCertificateTypes } from "@/src/features/certificates/core/hooks/useCertificateTypes";
import { useVessels } from "@/src/features/vessels/core";
import {
  fakeCertificateIngestion,
  fakeCertificateType,
  fakeConfirmCertificateIngestionResult,
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

const routerReplace = jest.fn();
const routerPush = jest.fn();
const showToast = jest.fn();
const refresh = jest.fn();
const submit = jest.fn();
const cancelIngestion = jest.fn();
const vessel = fakeVesselAsset();
const certificateType = fakeCertificateType();

describe("CertificateIngestionReviewScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    submit.mockResolvedValue(fakeConfirmCertificateIngestionResult());
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
      assetId: "vessel-one",
      ingestionId: "ingestion-1",
    });
    (useRouter as jest.Mock).mockReturnValue({
      replace: routerReplace,
      push: routerPush,
    });
    (useToast as jest.Mock).mockReturnValue({ show: showToast });
    (useCertificateIngestionById as jest.Mock).mockReturnValue({
      ingestion: fakeCertificateIngestion(),
      loading: false,
      error: null,
      refresh,
    });
    (useConfirmCertificateIngestion as jest.Mock).mockReturnValue({
      submit,
      loading: false,
      error: null,
    });
    (useCertificateWorkflowActions as jest.Mock).mockReturnValue({
      cancelIngestion,
      loading: false,
    });
    (useVessels as jest.Mock).mockReturnValue({
      vessels: [vessel],
      loading: false,
      error: null,
    });
    (useCertificateTypes as jest.Mock).mockReturnValue({
      certificateTypes: [certificateType],
      loading: false,
      error: null,
    });
  });

  it("GIVEN an extracted certificate candidate WHEN confirming SHOULD submit metadata and route to the created certificate", async () => {
    render(<CertificateIngestionReviewScreen />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("IOPP-2026-001")).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByText("Create submitted record"));

    await waitFor(() => {
      expect(submit).toHaveBeenCalledWith({
        certificateTypeId: "type-iopp",
        number: "IOPP-2026-001",
        issuer: "Flag State",
        issueDate: "2026-01-10T00:00:00.000Z",
        expiryDate: "2031-01-10T00:00:00.000Z",
        notes: "Candidate notes",
      });
    });
    expect(showToast).toHaveBeenCalledWith(
      "Certificate record created in submitted state. Approve it when the metadata is ready.",
      "success",
    );
    expect(routerReplace).toHaveBeenCalledWith(
      "/projects/project-atlantic/vessels/vessel-one/certificates/certificate-created",
    );
  });
});


