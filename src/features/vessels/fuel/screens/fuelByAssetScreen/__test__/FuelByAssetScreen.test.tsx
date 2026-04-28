import { render, screen } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFuelByAsset } from "@/src/features/fuel/core/hooks/useFuelByAsset";
import FuelByAssetScreen from "../FuelByAssetScreen";

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("@/src/features/fuel/core/hooks/useFuelByAsset", () => ({
  useFuelByAsset: jest.fn(),
}));

jest.mock("../FuelByAssetWorkspaceSection", () => ({
  FuelByAssetWorkspaceSection: () => null,
}));

describe("FuelByAssetScreen", () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push });
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
      assetId: "vessel-one",
    });
    (useFuelByAsset as jest.Mock).mockReturnValue({
      fuelLogs: [
        {
          id: "fuel-1",
          eventType: "BUNKERED",
          quantity: "120",
          unit: "MT",
          fuelType: "MGO",
          location: "Panama",
          price: "900",
        },
        {
          id: "fuel-2",
          eventType: "CONSUMED",
          quantity: "40",
          unit: "MT",
          fuelType: "MGO",
          location: null,
          price: null,
        },
      ],
      loading: false,
      error: null,
      refresh: jest.fn(),
    });
  });

  it("GIVEN a vessel fuel lane WHEN rendered SHOULD expose the vessel-scoped fuel registry", () => {
    render(<FuelByAssetScreen />);

    expect(screen.getByText("Fuel")).toBeOnTheScreen();
    expect(screen.getByText("Vessel fuel registry")).toBeOnTheScreen();
    expect(screen.getByText("Overview")).toBeOnTheScreen();
    expect(screen.getByText("Events in scope")).toBeOnTheScreen();
    expect(screen.getByText("Critical gaps")).toBeOnTheScreen();
  });

  it("GIVEN a vessel fuel lane WHEN bootstrapping SHOULD request the first backend page", () => {
    render(<FuelByAssetScreen />);

    expect(useFuelByAsset).toHaveBeenCalledWith(
      "project-atlantic",
      "vessel-one",
      {
        page: 1,
        pageSize: 10,
        sort: "DATE_DESC",
        search: "",
        eventType: undefined,
        fuelType: undefined,
        dateWindow: undefined,
        dateFrom: "",
        dateTo: "",
        hasCriticalGap: undefined,
      },
    );
  });

  it("GIVEN fuel create is dormant WHEN rendered SHOULD not expose the create action", () => {
    render(<FuelByAssetScreen />);

    expect(screen.queryByText("Add Fuel Log")).toBeNull();
    expect(push).not.toHaveBeenCalled();
  });
});
