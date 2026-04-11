import type { AdminProjectDto, AdminUserDto } from "@/src/contracts/admin.contract";

export function fakeAdminUser(
  overrides: Partial<AdminUserDto> = {},
): AdminUserDto {
  return {
    id: "user-ops",
    name: "Operations User",
    email: "ops@navigate.test",
    role: "OPS",
    createdAt: "2026-04-01T00:00:00.000Z",
    assignedProjectIds: ["project-atlantic"],
    ...overrides,
  };
}

export function fakeAdminProject(
  overrides: Partial<AdminProjectDto> = {},
): AdminProjectDto {
  const assignedUsers = overrides.assignedUsers ?? [
    {
      id: "user-ops",
      name: "Operations User",
      email: "ops@navigate.test",
      role: "OPS",
    },
  ];

  return {
    id: "project-atlantic",
    name: "Atlantic Ops",
    status: "ACTIVE",
    kind: "MARITIME",
    createdAt: "2026-04-01T00:00:00.000Z",
    assignedUsers,
    ...overrides,
  };
}
