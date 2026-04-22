import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useToast } from "@/src/context/ToastProvider";
import { useCrewById } from "../../../../core/hooks/useCrewById";
import {
  fakeCrewCertificateIngestion,
  fakeCrewCertificateRequirement,
  fakeCrewMember,
} from "@/src/test/fakes/crewCertificates";
import {
  useCreateCrewRequirementIngestion,
  useCreateExtraCrewCertificateIngestion,
  useCrewCertificateRequirementsByCrew,
} from "../../../hooks";
import CrewCertificateUploadScreen from "../CrewCertificateUploadScreen";

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

jest.mock("../../../../core/hooks/useCrewById", () => ({
  useCrewById: jest.fn(),
}));

jest.mock("../../../hooks", () => ({
  useCreateCrewRequirementIngestion: jest.fn(),
  useCreateExtraCrewCertificateIngestion: jest.fn(),
  useCrewCertificateRequirementsByCrew: jest.fn(),
}));

const routerReplace = jest.fn();
const showToast = jest.fn();
const requirementSubmit = jest.fn();
const extraSubmit = jest.fn();
const pickedFile = {
  uri: "file:///tmp/master-coc.pdf",
  name: "master-coc.pdf",
  mimeType: "application/pdf",
};

describe("CrewCertificateUploadScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    requirementSubmit.mockResolvedValue(fakeCrewCertificateIngestion());
    extraSubmit.mockResolvedValue(fakeCrewCertificateIngestion());
    (DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [pickedFile],
    });
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
      assetId: "vessel-one",
      crewId: "crew-master",
      requirementId: "crew-requirement-master-coc",
    });
    (useRouter as jest.Mock).mockReturnValue({
      replace: routerReplace,
    });
    (useToast as jest.Mock).mockReturnValue({ show: showToast });
    (useCrewById as jest.Mock).mockReturnValue({
      crew: fakeCrewMember(),
      loading: false,
      error: null,
    });
    (useCrewCertificateRequirementsByCrew as jest.Mock).mockReturnValue({
      requirements: [fakeCrewCertificateRequirement()],
      loading: false,
      error: null,
      refresh: jest.fn(),
    });
    (useCreateCrewRequirementIngestion as jest.Mock).mockReturnValue({
      submit: requirementSubmit,
      loading: false,
      error: null,
    });
    (useCreateExtraCrewCertificateIngestion as jest.Mock).mockReturnValue({
      submit: extraSubmit,
      loading: false,
      error: null,
    });
  });

  it("GIVEN a crew requirement upload WHEN choosing a file and submitting SHOULD upload evidence and route to review", async () => {
    render(<CrewCertificateUploadScreen />);

    fireEvent.press(screen.getByText("Pick PDF or image"));

    await waitFor(() => {
      expect(screen.getByText("master-coc.pdf")).toBeOnTheScreen();
    });

    fireEvent.changeText(
      screen.getByPlaceholderText("Context before we create the candidate"),
      "MSMC evidence package",
    );
    fireEvent.press(screen.getByText("Upload and extract candidate"));

    await waitFor(() => {
      expect(requirementSubmit).toHaveBeenCalledWith({
        file: expect.objectContaining(pickedFile),
        notes: "MSMC evidence package",
      });
    });
    expect(extraSubmit).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith(
      "Document uploaded. Review the extracted candidate next.",
      "success",
    );
    expect(routerReplace).toHaveBeenCalledWith({
      pathname: "/projects/[projectId]/crew/certificates/review",
      params: {
        projectId: "project-atlantic",
        assetId: "vessel-one",
        crewId: "crew-master",
        ingestionId: "crew-ingestion-1",
      },
    });
  });
});
