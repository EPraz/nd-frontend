import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useToast } from "@/src/context/ToastProvider";
import { useCertificatesById } from "@/src/features/certificates/core/hooks/useCertificatesById";
import { useCertificateWorkflowActions } from "@/src/features/certificates/ingestion";
import { fakeCertificate } from "@/src/test/fakes/certificates";
import CertificateViewScreen from "../CertificateViewScreen";

jest.mock("@/src/api/baseUrl", () => ({
  getBaseUrl: () => "http://localhost:3000",
}));

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("@/src/context/ToastProvider", () => ({
  useToast: jest.fn(),
}));

jest.mock("@/src/features/certificates/core/hooks/useCertificatesById", () => ({
  useCertificatesById: jest.fn(),
}));

jest.mock("@/src/features/certificates/ingestion", () => ({
  useCertificateWorkflowActions: jest.fn(),
}));

describe("CertificateViewScreen toast feedback", () => {
  const showToast = jest.fn();
  const reject = jest.fn();
  const removeCertificate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
      assetId: "vessel-one",
      certificateId: "certificate-1",
    });
    (useRouter as jest.Mock).mockReturnValue({
      back: jest.fn(),
      push: jest.fn(),
      replace: jest.fn(),
    });
    (useToast as jest.Mock).mockReturnValue({ show: showToast });
    (useCertificateWorkflowActions as jest.Mock).mockReturnValue({
      approve: jest.fn(),
      reject,
      saveMetadata: jest.fn(),
      resubmit: jest.fn(),
      removeAttachment: jest.fn(),
      removeCertificate,
      loading: false,
    });
    (useCertificatesById as jest.Mock).mockReturnValue({
      certificate: fakeCertificate({ workflowStatus: "SUBMITTED" }),
      loading: false,
      error: null,
      refresh: jest.fn(),
    });
  });

  it("GIVEN backend rejects send-back WHEN reviewer confirms SHOULD show backend reason", async () => {
    reject.mockRejectedValueOnce(
      new Error("Only submitted document records can be sent back."),
    );

    render(<CertificateViewScreen />);

    fireEvent.press(screen.getByText("Send back"));
    fireEvent.changeText(
      screen.getByPlaceholderText("Explain what must be corrected"),
      "Correct the expiry date",
    );
    const sendBackButtons = screen.getAllByText("Send back");
    fireEvent.press(sendBackButtons[sendBackButtons.length - 1]);

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        "Only submitted document records can be sent back.",
        "error",
      );
    });
  });

  it("GIVEN backend rejects delete WHEN user confirms SHOULD show backend reason", async () => {
    removeCertificate.mockRejectedValueOnce(
      new Error("Document record cannot be deleted while replacement evidence is pending."),
    );

    render(<CertificateViewScreen />);

    fireEvent.press(screen.getByText("Delete"));
    const deleteButtons = screen.getAllByText("Delete certificate");
    fireEvent.press(deleteButtons[deleteButtons.length - 1]);

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        "Document record cannot be deleted while replacement evidence is pending.",
        "error",
      );
    });
  });
});
