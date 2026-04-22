import {
  fakeCrewCertificate,
  fakeCrewCertificateRequirement,
} from "@/src/test/fakes/crewCertificates";
import {
  isExpiringWithinDays,
  summarizeCrewCertificateRequirements,
  summarizeCrewCertificates,
} from "../crewCertificateStats";

describe("crewCertificateStats", () => {
  const referenceDate = new Date("2026-04-12T12:00:00.000Z");

  it("GIVEN a mixed certificate list WHEN summarized SHOULD count active and expiring soon certificates", () => {
    const stats = summarizeCrewCertificates(
      [
        fakeCrewCertificate({
          id: "valid",
          status: "VALID",
          expiryDate: "2027-01-10T00:00:00.000Z",
        }),
        fakeCrewCertificate({
          id: "soon",
          status: "EXPIRING_SOON",
          expiryDate: "2026-04-25T00:00:00.000Z",
        }),
        fakeCrewCertificate({
          id: "expired",
          status: "EXPIRED",
          expiryDate: "2026-03-01T00:00:00.000Z",
        }),
        fakeCrewCertificate({
          id: "pending",
          status: "PENDING",
          expiryDate: "2026-05-01T00:00:00.000Z",
        }),
      ],
      referenceDate,
    );

    expect(stats.activeCertificates).toBe(2);
    expect(stats.expiringSoonCertificates).toBe(1);
  });

  it("GIVEN mixed requirements WHEN summarized SHOULD count workflow states and uploaded rows", () => {
    const stats = summarizeCrewCertificateRequirements([
      fakeCrewCertificateRequirement({
        status: "MISSING",
        hasStructuredCertificate: false,
      }),
      fakeCrewCertificateRequirement({
        id: "under-review",
        status: "UNDER_REVIEW",
        hasStructuredCertificate: false,
      }),
      fakeCrewCertificateRequirement({
        id: "provided",
        status: "PROVIDED",
        hasStructuredCertificate: true,
      }),
      fakeCrewCertificateRequirement({
        id: "expired",
        status: "EXPIRED",
        hasStructuredCertificate: true,
      }),
      fakeCrewCertificateRequirement({
        id: "exempt",
        status: "EXEMPT",
        hasStructuredCertificate: false,
      }),
    ]);

    expect(stats.totalRequirements).toBe(5);
    expect(stats.missingRequirements).toBe(1);
    expect(stats.underReviewRequirements).toBe(1);
    expect(stats.providedRequirements).toBe(1);
    expect(stats.expiredRequirements).toBe(1);
    expect(stats.exemptRequirements).toBe(1);
    expect(stats.uploadedRequirements).toBe(2);
  });

  it("GIVEN expiry dates across the 30 day window WHEN checked SHOULD only flag the valid boundary", () => {
    expect(
      isExpiringWithinDays("2026-04-30T00:00:00.000Z", 30, referenceDate),
    ).toBe(true);
    expect(
      isExpiringWithinDays("2026-05-20T00:00:00.000Z", 30, referenceDate),
    ).toBe(false);
    expect(isExpiringWithinDays(null, 30, referenceDate)).toBe(false);
  });
});
