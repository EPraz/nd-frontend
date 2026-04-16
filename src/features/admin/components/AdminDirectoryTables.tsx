import { Badge } from "@/src/components/ui/badge/Badge";
import { Button } from "@/src/components/ui/button/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeaderRow,
  CardTitle,
} from "@/src/components/ui/card/Card";
import { Field } from "@/src/components/ui/forms/Field";
import { Text } from "@/src/components/ui/text/Text";
import type {
  AdminProjectDto,
  AdminUserDto,
  UserRole,
} from "@/src/contracts/admin.contract";
import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import {
  formatAdminDate,
  KIND_LABEL,
  ROLE_LABEL,
  USER_ROLE_OPTIONS,
} from "../admin.constants";
import { ChoicePill, EmptyAdminState, MiniTag } from "./AdminPrimitives";

type ProjectDirectoryTableProps = {
  projects: AdminProjectDto[];
  totalProjects: number;
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onOpenProject: (projectId: string) => void;
  onOpenSettings: (projectId: string) => void;
  onManageAccess: (project: AdminProjectDto) => void;
};

type UserDirectoryTableProps = {
  users: AdminUserDto[];
  totalUsers: number;
  projectsById: Map<string, AdminProjectDto>;
  loading: boolean;
  search: string;
  roleFilter: UserRole | "ALL";
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: UserRole | "ALL") => void;
};

export function ProjectDirectoryTable({
  projects,
  totalProjects,
  loading,
  search,
  onSearchChange,
  onOpenProject,
  onOpenSettings,
  onManageAccess,
}: ProjectDirectoryTableProps) {
  return (
    <Card className="border-shellLine bg-shellPanel">
      <CardHeaderRow className="items-start">
        <View className="flex-1 gap-2">
          <Text className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
            Workspaces
          </Text>
          <CardTitle className="text-xl text-textMain">Project directory</CardTitle>
          <CardDescription>
            Assign users here, then manage module entitlements from each project.
          </CardDescription>
        </View>

        <Badge variant="secondary">
          <Text className="text-xs uppercase">
            {formatCount(totalProjects, "project")}
          </Text>
        </Badge>
      </CardHeaderRow>

      <CardContent className="gap-4">
        <View className="web:max-w-[420px]">
          <Field
            label="Search projects"
            value={search}
            onChangeText={onSearchChange}
            placeholder="Search by project, status, kind, or user"
            placeholderTextColor="#9AA7B8"
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
          ) : projects.length === 0 ? (
            <EmptyAdminState>
              No projects matched this filter. Create a workspace or adjust the search.
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
                  <MiniTag label={KIND_LABEL[project.kind]} />
                  <MiniTag label={project.status} tone="accent" />
                </View>

                <View
                  className="flex-row flex-wrap gap-2 px-3 py-4"
                  style={{ flex: 2.2 }}
                >
                  {project.assignedUsers.length === 0 ? (
                    <MiniTag label="No explicit access" tone="warning" />
                  ) : (
                    project.assignedUsers.map((user) => (
                      <MiniTag
                        key={`${project.id}-${user.id}`}
                        label={`${user.name} - ${ROLE_LABEL[user.role]}`}
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
                    size="pillSm"
                    onPress={() => onOpenProject(project.id)}
                  >
                    Open project
                  </Button>
                  <Button
                    variant="softAccent"
                    size="pillSm"
                    onPress={() => onOpenSettings(project.id)}
                  >
                    Project settings
                  </Button>
                  <Button
                    variant="soft"
                    size="pillSm"
                    onPress={() => onManageAccess(project)}
                  >
                    Manage access
                  </Button>
                </View>
              </AdminTableRow>
            ))
          )}
        </AdminTableShell>
      </CardContent>
    </Card>
  );
}

export function UserDirectoryTable({
  users,
  totalUsers,
  projectsById,
  loading,
  search,
  roleFilter,
  onSearchChange,
  onRoleFilterChange,
}: UserDirectoryTableProps) {
  return (
    <Card className="border-shellLine bg-shellPanel">
      <CardHeaderRow className="items-start">
        <View className="flex-1 gap-2">
          <Text className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
            Identity
          </Text>
          <CardTitle className="text-xl text-textMain">User directory</CardTitle>
          <CardDescription>
            Company users and their current project visibility.
          </CardDescription>
        </View>

        <Badge variant="secondary">
          <Text className="text-xs uppercase">
            {formatCount(totalUsers, "user")}
          </Text>
        </Badge>
      </CardHeaderRow>

      <CardContent className="gap-4">
        <View className="gap-3 web:flex-row web:items-end">
          <View className="flex-1">
            <Field
              label="Search users"
              value={search}
              onChangeText={onSearchChange}
              placeholder="Search by name, email, role, or project"
              placeholderTextColor="#9AA7B8"
            />
          </View>

          <View className="gap-2">
            <Text className="text-sm font-medium text-muted">Role filter</Text>
            <View className="flex-row flex-wrap gap-2">
              {(["ALL", ...USER_ROLE_OPTIONS] as (UserRole | "ALL")[]).map(
                (option) => (
                  <ChoicePill
                    key={option}
                    label={option === "ALL" ? "All" : ROLE_LABEL[option]}
                    active={roleFilter === option}
                    onPress={() => onRoleFilterChange(option)}
                  />
                ),
              )}
            </View>
          </View>
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
                  <MiniTag label={ROLE_LABEL[user.role]} tone="accent" />
                </View>

                <View
                  className="flex-row flex-wrap gap-2 px-3 py-4"
                  style={{ flex: 2.6 }}
                >
                  {user.assignedProjectIds.length === 0 ? (
                    <MiniTag label="No explicit project access" tone="warning" />
                  ) : (
                    user.assignedProjectIds.map((projectId) => (
                      <MiniTag
                        key={`${user.id}-${projectId}`}
                        label={projectsById.get(projectId)?.name ?? projectId}
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
      </CardContent>
    </Card>
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
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View
        className="overflow-hidden rounded-[26px] border border-shellLine bg-shellGlass"
        style={{ minWidth }}
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
    <View className="min-h-[76px] flex-row items-center border-b border-shellLine bg-shellPanelSoft/80 last:border-b-0">
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
