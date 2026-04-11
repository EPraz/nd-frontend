import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCertificateTypes } from "@/src/features/certificates";
import { useVessels } from "@/src/features/vessels/hooks/useVessels";
import { useCreateCertificate } from "@/src/hooks";
import {
  fakeCertificate,
  fakeCertificateType,
  fakeVesselAsset,
} from "@/src/test/fakes/certificates";
import CreateCertificateScreen from "./CreateCertificateScreen";

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("@/src/features/certificates", () => ({
  useCertificateTypes: jest.fn(),
}));

jest.mock("@/src/features/vessels/hooks/useVessels", () => ({
  useVessels: jest.fn(),
}));

jest.mock("@/src/hooks", () => ({
  useCreateCertificate: jest.fn(),
}));

const routerReplace = jest.fn();
const routerPush = jest.fn();
const routerBack = jest.fn();
const routerCanGoBack = jest.fn();
const submit = jest.fn();
const vessel = fakeVesselAsset();
const certificateType = fakeCertificateType();

describe("CreateCertificateScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    routerCanGoBack.mockReturnValue(false);
    submit.mockResolvedValue(fakeCertificate());
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
      assetId: "vessel-one",
    });
    (useRouter as jest.Mock).mockReturnValue({
      replace: routerReplace,
      push: routerPush,
      back: routerBack,
      canGoBack: routerCanGoBack,
    });
    (useCreateCertificate as jest.Mock).mockReturnValue({
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

  it("GIVEN a valid manual certificate form WHEN saving SHOULD submit the create payload and return to vessel certificates", async () => {
    render(<CreateCertificateScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText("Search by name, code, or alias"),
      "IOPP",
    );
    fireEvent.press(
      screen.getAllByText(
        "International Oil Pollution Prevention Certificate",
      )[0],
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("e.g. CERT-12345"),
      "IOPP-2026-900",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("e.g. Class Society / Flag"),
      "Class Society",
    );
    fireEvent.changeText(
      screen.getByPlaceholderText("Optional operational notes"),
      "Manual fallback record",
    );
    fireEvent.press(screen.getByText("Save"));

    await waitFor(() => {
      expect(submit).toHaveBeenCalledWith({
        assetId: "vessel-one",
        certificateTypeId: "type-iopp",
        number: "IOPP-2026-900",
        issuer: "Class Society",
        issueDate: undefined,
        expiryDate: undefined,
        notes: "Manual fallback record",
        status: "PENDING",
        workflowStatus: "DRAFT",
      });
    });
    expect(routerReplace).toHaveBeenCalledWith(
      "/projects/project-atlantic/vessels/vessel-one/certificates",
    );
  });
});
