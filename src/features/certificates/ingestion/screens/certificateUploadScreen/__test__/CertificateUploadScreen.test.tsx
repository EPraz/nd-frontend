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

    fireEvent.press(screen.getByText("Pick PDF or image"));

    await waitFor(() => {
      expect(screen.getAllByText("iopp-certificate.pdf").length).toBeGreaterThan(
        0,
      );
    });

    fireEvent.changeText(
      screen.getByPlaceholderText("Context before we create the candidate"),
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
});


