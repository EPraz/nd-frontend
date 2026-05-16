import { certificateActionErrorMessage } from "../certificateActionErrorMessage";

describe("certificateActionErrorMessage", () => {
  it("GIVEN an Error with a message WHEN resolved SHOULD return the backend reason", () => {
    expect(
      certificateActionErrorMessage(
        new Error("A document is already pending review."),
        "Fallback message",
      ),
    ).toBe("A document is already pending review.");
  });

  it("GIVEN a blank or unknown error WHEN resolved SHOULD return fallback", () => {
    expect(certificateActionErrorMessage(new Error("  "), "Fallback message")).toBe(
      "Fallback message",
    );
    expect(certificateActionErrorMessage(null, "Fallback message")).toBe(
      "Fallback message",
    );
  });
});
