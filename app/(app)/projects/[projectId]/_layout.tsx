import { Header, Loading, Sidebar } from "@/src/components";

import { sidebarItems, SidebarKey, sidebarRoutes } from "@/src/constants";
import { ProjectDataProvider, ProjectProvider } from "@/src/context";
import { useTheme } from "@/src/context/ThemeProvider";
import { useProject, useSession } from "@/src/hooks";

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
  Text,
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
  const { signOut } = useSession();

  const isDesktop = Platform.OS === "web" && width >= 1024;
  const showOverlay = !collapsed && !isDesktop;

  const handleSetCollapse = (value: boolean) => setCollapsed(value);

  if (!pid || loading) {
    return <Loading fullScreen />;
  }

  if (error || !project) {
    return (
      <View className="flex-1 bg-baseBg px-6 pt-10 gap-3">
        <Text className="text-2xl font-semibold tracking-tight text-surface">
          Project
        </Text>
        <Text className="text-destructive">
          {String(error ?? "Project not found")}
        </Text>

        <Pressable
          onPress={refresh}
          className="h-11 items-center justify-center rounded-xl bg-surface"
        >
          <Text className="font-semibold">Reintentar</Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/projects")}
          className="h-11 items-center justify-center rounded-xl border border-border/70 bg-surface/70"
        >
          <Text className="font-semibold text-surface">Volver a Projects</Text>
        </Pressable>
      </View>
    );
  }

  // ✅ AHORA sí: project existe
  const items = sidebarItems(project.kind);
  const routes = sidebarRoutes(pid, project.kind);

  const activeKey =
    (Object.entries(routes).find(
      ([, path]) => pathname === path || pathname.startsWith(`${path}/`),
    )?.[0] as SidebarKey) ?? "dashboard";

  const handlerOnChangeActive = (k: SidebarKey) => {
    const targetPath = routes[k];
    if (!targetPath) return; // safety (por Partial routes)
    if (targetPath !== pathname) router.push(targetPath);
    if (!isDesktop) setCollapsed(true);
  };

  return (
    <ProjectProvider
      value={{
        projectId: pid,
        projectName: project.name,
        projectKind: project.kind,
        projectStatus: project.status,
      }}
    >
      <ProjectDataProvider>
        <View className="flex-1 bg-baseBg relative">
          {showOverlay && (
            <Pressable
              onPress={() => setCollapsed(true)}
              className="absolute inset-0 z-10"
              accessibilityLabel="Close menu"
            >
              <BlurView
                intensity={8}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
              <View className="absolute inset-0 bg-black/40" />
            </Pressable>
          )}

          <Header collapsed={collapsed} handleSetCollapse={setCollapsed} />

          <Sidebar
            collapsed={collapsed}
            activeKey={activeKey}
            items={items}
            onChangeActive={handlerOnChangeActive}
            onToggleTheme={toggleTheme}
            onLogout={signOut}
            handleSetCollapse={handleSetCollapse}
          />

          <View className="flex-1 flex-row bg-baseBg">
            <ScrollView
              className="flex-1"
              contentContainerClassName="p-4 gap-4 web:p-6 web:ml-[92px]"
            >
              <Slot />
            </ScrollView>
          </View>
        </View>
      </ProjectDataProvider>
    </ProjectProvider>
  );
}
