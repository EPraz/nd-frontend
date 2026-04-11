import { fireEvent, render, screen } from "@testing-library/react-native";
import { fakeCrewComplianceSummary } from "@/src/test/fakes/crewCertificates";
import { CrewMsmcComplianceSummary } from "./CrewMsmcComplianceSummary";

describe("CrewMsmcComplianceSummary", () => {
  it("GIVEN an MSMC summary with gaps WHEN rendered SHOULD show the risk, vessel, and missing roles", () => {
    render(
      <CrewMsmcComplianceSummary
        title="MSMC fleet crew compliance"
        summaries={[fakeCrewComplianceSummary()]}
      />,
    );

    expect(screen.getByText("MSMC fleet crew compliance")).toBeOnTheScreen();
    expect(screen.getAllByText("HIGH")).toHaveLength(2);
    expect(screen.getByText("MV Navigate One")).toBeOnTheScreen();
    expect(
      screen.getByText("Missing roles: Officer of the Watch"),
    ).toBeOnTheScreen();
  });

  it("GIVEN a vessel without MSMC WHEN rendered SHOULD expose the v1 fallback state", () => {
    render(
      <CrewMsmcComplianceSummary
        summaries={[
          fakeCrewComplianceSummary({
            msmcConfigured: false,
            fallbackMode: "V1_RULES",
            flagState: null,
            totalMinimumCrew: null,
            crewComplianceScore: null,
            riskLevel: "UNKNOWN",
            roleGaps: [],
            issues: [
              {
                code: "MSMC_NOT_CONFIGURED",
                severity: "INFO",
                message:
                  "MSMC is not configured for this vessel. Using v1 rank-based requirements.",
                role: null,
                crewMemberId: null,
                crewMemberName: null,
                certificateTypeId: null,
                certificateName: null,
              },
            ],
          }),
        ]}
      />,
    );

    expect(screen.getAllByText("UNKNOWN")).toHaveLength(2);
    expect(
      screen.getByText(
        "MSMC is not configured for this vessel. Using v1 rank-based requirements.",
      ),
    ).toBeOnTheScreen();
    expect(
      screen.getByText("Flag: PA | Source: V1_RULES"),
    ).toBeOnTheScreen();
  });

  it("GIVEN an API error WHEN retry is available SHOULD allow retrying the summary load", () => {
    const onRetry = jest.fn();

    render(
      <CrewMsmcComplianceSummary
        summaries={[]}
        error="Unable to load MSMC summary"
        onRetry={onRetry}
      />,
    );

    fireEvent.press(screen.getByText("Retry MSMC summary"));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
