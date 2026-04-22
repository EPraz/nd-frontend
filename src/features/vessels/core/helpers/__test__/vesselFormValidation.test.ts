import {
  getVesselEmailError,
  normalizeVesselApiErrorMessage,
  normalizeVesselValue,
  VESSEL_EMAIL_ERROR_MESSAGE,
} from "../vesselFormValidation";

describe("vesselFormValidation", () => {
  it("GIVEN a blank or valid vessel email WHEN validating SHOULD return no error", () => {
    expect(getVesselEmailError("")).toBeNull();
    expect(getVesselEmailError(" master@vesselmail.com ")).toBeNull();
  });

  it("GIVEN an invalid vessel email WHEN validating SHOULD return the friendly email message", () => {
    expect(getVesselEmailError("not-an-email")).toBe(
      VESSEL_EMAIL_ERROR_MESSAGE,
    );
  });

  it("GIVEN the backend default email validator message WHEN normalizing SHOULD return the professional wording", () => {
    expect(normalizeVesselApiErrorMessage("email must be an email")).toBe(
      VESSEL_EMAIL_ERROR_MESSAGE,
    );
  });

  it("GIVEN a vessel form value WHEN normalizing SHOULD trim whitespace", () => {
    expect(normalizeVesselValue("  MV Navigate One  ")).toBe("MV Navigate One");
  });
});
