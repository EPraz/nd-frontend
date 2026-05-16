import { fireEvent, render, screen } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fakeCertificateRequirement } from "@/src/test/fakes/certificates";
import { CertificateRequirementsTable } from "../CertificateRequirementsTable";

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

const routerPush = jest.fn();

describe("CertificateRequirementsTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
    });
    (useRouter as jest.Mock).mockReturnValue({
      push: routerPush,
    });
  });

  it("GIVEN a requirement with a pending candidate WHEN rendered SHOULD show review without normal upload", () => {
    const onUpload = jest.fn();

    render(
      <CertificateRequirementsTable
        title="Requirements"
        data={[
          fakeCertificateRequirement({
            status: "UNDER_REVIEW",
            pendingIngestionId: "ingestion-pending",
            pendingIngestionStatus: "READY_FOR_REVIEW",
          }),
        ]}
        isLoading={false}
        error={null}
        onRetry={jest.fn()}
        onUpload={onUpload}
        canUpload
        returnTo="vessel-certificates"
      />,
    );

    fireEvent.press(screen.getByLabelText("Review uploaded document"));

    expect(screen.queryByLabelText("Upload document evidence")).toBeNull();
    expect(onUpload).not.toHaveBeenCalled();
    expect(routerPush).toHaveBeenCalledWith({
      pathname: "/projects/[projectId]/certificates/review",
      params: {
        projectId: "project-atlantic",
        assetId: "vessel-one",
        ingestionId: "ingestion-pending",
        returnTo: "vessel-certificates",
      },
    });
  });

  it("GIVEN a missing requirement with non-satisfying records WHEN rendered SHOULD keep document state missing", () => {
    const onUpload = jest.fn();

    render(
      <CertificateRequirementsTable
        title="Requirements"
        data={[
          fakeCertificateRequirement({
            hasStructuredCertificate: true,
            structuredCertificateId: null,
            structuredCertificateWorkflowStatus: null,
          }),
        ]}
        isLoading={false}
        error={null}
        onRetry={jest.fn()}
        onUpload={onUpload}
        canUpload
      />,
    );

    expect(screen.queryByText("Approved")).toBeNull();
    expect(screen.getAllByText("Missing").length).toBeGreaterThan(1);
    expect(screen.queryByLabelText("Open document record")).toBeNull();
    expect(screen.getByLabelText("Upload document evidence")).toBeOnTheScreen();
  });

  it("GIVEN a missing requirement with a rejected record WHEN rendered SHOULD expose correction access", () => {
    const onUpload = jest.fn();

    render(
      <CertificateRequirementsTable
        title="Requirements"
        data={[
          fakeCertificateRequirement({
            status: "MISSING",
            hasStructuredCertificate: true,
            structuredCertificateId: "certificate-rejected",
            structuredCertificateWorkflowStatus: "REJECTED",
            structuredCertificateRejectionReason: "Correct the expiry date",
          }),
        ]}
        isLoading={false}
        error={null}
        onRetry={jest.fn()}
        onUpload={onUpload}
        canUpload
      />,
    );

    expect(screen.getByText("Rejected")).toBeOnTheScreen();
    expect(screen.getByText("Correction: Correct the expiry date")).toBeOnTheScreen();
    expect(screen.getByLabelText("Open document record")).toBeOnTheScreen();
    expect(screen.getByLabelText("Upload document evidence")).toBeOnTheScreen();
  });

  it("GIVEN an expired requirement with a rejected renewal WHEN rendered SHOULD expose correction access", () => {
    const onUpload = jest.fn();

    render(
      <CertificateRequirementsTable
        title="Requirements"
        data={[
          fakeCertificateRequirement({
            status: "EXPIRED",
            hasStructuredCertificate: true,
            structuredCertificateId: "certificate-rejected-renewal",
            structuredCertificateWorkflowStatus: "REJECTED",
            structuredCertificateRejectionReason: "Replace the attached renewal evidence",
          }),
        ]}
        isLoading={false}
        error={null}
        onRetry={jest.fn()}
        onUpload={onUpload}
        canUpload
      />,
    );

    expect(screen.getByText("Expired")).toBeOnTheScreen();
    expect(screen.getByText("Rejected")).toBeOnTheScreen();
    expect(
      screen.getByText("Correction: Replace the attached renewal evidence"),
    ).toBeOnTheScreen();
    expect(screen.getByLabelText("Open document record")).toBeOnTheScreen();
  });

  it("GIVEN a child requirement blocked by parent WHEN rendered SHOULD show parent issue without marking approved", () => {
    const onUpload = jest.fn();

    render(
      <CertificateRequirementsTable
        title="Requirements"
        data={[
          fakeCertificateRequirement({
            status: "MISSING",
            hasStructuredCertificate: true,
            structuredCertificateId: "certificate-child",
            structuredCertificateWorkflowStatus: "APPROVED",
            structuredCertificateBlockingReason:
              "Principal document must be valid or expiring soon before this child document can satisfy compliance.",
          }),
        ]}
        isLoading={false}
        error={null}
        onRetry={jest.fn()}
        onUpload={onUpload}
        canUpload
      />,
    );

    expect(screen.getByText("Parent Blocked")).toBeOnTheScreen();
    expect(
      screen.getByText(
        "Principal document must be valid or expiring soon before this child document can satisfy compliance.",
      ),
    ).toBeOnTheScreen();
    expect(screen.queryByText("Approved")).toBeNull();
    expect(screen.getByLabelText("Open document record")).toBeOnTheScreen();
  });
});
