import { render, screen } from "@testing-library/react-native";
import VesselImagePanel from "../VesselImagePanel";

describe("VesselImagePanel", () => {
  it("GIVEN a selected image in compact mode WHEN rendering SHOULD keep the preview and file label visible", () => {
    render(
      <VesselImagePanel
        compact
        imagePreviewUrl="file://preview.jpg"
        pendingFileName="preview.jpg"
        onSelectImage={jest.fn()}
        onRemoveImage={jest.fn()}
      />,
    );

    expect(screen.getByTestId("vessel-image-preview-frame")).toBeOnTheScreen();
    expect(screen.getByTestId("vessel-image-preview")).toBeOnTheScreen();
    expect(screen.getByText("Change image")).toBeOnTheScreen();
    expect(screen.getByText("Selected file: preview.jpg")).toBeOnTheScreen();
  });
});
