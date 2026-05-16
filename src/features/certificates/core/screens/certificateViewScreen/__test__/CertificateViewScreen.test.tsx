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

function fakeEvidenceAttachment(overrides: Record<string, unknown> = {}) {
  return {
    id: "attachment-1",
    fileName: "iopp.pdf",
    mimeType: "application/pdf",
    url: "/storage/object?ref=iopp.pdf",
    checksum: null,
    version: 1,
    uploadedByUserId: "user-1",
    uploadedAt: "2026-01-10T00:00:00.000Z",
    ...overrides,
  };
}

describe("CertificateViewScreen", () => {
  let approveMock: jest.Mock;
  let rejectMock: jest.Mock;
  let saveMetadataMock: jest.Mock;
  let resubmitMock: jest.Mock;
  let removeCertificateMock: jest.Mock;
  let refreshMock: jest.Mock;
  let showMock: jest.Mock;
  let routerPushMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    approveMock = jest.fn();
    rejectMock = jest.fn();
    saveMetadataMock = jest.fn();
    resubmitMock = jest.fn();
    removeCertificateMock = jest.fn();
    refreshMock = jest.fn();
    showMock = jest.fn();
    routerPushMock = jest.fn();
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
      assetId: "vessel-one",
      certificateId: "certificate-1",
    });
    (useRouter as jest.Mock).mockReturnValue({
      back: jest.fn(),
      push: routerPushMock,
      replace: jest.fn(),
    });
    (useToast as jest.Mock).mockReturnValue({ show: showMock });
    (useCertificateWorkflowActions as jest.Mock).mockReturnValue({
      approve: approveMock,
      reject: rejectMock,
      saveMetadata: saveMetadataMock,
      resubmit: resubmitMock,
      removeAttachment: jest.fn(),
      removeCertificate: removeCertificateMock,
      loading: false,
    });
  });

  it("GIVEN a submitted document record WHEN rendered SHOULD expose approval actions", () => {
    (useCertificatesById as jest.Mock).mockReturnValue({
      certificate: fakeCertificate({ workflowStatus: "SUBMITTED" }),
      loading: false,
      error: null,
      refresh: refreshMock,
    });

    render(<CertificateViewScreen />);

    expect(screen.getByText("Approve")).toBeOnTheScreen();
    expect(screen.getByText("Send back")).toBeOnTheScreen();
  });

  it("GIVEN a non-submitted document record WHEN rendered SHOULD hide approval actions", () => {
    (useCertificatesById as jest.Mock).mockReturnValue({
      certificate: fakeCertificate({ workflowStatus: "DRAFT" }),
      loading: false,
      error: null,
      refresh: refreshMock,
    });

    render(<CertificateViewScreen />);

    expect(screen.queryByText("Approve")).toBeNull();
    expect(screen.queryByText("Send back")).toBeNull();
  });

  it("GIVEN a submitted document record WHEN sent back SHOULD require and submit a correction note", async () => {
    (useCertificatesById as jest.Mock).mockReturnValue({
      certificate: fakeCertificate({ workflowStatus: "SUBMITTED" }),
      loading: false,
      error: null,
      refresh: refreshMock,
    });

    render(<CertificateViewScreen />);

    fireEvent.press(screen.getByText("Send back"));
    const sendBackButtons = screen.getAllByText("Send back");
    fireEvent.press(sendBackButtons[sendBackButtons.length - 1]);

    expect(
      screen.getByText("Add a correction note before sending this back."),
    ).toBeOnTheScreen();
    expect(rejectMock).not.toHaveBeenCalled();

    fireEvent.changeText(
      screen.getByPlaceholderText("Explain what must be corrected"),
      "Correct the expiry date",
    );
    const confirmSendBackButtons = screen.getAllByText("Send back");
    fireEvent.press(
      confirmSendBackButtons[confirmSendBackButtons.length - 1],
    );

    await waitFor(() => {
      expect(rejectMock).toHaveBeenCalledWith({
        reason: "Correct the expiry date",
      });
    });
    expect(refreshMock).toHaveBeenCalled();
  });

  it("GIVEN a child document with ineligible parent WHEN approval fails SHOULD show backend reason", async () => {
    approveMock.mockRejectedValue(
      new Error(
        "Principal certificate must be approved before this child document can be approved.",
      ),
    );
    (useCertificatesById as jest.Mock).mockReturnValue({
      certificate: fakeCertificate({
        workflowStatus: "SUBMITTED",
        certificateDocumentKind: "SUPPLEMENT",
        certificateParentTypeId: "type-parent",
        certificateParentTypeName: "IOPP Certificate",
        parentCertificateId: "parent-1",
        parentCertificateName: "IOPP Certificate",
        parentCertificateNumber: "IOPP-2026",
        parentCertificateWorkflowStatus: "SUBMITTED",
        parentCertificateStatus: "VALID",
      }),
      loading: false,
      error: null,
      refresh: refreshMock,
    });

    render(<CertificateViewScreen />);

    fireEvent.press(screen.getByText("Approve"));

    await waitFor(() => {
      expect(showMock).toHaveBeenCalledWith(
        "Principal certificate must be approved before this child document can be approved.",
        "error",
      );
    });
  });

  it("GIVEN a child document blocked by parent WHEN rendered SHOULD explain the parent issue", () => {
    (useCertificatesById as jest.Mock).mockReturnValue({
      certificate: fakeCertificate({
        workflowStatus: "APPROVED",
        certificateDocumentKind: "SUPPLEMENT",
        certificateParentTypeId: "type-parent",
        certificateParentTypeName: "IOPP Certificate",
        parentCertificateId: "parent-1",
        parentCertificateName: "IOPP Certificate",
        parentCertificateNumber: "IOPP-2026",
        parentCertificateWorkflowStatus: "APPROVED",
        parentCertificateStatus: "EXPIRED",
        requirementStatus: "MISSING",
      }),
      loading: false,
      error: null,
      refresh: refreshMock,
    });

    render(<CertificateViewScreen />);

    expect(screen.getByText("Approved / Expired")).toBeOnTheScreen();
    expect(
      screen.getByText(
        "Principal document must be valid or expiring soon before this child document can satisfy compliance.",
      ),
    ).toBeOnTheScreen();
  });

  it("GIVEN a child document without parent link WHEN rendered SHOULD explain the missing parent", () => {
    (useCertificatesById as jest.Mock).mockReturnValue({
      certificate: fakeCertificate({
        workflowStatus: "APPROVED",
        certificateDocumentKind: "SUPPLEMENT",
        certificateParentTypeId: "type-parent",
        certificateParentTypeName: "IOPP Certificate",
        parentCertificateId: null,
        parentCertificateName: null,
        parentCertificateWorkflowStatus: null,
        parentCertificateStatus: null,
        requirementStatus: "MISSING",
      }),
      loading: false,
      error: null,
      refresh: refreshMock,
    });

    render(<CertificateViewScreen />);

    expect(screen.getByText("Expected: IOPP Certificate")).toBeOnTheScreen();
    expect(
      screen.getByText("Principal document is missing or no longer linked."),
    ).toBeOnTheScreen();
  });

  it("GIVEN a rejected document record WHEN corrected SHOULD save metadata before resubmit", async () => {
    (useCertificatesById as jest.Mock).mockReturnValue({
      certificate: fakeCertificate({
        workflowStatus: "REJECTED",
        rejectedAt: "2026-01-15T00:00:00.000Z",
        rejectedByUserId: "user-reviewer",
        rejectedByUserName: "Reviewer",
        rejectionReason: "Correct the expiry date.",
        attachmentCount: 1,
        attachments: [
          {
            id: "attachment-1",
            fileName: "iopp.pdf",
            mimeType: "application/pdf",
            url: "/storage/object?ref=iopp.pdf",
            checksum: null,
            version: 1,
            uploadedByUserId: "user-1",
            uploadedAt: "2026-01-10T00:00:00.000Z",
          },
        ],
      }),
      loading: false,
      error: null,
      refresh: refreshMock,
    });

    render(<CertificateViewScreen />);

    expect(screen.getByText("Correction required")).toBeOnTheScreen();
    expect(screen.getByText("Correct the expiry date.")).toBeOnTheScreen();
    expect(screen.queryByText("Approve")).toBeNull();
    expect(screen.queryByText("Send back")).toBeNull();

    fireEvent.changeText(
      screen.getByPlaceholderText("Document number"),
      " IOPP-CORRECTED ",
    );
    fireEvent.press(screen.getByText("Save and resubmit"));

    await waitFor(() => {
      expect(saveMetadataMock).toHaveBeenCalledWith(
        expect.objectContaining({
          number: "IOPP-CORRECTED",
          issuer: "Flag State",
          issueDate: "2026-01-10T00:00:00.000Z",
          expiryDate: "2031-01-10T00:00:00.000Z",
        }),
      );
    });
    expect(resubmitMock).toHaveBeenCalled();
    expect(refreshMock).toHaveBeenCalled();
  });

  it("GIVEN a rejected document record without evidence WHEN resubmitted SHOULD guide upload first", async () => {
    (useCertificatesById as jest.Mock).mockReturnValue({
      certificate: fakeCertificate({
        workflowStatus: "REJECTED",
        rejectionReason: "The uploaded file was deleted.",
        attachmentCount: 0,
        attachments: [],
      }),
      loading: false,
      error: null,
      refresh: refreshMock,
    });

    render(<CertificateViewScreen />);

    fireEvent.press(screen.getByText("Save and resubmit"));

    expect(
      await screen.findByText(
        "Upload document evidence before resubmitting this document.",
      ),
    ).toBeOnTheScreen();
    expect(saveMetadataMock).not.toHaveBeenCalled();
    expect(resubmitMock).not.toHaveBeenCalled();
  });

  it("GIVEN a rejected document record with replacement evidence pending WHEN rendered SHOULD block legacy resubmit and delete", async () => {
    (useCertificatesById as jest.Mock).mockReturnValue({
      certificate: fakeCertificate({
        workflowStatus: "REJECTED",
        rejectionReason: "Replace the attached evidence.",
        attachmentCount: 1,
        attachments: [fakeEvidenceAttachment()],
        pendingReplacementIngestionId: "replacement-ingestion-1",
      }),
      loading: false,
      error: null,
      refresh: refreshMock,
    });

    render(<CertificateViewScreen />);

    expect(
      screen.getByText(
        "Review or cancel the pending replacement evidence before resubmitting this document record.",
      ),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByText("Save and resubmit"));
    expect(saveMetadataMock).not.toHaveBeenCalled();
    expect(resubmitMock).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText("Delete"));
    expect(screen.queryByText("Delete certificate")).toBeNull();
    expect(removeCertificateMock).not.toHaveBeenCalled();
  });

  it.each(["SUBMITTED", "APPROVED"] as const)(
    "GIVEN a %s document record with one evidence file WHEN rendered SHOULD not expose last-file deletion",
    (workflowStatus) => {
      (useCertificatesById as jest.Mock).mockReturnValue({
        certificate: fakeCertificate({
          workflowStatus,
          attachmentCount: 1,
          attachments: [fakeEvidenceAttachment()],
        }),
        loading: false,
        error: null,
        refresh: refreshMock,
      });

      render(<CertificateViewScreen />);

      expect(screen.queryByText("Delete file")).toBeNull();
    },
  );

  it("GIVEN a rejected document record WHEN uploading new evidence SHOULD preserve replacement context", () => {
    (useCertificatesById as jest.Mock).mockReturnValue({
      certificate: fakeCertificate({
        workflowStatus: "REJECTED",
        rejectionReason: "The uploaded evidence is the wrong document.",
        attachmentCount: 1,
        attachments: [fakeEvidenceAttachment()],
      }),
      loading: false,
      error: null,
      refresh: refreshMock,
    });

    render(<CertificateViewScreen />);

    fireEvent.press(screen.getByText("Upload new evidence"));

    expect(routerPushMock).toHaveBeenCalledWith({
      pathname: "/projects/[projectId]/certificates/upload",
      params: expect.objectContaining({
        projectId: "project-atlantic",
        assetId: "vessel-one",
        returnTo: "vessel-certificates",
        replacementCertificateId: "certificate-1",
        correctionMode: "replace-evidence",
      }),
    });
  });
});
