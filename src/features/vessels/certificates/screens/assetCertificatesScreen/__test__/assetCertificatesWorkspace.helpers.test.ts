import { fakeCertificate, fakeCertificateRequirement } from "@/src/test/fakes/certificates";
import {
  getAssetCertificatesSummaryItems,
  getAssetCertificatesWorkspaceStats,
} from "../assetCertificatesWorkspace.helpers";

describe("assetCertificatesWorkspace helpers", () => {
  it("GIVEN rejected records WHEN building summary SHOULD separate correction work from missing gaps", () => {
    const stats = getAssetCertificatesWorkspaceStats(
      [
        fakeCertificateRequirement({ id: "requirement-1", status: "MISSING" }),
        fakeCertificateRequirement({ id: "requirement-2", status: "PROVIDED" }),
      ],
      [
        fakeCertificate({
          id: "certificate-rejected",
          status: "PENDING",
          workflowStatus: "REJECTED",
        }),
      ],
    );

    const summary = getAssetCertificatesSummaryItems(stats);

    expect(stats.missing).toBe(1);
    expect(stats.correctionNeeded).toBe(1);
    expect(summary).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: "Missing",
          helper: "open requirement gaps",
        }),
        expect.objectContaining({
          label: "Correction needed",
          value: "1",
          helper: "records sent back",
        }),
      ]),
    );
  });
});
