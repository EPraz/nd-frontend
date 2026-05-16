import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useToast } from "@/src/context/ToastProvider";
import { useCertificatesByAsset } from "@/src/features/certificates/core/hooks/useCertificatesByAsset";
import { useCertificateTypes } from "@/src/features/certificates/core/hooks/useCertificateTypes";
import { useVessels } from "@/src/features/vessels/core";
import {
  fakeCertificate,
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
    (useCertificatesByAsset as jest.Mock).mockReturnValue({
      certificates: [],
      loading: false,
      error: null,
      refresh: jest.fn(),
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
        parentCertificateId: null,
        notes: "Candidate notes",
      });
    });
    expect(showToast).toHaveBeenCalledWith(
      "Document record created in submitted state. Approve it when the metadata is ready.",
      "success",
    );
    expect(routerReplace).toHaveBeenCalledWith(
      "/projects/project-atlantic/vessels/vessel-one/certificates/certificate-created",
    );
  });

  it("GIVEN a replacement ingestion opened without route context WHEN confirming SHOULD show replacement copy", async () => {
    (useCertificateIngestionById as jest.Mock).mockReturnValue({
      ingestion: fakeCertificateIngestion({
        sourceKind: "EXTRA",
        sourceRequirementId: null,
        linkedVesselCertificateId: "rejected-certificate-1",
      }),
      loading: false,
      error: null,
      refresh,
    });

    render(<CertificateIngestionReviewScreen />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("IOPP-2026-001")).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByText("Create submitted record"));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        "Replacement evidence confirmed. The document is resubmitted for review.",
        "success",
      );
    });
  });

  it("GIVEN review starts from vessel certificates WHEN back is pressed SHOULD return to the vessel lane", () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
      assetId: "vessel-one",
      ingestionId: "ingestion-1",
      returnTo: "vessel-certificates",
    });

    render(<CertificateIngestionReviewScreen />);

    fireEvent.press(screen.getByText("Certificate compliance"));

    expect(routerReplace).toHaveBeenCalledWith(
      "/projects/project-atlantic/vessels/vessel-one/certificates",
    );
  });

  it("GIVEN a no-expiry document type WHEN OCR has an expiry candidate SHOULD submit without expiry", async () => {
    const planType = fakeCertificateType({
      id: "type-plan",
      code: "SOPEP_PLAN",
      name: "Shipboard Oil Pollution Emergency Plan",
      documentKind: "PLAN",
      requiresExpiry: false,
      typicalValidityMonths: null,
    });
    (useCertificateIngestionById as jest.Mock).mockReturnValue({
      ingestion: fakeCertificateIngestion({
        certificateTypeId: planType.id,
        certificateCode: planType.code,
        certificateName: planType.name,
        candidateExpiryDate: "2031-01-10T00:00:00.000Z",
      }),
      loading: false,
      error: null,
      refresh,
    });
    (useCertificateTypes as jest.Mock).mockReturnValue({
      certificateTypes: [planType],
      loading: false,
      error: null,
    });

    render(<CertificateIngestionReviewScreen />);

    await waitFor(() => {
      expect(screen.getAllByText("No expiry required").length).toBeGreaterThan(0);
    });

    fireEvent.press(screen.getByText("Create submitted record"));

    await waitFor(() => {
      expect(submit).toHaveBeenCalledWith(
        expect.objectContaining({
          certificateTypeId: planType.id,
          expiryDate: null,
          parentCertificateId: null,
        }),
      );
    });
  });

  it("GIVEN a requirement candidate WHEN reviewer changes the document type SHOULD warn before acknowledging the retarget", async () => {
    const alternateType = fakeCertificateType({
      id: "type-other",
      code: "OTHER_DOC",
      name: "Other Document",
      documentKind: "PLAN",
      requiresExpiry: false,
      typicalValidityMonths: null,
    });
    (useCertificateTypes as jest.Mock).mockReturnValue({
      certificateTypes: [certificateType, alternateType],
      loading: false,
      error: null,
    });

    render(<CertificateIngestionReviewScreen />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("IOPP-2026-001")).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByLabelText("Open document type selector"));
    fireEvent.press(screen.getByText("Other Document"));

    expect(
      screen.getByText("This will not satisfy the original requirement."),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByText("Create submitted record"));

    expect(screen.getByText("Create other document record")).toBeOnTheScreen();
    expect(submit).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText("Create other document record"));

    await waitFor(() => {
      expect(submit).toHaveBeenCalledWith(
        expect.objectContaining({
          certificateTypeId: alternateType.id,
          acknowledgeRequirementMismatch: true,
        }),
      );
    });
  });

  it("GIVEN the document type catalog is still loading WHEN review renders SHOULD keep confirm disabled", async () => {
    (useCertificateTypes as jest.Mock).mockReturnValue({
      certificateTypes: [],
      loading: true,
      error: null,
    });

    render(<CertificateIngestionReviewScreen />);

    await waitFor(() => {
      expect(screen.getByText("Loading document types...")).toBeOnTheScreen();
    });

    expect(
      screen.getByRole("button", { name: "Create submitted record" }),
    ).toBeDisabled();
  });

  it("GIVEN a child document candidate WHEN confirming SHOULD require and submit the parent certificate", async () => {
    const parentType = fakeCertificateType({
      id: "type-parent",
      code: "PRINCIPAL_CERT",
      name: "Principal Certificate",
    });
    const childType = fakeCertificateType({
      id: "type-supplement",
      code: "IOPP_SUPPLEMENT",
      name: "IOPP Supplement",
      documentKind: "SUPPLEMENT",
      requiresExpiry: false,
      parentTypeId: parentType.id,
      parentCode: parentType.code,
      parentName: parentType.name,
    });
    (useCertificateIngestionById as jest.Mock).mockReturnValue({
      ingestion: fakeCertificateIngestion({
        certificateTypeId: childType.id,
        certificateCode: childType.code,
        certificateName: childType.name,
        candidateExpiryDate: null,
      }),
      loading: false,
      error: null,
      refresh,
    });
    (useCertificateTypes as jest.Mock).mockReturnValue({
      certificateTypes: [parentType, childType],
      loading: false,
      error: null,
    });
    (useCertificatesByAsset as jest.Mock).mockReturnValue({
      certificates: [
        fakeCertificate({
          id: "draft-parent-certificate",
          certificateTypeId: parentType.id,
          certificateCode: parentType.code,
          certificateName: "Draft Principal Certificate",
          number: "DRAFT-001",
          workflowStatus: "DRAFT",
        }),
        fakeCertificate({
          id: "parent-certificate",
          certificateTypeId: parentType.id,
          certificateCode: parentType.code,
          certificateName: parentType.name,
          number: "PARENT-001",
          workflowStatus: "APPROVED",
        }),
        fakeCertificate({
          id: "expired-parent-certificate",
          certificateTypeId: parentType.id,
          certificateCode: parentType.code,
          certificateName: "Expired Principal Certificate",
          number: "EXPIRED-001",
          workflowStatus: "APPROVED",
          status: "EXPIRED",
        }),
      ],
      loading: false,
      error: null,
      refresh: jest.fn(),
    });

    render(<CertificateIngestionReviewScreen />);

    await waitFor(() => {
      expect(screen.getByText("Principal certificate *")).toBeOnTheScreen();
    });

    expect(screen.queryByText("Draft Principal Certificate")).toBeNull();
    expect(screen.queryByText("Expired Principal Certificate")).toBeNull();
    expect(screen.getByText("Approved / Valid")).toBeOnTheScreen();
    fireEvent.press(screen.getByText("Principal Certificate"));
    fireEvent.press(screen.getByText("Create submitted record"));

    await waitFor(() => {
      expect(submit).toHaveBeenCalledWith(
        expect.objectContaining({
          certificateTypeId: childType.id,
          parentCertificateId: "parent-certificate",
        }),
      );
    });
  });

  it("GIVEN a child document candidate WHEN parent certificates are loading SHOULD show loading instead of an empty parent warning", async () => {
    const parentType = fakeCertificateType({
      id: "type-parent",
      code: "PRINCIPAL_CERT",
      name: "Principal Certificate",
    });
    const childType = fakeCertificateType({
      id: "type-supplement",
      code: "IOPP_SUPPLEMENT",
      name: "IOPP Supplement",
      documentKind: "SUPPLEMENT",
      requiresExpiry: false,
      parentTypeId: parentType.id,
      parentCode: parentType.code,
      parentName: parentType.name,
    });
    (useCertificateIngestionById as jest.Mock).mockReturnValue({
      ingestion: fakeCertificateIngestion({
        certificateTypeId: childType.id,
        certificateCode: childType.code,
        certificateName: childType.name,
        candidateExpiryDate: null,
      }),
      loading: false,
      error: null,
      refresh,
    });
    (useCertificateTypes as jest.Mock).mockReturnValue({
      certificateTypes: [parentType, childType],
      loading: false,
      error: null,
    });
    (useCertificatesByAsset as jest.Mock).mockReturnValue({
      certificates: [],
      loading: true,
      error: null,
      refresh: jest.fn(),
    });

    render(<CertificateIngestionReviewScreen />);

    await waitFor(() => {
      expect(
        screen.getByText("Loading eligible principal certificates..."),
      ).toBeOnTheScreen();
    });
    expect(screen.queryByText(/No matching parent certificate is loaded/)).toBeNull();
  });

  it("GIVEN a child document candidate with only ineligible parent records WHEN review renders SHOULD explain the parent is not eligible", async () => {
    const parentType = fakeCertificateType({
      id: "type-parent",
      code: "PRINCIPAL_CERT",
      name: "Principal Certificate",
    });
    const childType = fakeCertificateType({
      id: "type-supplement",
      code: "IOPP_SUPPLEMENT",
      name: "IOPP Supplement",
      documentKind: "SUPPLEMENT",
      requiresExpiry: false,
      parentTypeId: parentType.id,
      parentCode: parentType.code,
      parentName: parentType.name,
    });
    (useCertificateIngestionById as jest.Mock).mockReturnValue({
      ingestion: fakeCertificateIngestion({
        certificateTypeId: childType.id,
        certificateCode: childType.code,
        certificateName: childType.name,
        candidateExpiryDate: null,
      }),
      loading: false,
      error: null,
      refresh,
    });
    (useCertificateTypes as jest.Mock).mockReturnValue({
      certificateTypes: [parentType, childType],
      loading: false,
      error: null,
    });
    (useCertificatesByAsset as jest.Mock).mockReturnValue({
      certificates: [
        fakeCertificate({
          id: "expired-parent-certificate",
          certificateTypeId: parentType.id,
          certificateCode: parentType.code,
          certificateName: parentType.name,
          number: "EXPIRED-001",
          workflowStatus: "APPROVED",
          status: "EXPIRED",
        }),
      ],
      loading: false,
      error: null,
      refresh: jest.fn(),
    });

    render(<CertificateIngestionReviewScreen />);

    await waitFor(() => {
      expect(
        screen.getByText(
          "A matching principal certificate exists for IOPP Supplement, but it is not eligible yet.",
        ),
      ).toBeOnTheScreen();
    });

    expect(
      screen.getByText(/It must be submitted or approved/),
    ).toBeOnTheScreen();
    expect(screen.queryByText(/No matching parent certificate is loaded/)).toBeNull();
    expect(
      screen.getByRole("button", { name: "Create submitted record" }),
    ).toBeDisabled();
  });

  it("GIVEN a child document type without configured parent type WHEN review renders SHOULD block confirmation", async () => {
    const childType = fakeCertificateType({
      id: "type-supplement",
      code: "IOPP_SUPPLEMENT",
      name: "IOPP Supplement",
      documentKind: "SUPPLEMENT",
      requiresExpiry: false,
      parentTypeId: null,
      parentCode: null,
      parentName: null,
    });
    (useCertificateIngestionById as jest.Mock).mockReturnValue({
      ingestion: fakeCertificateIngestion({
        certificateTypeId: childType.id,
        certificateCode: childType.code,
        certificateName: childType.name,
        candidateExpiryDate: null,
      }),
      loading: false,
      error: null,
      refresh,
    });
    (useCertificateTypes as jest.Mock).mockReturnValue({
      certificateTypes: [childType],
      loading: false,
      error: null,
    });
    (useCertificatesByAsset as jest.Mock).mockReturnValue({
      certificates: [
        fakeCertificate({
          id: "parent-certificate",
          workflowStatus: "APPROVED",
          status: "VALID",
        }),
      ],
      loading: false,
      error: null,
      refresh: jest.fn(),
    });

    render(<CertificateIngestionReviewScreen />);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Parent document type is not configured for this document type.",
        ),
      ).toBeOnTheScreen();
    });

    expect(
      screen.getByRole("button", { name: "Create submitted record" }),
    ).toBeDisabled();
  });
});


