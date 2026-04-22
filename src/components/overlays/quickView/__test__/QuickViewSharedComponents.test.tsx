import { render, screen, fireEvent } from "@testing-library/react-native";
import React from "react";
import { Text } from "@/src/components/ui/text/Text";
import { QuickViewFooterActions } from "../QuickViewFooterActions";
import { QuickViewHeaderActions } from "../QuickViewHeaderActions";
import { QuickViewLeadSection } from "../QuickViewLeadSection";
import { QuickViewSummaryBadge } from "../QuickViewSummaryBadge";

describe("quick view shared components", () => {
  it("renders header actions and close action", () => {
    const onEdit = jest.fn();
    const onClose = jest.fn();

    render(
      <QuickViewHeaderActions
        onClose={onClose}
        actions={[
          {
            label: "Edit",
            onPress: onEdit,
          },
        ]}
      />,
    );

    fireEvent.press(screen.getByText("Edit"));
    fireEvent.press(screen.getByLabelText("Close modal"));

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders footer actions with built-in close button", () => {
    const onClose = jest.fn();
    const onOpen = jest.fn();

    render(
      <QuickViewFooterActions
        onClose={onClose}
        actions={[
          {
            label: "Open Full Page",
            onPress: onOpen,
          },
        ]}
      />,
    );

    fireEvent.press(screen.getByText("Close"));
    fireEvent.press(screen.getByText("Open Full Page"));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("renders lead section main and aside content", () => {
    render(
      <QuickViewLeadSection
        main={<Text>Main content</Text>}
        aside={<Text>Aside content</Text>}
      />,
    );

    expect(screen.getByText("Main content")).toBeTruthy();
    expect(screen.getByText("Aside content")).toBeTruthy();
  });

  it("renders a summary badge label", () => {
    render(<QuickViewSummaryBadge label="Status: Active" tone="ok" />);

    expect(screen.getByText("Status: Active")).toBeTruthy();
  });
});
