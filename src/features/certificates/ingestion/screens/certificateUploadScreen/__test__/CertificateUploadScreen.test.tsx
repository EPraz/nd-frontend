import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useVessels } from "@/src/features/vessels/core";
import {
  fakeCertificateIngestion,
  fakeCertificateRequirement,
  fakeVesselAsset,
} from "@/src/test/fakes/certificates";
import { useToast } from "@/src/context/ToastProvider";
import { useCertificateRequirementsByAsset } from "@/src/features/certificates/requirements/hooks/useCertificateRequirementsByAsset";
import { useCreateExtraCertificateIngestion } from "../../../hooks/useCreateExtraCertificateIngestion";
import { useCreateRequirementIngestion } from "../../../hooks/useCreateRequirementIngestion";
import CertificateUploadScreen from "../CertificateUploadScreen";

jest.mock("expo-document-picker", () => ({
  getDocumentAsync: jest.fn(),
}));

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

jest.mock(
  "@/src/features/certificates/requirements/hooks/useCertificateRequirementsByAsset",
  () => ({
    useCertificateRequirementsByAsset: jest.fn(),
  }),
);

jest.mock("../../../hooks/useCreateExtraCertificateIngestion", () => ({
  useCreateExtraCertificateIngestion: jest.fn(),
}));

jest.mock("../../../hooks/useCreateRequirementIngestion", () => ({
  useCreateRequirementIngestion: jest.fn(),
}));

const routerReplace = jest.fn();
const routerPush = jest.fn();
const showToast = jest.fn();
const requirementSubmit = jest.fn();
const extraSubmit = jest.fn();
const vessel = fakeVesselAsset();
const pickedFile = {
  uri: "file:///tmp/iopp-certificate.pdf",
  name: "iopp-certificate.pdf",
  mimeType: "application/pdf",
};

