import { WorkspaceBackdrop } from "@/src/components/layout/AtmosphericBackdrop";
import { Button } from "@/src/components/ui/button/Button";
import { Card, CardContent } from "@/src/components/ui/card/Card";
import {
  EntryPortalHeader,
  EntryPortalSummaryItem,
  EntryPortalSummaryStrip,
} from "@/src/components/ui/entryPortal";
import { RegistrySegmentedTabs } from "@/src/components/ui/registryWorkspace/RegistrySegmentedTabs";
import { Text } from "@/src/components/ui/text/Text";
import { PROJECT_MODULE_CATALOG } from "@/src/constants/projectModules";
import { useSessionContext } from "@/src/context/SessionProvider";
import { useToast } from "@/src/context/ToastProvider";
import type { AdminProjectDto, UserRole } from "@/src/contracts/admin.contract";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { canUser } from "@/src/security/rolePermissions";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { KIND_LABEL, ROLE_LABEL } from "../admin.constants";
import {
  CreateProjectPanel,
  CreateUserPanel,
  type CreateProjectFormValues,
  type CreateUserFormValues,
} from "../components/AdminCreateForms";
import {
  ProjectDirectoryTable,
  UserDirectoryTable,
} from "../components/AdminDirectoryTables";
import { ProjectAccessModal } from "../components/ProjectAccessModal";
import { useAdminWorkspace } from "../hooks/useAdminWorkspace";
import { SuperAdminHeaderActions } from "./superAdminWorkspaceScreen/SuperAdminHeaderActions";
import {
  SuperAdminWorkspaceTabs,
  type AdminWorkspaceTab,
} from "./superAdminWorkspaceScreen/SuperAdminWorkspaceTabs";

export default function SuperAdminWorkspaceScreen() {
  const router = useRouter();
  const { session } = useSessionContext();
  const { show } = useToast();
  const isAdmin = canUser(session, "USER_MANAGE");
  const {
    projects,
    users,
    loading,
    error,
    refresh,
    createProject,
    saveProjectModules,
    createUser,
    saveProjectUsers,
    savingProject,
    savingProjectModules,
    savingUser,
    savingAccess,
  } = useAdminWorkspace(isAdmin);

  const [projectSearch, setProjectSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [activeTab, setActiveTab] = useState<AdminWorkspaceTab>("projects");
  const [setupTab, setSetupTab] = useState<"project" | "user">("project");
  const [accessProject, setAccessProject] = useState<AdminProjectDto | null>(
    null,
  );
  const [draftAssignedUserIds, setDraftAssignedUserIds] = useState<string[]>(
    [],
  );
  const debouncedProjectSearch = useDebouncedValue(projectSearch);
  const debouncedUserSearch = useDebouncedValue(userSearch);

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

  const summaryItems = useMemo<EntryPortalSummaryItem[]>(
    () => [
      {
        label: "Projects",
        value: String(summary.projects),
        helper: "company workspaces available",
        tone: "accent",
      },
      {
        label: "Users",
        value: String(summary.users),
        helper: "company identities on file",
        tone: "info",
      },
      {
        label: "Assigned",
        value: String(summary.assignedUsers),
        helper: "users with project access",
        tone: "ok",
      },
      {
        label: "Admins",
        value: String(summary.admins),
        helper: "company-wide control holders",
        tone: "warn",
      },
    ],
    [summary.admins, summary.assignedUsers, summary.projects, summary.users],
  );

  const filteredProjects = useMemo(() => {
    const search = normalizeSearch(debouncedProjectSearch);
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
  }, [debouncedProjectSearch, projects]);

  const filteredUsers = useMemo(() => {
    const search = normalizeSearch(debouncedUserSearch);

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
  }, [debouncedUserSearch, projectsById, roleFilter, users]);

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

      try {
        await saveProjectModules(created.id, {
          modules: PROJECT_MODULE_CATALOG.map((module) => {
            const enabled = values.enabledModuleKeys.includes(module.key);

            return {
              key: module.key,
              enabled,
              submodules: module.submodules.map((submodule) => ({
                key: submodule.key,
                enabled: enabled && submodule.defaultEnabled,
              })),
            };
          }),
        });
      } catch {
        show(
          "Project created, but module availability needs review in Project settings.",
          "warning",
        );
        return true;
      }

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
    if (
      !values.name.trim() ||
      !values.email.trim() ||
      !values.password.trim()
    ) {
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
          <EntryPortalHeader
            eyebrow="Company control"
            title="Admin workspace"
            subtitle="Manage workspaces, user identities, and project access from the same calm control surface."
            actions={<SuperAdminHeaderActions onRefresh={refresh} />}
          />

          <EntryPortalSummaryStrip items={summaryItems} />

          <SuperAdminWorkspaceTabs
            activeKey={activeTab}
            onChange={setActiveTab}
          />

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

          {activeTab === "projects" ? (
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
          ) : null}

          {activeTab === "users" ? (
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
          ) : null}

          {activeTab === "setup" ? (
            <View className="gap-6">
              <View className="gap-2">
                <Text className="text-[11px] font-semibold uppercase tracking-[0.22em] text-shellHighlight">
                  Setup
                </Text>
                <Text className="text-[24px] font-semibold tracking-tight text-textMain">
                  Create the next access object
                </Text>
                <Text className="max-w-[720px] text-[13px] leading-6 text-muted">
                  Add one workspace or one user at a time, then verify access in
                  the directories.
                </Text>
              </View>

              <View className="gap-4">
                <RegistrySegmentedTabs
                  tabs={[
                    { key: "project", label: "Create project" },
                    { key: "user", label: "Create user" },
                  ]}
                  activeKey={setupTab}
                  onChange={setSetupTab}
                />

                {setupTab === "project" ? (
                  <CreateProjectPanel
                    saving={savingProject || savingProjectModules}
                    onSubmit={handleCreateProject}
                    onInvalid={() =>
                      show("Project name is required", "warning")
                    }
                  />
                ) : (
                  <CreateUserPanel
                    projects={projects}
                    saving={savingUser}
                    onSubmit={handleCreateUser}
                    onInvalid={() =>
                      show("Name, email, and password are required", "warning")
                    }
                  />
                )}
              </View>
            </View>
          ) : null}
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
