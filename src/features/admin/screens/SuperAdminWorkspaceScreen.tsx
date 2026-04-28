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
import { DEFAULT_PAGE_SIZE } from "@/src/contracts/pagination.contract";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { canUser } from "@/src/security/rolePermissions";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
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
import {
  useAdminProjectPage,
  useAdminUserPage,
  useAdminWorkspace,
} from "../hooks/useAdminWorkspace";
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
  const [projectPage, setProjectPage] = useState(1);
  const [projectPageSize, setProjectPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [projectStatusFilter, setProjectStatusFilter] = useState("ALL");
  const [projectKindFilter, setProjectKindFilter] = useState("ALL");
  const [projectAssignedUserFilter, setProjectAssignedUserFilter] =
    useState("ALL");
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [userProjectFilter, setUserProjectFilter] = useState("ALL");
  const [userAccessFilter, setUserAccessFilter] = useState("ALL");
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
  const projectPageData = useAdminProjectPage(isAdmin, {
    page: projectPage,
    pageSize: projectPageSize,
    search: debouncedProjectSearch,
    status: projectStatusFilter === "ALL" ? undefined : projectStatusFilter,
    kind: projectKindFilter === "ALL" ? undefined : projectKindFilter,
    assignedUserId:
      projectAssignedUserFilter === "ALL" ? undefined : projectAssignedUserFilter,
  });
  const userPageData = useAdminUserPage(isAdmin, {
    page: userPage,
    pageSize: userPageSize,
    search: debouncedUserSearch,
    role: roleFilter === "ALL" ? undefined : roleFilter,
    projectId: userProjectFilter === "ALL" ? undefined : userProjectFilter,
    accessState: userAccessFilter === "ALL" ? undefined : userAccessFilter,
  });

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

  async function refreshAll() {
    await Promise.all([
      refresh(),
      projectPageData.refresh(),
      userPageData.refresh(),
    ]);
  }

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
      await projectPageData.refresh();
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
      await userPageData.refresh();
      await projectPageData.refresh();
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
      await Promise.all([projectPageData.refresh(), userPageData.refresh()]);
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
            actions={<SuperAdminHeaderActions onRefresh={refreshAll} />}
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
              projects={projectPageData.projects}
              totalProjects={projects.length}
              loading={loading || projectPageData.loading}
              error={projectPageData.error}
              search={projectSearch}
              onSearchChange={(value) => {
                setProjectSearch(value);
                setProjectPage(1);
              }}
              statusFilter={projectStatusFilter}
              onStatusFilterChange={(value) => {
                setProjectStatusFilter(value);
                setProjectPage(1);
              }}
              kindFilter={projectKindFilter}
              onKindFilterChange={(value) => {
                setProjectKindFilter(value);
                setProjectPage(1);
              }}
              assignedUserFilter={projectAssignedUserFilter}
              users={users}
              onAssignedUserFilterChange={(value) => {
                setProjectAssignedUserFilter(value);
                setProjectPage(1);
              }}
              pagination={projectPageData.pagination}
              onPageChange={setProjectPage}
              onPageSizeChange={(nextPageSize) => {
                setProjectPageSize(nextPageSize);
                setProjectPage(1);
              }}
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
              users={userPageData.users}
              totalUsers={users.length}
              projectsById={projectsById}
              loading={loading || userPageData.loading}
              error={userPageData.error}
              search={userSearch}
              roleFilter={roleFilter}
              projectFilter={userProjectFilter}
              accessFilter={userAccessFilter}
              projects={projects}
              onSearchChange={(value) => {
                setUserSearch(value);
                setUserPage(1);
              }}
              onRoleFilterChange={(value) => {
                setRoleFilter(value);
                setUserPage(1);
              }}
              onProjectFilterChange={(value) => {
                setUserProjectFilter(value);
                setUserPage(1);
              }}
              onAccessFilterChange={(value) => {
                setUserAccessFilter(value);
                setUserPage(1);
              }}
              pagination={userPageData.pagination}
              onPageChange={setUserPage}
              onPageSizeChange={(nextPageSize) => {
                setUserPageSize(nextPageSize);
                setUserPage(1);
              }}
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

function toggleListValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}