describe("CertificateUploadScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    requirementSubmit.mockResolvedValue(fakeCertificateIngestion());
    extraSubmit.mockResolvedValue(fakeCertificateIngestion());
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [pickedFile],
    });
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
      assetId: "vessel-one",
      requirementId: "requirement-1",
    });
    (useRouter as jest.Mock).mockReturnValue({
      replace: routerReplace,
      push: routerPush,
    });
    (useToast as jest.Mock).mockReturnValue({ show: showToast });
    (useVessels as jest.Mock).mockReturnValue({
      vessels: [vessel],
      loading: false,
      error: null,
    });
    (useCertificateRequirementsByAsset as jest.Mock).mockReturnValue({
      requirements: [fakeCertificateRequirement()],
      loading: false,
      error: null,
      refresh: jest.fn(),
    });
    (useCreateRequirementIngestion as jest.Mock).mockReturnValue({
      submit: requirementSubmit,
      loading: false,
      error: null,
    });
    (useCreateExtraCertificateIngestion as jest.Mock).mockReturnValue({
      submit: extraSubmit,
      loading: false,
      error: null,
    });
  });

  it("GIVEN a requirement upload WHEN choosing a file and submitting SHOULD upload evidence and route to review", async () => {
    render(<CertificateUploadScreen />);

    fireEvent.press(screen.getByText("Select document"));

    await waitFor(() => {
      expect(screen.getAllByText("iopp-certificate.pdf").length).toBeGreaterThan(
        0,
      );
    });

    fireEvent.changeText(
      screen.getByPlaceholderText(
        "Capture context before the candidate is reviewed",
      ),
      "PSC evidence package",
    );
    fireEvent.press(screen.getByText("Upload and extract candidate"));

    await waitFor(() => {
      expect(requirementSubmit).toHaveBeenCalledWith({
        file: expect.objectContaining(pickedFile),
        notes: "PSC evidence package",
      });
    });
    expect(extraSubmit).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith(
      "Document uploaded. Review the extracted candidate next.",
      "success",
    );
    expect(routerReplace).toHaveBeenCalledWith({
      pathname: "/projects/[projectId]/certificates/review",
      params: {
        projectId: "project-atlantic",
        assetId: "vessel-one",
        ingestionId: "ingestion-1",
      },
    });
  });

  it("GIVEN backend rejects upload WHEN submitting SHOULD show backend reason", async () => {
    requirementSubmit.mockRejectedValueOnce(
      new Error("A document is already pending review for this requirement."),
    );

    render(<CertificateUploadScreen />);

    fireEvent.press(screen.getByText("Select document"));

    await waitFor(() => {
      expect(screen.getAllByText("iopp-certificate.pdf").length).toBeGreaterThan(
        0,
      );
    });

    fireEvent.press(screen.getByText("Upload and extract candidate"));

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith(
        "A document is already pending review for this requirement.",
        "error",
      );
    });
  });

  it("GIVEN upload starts from vessel certificates WHEN routing to review SHOULD preserve the return context", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
      assetId: "vessel-one",
      requirementId: "requirement-1",
      returnTo: "vessel-certificates",
    });

    render(<CertificateUploadScreen />);

    fireEvent.press(screen.getByText("Select document"));

    await waitFor(() => {
      expect(screen.getAllByText("iopp-certificate.pdf").length).toBeGreaterThan(
        0,
      );
    });

    fireEvent.press(screen.getByText("Upload and extract candidate"));

    await waitFor(() => {
      expect(routerReplace).toHaveBeenCalledWith({
        pathname: "/projects/[projectId]/certificates/review",
        params: {
          projectId: "project-atlantic",
          assetId: "vessel-one",
          ingestionId: "ingestion-1",
          returnTo: "vessel-certificates",
        },
      });
    });
  });

  it("GIVEN upload replaces rejected evidence WHEN routing to review SHOULD preserve correction context", async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
      assetId: "vessel-one",
      returnTo: "vessel-certificates",
      replacementCertificateId: "certificate-1",
      correctionMode: "replace-evidence",
    });

    render(<CertificateUploadScreen />);

    fireEvent.press(screen.getByText("Select document"));

    await waitFor(() => {
      expect(screen.getAllByText("iopp-certificate.pdf").length).toBeGreaterThan(
        0,
      );
    });

    fireEvent.press(screen.getByText("Upload and extract candidate"));

    await waitFor(() => {
      expect(extraSubmit).toHaveBeenCalledWith({
        file: expect.objectContaining(pickedFile),
        notes: undefined,
        replacementCertificateId: "certificate-1",
      });
    });
    expect(routerReplace).toHaveBeenCalledWith({
      pathname: "/projects/[projectId]/certificates/review",
      params: {
        projectId: "project-atlantic",
        assetId: "vessel-one",
        ingestionId: "ingestion-1",
        returnTo: "vessel-certificates",
        replacementCertificateId: "certificate-1",
        correctionMode: "replace-evidence",
      },
    });
  });

  it("GIVEN a no-expiry plan requirement WHEN rendered SHOULD show document kind and expiry guidance", () => {
    (useCertificateRequirementsByAsset as jest.Mock).mockReturnValue({
      requirements: [
        fakeCertificateRequirement({
          certificateName: "Shipboard Oil Pollution Emergency Plan",
          certificateCode: "SOPEP_PLAN",
          certificateDocumentKind: "PLAN",
          certificateRequiresExpiry: false,
          certificateConvention: "MARPOL Annex I",
          certificateSourceReference: "Reg. 37",
        }),
      ],
      loading: false,
      error: null,
      refresh: jest.fn(),
    });

    render(<CertificateUploadScreen />);

    expect(screen.getAllByText("Plan").length).toBeGreaterThan(0);
    expect(screen.getByText("No expiry required")).toBeOnTheScreen();
    expect(screen.getAllByText(/MARPOL Annex I/).length).toBeGreaterThan(0);
  });

  it("GIVEN a requirement deep link that no longer resolves WHEN rendered SHOULD block the upload task", () => {
    (useCertificateRequirementsByAsset as jest.Mock).mockReturnValue({
      requirements: [],
      loading: false,
      error: null,
      refresh: jest.fn(),
    });

    render(<CertificateUploadScreen />);

    expect(screen.getByText("Requirement not found")).toBeOnTheScreen();
    expect(screen.queryByText("Select document")).toBeNull();
    expect(screen.queryByText("Upload and extract candidate")).toBeNull();
  });
});


