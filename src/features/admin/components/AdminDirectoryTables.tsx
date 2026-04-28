import { Badge } from "@/src/components/ui/badge/Badge";
import { Button } from "@/src/components/ui/button/Button";
import { ToolbarSelect } from "@/src/components/ui/forms/ToolbarSelect";
import {
  RegistryTablePill,
  TableFilterSearch,
  TablePaginationControls,
} from "@/src/components/ui/table";
import { Text } from "@/src/components/ui/text/Text";
import type {
  AdminProjectDto,
  AdminUserDto,
  UserRole,
} from "@/src/contracts/admin.contract";
import type { PaginationMetaDto } from "@/src/contracts/pagination.contract";
import {
  ArrowUpRight,
  Settings2,
  UserRoundCog,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import {
  formatAdminDate,
  KIND_LABEL,
  PROJECT_STATUS_LABEL,
  ROLE_LABEL,
  USER_ROLE_OPTIONS,
} from "../admin.constants";
import { EmptyAdminState } from "./AdminPrimitives";

const ACTION_ICON_COLOR = "#ffd0a8";
const OPEN_ICON_COLOR = "#7dd3fc";
const ACCESS_ICON_COLOR = "#86efac";
const ACTION_BUTTON_STYLES = {
  open: {
    borderColor: "rgba(125, 211, 252, 0.32)",
    backgroundColor: "rgba(125, 211, 252, 0.09)",
  },
  settings: {
    borderColor: "rgba(255, 138, 61, 0.42)",
    backgroundColor: "rgba(255, 138, 61, 0.15)",
  },
  access: {
    borderColor: "rgba(134, 239, 172, 0.3)",
    backgroundColor: "rgba(134, 239, 172, 0.09)",
  },
} as const;
const PROJECT_STATUS_OPTIONS = ["ALL", "ACTIVE", "ARCHIVED"] as const;
const PROJECT_KIND_FILTER_OPTIONS = [
  "ALL",
  "MARITIME",
  "STORE",
  "BARBERSHOP",
  "OTHER",
] as const;
const ACCESS_FILTER_OPTIONS = ["ALL", "ASSIGNED", "UNASSIGNED"] as const;

type ProjectDirectoryTableProps = {
  projects: AdminProjectDto[];
  totalProjects: number;
  loading: boolean;
  error: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  kindFilter: string;
  onKindFilterChange: (value: string) => void;
  assignedUserFilter: string;
  users: AdminUserDto[];
  onAssignedUserFilterChange: (value: string) => void;
  pagination: PaginationMetaDto | null;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onOpenProject: (projectId: string) => void;
  onOpenSettings: (projectId: string) => void;
  onManageAccess: (project: AdminProjectDto) => void;
};

type UserDirectoryTableProps = {
  users: AdminUserDto[];
  totalUsers: number;
  projectsById: Map<string, AdminProjectDto>;
  loading: boolean;
  error: string | null;
  search: string;
  roleFilter: UserRole | "ALL";
  projectFilter: string;
  accessFilter: string;
  projects: AdminProjectDto[];
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: UserRole | "ALL") => void;
  onProjectFilterChange: (value: string) => void;
  onAccessFilterChange: (value: string) => void;
  pagination: PaginationMetaDto | null;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export function ProjectDirectoryTable({
  projects,
  totalProjects,
  loading,
  error,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  kindFilter,
  onKindFilterChange,
  assignedUserFilter,
  users,
  onAssignedUserFilterChange,
  pagination,
  onPageChange,
  onPageSizeChange,
  onOpenProject,
  onOpenSettings,
  onManageAccess,
}: ProjectDirectoryTableProps) {
  const [openControl, setOpenControl] = useState<string | null>(null);
  const toggleControl = (controlId: string) =>
    setOpenControl((current) => (current === controlId ? null : controlId));

  return (
    <View className="gap-4">
      <AdminDirectoryHeader
        eyebrow="Workspaces"
        title="Project directory"
        description="Assign users here, then manage module entitlements from each project."
        count={formatCount(totalProjects, "project")}
      />

      <View className="flex-row flex-wrap items-center gap-2">
        <TableFilterSearch
          value={search}
          onChangeText={onSearchChange}
          placeholder="Search by project, status, kind, or user"
          open
          onOpenChange={() => undefined}
          minWidth={360}
        />
        <ToolbarSelect
          value={statusFilter}
          options={[...PROJECT_STATUS_OPTIONS]}
          open={openControl === "project-status"}
          onToggle={() => toggleControl("project-status")}
          onChange={onStatusFilterChange}
          renderLabel={(value) =>
            value === "ALL" ? "All status" : PROJECT_STATUS_LABEL[value as keyof typeof PROJECT_STATUS_LABEL]
          }
          triggerIconName="pulse-outline"
          minWidth={150}
        />
        <ToolbarSelect
          value={kindFilter}
          options={[...PROJECT_KIND_FILTER_OPTIONS]}
          open={openControl === "project-kind"}
          onToggle={() => toggleControl("project-kind")}
          onChange={onKindFilterChange}
          renderLabel={(value) =>
            value === "ALL" ? "All kinds" : KIND_LABEL[value as keyof typeof KIND_LABEL]
          }
          triggerIconName="compass-outline"
          minWidth={150}
        />
        <ToolbarSelect
          value={assignedUserFilter}
          options={["ALL", ...users.map((user) => user.id)]}
          open={openControl === "project-assignee"}
          onToggle={() => toggleControl("project-assignee")}
          onChange={onAssignedUserFilterChange}
          renderLabel={(value) => {
            if (value === "ALL") return "All assignees";
            return users.find((user) => user.id === value)?.name ?? "User";
          }}
          triggerIconName="person-outline"
          minWidth={190}
        />
      </View>

      <AdminTableShell minWidth={1040}>
        <AdminTableHeader
          columns={[
            ["Workspace", 2.1],
            ["Kind / status", 1.3],
            ["Assigned users", 2.2],
            ["Created", 1],
            ["Actions", 2],
          ]}
        />

        {loading ? (
          <AdminTableMessage>Loading projects...</AdminTableMessage>
        ) : error ? (
          <AdminTableMessage>{error}</AdminTableMessage>
        ) : projects.length === 0 ? (
          <EmptyAdminState>
            No projects matched this filter. Create a workspace or adjust the
            search.
          </EmptyAdminState>
        ) : (
          projects.map((project) => (
            <AdminTableRow key={project.id}>
              <View className="gap-1 px-3 py-4" style={{ flex: 2.1 }}>
                <Text className="text-base font-semibold text-textMain">
                  {project.name}
                </Text>
                <Text className="text-xs text-muted">
                  Project-level module settings available
                </Text>
              </View>

              <View
                className="flex-row flex-wrap gap-2 px-3 py-4"
                style={{ flex: 1.3 }}
              >
                <RegistryTablePill
                  label={KIND_LABEL[project.kind]}
                  tone="info"
                />
                <RegistryTablePill
                  label={PROJECT_STATUS_LABEL[project.status]}
                  tone={project.status === "ACTIVE" ? "ok" : "warn"}
                />
              </View>

              <View
                className="flex-row flex-wrap gap-2 px-3 py-4"
                style={{ flex: 2.2 }}
              >
                {project.assignedUsers.length === 0 ? (
                  <RegistryTablePill label="No explicit access" tone="warn" />
                ) : (
                  project.assignedUsers.map((user) => (
                    <RegistryTablePill
                      key={`${project.id}-${user.id}`}
                      label={`${user.name} - ${ROLE_LABEL[user.role]}`}
                      tone={user.role === "ADMIN" ? "warn" : "neutral"}
                    />
                  ))
                )}
              </View>

              <View className="flex-1 px-3 py-4">
                <Text className="text-sm text-muted">
                  {formatAdminDate(project.createdAt)}
                </Text>
              </View>

              <View
                className="flex-row flex-wrap justify-end gap-2 px-3 py-4"
                style={{ flex: 2 }}
              >
                <Button
                  variant="outline"
                  size="pillXs"
                  style={ACTION_BUTTON_STYLES.open}
                  onPress={() => onOpenProject(project.id)}
                  rightIcon={
                    <ArrowUpRight size={13} color={OPEN_ICON_COLOR} />
                  }
                >
                  Open
                </Button>
                <Button
                  variant="softAccent"
                  size="pillXs"
                  style={ACTION_BUTTON_STYLES.settings}
                  onPress={() => onOpenSettings(project.id)}
                  rightIcon={<Settings2 size={13} color={ACTION_ICON_COLOR} />}
                >
                  Settings
                </Button>
                <Button
                  variant="soft"
                  size="pillXs"
                  style={ACTION_BUTTON_STYLES.access}
                  onPress={() => onManageAccess(project)}
                  rightIcon={
                    <UserRoundCog size={13} color={ACCESS_ICON_COLOR} />
                  }
                >
                  Access
                </Button>
              </View>
            </AdminTableRow>
          ))
        )}
      </AdminTableShell>

      {pagination ? (
        <TablePaginationControls
          meta={pagination}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      ) : null}
    </View>
  );
}

export function UserDirectoryTable({
  users,
  totalUsers,
  projectsById,
  loading,
  error,
  search,
  roleFilter,
  projectFilter,
  accessFilter,
  projects,
  onSearchChange,
  onRoleFilterChange,
  onProjectFilterChange,
  onAccessFilterChange,
  pagination,
  onPageChange,
  onPageSizeChange,
}: UserDirectoryTableProps) {
  const [openControl, setOpenControl] = useState<string | null>(null);
  const toggleControl = (controlId: string) =>
    setOpenControl((current) => (current === controlId ? null : controlId));

  return (
    <View className="gap-4">
      <AdminDirectoryHeader
        eyebrow="Identity"
        title="User directory"
        description="Company users and their current project visibility."
        count={formatCount(totalUsers, "user")}
      />

      <View className="flex-row flex-wrap items-center gap-2">
        <TableFilterSearch
          value={search}
          onChangeText={onSearchChange}
          placeholder="Search by name, email, role, or project"
          open
          onOpenChange={() => undefined}
          minWidth={360}
        />
        <ToolbarSelect
          value={roleFilter}
          options={["ALL", ...USER_ROLE_OPTIONS]}
          open={openControl === "user-role"}
          onToggle={() => toggleControl("user-role")}
          onChange={onRoleFilterChange}
          renderLabel={(value) =>
            value === "ALL" ? "All roles" : ROLE_LABEL[value]
          }
          triggerIconName="shield-outline"
          minWidth={150}
        />
        <ToolbarSelect
          value={projectFilter}
          options={["ALL", ...projects.map((project) => project.id)]}
          open={openControl === "user-project"}
          onToggle={() => toggleControl("user-project")}
          onChange={onProjectFilterChange}
          renderLabel={(value) => {
            if (value === "ALL") return "All projects";
            return projectsById.get(value)?.name ?? "Project";
          }}
          triggerIconName="briefcase-outline"
          minWidth={180}
        />
        <ToolbarSelect
          value={accessFilter}
          options={[...ACCESS_FILTER_OPTIONS]}
          open={openControl === "user-access"}
          onToggle={() => toggleControl("user-access")}
          onChange={onAccessFilterChange}
          renderLabel={(value) =>
            value === "ALL" ? "All access" : value === "ASSIGNED" ? "Assigned" : "Unassigned"
          }
          triggerIconName="key-outline"
          minWidth={150}
        />
      </View>

      <AdminTableShell minWidth={980}>
        <AdminTableHeader
          columns={[
            ["User", 1.8],
            ["Role", 1],
            ["Project access", 2.6],
            ["Created", 1],
          ]}
        />

        {loading ? (
          <AdminTableMessage>Loading users...</AdminTableMessage>
        ) : error ? (
          <AdminTableMessage>{error}</AdminTableMessage>
        ) : users.length === 0 ? (
          <EmptyAdminState>
            No users matched this filter. Create a user or adjust the search.
          </EmptyAdminState>
        ) : (
          users.map((user) => (
            <AdminTableRow key={user.id}>
              <View className="gap-1 px-3 py-4" style={{ flex: 1.8 }}>
                <Text className="text-base font-semibold text-textMain">
                  {user.name}
                </Text>
                <Text className="text-xs text-muted">{user.email}</Text>
              </View>

              <View className="flex-1 px-3 py-4">
                <RegistryTablePill
                  label={ROLE_LABEL[user.role]}
                  tone={
                    user.role === "ADMIN"
                      ? "warn"
                      : user.role === "OPS"
                        ? "info"
                        : "neutral"
                  }
                />
              </View>

              <View
                className="flex-row flex-wrap gap-2 px-3 py-4"
                style={{ flex: 2.6 }}
              >
                {user.assignedProjectIds.length === 0 ? (
                  <RegistryTablePill
                    label="No explicit project access"
                    tone="warn"
                  />
                ) : (
                  user.assignedProjectIds.map((projectId) => (
                    <RegistryTablePill
                      key={`${user.id}-${projectId}`}
                      label={projectsById.get(projectId)?.name ?? projectId}
                      tone="info"
                    />
                  ))
                )}
              </View>

              <View className="flex-1 px-3 py-4">
                <Text className="text-sm text-muted">
                  {formatAdminDate(user.createdAt)}
                </Text>
              </View>
            </AdminTableRow>
          ))
        )}
      </AdminTableShell>

      {pagination ? (
        <TablePaginationControls
          meta={pagination}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      ) : null}
    </View>
  );
}

function AdminDirectoryHeader({
  eyebrow,
  title,
  description,
  count,
}: {
  eyebrow: string;
  title: string;
  description: string;
  count: string;
}) {
  return (
    <View className="gap-3 web:flex-row web:items-end web:justify-between">
      <View className="gap-2">
        <Text className="text-[11px] font-semibold uppercase tracking-[0.22em] text-shellHighlight">
          {eyebrow}
        </Text>
        <View className="gap-1">
          <Text className="text-[24px] font-semibold tracking-tight text-textMain">
            {title}
          </Text>
          <Text className="max-w-[720px] text-[13px] leading-6 text-muted">
            {description}
          </Text>
        </View>
      </View>

      <Badge variant="secondary" className="self-start px-3 py-1">
        <Text className="text-xs uppercase">{count}</Text>
      </Badge>
    </View>
  );
}

function AdminTableShell({
  children,
  minWidth,
}: {
  children: ReactNode;
  minWidth: number;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="w-full"
      contentContainerStyle={{ minWidth: "100%" }}
    >
      <View
        className="w-full overflow-hidden rounded-[26px] border border-shellLine bg-shellGlass"
        style={{ minWidth, width: "100%" }}
      >
        {children}
      </View>
    </ScrollView>
  );
}

function AdminTableHeader({
  columns,
}: {
  columns: [label: string, flex: number][];
}) {
  return (
    <View className="flex-row items-center border-b border-shellLine bg-shellPanelSoft px-2 py-3">
      {columns.map(([label, flex]) => (
        <Text
          key={label}
          className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted"
          style={{ flex }}
        >
          {label}
        </Text>
      ))}
    </View>
  );
}

function AdminTableRow({ children }: { children: ReactNode }) {
  return (
    <View className="min-h-[46px] flex-row items-center border-b border-shellLine bg-shellPanelSoft last:border-b-0">
      {children}
    </View>
  );
}

function AdminTableMessage({ children }: { children: string }) {
  return (
    <View className="px-5 py-6">
      <Text className="text-sm text-muted">{children}</Text>
    </View>
  );
}

function formatCount(value: number, label: string) {
  return `${value} ${value === 1 ? label : `${label}s`}`;
}
