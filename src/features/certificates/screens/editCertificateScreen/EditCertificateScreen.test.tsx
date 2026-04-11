import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useToast } from "@/src/context";
import { useCertificateTypes } from "@/src/features/certificates";
import { useVessels } from "@/src/features/vessels";
import {
  fakeCertificate,
  fakeCertificateType,
  fakeVesselAsset,
} from "@/src/test/fakes/certificates";
import { useCertificatesById, useUpdateCertificate } from "../../hooks";
import EditCertificateScreen from "./EditCertificateScreen";

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("@/src/context", () => ({
  useToast: jest.fn(),
}));

jest.mock("@/src/features/certificates", () => ({
  useCertificateTypes: jest.fn(),
}));

jest.mock("@/src/features/vessels", () => ({
  useVessels: jest.fn(),
}));

jest.mock("../../hooks", () => ({
  useCertificatesById: jest.fn(),
  useUpdateCertificate: jest.fn(),
}));

const routerReplace = jest.fn();
const routerBack = jest.fn();
const showToast = jest.fn();
const refresh = jest.fn();
const submit = jest.fn();
const vessel = fakeVesselAsset();
const certificateType = fakeCertificateType();
const certificate = fakeCertificate();

describe("EditCertificateScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    submit.mockResolvedValue(
      fakeCertificate({ number: "IOPP-2026-901" }),
    );
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
      assetId: "vessel-one",
      certificateId: "certificate-1",
    });
    (useRouter as jest.Mock).mockReturnValue({
      replace: routerReplace,
      back: routerBack,
    });
    (useToast as jest.Mock).mockReturnValue({ show: showToast });
    (useCertificatesById as jest.Mock).mockReturnValue({
      certificate,
      loading: false,
      error: null,
      refresh,
    });
    (useUpdateCertificate as jest.Mock).mockReturnValue({
      submit,
      loading: false,
      error: null,
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

  it("GIVEN a hydrated manual certificate form WHEN saving changes SHOULD submit the update payload and return to detail", async () => {
    render(<EditCertificateScreen />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("IOPP-2026-001")).toBeOnTheScreen();
    });

    fireEvent.changeText(
      screen.getByPlaceholderText("e.g. CERT-12345"),
      "IOPP-2026-901",
    );
    fireEvent.press(screen.getByText("Save changes"));

    await waitFor(() => {
      expect(submit).toHaveBeenCalledWith({
        certificateTypeId: "type-iopp",
        number: "IOPP-2026-901",
        issuer: "Flag State",
        issueDate: "2026-01-10T00:00:00.000Z",
        expiryDate: "2031-01-10T00:00:00.000Z",
        notes: "Manual fallback record",
      });
    });
    expect(showToast).toHaveBeenCalledWith(
      "Certificate updated successfully",
      "success",
    );
    expect(routerReplace).toHaveBeenCalledWith(
      "/projects/project-atlantic/vessels/vessel-one/certificates/certificate-1",
    );
  });
});
