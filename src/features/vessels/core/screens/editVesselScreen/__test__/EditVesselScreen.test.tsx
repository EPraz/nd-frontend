import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import EditVesselScreen from "../EditVesselScreen";
import {
  removeVesselImage,
  uploadVesselImage,
} from "../../../api/vessel-profile.api";
import { useUpdateVesselProfile } from "../../../hooks/useUpdateVesselProfile";
import { useVessel } from "../../../hooks/useVessel";
import { useVesselProfile } from "../../../hooks/useVesselProfile";

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

const mockShow = jest.fn();

jest.mock("@/src/context/ToastProvider", () => ({
  useToast: () => ({ show: mockShow }),
}));

jest.mock("../../../api/vessel-profile.api", () => ({
  removeVesselImage: jest.fn(),
  uploadVesselImage: jest.fn(),
}));

jest.mock("../../../hooks/useUpdateVesselProfile", () => ({
  useUpdateVesselProfile: jest.fn(),
}));

jest.mock("../../../hooks/useVessel", () => ({
  useVessel: jest.fn(),
}));

jest.mock("../../../hooks/useVesselProfile", () => ({
  useVesselProfile: jest.fn(),
}));

const routerReplace = jest.fn();
const routerBack = jest.fn();
const routerCanGoBack = jest.fn();
const refreshVessel = jest.fn();
const refreshProfile = jest.fn();
const submit = jest.fn();

describe("EditVesselScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    routerCanGoBack.mockReturnValue(false);
    submit.mockResolvedValue({});
    (removeVesselImage as jest.Mock).mockResolvedValue({});
    (uploadVesselImage as jest.Mock).mockResolvedValue({});
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
      assetId: "vessel-one",
    });
    (useRouter as jest.Mock).mockReturnValue({
      replace: routerReplace,
      back: routerBack,
      canGoBack: routerCanGoBack,
    });
    (useVessel as jest.Mock).mockReturnValue({
      vessel: {
        id: "vessel-one",
        name: "MV Navigate One",
        imageUrl: null,
        imageFileName: null,
      },
      loading: false,
      error: null,
      refresh: refreshVessel,
    });
    (useVesselProfile as jest.Mock).mockReturnValue({
      profile: {
        identifierType: "IMO",
        imo: "9876543",
        licenseNumber: null,
        flag: "PA",
        email: "master@navigate.test",
        callSign: "HP1234",
        mmsi: null,
        homePort: "Panama",
        vesselType: "Offshore Supply Vessel",
        classSociety: "ABS",
        builder: null,
        yearBuilt: 2018,
      },
      loading: false,
      error: null,
      refresh: refreshProfile,
    });
    (useUpdateVesselProfile as jest.Mock).mockReturnValue({
      submit,
      loading: false,
      error: null,
    });
  });

  it("GIVEN an edited vessel profile WHEN saving SHOULD submit the updated profile payload", async () => {
    render(<EditVesselScreen />);

    fireEvent.changeText(screen.getByPlaceholderText("e.g. Balboa"), "Cristobal");
    fireEvent.press(screen.getByText("Save changes"));

    await waitFor(() => {
      expect(submit).toHaveBeenCalledWith(
        expect.objectContaining({
          identifierType: "IMO",
          imo: "9876543",
          flag: "PA",
          email: "master@navigate.test",
          homePort: "Cristobal",
          vesselType: "Offshore Supply Vessel",
          yearBuilt: 2018,
        }),
      );
    });

    expect(mockShow).toHaveBeenCalledWith("Vessel profile updated", "success");
    expect(routerReplace).toHaveBeenCalledWith(
      "/projects/project-atlantic/vessels/vessel-one",
    );
  });

  it("GIVEN the edit editor WHEN pressing back SHOULD return to the vessel overview route", () => {
    render(<EditVesselScreen />);

    fireEvent.press(screen.getByText("Back to vessel"));

    expect(routerReplace).toHaveBeenCalledWith(
      "/projects/project-atlantic/vessels/vessel-one",
    );
    expect(routerBack).not.toHaveBeenCalled();
  });
});
