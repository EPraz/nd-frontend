import { Header, Loading, Sidebar, Text, WorkspaceBackdrop } from "@/src/components";
import { sidebarItems, SidebarKey, sidebarRoutes } from "@/src/constants";
import {
  ProjectDataProvider,
  ProjectEntitlementsProvider,
  ProjectProvider,
  useProjectEntitlements,
  useSessionContext,
} from "@/src/context";
import { useTheme } from "@/src/context/ThemeProvider";
import { useProject } from "@/src/hooks";
import { BlurView } from "expo-blur";
import { Slot, useLocalSearchParams, usePathname, useRouter } from "expo-router";
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
  const { toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  const [collapsed, setCollapsed] = useState(true);
  const { signOut } = useSessionContext();

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
            signOut={signOut}
            toggleTheme={toggleTheme}
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
  signOut,
  toggleTheme,
}: {
  collapsed: boolean;
  handleSetCollapse: (value: boolean) => void;
  isDesktop: boolean;
  pathname: string;
  projectId: string;
  projectKind: Parameters<typeof sidebarItems>[0];
  showOverlay: boolean;
  signOut: () => Promise<void>;
  toggleTheme: () => void;
}) {
  const router = useRouter();
  const { session } = useSessionContext();
  const { isModuleEnabled, loading: entitlementsLoading } = useProjectEntitlements();

  const routes = sidebarRoutes(projectId, projectKind);
  const items = sidebarItems(projectKind, {
    moduleEnabled: {
      vessels: isModuleEnabled("vessels"),
      certificates: isModuleEnabled("certificates"),
      crew: isModuleEnabled("crew"),
      maintenance: isModuleEnabled("maintenance"),
      fuel: isModuleEnabled("fuel"),
    },
    canManageProject: session?.role === "ADMIN",
  });

  const activeKey =
    (Object.entries(routes).find(
      ([, path]) => pathname === path || pathname.startsWith(`${path}/`),
    )?.[0] as SidebarKey) ?? "dashboard";

  const blockedModule = getBlockedProjectModule(pathname, projectId, isModuleEnabled);
  const guardedModule = getGuardedProjectModule(pathname, projectId);

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

      <Header collapsed={collapsed} handleSetCollapse={handleSetCollapse} />

      <Sidebar
        collapsed={collapsed}
        activeKey={activeKey}
        items={items}
        onChangeActive={handleChangeActive}
        onToggleTheme={toggleTheme}
        onLogout={signOut}
        handleSetCollapse={handleSetCollapse}
      />

      <View className="flex-1 flex-row">
        <ScrollView
          className="flex-1"
          contentContainerClassName="p-4 gap-4 web:p-6 web:lg:ml-[92px]"
        >
          <View className="flex-row justify-start">
            <Pressable
              onPress={() => router.push('/projects')}
              className="h-10 flex-row items-center gap-2 rounded-full border border-shellLine bg-shellPanelSoft px-4 web:backdrop-blur-md"
            >
              <Text className="text-sm font-semibold text-textMain">
                Back to workspaces
              </Text>
            </Pressable>
          </View>

          {guardedModule && entitlementsLoading ? (
            <Loading fullScreen className="bg-transparent" />
          ) : blockedModule ? (
            <BlockedModuleState
              label={blockedModule}
              canManageProject={session?.role === "ADMIN"}
              onOpenDashboard={() => router.push(`/projects/${projectId}/dashboard`)}
              onOpenSettings={() => router.push(`/projects/${projectId}/settings`)}
            />
          ) : (
            <Slot />
          )}
        </ScrollView>
      </View>
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

function getBlockedProjectModule(
  pathname: string,
  projectId: string,
  isModuleEnabled: (moduleKey: string) => boolean,
): string | null {
  const base = `/projects/${projectId}`;

  const checks = [
    { prefix: `${base}/vessels`, label: "Vessels", key: "vessels" },
    { prefix: `${base}/certificates`, label: "Certificates", key: "certificates" },
    { prefix: `${base}/crew`, label: "Crew", key: "crew" },
    { prefix: `${base}/maintenance`, label: "Maintenance", key: "maintenance" },
    { prefix: `${base}/fuel`, label: "Fuel", key: "fuel" },
  ];

  const match = checks.find(
    (entry) => pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`),
  );

  if (!match) return null;
  return isModuleEnabled(match.key) ? null : match.label;
}

function getGuardedProjectModule(pathname: string, projectId: string): string | null {
  const base = `/projects/${projectId}`;

  const checks = [
    { prefix: `${base}/vessels`, label: "Vessels" },
    { prefix: `${base}/certificates`, label: "Certificates" },
    { prefix: `${base}/crew`, label: "Crew" },
    { prefix: `${base}/maintenance`, label: "Maintenance" },
    { prefix: `${base}/fuel`, label: "Fuel" },
  ];

  const match = checks.find(
    (entry) => pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`),
  );

  return match?.label ?? null;
}
