import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  PageHeader,
  Text,
  WorkspaceBackdrop,
} from "@/src/components";
import { useSessionContext, useToast } from "@/src/context";
import type {
  AdminProjectDto,
  UserRole,
} from "@/src/contracts/admin.contract";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { KIND_LABEL, ROLE_LABEL } from "../admin.constants";
import {
  CreateProjectPanel,
  type CreateProjectFormValues,
  CreateUserPanel,
  type CreateUserFormValues,
} from "../components/AdminCreateForms";
import {
  ProjectDirectoryTable,
  UserDirectoryTable,
} from "../components/AdminDirectoryTables";
import { AdminMetricCard } from "../components/AdminPrimitives";
import { ProjectAccessModal } from "../components/ProjectAccessModal";
import { useAdminWorkspace } from "../hooks/useAdminWorkspace";

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

  const [projectSearch, setProjectSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [accessProject, setAccessProject] = useState<AdminProjectDto | null>(
    null,
  );
  const [draftAssignedUserIds, setDraftAssignedUserIds] = useState<string[]>(
    [],
  );

  const projectsById = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );

  const summary = useMemo(
    () => ({
      projects: projects.length,
      users: users.length,
      assignedUsers: users.filter((user) => user.assignedProjectIds.length > 0)
        .length,
      admins: users.filter((user) => user.role === "ADMIN").length,
    }),
    [projects, users],
  );

  const filteredProjects = useMemo(() => {
    const search = normalizeSearch(projectSearch);
    if (!search) return projects;

    return projects.filter((project) =>
      matchesSearch(search, [
        project.name,
        project.status,
        KIND_LABEL[project.kind],
        ...project.assignedUsers.flatMap((user) => [
          user.name,
          user.email,
          ROLE_LABEL[user.role],
        ]),
      ]),
    );
  }, [projectSearch, projects]);

  const filteredUsers = useMemo(() => {
    const search = normalizeSearch(userSearch);

    return users.filter((user) => {
      if (roleFilter !== "ALL" && user.role !== roleFilter) return false;
      if (!search) return true;

      return matchesSearch(search, [
        user.name,
        user.email,
        ROLE_LABEL[user.role],
        ...user.assignedProjectIds.map(
          (projectId) => projectsById.get(projectId)?.name ?? projectId,
        ),
      ]);
    });
  }, [projectsById, roleFilter, userSearch, users]);

  if (!isAdmin) {
    return (
      <View className="relative flex-1 bg-shellCanvas px-6 pt-10">
        <WorkspaceBackdrop />
        <Card className="border-shellLine bg-shellPanel">
          <CardContent className="gap-3 py-6">
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
                className="self-start rounded-full"
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

  const handleCreateProject = async (values: CreateProjectFormValues) => {
    if (!values.name.trim()) {
      show("Project name is required", "warning");
      return false;
    }

    try {
      const created = await createProject({
        name: values.name.trim(),
        kind: values.kind,
      });
      show(`Project created: ${created.name}`, "success");
      return true;
    } catch (error) {
      show(
        error instanceof Error ? error.message : "Project creation failed",
        "error",
      );
      return false;
    }
  };

  const handleCreateUser = async (values: CreateUserFormValues) => {
    if (!values.name.trim() || !values.email.trim() || !values.password.trim()) {
      show("Name, email, and password are required", "warning");
      return false;
    }

    try {
      const created = await createUser({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
        projectIds: values.projectIds,
      });
      show(`User created: ${created.email}`, "success");
      return true;
    } catch (error) {
      show(
        error instanceof Error ? error.message : "User creation failed",
        "error",
      );
      return false;
    }
  };

  const openAccessModal = (project: AdminProjectDto) => {
    setAccessProject(project);
    setDraftAssignedUserIds(project.assignedUsers.map((user) => user.id));
  };

  const handleToggleAssignedUser = (userId: string) => {
    setDraftAssignedUserIds((current) => toggleListValue(current, userId));
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
    <View className="relative flex-1 bg-shellCanvas">
      <WorkspaceBackdrop />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-10 pb-10 web:items-center"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full gap-6 web:max-w-[1480px]">
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

          <Card className="border-shellLine bg-shellPanel">
            <CardContent className="gap-6 py-6">
              <View className="gap-3 web:flex-row web:items-start web:justify-between">
                <View className="max-w-[820px] gap-2">
                  <Text className="text-[11px] uppercase tracking-[0.24em] text-accent">
                    Admin console
                  </Text>
                  <CardTitle className="text-2xl text-textMain">
                    Company setup, access assignment, and module handoff
                  </CardTitle>
                  <CardDescription className="text-sm leading-6">
                    This layer stays intentionally focused: create workspaces,
                    create users, and control project membership. Project-level
                    module and submodule switches stay inside each workspace.
                  </CardDescription>
                </View>

                <View className="self-start rounded-full border border-accent/30 bg-accent/10 px-4 py-2">
                  <Text className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    RBAC pending by design
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>

          <View className="gap-3 web:flex-row">
            <AdminMetricCard
              label="Projects"
              value={String(summary.projects)}
              caption="Company workspaces available"
              tone="accent"
            />
            <AdminMetricCard
              label="Users"
              value={String(summary.users)}
              caption="Company identities on file"
            />
            <AdminMetricCard
              label="Assigned"
              value={String(summary.assignedUsers)}
              caption="Users with explicit project access"
            />
            <AdminMetricCard
              label="Admins"
              value={String(summary.admins)}
              caption="Company-wide access holders"
            />
          </View>

          {error ? (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="gap-2 py-5">
                <Text className="font-semibold text-destructive">
                  Admin data temporarily unavailable
                </Text>
                <Text className="text-muted">{error}</Text>
              </CardContent>
            </Card>
          ) : null}

          <View className="gap-6 web:grid web:grid-cols-[minmax(0,1fr)_400px]">
            <View className="gap-6">
              <ProjectDirectoryTable
                projects={filteredProjects}
                totalProjects={projects.length}
                loading={loading}
                search={projectSearch}
                onSearchChange={setProjectSearch}
                onOpenProject={(projectId) =>
                  router.push(`/projects/${projectId}/dashboard`)
                }
                onOpenSettings={(projectId) =>
                  router.push(`/projects/${projectId}/settings`)
                }
                onManageAccess={openAccessModal}
              />

              <UserDirectoryTable
                users={filteredUsers}
                totalUsers={users.length}
                projectsById={projectsById}
                loading={loading}
                search={userSearch}
                roleFilter={roleFilter}
                onSearchChange={setUserSearch}
                onRoleFilterChange={setRoleFilter}
              />
            </View>

            <View className="gap-6">
              <Card className="border-shellLine bg-shellPanel">
                <CardContent className="gap-3 py-6">
                  <Text className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                    Setup rail
                  </Text>
                  <Text className="text-xl font-semibold text-textMain">
                    Add what the client needs, then verify access in the tables.
                  </Text>
                  <Text className="text-sm leading-6 text-muted">
                    This keeps creation compact while the directory area remains
                    the source of truth for current project membership.
                  </Text>
                </CardContent>
              </Card>

              <CreateProjectPanel
                saving={savingProject}
                onSubmit={handleCreateProject}
                onInvalid={() => show("Project name is required", "warning")}
              />

              <CreateUserPanel
                projects={projects}
                saving={savingUser}
                onSubmit={handleCreateUser}
                onInvalid={() =>
                  show("Name, email, and password are required", "warning")
                }
              />
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

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function matchesSearch(search: string, values: (string | undefined)[]) {
  return values.some((value) => value?.toLowerCase().includes(search));
}

function toggleListValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}
