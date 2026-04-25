import { Badge } from "@/src/components/ui/badge/Badge";
import { Button } from "@/src/components/ui/button/Button";
import { RegistryTablePill } from "@/src/components/ui/table";
import { Text } from "@/src/components/ui/text/Text";
import type {
  AdminProjectDto,
  AdminUserDto,
  UserRole,
} from "@/src/contracts/admin.contract";
import {
  ArrowUpRight,
  Search,
  Settings2,
  UserRoundCog,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import {
  formatAdminDate,
  KIND_LABEL,
  PROJECT_STATUS_LABEL,
  ROLE_LABEL,
  USER_ROLE_OPTIONS,
} from "../admin.constants";
import { EmptyAdminState } from "./AdminPrimitives";

const SEARCH_ICON_COLOR = "#9fb0c8";
const PLACEHOLDER_COLOR = "#8d9ab0";
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
    <View className="gap-4">
      <AdminDirectoryHeader
        eyebrow="Workspaces"
        title="Project directory"
        description="Assign users here, then manage module entitlements from each project."
        count={formatCount(totalProjects, "project")}
      />

      <AdminSearchInput
        value={search}
        onChangeText={onSearchChange}
        placeholder="Search by project, status, kind, or user"
      />

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
                  tone="neutral"
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
                      tone="info"
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
    </View>
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
    <View className="gap-4">
      <AdminDirectoryHeader
        eyebrow="Identity"
        title="User directory"
        description="Company users and their current project visibility."
        count={formatCount(totalUsers, "user")}
      />

      <View className="gap-3 web:flex-row web:items-end">
        <View className="flex-1">
          <AdminSearchInput
            value={search}
            onChangeText={onSearchChange}
            placeholder="Search by name, email, role, or project"
          />
        </View>

        <RoleFilterTabs
          value={roleFilter}
          onChange={onRoleFilterChange}
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
                  tone={user.role === "ADMIN" ? "warn" : "accent"}
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
    </View>
  );
}

function RoleFilterTabs({
  value,
  onChange,
}: {
  value: UserRole | "ALL";
  onChange: (value: UserRole | "ALL") => void;
}) {
  const options = ["ALL", ...USER_ROLE_OPTIONS] as (UserRole | "ALL")[];

  return (
    <View className="gap-2 web:min-w-[360px]">
      <Text className="text-sm font-medium text-muted">Role</Text>
      <View className="flex-row items-center gap-5 border-b border-shellLine">
        {options.map((option) => {
          const active = value === option;

          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onChange(option)}
              className={[
                "border-b-2 pb-2",
                active ? "border-accent" : "border-transparent",
              ].join(" ")}
            >
              <Text
                className={[
                  "text-sm font-semibold",
                  active ? "text-textMain" : "text-muted",
                ].join(" ")}
              >
                {option === "ALL" ? "All" : ROLE_LABEL[option]}
              </Text>
            </Pressable>
          );
        })}
      </View>
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

function AdminSearchInput({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  return (
    <View className="flex-row items-center gap-3 rounded-full border border-shellLine bg-shellChrome px-4 py-3 web:max-w-[560px] web:backdrop-blur-md">
      <Search size={18} color={SEARCH_ICON_COLOR} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={PLACEHOLDER_COLOR}
        className="flex-1 text-textMain web:outline-none"
        autoCapitalize="none"
      />
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
