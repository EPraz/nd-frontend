import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { pickImageUpload } from "@/src/helpers/pickImageUpload";
import NewVesselScreen from "../NewVesselScreen";
import { uploadVesselImage } from "../../../api/vessel-profile.api";
import { useCreateVessel } from "../../../hooks/useCreateVessel";

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

const mockShow = jest.fn();

jest.mock("@/src/context/ToastProvider", () => ({
  useToast: () => ({ show: mockShow }),
}));

jest.mock("../../../api/vessel-profile.api", () => ({
  uploadVesselImage: jest.fn(),
}));

jest.mock("../../../hooks/useCreateVessel", () => ({
  useCreateVessel: jest.fn(),
}));

jest.mock("@/src/helpers/pickImageUpload", () => ({
  pickImageUpload: jest.fn(),
}));

const routerReplace = jest.fn();
const routerBack = jest.fn();
const routerCanGoBack = jest.fn();
const submit = jest.fn();

describe("NewVesselScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    routerCanGoBack.mockReturnValue(false);
    submit.mockResolvedValue({ id: "vessel-new" });
    (uploadVesselImage as jest.Mock).mockResolvedValue({});
    (pickImageUpload as jest.Mock).mockResolvedValue(null);
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
    });
    (useRouter as jest.Mock).mockReturnValue({
      replace: routerReplace,
      back: routerBack,
      canGoBack: routerCanGoBack,
    });
    (useCreateVessel as jest.Mock).mockReturnValue({
      submit,
      loading: false,
      error: null,
    });
  });

  it("GIVEN a valid new vessel WHEN saving SHOULD create the vessel and persist profile follow-up details", async () => {
    render(<NewVesselScreen />);

    expect(screen.getByText("Select build year")).toBeOnTheScreen();
    expect(screen.queryByPlaceholderText("e.g. 2018")).toBeNull();

    fireEvent.changeText(
      screen.getByPlaceholderText("e.g. MV Navigate One"),
      "MV Navigate One",
    );
    fireEvent.changeText(screen.getByPlaceholderText("e.g. 9876543"), "9876543");
    fireEvent.changeText(
      screen.getByPlaceholderText("e.g. master@vesselmail.com"),
      "master@navigate.test",
    );
    fireEvent.changeText(screen.getByPlaceholderText("e.g. Balboa"), "Balboa");
    fireEvent.changeText(screen.getByPlaceholderText("e.g. ABS"), "ABS");

    fireEvent.press(screen.getByText("Save vessel"));

    await waitFor(() => {
      expect(submit).toHaveBeenCalledWith({
        type: "VESSEL",
        name: "MV Navigate One",
        identifierType: "IMO",
        imo: "9876543",
        flag: "PA",
        email: "master@navigate.test",
        homePort: "Balboa",
        classSociety: "ABS",
      });
    });

    expect(routerReplace).toHaveBeenCalledWith(
      "/projects/project-atlantic/vessels/vessel-new",
    );
  });

  it("GIVEN an image upload failure after create WHEN saving SHOULD redirect to edit for retry", async () => {
    (uploadVesselImage as jest.Mock).mockRejectedValueOnce(new Error("upload failed"));
    (pickImageUpload as jest.Mock).mockResolvedValueOnce({
      uri: "file:///tmp/vessel.jpg",
      name: "vessel.jpg",
      mimeType: "image/jpeg",
    });

    render(<NewVesselScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText("e.g. MV Navigate One"),
      "MV Navigate One",
    );
    fireEvent.changeText(screen.getByPlaceholderText("e.g. 9876543"), "9876543");
    fireEvent.press(screen.getByText("Select image"));

    await waitFor(() => {
      expect(screen.getByText("Selected file: vessel.jpg")).toBeOnTheScreen();
    });

    fireEvent.press(screen.getByText("Save vessel"));

    await waitFor(() => {
      expect(routerReplace).toHaveBeenCalledWith(
        "/projects/project-atlantic/vessels/vessel-new/edit",
      );
    });
    expect(mockShow).toHaveBeenCalledWith(
      "Vessel created, but the image still needs another try from edit mode.",
      "error",
    );
  });

  it("GIVEN license identity WHEN saving SHOULD submit the license payload and normalized flag code", async () => {
    render(<NewVesselScreen />);

    fireEvent.changeText(
      screen.getByPlaceholderText("e.g. MV Navigate One"),
      "MV License Vessel",
    );
    fireEvent.press(screen.getByText("License"));
    fireEvent.changeText(
      screen.getByPlaceholderText("e.g. LIC-PA-001"),
      "LIC-CO-009",
    );
    fireEvent.press(screen.getByText("PA · Panama"));
    fireEvent.changeText(
      screen.getByPlaceholderText("Search by code or country..."),
      "col",
    );
    fireEvent.press(screen.getByText("CO · Colombia"));

    fireEvent.press(screen.getByText("Save vessel"));

    await waitFor(() => {
      expect(submit).toHaveBeenCalledWith({
        type: "VESSEL",
        name: "MV License Vessel",
        identifierType: "LICENSE",
        licenseNumber: "LIC-CO-009",
        flag: "CO",
      });
    });
  });

  it("GIVEN the create editor WHEN pressing back SHOULD return to the vessel registry route", () => {
    render(<NewVesselScreen />);

    fireEvent.press(screen.getByText("Back to vessels"));

    expect(routerReplace).toHaveBeenCalledWith(
      "/projects/project-atlantic/vessels",
    );
    expect(routerBack).not.toHaveBeenCalled();
  });
});
