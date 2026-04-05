import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardHeaderRow,
  CardTitle,
  Field,
  PageHeader,
  Text,
} from "@/src/components";
import { useSessionContext, useToast } from "@/src/context";
import type {
  AdminProjectDto,
  AdminUserDto,
  UserRole,
} from "@/src/contracts/admin.contract";
import type { ProjectKind } from "@/src/contracts/projects.contract";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useAdminWorkspace } from "../hooks/useAdminWorkspace";

const PROJECT_KIND_OPTIONS: ProjectKind[] = [
  "MARITIME",
  // "STORE",
  // "BARBERSHOP",
  // "OTHER",
];

const USER_ROLE_OPTIONS: UserRole[] = ["ADMIN", "OPS", "VIEWER"];
// const USER_ROLE_OPTIONS: UserRole[] = ["ADMIN"];

const KIND_LABEL: Record<ProjectKind, string> = {
  MARITIME: "Maritime",
  STORE: "Store",
  BARBERSHOP: "Barbershop",
  OTHER: "Other",
};

const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: "Admin",
  OPS: "Ops",
  VIEWER: "Viewer",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

export default function SuperAdminWorkspaceScreen() {
  const router = useRouter();
  const { session } = useSessionContext();
  const { show } = useToast();
  const isAdmin = session?.role === "ADMIN";
  const {
    projects,
    users,
    loading,
    error,
    refresh,
    createProject,
    createUser,
    saveProjectUsers,
    savingProject,
    savingUser,
    savingAccess,
  } = useAdminWorkspace(isAdmin);

  const [projectName, setProjectName] = useState("");
  const [projectKind, setProjectKind] = useState<ProjectKind>("MARITIME");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userRole, setUserRole] = useState<UserRole>("OPS");
  const [selectedUserProjectIds, setSelectedUserProjectIds] = useState<
    string[]
  >([]);
  const [accessProject, setAccessProject] = useState<AdminProjectDto | null>(
    null,
  );
  const [draftAssignedUserIds, setDraftAssignedUserIds] = useState<string[]>(
    [],
  );

  const summary = useMemo(
    () => ({
      projects: projects.length,
      users: users.length,
      assignedUsers: users.filter((user) => user.assignedProjectIds.length > 0)
        .length,
    }),
    [projects, users],
  );

  if (!isAdmin) {
    return (
      <View className="flex-1 bg-baseBg px-6 pt-10">
        <Card className="border-border bg-surface">
          <CardContent className="py-6 gap-3">
            <Text className="text-xl font-semibold text-textMain">
              Access restricted
            </Text>
            <Text className="text-muted">
              Only admin users can access the super admin workspace.
            </Text>
            <View className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full self-start"
                onPress={() => router.replace("/projects")}
              >
                Back to workspace portal
              </Button>
            </View>
          </CardContent>
        </Card>
      </View>
    );
  }

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      show("Project name is required", "warning");
      return;
    }

    try {
      const created = await createProject({
        name: projectName.trim(),
        kind: projectKind,
      });
      setProjectName("");
      setProjectKind("MARITIME");
      show(`Project created: ${created.name}`, "success");
    } catch (error) {
      show(
        error instanceof Error ? error.message : "Project creation failed",
        "error",
      );
    }
  };

  const handleCreateUser = async () => {
    if (!userName.trim() || !userEmail.trim() || !userPassword.trim()) {
      show("Name, email, and password are required", "warning");
      return;
    }

    try {
      const created = await createUser({
        name: userName.trim(),
        email: userEmail.trim(),
        password: userPassword,
        role: userRole,
        projectIds: selectedUserProjectIds,
      });
      setUserName("");
      setUserEmail("");
      setUserPassword("");
      setUserRole("OPS");
      setSelectedUserProjectIds([]);
      show(`User created: ${created.email}`, "success");
    } catch (error) {
      show(
        error instanceof Error ? error.message : "User creation failed",
        "error",
      );
    }
  };

  const openAccessModal = (project: AdminProjectDto) => {
    setAccessProject(project);
    setDraftAssignedUserIds(project.assignedUsers.map((user) => user.id));
  };

  const handleToggleAssignedUser = (userId: string) => {
    setDraftAssignedUserIds((current) =>
      current.includes(userId)
        ? current.filter((value) => value !== userId)
        : [...current, userId],
    );
  };

  const handleSaveProjectAccess = async () => {
    if (!accessProject) return;
    try {
      await saveProjectUsers(accessProject.id, draftAssignedUserIds);
      show(`Access updated for ${accessProject.name}`, "success");
      setAccessProject(null);
      setDraftAssignedUserIds([]);
    } catch (error) {
      show(
        error instanceof Error ? error.message : "Access update failed",
        "error",
      );
    }
  };

  return (
    <View className="flex-1 bg-baseBg">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-10 pb-10 web:items-center"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full gap-6 web:max-w-[1320px]">
          <PageHeader
            title="Super Admin Workspace"
            subTitle="Create projects, create users, assign project access, and jump into project-level module settings when needed."
            onRefresh={refresh}
            actions={
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onPress={() => router.replace("/projects")}
              >
                Back to workspaces
              </Button>
            }
          />

          <Card className="border-border bg-surface">
            <CardContent className="py-6 gap-6">
              <View className="gap-2">
                <Text className="text-[11px] uppercase tracking-[0.24em] text-muted">
                  Admin Foundation
                </Text>
                <Text className="text-xl font-semibold text-textMain">
                  Company-level control without mixing in RBAC yet
                </Text>
                <Text className="text-sm leading-6 text-muted">
                  This layer is intentionally focused on company admin basics:
                  create projects, create users, assign users to projects, and
                  keep module/submodule toggles inside each project.
                  Fine-grained user permissions stay out of scope for now.
                </Text>
              </View>

              <View className="gap-3 web:flex-row">
                <SummaryStat
                  label="Projects"
                  value={String(summary.projects)}
                  caption="Company workspaces available"
                />
                <SummaryStat
                  label="Users"
                  value={String(summary.users)}
                  caption="Company users on file"
                />
                <SummaryStat
                  label="Assigned"
                  value={String(summary.assignedUsers)}
                  caption="Users with explicit project access"
                />
              </View>
            </CardContent>
          </Card>

          {error ? (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="py-5 gap-2">
                <Text className="font-semibold text-destructive">
                  Admin data temporarily unavailable
                </Text>
                <Text className="text-muted">{error}</Text>
              </CardContent>
            </Card>
          ) : null}

          <View className="gap-6 web:flex-row web:items-start">
            <View className="flex-1 gap-6">
              <Card className="border-border bg-surface">
                <CardHeader className="gap-2">
                  <CardTitle className="text-textMain text-lg">
                    Create project
                  </CardTitle>
                  <CardDescription>
                    Add a new workspace first, then fine-tune modules from the
                    project itself.
                  </CardDescription>
                </CardHeader>

                <CardContent className="gap-5">
                  <Field
                    label="Project name"
                    value={projectName}
                    onChangeText={setProjectName}
                    placeholder="Example: Pacific Fleet Expansion"
                    autoCapitalize="words"
                    placeholderTextColor="#9AA7B8"
                  />

                  <View className="gap-2">
                    <Text className="text-sm font-medium text-textMain/80">
                      Project kind
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {PROJECT_KIND_OPTIONS.map((option) => (
                        <ChoicePill
                          key={option}
                          label={KIND_LABEL[option]}
                          active={projectKind === option}
                          onPress={() => setProjectKind(option)}
                        />
                      ))}
                    </View>
                  </View>

                  <View className="items-start">
                    <Button
                      variant="default"
                      size="sm"
                      className="rounded-full"
                      onPress={handleCreateProject}
                      loading={savingProject}
                    >
                      Create project
                    </Button>
                  </View>
                </CardContent>
              </Card>

              <Card className="border-border bg-surface">
                <CardHeaderRow className="items-start">
                  <View className="gap-2 flex-1">
                    <CardTitle className="text-textMain text-lg">
                      Project catalog
                    </CardTitle>
                    <CardDescription>
                      Project access and module entitlements stay separate:
                      assign users here, manage modules inside each project.
                    </CardDescription>
                  </View>
                  <Badge variant="secondary">
                    <Text className="text-xs uppercase">
                      {projects.length} projects
                    </Text>
                  </Badge>
                </CardHeaderRow>

                <CardContent className="gap-4">
                  {loading ? (
                    <Text className="text-muted">Loading projects...</Text>
                  ) : projects.length === 0 ? (
                    <Text className="text-muted">
                      No projects yet. Create the first one from this page.
                    </Text>
                  ) : (
                    projects.map((project) => (
                      <View
                        key={project.id}
                        className="rounded-[24px] border border-border bg-baseBg/35 p-5 gap-4"
                      >
                        <View className="flex-row items-start justify-between gap-4">
                          <View className="flex-1 gap-2">
                            <Text className="text-lg font-semibold text-textMain">
                              {project.name}
                            </Text>
                            <View className="flex-row flex-wrap items-center gap-2">
                              <MiniTag label={KIND_LABEL[project.kind]} />
                              <MiniTag label={project.status} tone="accent" />
                              <MiniTag
                                label={`${project.assignedUsers.length} assigned`}
                              />
                            </View>
                          </View>

                          <Text className="text-xs text-muted">
                            Created {formatDate(project.createdAt)}
                          </Text>
                        </View>

                        <View className="gap-2">
                          <Text className="text-xs uppercase tracking-[0.18em] text-muted">
                            Assigned users
                          </Text>
                          <View className="flex-row flex-wrap gap-2">
                            {project.assignedUsers.length === 0 ? (
                              <MiniTag label="No explicit assignments yet" />
                            ) : (
                              project.assignedUsers.map((user) => (
                                <MiniTag
                                  key={`${project.id}-${user.id}`}
                                  label={`${user.name} · ${ROLE_LABEL[user.role]}`}
                                />
                              ))
                            )}
                          </View>
                        </View>

                        <View className="flex-row flex-wrap gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onPress={() =>
                              router.push(`/projects/${project.id}/dashboard`)
                            }
                          >
                            Open project
                          </Button>
                          <Button
                            variant="softAccent"
                            size="sm"
                            className="rounded-full"
                            onPress={() =>
                              router.push(`/projects/${project.id}/settings`)
                            }
                          >
                            Project settings
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-full bg-baseBg/35"
                            onPress={() => openAccessModal(project)}
                          >
                            Manage access
                          </Button>
                        </View>
                      </View>
                    ))
                  )}
                </CardContent>
              </Card>
            </View>

            <View className="flex-1 gap-6">
              <Card className="border-border bg-surface">
                <CardHeader className="gap-2">
                  <CardTitle className="text-textMain text-lg">
                    Create user
                  </CardTitle>
                  <CardDescription>
                    Create the user here and optionally assign initial project
                    access in the same step.
                  </CardDescription>
                </CardHeader>

                <CardContent className="gap-5">
                  <Field
                    label="Full name"
                    value={userName}
                    onChangeText={setUserName}
                    placeholder="Example: Juan Perez"
                    autoCapitalize="words"
                    placeholderTextColor="#9AA7B8"
                  />
                  <Field
                    label="Email"
                    value={userEmail}
                    onChangeText={setUserEmail}
                    placeholder="juan.perez@client.test"
                    keyboardType="email-address"
                    placeholderTextColor="#9AA7B8"
                  />
                  <Field
                    label="Password"
                    value={userPassword}
                    onChangeText={setUserPassword}
                    placeholder="Use a clear but strong password"
                    secureTextEntry
                    placeholderTextColor="#9AA7B8"
                  />

                  <View className="gap-2">
                    <Text className="text-sm font-medium text-textMain/80">
                      Role
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {USER_ROLE_OPTIONS.map((option) => (
                        <ChoicePill
                          key={option}
                          label={ROLE_LABEL[option]}
                          active={userRole === option}
                          onPress={() => setUserRole(option)}
                        />
                      ))}
                    </View>
                  </View>

                  <View className="gap-3 rounded-[24px] border border-border bg-baseBg/35 p-4">
                    <View className="gap-1">
                      <Text className="text-sm font-semibold text-textMain">
                        Initial project access
                      </Text>
                      <Text className="text-sm text-muted">
                        Optional now. You can still adjust access later from
                        each project card.
                      </Text>
                    </View>

                    {projects.length === 0 ? (
                      <Text className="text-sm text-muted">
                        Create a project first to assign access here.
                      </Text>
                    ) : (
                      <View className="gap-2">
                        {projects.map((project) => (
                          <SelectRow
                            key={`create-user-${project.id}`}
                            title={project.name}
                            subtitle={KIND_LABEL[project.kind]}
                            selected={selectedUserProjectIds.includes(
                              project.id,
                            )}
                            onPress={() =>
                              setSelectedUserProjectIds((current) =>
                                current.includes(project.id)
                                  ? current.filter(
                                      (value) => value !== project.id,
                                    )
                                  : [...current, project.id],
                              )
                            }
                          />
                        ))}
                      </View>
                    )}
                  </View>

                  <View className="items-start">
                    <Button
                      variant="default"
                      size="sm"
                      className="rounded-full"
                      onPress={handleCreateUser}
                      loading={savingUser}
                    >
                      Create user
                    </Button>
                  </View>
                </CardContent>
              </Card>

              <Card className="border-border bg-surface">
                <CardHeaderRow className="items-start">
                  <View className="gap-2 flex-1">
                    <CardTitle className="text-textMain text-lg">
                      User directory
                    </CardTitle>
                    <CardDescription>
                      These are company users. Project access remains explicit
                      for non-admin roles.
                    </CardDescription>
                  </View>
                  <Badge variant="secondary">
                    <Text className="text-xs uppercase">
                      {users.length} users
                    </Text>
                  </Badge>
                </CardHeaderRow>

                <CardContent className="gap-4">
                  {loading ? (
                    <Text className="text-muted">Loading users...</Text>
                  ) : users.length === 0 ? (
                    <Text className="text-muted">
                      No users yet. Create the first client-facing user from
                      this page.
                    </Text>
                  ) : (
                    users.map((user) => (
                      <View
                        key={user.id}
                        className="rounded-[24px] border border-border bg-baseBg/35 p-5 gap-3"
                      >
                        <View className="flex-row items-start justify-between gap-4">
                          <View className="flex-1 gap-1">
                            <Text className="text-base font-semibold text-textMain">
                              {user.name}
                            </Text>
                            <Text className="text-sm text-muted">
                              {user.email}
                            </Text>
                          </View>

                          <MiniTag
                            label={ROLE_LABEL[user.role]}
                            tone="accent"
                          />
                        </View>

                        <View className="flex-row flex-wrap gap-2">
                          {user.assignedProjectIds.length === 0 ? (
                            <MiniTag label="No explicit project access" />
                          ) : (
                            user.assignedProjectIds.map((projectId) => {
                              const project = projects.find(
                                (item) => item.id === projectId,
                              );
                              return (
                                <MiniTag
                                  key={`${user.id}-${projectId}`}
                                  label={project?.name ?? projectId}
                                />
                              );
                            })
                          )}
                        </View>

                        <Text className="text-xs text-muted">
                          Created {formatDate(user.createdAt)}
                        </Text>
                      </View>
                    ))
                  )}
                </CardContent>
              </Card>
            </View>
          </View>
        </View>
      </ScrollView>

      <ProjectAccessModal
        project={accessProject}
        users={users}
        selectedUserIds={draftAssignedUserIds}
        saving={savingAccess === accessProject?.id}
        onClose={() => {
          setAccessProject(null);
          setDraftAssignedUserIds([]);
        }}
        onToggleUser={handleToggleAssignedUser}
        onSave={handleSaveProjectAccess}
      />
    </View>
  );
}

