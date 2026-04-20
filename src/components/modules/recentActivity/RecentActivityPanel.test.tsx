import { fireEvent, render, screen } from "@testing-library/react-native";
import type { AuditEventDto } from "@/src/contracts/audit.contract";
import { RecentActivityPanel } from "./RecentActivityPanel";

function createAuditEvent(
  overrides: Partial<AuditEventDto> = {},
): AuditEventDto {
  return {
    id: "audit-1",
    projectId: "project-1",
    assetId: "asset-1",
    assetName: "MV Navigate One",
    moduleKey: "CERTIFICATES",
    entityType: "VESSEL_CERTIFICATE",
    entityId: "certificate-1",
    entityLabel: "Safety Management Certificate",
    action: "UPDATE",
    summary: "Certificate review status updated",
    actorUserId: "user-1",
    actorUserName: "Admin User",
    metadata: {},
    createdAt: "2026-04-20T15:45:00.000Z",
    ...overrides,
  };
}

describe("RecentActivityPanel", () => {
  it("GIVEN the audit feed is loading WHEN the panel renders SHOULD show a loading state", () => {
    render(
      <RecentActivityPanel
        title="Recent Activity"
        description="Latest operational changes."
        events={[]}
        isLoading
        error={null}
        onRetry={jest.fn()}
      />,
    );

    expect(screen.getByText("Loading activity...")).toBeOnTheScreen();
    expect(
      screen.getByText("Fetching the latest operational changes."),
    ).toBeOnTheScreen();
  });

  it("GIVEN the audit request fails WHEN the user presses retry SHOULD call the retry handler", () => {
    const onRetry = jest.fn();

    render(
      <RecentActivityPanel
        title="Recent Activity"
        description="Latest operational changes."
        events={[]}
        isLoading={false}
        error="Unable to load audit events."
        onRetry={onRetry}
      />,
    );

    expect(screen.getByText("Unable to load audit events.")).toBeOnTheScreen();

    fireEvent.press(screen.getByText("Retry"));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("GIVEN there are no events WHEN the panel renders SHOULD show the empty state", () => {
    render(
      <RecentActivityPanel
        title="Recent Activity"
        description="Latest operational changes."
        events={[]}
        isLoading={false}
        error={null}
        onRetry={jest.fn()}
      />,
    );

    expect(screen.getByText("No recent activity yet")).toBeOnTheScreen();
    expect(
      screen.getByText(
        "New changes across enabled modules will appear here as the team works.",
      ),
    ).toBeOnTheScreen();
  });

  it("GIVEN all events belong to disabled modules WHEN the panel renders SHOULD keep the timeline empty", () => {
    render(
      <RecentActivityPanel
        title="Recent Activity"
        description="Latest operational changes."
        events={[
          createAuditEvent({
            id: "audit-maintenance",
            moduleKey: "MAINTENANCE",
            entityType: "MAINTENANCE_TASK",
            summary: "Maintenance task updated",
          }),
        ]}
        isLoading={false}
        error={null}
        onRetry={jest.fn()}
        isModuleEnabled={(moduleKey) => moduleKey !== "maintenance"}
      />,
    );

    expect(screen.getByText("No recent activity yet")).toBeOnTheScreen();
    expect(screen.queryByText("Maintenance task updated")).toBeNull();
  });

  it("GIVEN mixed audit events WHEN the panel renders SHOULD show only visible items with client-friendly labels", () => {
    render(
      <RecentActivityPanel
        title="Recent Activity"
        description="Latest operational changes."
        events={[
          createAuditEvent(),
          createAuditEvent({
            id: "audit-crew",
            moduleKey: "CREW_CERTIFICATES",
            entityType: "CREW_CERTIFICATE",
            entityLabel: "Basic Safety Training",
            summary: "Crew certificate approved",
            action: "APPROVE",
            assetName: null,
          }),
          createAuditEvent({
            id: "audit-fuel",
            moduleKey: "FUEL",
            entityType: "FUEL_LOG",
            entityLabel: "Bunker Log",
            summary: "Fuel log updated",
          }),
        ]}
        isLoading={false}
        error={null}
        onRetry={jest.fn()}
        isModuleEnabled={(moduleKey) => moduleKey !== "fuel"}
      />,
    );

    expect(
      screen.getByText("Certificate review status updated"),
    ).toBeOnTheScreen();
    expect(screen.getByText("Crew certificate approved")).toBeOnTheScreen();
    expect(screen.getByText("Certificates")).toBeOnTheScreen();
    expect(screen.getByText("Crew Certificates")).toBeOnTheScreen();
    expect(screen.getByText("Subject: Safety Management Certificate")).toBeOnTheScreen();
    expect(screen.getByText("Subject: Basic Safety Training")).toBeOnTheScreen();
    expect(screen.queryByText("Fuel log updated")).toBeNull();
  });

  it("GIVEN project and admin events WHEN module entitlements are disabled SHOULD keep those transversal events visible", () => {
    render(
      <RecentActivityPanel
        title="Recent Activity"
        description="Latest operational changes."
        events={[
          createAuditEvent({
            id: "audit-project",
            moduleKey: "PROJECTS",
            entityType: "PROJECT",
            entityLabel: "Atlantic Ops",
            summary: "Project settings updated",
          }),
          createAuditEvent({
            id: "audit-admin",
            moduleKey: "ADMIN",
            entityType: "PROJECT_ACCESS",
            entityLabel: "Admin Access",
            summary: "User access reassigned",
          }),
          createAuditEvent({
            id: "audit-maintenance",
            moduleKey: "MAINTENANCE",
            entityType: "MAINTENANCE_TASK",
            entityLabel: "Task 14",
            summary: "Maintenance task updated",
          }),
        ]}
        isLoading={false}
        error={null}
        onRetry={jest.fn()}
        isModuleEnabled={() => false}
      />,
    );

    expect(screen.getByText("Project settings updated")).toBeOnTheScreen();
    expect(screen.getByText("User access reassigned")).toBeOnTheScreen();
    expect(screen.queryByText("Maintenance task updated")).toBeNull();
  });
});
