import { render, screen } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { useToast } from "@/src/context/ToastProvider";
import { useVessels } from "@/src/features/vessels/core";
import { useCreateCrewBulkUploadSession } from "../../hooks/useCreateCrewBulkUploadSession";
import { useCrewBulkUploadSessionActions } from "../../hooks/useCrewBulkUploadSessionActions";
import { useCrewBulkUploadSessions } from "../../hooks/useCrewBulkUploadSessions";
import { CrewBulkUploadWorkspaceSection } from "../CrewBulkUploadWorkspaceSection";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/src/context/ToastProvider", () => ({
  useToast: jest.fn(),
}));

jest.mock("@/src/features/vessels/core", () => ({
  useVessels: jest.fn(),
}));

jest.mock("../../hooks/useCrewBulkUploadSessions", () => ({
  useCrewBulkUploadSessions: jest.fn(),
}));

jest.mock("../../hooks/useCreateCrewBulkUploadSession", () => ({
  useCreateCrewBulkUploadSession: jest.fn(),
}));

jest.mock("../../hooks/useCrewBulkUploadSessionActions", () => ({
  useCrewBulkUploadSessionActions: jest.fn(),
}));

describe("CrewBulkUploadWorkspaceSection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    (useToast as jest.Mock).mockReturnValue({ show: jest.fn() });
    (useVessels as jest.Mock).mockReturnValue({
      vessels: [],
      loading: false,
      error: null,
    });
    (useCrewBulkUploadSessions as jest.Mock).mockReturnValue({
      sessions: [
        {
          id: "session-1",
          projectId: "project-atlantic",
          defaultAssetId: null,
          defaultAssetName: null,
          revisionNumber: 2,
          status: "READY_FOR_REVIEW",
          sourceFileName: "crew-bulk.xlsx",
          sourceMimeType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          checksum: "checksum-1",
          templateVersion: "crew-bulk-foundation-v1",
          totalRows: 6,
          crewRows: 4,
          certificateRows: 2,
          criticalCount: 1,
          warningCount: 2,
          infoCount: 0,
          createdCount: 0,
          updatedCount: 0,
          skippedCount: 0,
          createdByUserId: "user-1",
          committedByUserId: null,
          discardedByUserId: null,
          committedAt: null,
          discardedAt: null,
          createdAt: "2026-04-20T10:00:00.000Z",
          updatedAt: "2026-04-20T10:30:00.000Z",
        },
      ],
      loading: false,
      error: null,
      refresh: jest.fn(),
    });
    (useCreateCrewBulkUploadSession as jest.Mock).mockReturnValue({
      submit: jest.fn(),
      loading: false,
      error: null,
    });
    (useCrewBulkUploadSessionActions as jest.Mock).mockReturnValue({
      downloadTemplate: jest.fn(),
      loading: false,
      error: null,
    });
  });

  it("GIVEN bulk upload lives under crew WHEN the section renders SHOULD show summary, session start and existing sessions", () => {
    render(<CrewBulkUploadWorkspaceSection projectId="project-atlantic" />);

    expect(screen.getByText("Start a new session")).toBeOnTheScreen();
    expect(screen.getByText("Existing sessions")).toBeOnTheScreen();
    expect(screen.getAllByText("crew-bulk.xlsx").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Ready for review").length).toBeGreaterThan(0);
    expect(screen.getByText("Critical before commit")).toBeOnTheScreen();
  });
});