function SummaryStat({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <View className="flex-1 rounded-[24px] border border-border bg-baseBg/35 p-5 gap-2">
      <Text className="text-[11px] uppercase tracking-[0.22em] text-muted">
        {label}
      </Text>
      <Text className="text-[34px] font-semibold leading-none text-textMain">
        {value}
      </Text>
      <Text className="text-sm text-muted">{caption}</Text>
    </View>
  );
}

function ChoicePill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={[
        "rounded-full border px-4 py-2.5",
        active ? "border-accent/40 bg-accent/14" : "border-border bg-baseBg/35",
      ].join(" ")}
    >
      <Text
        className={[
          "text-sm font-semibold",
          active ? "text-accent" : "text-textMain",
        ].join(" ")}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function MiniTag({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "accent";
}) {
  return (
    <View
      className={[
        "rounded-full border px-3 py-1.5",
        tone === "accent"
          ? "border-accent/35 bg-accent/12"
          : "border-border bg-surface/70",
      ].join(" ")}
    >
      <Text
        className={[
          "text-xs font-medium",
          tone === "accent" ? "text-accent" : "text-muted",
        ].join(" ")}
      >
        {label}
      </Text>
    </View>
  );
}

function SelectRow({
  title,
  subtitle,
  selected,
  onPress,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={[
        "flex-row items-center justify-between gap-4 rounded-2xl border px-4 py-3",
        selected
          ? "border-accent/35 bg-accent/10"
          : "border-border bg-surface/70",
      ].join(" ")}
    >
      <View className="flex-1 gap-1">
        <Text className="font-semibold text-textMain">{title}</Text>
        <Text className="text-sm text-muted">{subtitle}</Text>
      </View>

      <View
        className={[
          "h-6 w-11 rounded-full px-1",
          selected ? "bg-accent/25" : "bg-baseBg/70",
        ].join(" ")}
      >
        <View
          className={[
            "mt-1 h-4 w-4 rounded-full",
            selected ? "ml-auto bg-accent" : "ml-0 bg-border",
          ].join(" ")}
        />
      </View>
    </Pressable>
  );
}

