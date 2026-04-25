import {
  Header,
  Loading,
  Sidebar,
  Text,
  WorkspaceBackdrop,
} from "@/src/components";
import { sidebarItems, SidebarKey, sidebarRoutes } from "@/src/constants";
import { ProjectDataProvider } from "@/src/context/ProjectDataProvider";
import {
  ProjectEntitlementsProvider,
  useProjectEntitlements,
} from "@/src/context/ProjectEntitlementsProvider";
import { ProjectProvider } from "@/src/context/ProjectProvider";
import { useSessionContext } from "@/src/context/SessionProvider";
import { getGuardedProjectModule } from "@/src/helpers/projectEntitlements";
import { useProject } from "@/src/hooks/useProject";
import { canUser } from "@/src/security/rolePermissions";
import { BlurView } from "expo-blur";
import {
  Slot,
  useLocalSearchParams,
  usePathname,
  useRouter,
} from "expo-router";
import { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
export default function ProjectShellLayout() {
  const { projectId } = useLocalSearchParams<{ projectId?: string }>();
  const pid = typeof projectId === "string" ? projectId : "";

  const { project, loading, error, refresh } = useProject(pid);
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  const [collapsed, setCollapsed] = useState(true);

  const isDesktop = Platform.OS === "web" && width >= 1024;
  const showOverlay = !collapsed && !isDesktop;

  const handleSetCollapse = (value: boolean) => setCollapsed(value);

  if (!pid || loading) {
    return (
      <View className="relative flex-1 items-center justify-center bg-shellCanvas">
        <WorkspaceBackdrop />
        <Loading fullScreen className="bg-transparent" />
      </View>
    );
  }

  if (error || !project) {
    return (
      <View className="flex-1 bg-shellCanvas relative px-6 pt-10 gap-3">
        <WorkspaceBackdrop />
        <Text className="text-2xl font-semibold tracking-tight text-textMain">
          Project
        </Text>
        <Text className="text-destructive">
          {String(error ?? "Project not found")}
        </Text>

        <Pressable
          onPress={refresh}
          className="h-11 items-center justify-center rounded-xl border border-shellLine bg-shellPanel"
        >
          <Text className="font-semibold">Reintentar</Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/projects")}
          className="h-11 items-center justify-center rounded-xl border border-shellLine bg-shellPanelSoft"
        >
          <Text className="font-semibold text-textMain">Volver a Projects</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ProjectProvider
      value={{
        projectId: pid,
        projectName: project.name,
        projectKind: project.kind,
        projectStatus: project.status,
      }}
    >
      <ProjectEntitlementsProvider projectId={pid}>
        <ProjectDataProvider>
          <ProjectShellScaffold
            collapsed={collapsed}
            handleSetCollapse={handleSetCollapse}
            isDesktop={isDesktop}
            pathname={pathname}
            projectId={pid}
            projectKind={project.kind}
            showOverlay={showOverlay}
          />
        </ProjectDataProvider>
      </ProjectEntitlementsProvider>
    </ProjectProvider>
  );
}
function ProjectShellScaffold({
  collapsed,
  handleSetCollapse,
  isDesktop,
  pathname,
  projectId,
  projectKind,
  showOverlay,
}: {
  collapsed: boolean;
  handleSetCollapse: (value: boolean) => void;
  isDesktop: boolean;
  pathname: string;
  projectId: string;
  projectKind: Parameters<typeof sidebarItems>[0];
  showOverlay: boolean;
}) {
  const router = useRouter();
  const { session } = useSessionContext();
  const { isModuleEnabled, loading: entitlementsLoading } =
    useProjectEntitlements();
  const shellInset = isDesktop ? (collapsed ? 76 : 176) : 0;

  const routes = sidebarRoutes(projectId, projectKind);
  const canManageProject = canUser(session, "PROJECT_CONFIGURE");
  const items = sidebarItems(projectKind, {
    moduleEnabled: {
      vessels: isModuleEnabled("vessels"),
      certificates: isModuleEnabled("certificates"),
      crew: isModuleEnabled("crew"),
      maintenance: isModuleEnabled("maintenance"),
      fuel: isModuleEnabled("fuel"),
    },
    canManageProject,
  });

  const activeKey =
    (Object.entries(routes).find(
      ([, path]) => pathname === path || pathname.startsWith(`${path}/`),
    )?.[0] as SidebarKey) ?? "dashboard";

  const guardedModule = getGuardedProjectModule(pathname, projectId);
  const blockedModule =
    guardedModule && !isModuleEnabled(guardedModule.moduleKey)
      ? guardedModule.label
      : null;
  const isSettingsRoute =
    pathname === routes.settings || pathname.startsWith(`${routes.settings}/`);
  const blockedPermission = isSettingsRoute && !canManageProject;

  const handleChangeActive = (key: SidebarKey) => {
    const targetPath = routes[key];
    if (!targetPath) return;
    if (targetPath !== pathname) router.push(targetPath);
    if (!isDesktop) handleSetCollapse(true);
  };

  return (
    <View className="flex-1 bg-shellCanvas relative">
      <WorkspaceBackdrop />
      {showOverlay && (
        <Pressable
          onPress={() => handleSetCollapse(true)}
          className="absolute inset-0 z-10"
          accessibilityLabel="Close menu"
        >
          <BlurView intensity={8} tint="dark" style={StyleSheet.absoluteFill} />
          <View className="absolute inset-0 bg-black/40" />
        </Pressable>
      )}

      <Header
        collapsed={collapsed}
        handleSetCollapse={handleSetCollapse}
      />

      <Sidebar
        collapsed={collapsed}
        activeKey={activeKey}
        items={items}
        onChangeActive={handleChangeActive}
        onToggleCollapse={() => handleSetCollapse(!collapsed)}
        onOpenWorkspaces={() => router.push("/projects")}
      />

      <View className="flex-1 flex-row">
        <ScrollView
          className="flex-1 web:transition-all web:duration-200"
          contentContainerClassName="p-4 gap-4 web:p-6"
          contentContainerStyle={
            isDesktop ? { marginLeft: shellInset } : undefined
          }
        >
          {guardedModule && entitlementsLoading ? (
            <Loading fullScreen className="bg-transparent" />
          ) : blockedPermission ? (
            <BlockedPermissionState
              onOpenDashboard={() =>
                router.push(`/projects/${projectId}/dashboard`)
              }
            />
          ) : blockedModule ? (
            <BlockedModuleState
              label={blockedModule}
              canManageProject={canManageProject}
              onOpenDashboard={() =>
                router.push(`/projects/${projectId}/dashboard`)
              }
              onOpenSettings={() =>
                router.push(`/projects/${projectId}/settings`)
              }
            />
          ) : (
            <Slot />
          )}
        </ScrollView>
      </View>
    </View>
  );
}

function BlockedPermissionState({
  onOpenDashboard,
}: {
  onOpenDashboard: () => void;
}) {
  return (
    <View className="gap-4 rounded-[24px] border border-shellLine bg-shellPanel p-6">
      <View className="gap-2">
        <Text className="text-xl font-semibold text-textMain">
          Permission required
        </Text>
        <Text className="text-muted">
          Only admin users can manage project settings. Backend permissions still
          protect this page if someone opens the route directly.
        </Text>
      </View>

      <Pressable
        onPress={onOpenDashboard}
        className="h-11 items-center justify-center self-start rounded-xl border border-shellLine bg-shellPanelSoft px-4"
      >
        <Text className="font-semibold text-textMain">Go to dashboard</Text>
      </Pressable>
    </View>
  );
}

function BlockedModuleState({
  label,
  canManageProject,
  onOpenDashboard,
  onOpenSettings,
}: {
  label: string;
  canManageProject: boolean;
  onOpenDashboard: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <View className="rounded-[24px] border border-shellLine bg-shellPanel p-6 gap-4">
      <View className="gap-2">
        <Text className="text-xl font-semibold text-textMain">
          Module unavailable
        </Text>
        <Text className="text-muted">
          {label} is disabled for this project. Re-enable it from Project
          Settings to access this area again.
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-3">
        <Pressable
          onPress={onOpenDashboard}
          className="h-11 items-center justify-center rounded-xl border border-shellLine bg-shellPanelSoft px-4"
        >
          <Text className="font-semibold text-textMain">Go to dashboard</Text>
        </Pressable>

        {canManageProject ? (
          <Pressable
            onPress={onOpenSettings}
            className="h-11 items-center justify-center rounded-xl bg-accent px-4"
          >
            <Text className="font-semibold text-textMain">Open settings</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
