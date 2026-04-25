import { canRole, canUser } from "../rolePermissions";

describe("rolePermissions", () => {
  it("GIVEN an admin role WHEN checking elevated actions SHOULD allow project configuration and certificate approval", () => {
    expect(canRole("ADMIN", "PROJECT_CONFIGURE")).toBe(true);
    expect(canRole("ADMIN", "USER_MANAGE")).toBe(true);
    expect(canRole("ADMIN", "CERTIFICATE_APPROVE")).toBe(true);
  });

  it("GIVEN an ops role WHEN checking operational actions SHOULD allow writes and ingestion confirmation", () => {
    expect(canRole("OPS", "OPERATIONAL_WRITE")).toBe(true);
    expect(canRole("OPS", "DOCUMENT_UPLOAD")).toBe(true);
    expect(canRole("OPS", "INGESTION_CONFIRM")).toBe(true);
  });

  it("GIVEN an ops role WHEN checking admin-only actions SHOULD deny project configuration and approval", () => {
    expect(canRole("OPS", "PROJECT_CONFIGURE")).toBe(false);
    expect(canRole("OPS", "USER_MANAGE")).toBe(false);
    expect(canRole("OPS", "CERTIFICATE_APPROVE")).toBe(false);
  });

  it("GIVEN a viewer role WHEN checking read actions SHOULD allow project, file, and audit reads", () => {
    expect(canRole("VIEWER", "PROJECT_READ")).toBe(true);
    expect(canRole("VIEWER", "FILE_VIEW")).toBe(true);
    expect(canRole("VIEWER", "AUDIT_VIEW")).toBe(true);
  });

  it("GIVEN a viewer role WHEN checking mutation actions SHOULD deny writes, uploads, and soft delete", () => {
    expect(canRole("VIEWER", "OPERATIONAL_WRITE")).toBe(false);
    expect(canRole("VIEWER", "DOCUMENT_UPLOAD")).toBe(false);
    expect(canRole("VIEWER", "OPERATIONAL_SOFT_DELETE")).toBe(false);
  });

  it("GIVEN no active session WHEN checking any action SHOULD deny by default", () => {
    expect(canUser(null, "PROJECT_READ")).toBe(false);
    expect(canRole(undefined, "FILE_VIEW")).toBe(false);
  });
});

