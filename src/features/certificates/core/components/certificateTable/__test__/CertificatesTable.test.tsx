import { render, screen } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fakeCertificate } from "@/src/test/fakes/certificates";
import { CertificatesTable } from "../CertificatesTable";

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

describe("CertificatesTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
    });
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
  });

  it("GIVEN a child document blocked by parent WHEN rendered SHOULD explain the parent block in overview", () => {
    render(
      <CertificatesTable
        title="Overview"
        data={[
          fakeCertificate({
            certificateDocumentKind: "SUPPLEMENT",
            certificateParentTypeId: "type-parent",
            certificateParentTypeName: "IOPP Certificate",
            parentCertificateId: "parent-1",
            parentCertificateName: "IOPP Certificate",
            parentCertificateWorkflowStatus: "APPROVED",
            parentCertificateStatus: "EXPIRED",
            status: "VALID",
            workflowStatus: "APPROVED",
            requirementStatus: "MISSING",
          }),
        ]}
        isLoading={false}
        error={null}
        onRetry={jest.fn()}
      />,
    );

    expect(screen.getByText("Parent blocked")).toBeOnTheScreen();
    expect(
      screen.getByText(
        "Principal document must be valid or expiring soon before this child document can satisfy compliance.",
      ),
    ).toBeOnTheScreen();
  });
});
