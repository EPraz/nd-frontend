import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useToast } from "@/src/context/ToastProvider";
import { useCertificateTypes } from "@/src/features/certificates/core/hooks/useCertificateTypes";
import { useCrewById } from "../../../../core/hooks/useCrewById";
import {
  fakeConfirmCrewCertificateIngestionResult,
  fakeCrewCertificateIngestion,
  fakeCrewCertificateType,
  fakeCrewMember,
} from "@/src/test/fakes/crewCertificates";
import { useConfirmCrewCertificateIngestion } from "../../../hooks/useConfirmCrewCertificateIngestion";
import { useCrewCertificateIngestionById } from "../../../hooks/useCrewCertificateIngestionById";
import { useCrewCertificateWorkflowActions } from "../../../hooks/useCrewCertificateWorkflowActions";
import CrewCertificateIngestionReviewScreen from "../CrewCertificateIngestionReviewScreen";

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

jest.mock("../../../../core/hooks/useCrewById", () => ({
  useCrewById: jest.fn(),
}));

jest.mock("../../../hooks/useConfirmCrewCertificateIngestion", () => ({
  useConfirmCrewCertificateIngestion: jest.fn(),
}));

jest.mock("../../../hooks/useCrewCertificateIngestionById", () => ({
  useCrewCertificateIngestionById: jest.fn(),
}));

jest.mock("../../../hooks/useCrewCertificateWorkflowActions", () => ({
  useCrewCertificateWorkflowActions: jest.fn(),
}));

const routerReplace = jest.fn();
const showToast = jest.fn();
const refresh = jest.fn();
const refreshCrew = jest.fn();
const submit = jest.fn();
const cancelIngestion = jest.fn();
const certificateType = fakeCrewCertificateType();

describe("CrewCertificateIngestionReviewScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    submit.mockResolvedValue(fakeConfirmCrewCertificateIngestionResult());
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
      assetId: "vessel-one",
      crewId: "crew-master",
      ingestionId: "crew-ingestion-1",
    });
    (useRouter as jest.Mock).mockReturnValue({
      replace: routerReplace,
    });
    (useToast as jest.Mock).mockReturnValue({ show: showToast });
    (useCrewById as jest.Mock).mockReturnValue({
      crew: fakeCrewMember(),
      loading: false,
      error: null,
      refresh: refreshCrew,
    });
    (useCrewCertificateIngestionById as jest.Mock).mockReturnValue({
      ingestion: fakeCrewCertificateIngestion(),
      loading: false,
      error: null,
      refresh,
    });
    (useConfirmCrewCertificateIngestion as jest.Mock).mockReturnValue({
      submit,
      loading: false,
      error: null,
    });
    (useCrewCertificateWorkflowActions as jest.Mock).mockReturnValue({
      cancelIngestion,
      loading: false,
    });
    (useCertificateTypes as jest.Mock).mockReturnValue({
      certificateTypes: [certificateType],
      loading: false,
      error: null,
    });
  });

  it("GIVEN an extracted crew certificate candidate WHEN confirming SHOULD submit metadata and route to the created crew certificate", async () => {
    render(<CrewCertificateIngestionReviewScreen />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("COC-2026-001")).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByText("Create submitted record"));

    await waitFor(() => {
      expect(submit).toHaveBeenCalledWith({
        certificateTypeId: "type-master-coc",
        number: "COC-2026-001",
        issuer: "Flag State",
        issueDate: "2026-01-10T00:00:00.000Z",
        expiryDate: "2031-01-10T00:00:00.000Z",
        notes: "Candidate notes",
      });
    });
    expect(showToast).toHaveBeenCalledWith(
      "Crew certificate created in submitted state. Approve it when the metadata is ready.",
      "success",
    );
    expect(routerReplace).toHaveBeenCalledWith(
      "/projects/project-atlantic/vessels/vessel-one/crew/crew-master/certificates/crew-certificate-created",
    );
  });
});
