import { render, screen } from "@testing-library/react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useToast } from "@/src/context";
import { useCrewBulkUploadSession } from "../hooks/useCrewBulkUploadSession";
import { useCrewBulkUploadSessionActions } from "../hooks/useCrewBulkUploadSessionActions";
import type { CrewBulkUploadSessionDto } from "../contracts/crewBulkUpload.contract";
import CrewBulkUploadSessionScreen from "./CrewBulkUploadSessionScreen";

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock("@/src/context", () => ({
  useToast: jest.fn(),
}));

jest.mock("../hooks/useCrewBulkUploadSession", () => ({
  useCrewBulkUploadSession: jest.fn(),
}));

jest.mock("../hooks/useCrewBulkUploadSessionActions", () => ({
  useCrewBulkUploadSessionActions: jest.fn(),
}));

const routerPush = jest.fn();
const showToast = jest.fn();
const refresh = jest.fn();
const setSession = jest.fn();

function createSession(
  overrides: Partial<CrewBulkUploadSessionDto> = {},
): CrewBulkUploadSessionDto {
  return {
    id: "session-1",
    projectId: "project-atlantic",
    defaultAssetId: "asset-1",
    defaultAssetName: "MV Navigate One",
    revisionNumber: 2,
    status: "COMMITTED",
    sourceFileName: "crew-bulk.xlsx",
    sourceMimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    checksum: "checksum-1",
    templateVersion: "crew-bulk-foundation-v1",
    totalRows: 2,
    crewRows: 2,
    certificateRows: 1,
    criticalCount: 0,
    warningCount: 1,
    infoCount: 1,
    createdCount: 1,
    updatedCount: 1,
    skippedCount: 1,
    createdByUserId: "user-1",
    committedByUserId: "user-1",
    discardedByUserId: null,
    committedAt: "2026-04-15T13:00:00.000Z",
    discardedAt: null,
    createdAt: "2026-04-15T12:00:00.000Z",
    updatedAt: "2026-04-15T13:00:00.000Z",
    summary: {
      sheets: [
        {
          sheetName: "Crew Data",
          kind: "CREW",
          parsedRows: 2,
        },
        {
          sheetName: "Certificates",
          kind: "CERTIFICATE",
          parsedRows: 1,
        },
      ],
      previewOnlyKinds: ["CERTIFICATE"],
      duplicatePolicy: {
        uniqueIdentityMatch: "Update when a unique match exists.",
        ambiguousIdentityMatch: "Block ambiguous matches.",
        weakIdentityNoMatch: "Create with warning after preview.",
        certificateRows: "Preview only.",
      },
      revisions: [
        {
          revisionNumber: 1,
          sourceFileName: "crew-bulk-v1.xlsx",
          checksum: "checksum-v1",
          uploadedAt: "2026-04-15T12:00:00.000Z",
          uploadedByUserId: "user-1",
          defaultAssetId: "asset-1",
          defaultAssetName: "MV Navigate One",
          totalRows: 2,
          crewRows: 2,
          certificateRows: 1,
          criticalCount: 1,
          warningCount: 1,
          infoCount: 1,
        },
        {
          revisionNumber: 2,
          sourceFileName: "crew-bulk.xlsx",
          checksum: "checksum-1",
          uploadedAt: "2026-04-15T13:00:00.000Z",
          uploadedByUserId: "user-1",
          defaultAssetId: "asset-1",
          defaultAssetName: "MV Navigate One",
          totalRows: 2,
          crewRows: 2,
          certificateRows: 1,
          criticalCount: 0,
          warningCount: 1,
          infoCount: 1,
        },
      ],
      commit: {
        createdCount: 1,
        updatedCount: 1,
        skippedCount: 1,
        affectedCrewIds: ["crew-1", "crew-2"],
        requirementsRefresh: "FAILED",
      },
    },
    rows: [
      {
        id: "row-1",
        sheetName: "Crew Data",
        rowNumber: 2,
        rowKind: "CREW",
        displayLabel: "Juan Perez",
        rawData: {},
        normalizedData: {},
        matchedAssetId: "asset-1",
        matchedAssetName: "MV Navigate One",
        matchedCrewMemberId: null,
        matchedCrewMemberName: null,
        proposedAction: "CREATE",
        commitStatus: "COMMITTED",
        issues: [],
        committedCrewMemberId: "crew-1",
        committedCrewMemberName: "Juan Perez",
        committedAt: "2026-04-15T13:00:00.000Z",
        createdAt: "2026-04-15T12:00:00.000Z",
        updatedAt: "2026-04-15T13:00:00.000Z",
      },
    ],
    ...overrides,
  };
}

describe("CrewBulkUploadSessionScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      projectId: "project-atlantic",
      sessionId: "session-1",
    });
    (useRouter as jest.Mock).mockReturnValue({
      push: routerPush,
    });
    (useToast as jest.Mock).mockReturnValue({ show: showToast });
    (useCrewBulkUploadSessionActions as jest.Mock).mockReturnValue({
      commit: jest.fn(),
      discard: jest.fn(),
      reupload: jest.fn(),
      loading: false,
      error: null,
    });
  });

  it("GIVEN a committed session WHEN the review screen renders SHOULD show commit outcome and requirements refresh guidance", () => {
    (useCrewBulkUploadSession as jest.Mock).mockReturnValue({
      session: createSession(),
      loading: false,
      error: null,
      refresh,
      setSession,
    });

    render(<CrewBulkUploadSessionScreen />);

    expect(screen.getByText("Commit outcome")).toBeOnTheScreen();
    expect(
      screen.getByText(
        "Crew rows were committed, but the requirements refresh failed. Open crew certificates and trigger a refresh before relying on compliance totals.",
      ),
    ).toBeOnTheScreen();
    expect(screen.getByText("Open crew certificates")).toBeOnTheScreen();
    expect(screen.getByText("CERTIFICATE - 1 parsed rows")).toBeOnTheScreen();
    expect(screen.getByText("Revision history")).toBeOnTheScreen();
    expect(screen.getByText("Revision 2: crew-bulk.xlsx")).toBeOnTheScreen();
  });

  it("GIVEN a discarded session WHEN the review screen renders SHOULD show traceability copy without the crew certificates CTA", () => {
    (useCrewBulkUploadSession as jest.Mock).mockReturnValue({
      session: createSession({
        status: "DISCARDED",
        committedAt: null,
        committedByUserId: null,
        discardedAt: "2026-04-15T13:30:00.000Z",
        discardedByUserId: "user-1",
        summary: {
          sheets: [
            {
              sheetName: "Crew Data",
              kind: "CREW",
              parsedRows: 2,
            },
          ],
          previewOnlyKinds: ["CERTIFICATE"],
        },
      }),
      loading: false,
      error: null,
      refresh,
      setSession,
    });

    render(<CrewBulkUploadSessionScreen />);

    expect(screen.getByText("Session discarded")).toBeOnTheScreen();
    expect(
      screen.getByText(
        "This session stays visible only as traceability. Start a new upload from the workspace when the workbook has been corrected.",
      ),
    ).toBeOnTheScreen();
    expect(screen.queryByText("Open crew certificates")).toBeNull();
  });

  it("GIVEN a ready session WHEN the review screen renders SHOULD show in-session correction guidance", () => {
    (useCrewBulkUploadSession as jest.Mock).mockReturnValue({
      session: createSession({
        status: "READY_FOR_REVIEW",
        committedAt: null,
        committedByUserId: null,
        summary: {
          sheets: [
            {
              sheetName: "Crew Data",
              kind: "CREW",
              parsedRows: 2,
            },
          ],
          previewOnlyKinds: ["CERTIFICATE"],
          duplicatePolicy: {
            uniqueIdentityMatch: "Update when a unique match exists.",
            ambiguousIdentityMatch: "Block ambiguous matches.",
            weakIdentityNoMatch: "Create with warning after preview.",
            certificateRows: "Preview only.",
          },
          revisions: [
            {
              revisionNumber: 2,
              sourceFileName: "crew-bulk.xlsx",
              checksum: "checksum-1",
              uploadedAt: "2026-04-15T13:00:00.000Z",
              uploadedByUserId: "user-1",
              defaultAssetId: "asset-1",
              defaultAssetName: "MV Navigate One",
              totalRows: 2,
              crewRows: 2,
              certificateRows: 1,
              criticalCount: 0,
              warningCount: 1,
              infoCount: 1,
            },
          ],
        },
      }),
      loading: false,
      error: null,
      refresh,
      setSession,
    });

    render(<CrewBulkUploadSessionScreen />);

    expect(screen.getByText("Correct this session")).toBeOnTheScreen();
    expect(screen.getByText("Replace workbook in this session")).toBeOnTheScreen();
    expect(screen.getByText("Duplicate handling policy")).toBeOnTheScreen();
  });
});