function ProjectAccessModal({
  project,
  users,
  selectedUserIds,
  saving,
  onClose,
  onToggleUser,
  onSave,
}: {
  project: AdminProjectDto | null;
  users: AdminUserDto[];
  selectedUserIds: string[];
  saving: boolean;
  onClose: () => void;
  onToggleUser: (userId: string) => void;
  onSave: () => void;
}) {
  return (
    <Modal
      visible={Boolean(project)}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center px-4">
        <Pressable className="absolute inset-0 bg-black/50" onPress={onClose} />

        <Card className="w-full max-w-[860px] border-border bg-surface p-0 overflow-hidden">
          <CardHeaderRow className="border-b border-border px-6 py-5">
            <View className="flex-1 gap-2">
              <Text className="text-[11px] uppercase tracking-[0.22em] text-muted">
                Project access
              </Text>
              <CardTitle className="text-textMain text-xl">
                {project?.name ?? "Project"}
              </CardTitle>
              <CardDescription>
                Admin users still have company-wide visibility. Use explicit
                assignments here for operational and client-facing users.
              </CardDescription>
            </View>

            <Button
              variant="icon"
              size="icon"
              onPress={onClose}
              leftIcon={
                <Feather name="x" size={16} color="hsl(var(--text-main))" />
              }
            />
          </CardHeaderRow>

          <CardContent className="py-6 gap-5">
            <View className="rounded-[24px] border border-border bg-baseBg/35 p-4">
              <Text className="text-sm text-muted">
                Select which users should appear as explicitly assigned to this
                project. This controls project visibility for non-admin users.
              </Text>
            </View>

            <ScrollView className="max-h-[380px]">
              <View className="gap-3">
                {users.length === 0 ? (
                  <Text className="text-sm text-muted">
                    Create users first before assigning project access.
                  </Text>
                ) : (
                  users.map((user) => (
                    <SelectRow
                      key={`access-${user.id}`}
                      title={user.name}
                      subtitle={`${user.email} · ${ROLE_LABEL[user.role]}`}
                      selected={selectedUserIds.includes(user.id)}
                      onPress={() => onToggleUser(user.id)}
                    />
                  ))
                )}
              </View>
            </ScrollView>

            <View className="flex-row justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onPress={onClose}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                className="rounded-full"
                onPress={onSave}
                loading={saving}
              >
                Save access
              </Button>
            </View>
          </CardContent>
        </Card>
      </View>
    </Modal>
  );
}
