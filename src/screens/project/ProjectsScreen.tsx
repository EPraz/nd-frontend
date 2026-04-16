import { Button } from "@/src/components/ui/button/Button";
import Loading from "@/src/components/ui/loading/Loading";
import { Text } from "@/src/components/ui/text/Text";
import { WorkspaceBackdrop } from "@/src/components/layout/AtmosphericBackdrop";
import { useSessionContext } from "@/src/context/SessionProvider";
import { ProjectDto, ProjectKind } from "@/src/contracts/projects.contract";
import { useProjects } from "@/src/hooks/useProjects";
import { useRouter } from "expo-router";
import { ChevronRight, LogOut, RefreshCw, Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";

const KIND_LABEL: Record<ProjectKind, string> = {
  MARITIME: "Maritime operations",
  STORE: "Retail workspace",
  BARBERSHOP: "Service workspace",
  OTHER: "Operational workspace",
};

const KIND_SHORT_LABEL: Record<ProjectKind, string> = {
  MARITIME: "Maritime",
  STORE: "Retail",
  BARBERSHOP: "Service",
  OTHER: "General",
};

function isActiveStatus(status: string) {
  return ["active", "open", "running"].includes(status.toLowerCase());
}

function statusTone(status: string) {
  const normalizedStatus = status.toLowerCase();

  if (isActiveStatus(status)) {
    return {
      dot: "bg-success",
      pill: "border-success/35 bg-success/20",
      text: "text-success",
    };
  }

  if (["paused", "on_hold", "blocked"].includes(normalizedStatus)) {
    return {
      dot: "bg-warning",
      pill: "border-warning/35 bg-warning/20",
      text: "text-warning",
    };
  }

  return {
    dot: "bg-muted",
    pill: "border-shellLine bg-shellPanelSoft",
    text: "text-muted",
  };
}

export default function ProjectsScreen() {
  const router = useRouter();
  const { projects, loading, error, refresh } = useProjects();
  const { signOut, session } = useSessionContext();
  const [query, setQuery] = useState("");
  const iconMuted = "hsl(var(--muted))";

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return projects;

    return projects.filter((project: ProjectDto) =>
      `${project.name} ${project.kind ?? ""} ${project.status}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [projects, query]);

  const metrics = useMemo(() => {
    const active = projects.filter((project) =>
      isActiveStatus(String(project.status)),
    ).length;
    const maritime = projects.filter(
      (project) => project.kind === "MARITIME",
    ).length;

    return [
      {
        label: "Workspaces",
        value: String(projects.length),
        helper: "available to this session",
      },
      {
        label: "Active",
        value: String(active),
        helper: "ready for operations",
      },
      {
        label: "Maritime",
        value: String(maritime),
        helper: "current vertical",
      },
    ];
  }, [projects]);

  if (loading) {
    return (
      <View className="relative flex-1 items-center justify-center bg-shellCanvas">
        <WorkspaceBackdrop />
        <Loading className="bg-transparent" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="relative flex-1 bg-shellCanvas">
        <WorkspaceBackdrop />
        <View className="flex-1 justify-center gap-4 px-6 web:mx-auto web:max-w-[720px]">
          <Text className="text-3xl font-semibold tracking-tight text-textMain">
            Workspace access is unavailable
          </Text>
          <Text className="text-muted">{String(error)}</Text>
          <Button
            variant="outline"
            size="lg"
            className="self-start rounded-full"
            onPress={refresh}
          >
            Retry connection
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View className="relative flex-1 bg-shellCanvas">
      <WorkspaceBackdrop />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 py-6 web:items-center web:px-8 web:py-10"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full gap-6 web:max-w-[1180px]">
          <View className="flex-row flex-wrap items-center justify-between gap-3">
            <View className="gap-1">
              <Text className="text-[11px] font-semibold uppercase tracking-[0.28em] text-shellHighlight">
                ARXIS
              </Text>
              <Text className="text-sm text-muted">
                Advanced Risk & Operational Intelligence System
              </Text>
            </View>

            <View className="flex-row flex-wrap items-center justify-end gap-2">
              {session?.role === "ADMIN" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onPress={() => router.push("/admin")}
                >
                  Admin console
                </Button>
              ) : null}

              <Button
                variant="icon"
                size="icon"
                onPress={refresh}
                accessibilityLabel="Refresh workspaces"
              >
                <RefreshCw size={17} color={iconMuted} />
              </Button>

              <Button
                variant="icon"
                size="icon"
                onPress={signOut}
                accessibilityLabel="Sign out"
              >
                <LogOut size={17} color={iconMuted} />
              </Button>
            </View>
          </View>

          <View className="overflow-hidden rounded-[34px] border border-shellLine bg-shellPanel p-5 web:p-7 web:backdrop-blur-md">
            <View className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-shellBadge" />
            <View className="absolute -bottom-20 left-10 h-40 w-40 rounded-full bg-shellGlass" />

            <View className="gap-6 web:flex-row web:items-stretch">
              <View className="min-w-[280px] flex-1 justify-between gap-8">
                <View className="gap-4">
                  <View className="self-start rounded-full border border-shellBadgeBorder bg-shellBadge px-3 py-1">
                    <Text className="text-[11px] font-semibold uppercase tracking-[0.22em] text-shellHighlight">
                      Workspace command
                    </Text>
                  </View>

                  <View className="gap-3">
                    <Text className="max-w-[680px] text-[34px] font-semibold leading-[40px] tracking-tight text-textMain web:text-[54px] web:leading-[60px]">
                      Choose the operational workspace for today&apos;s run.
                    </Text>
                    <Text className="max-w-[620px] text-[14px] leading-6 text-muted web:text-[16px]">
                      Each workspace carries its own vessels, compliance state,
                      crew readiness, maintenance activity, and enabled modules.
                    </Text>
                  </View>
                </View>

                <View className="flex-row flex-wrap gap-3">
                  {metrics.map((metric) => (
                    <View
                      key={metric.label}
                      className="min-w-[150px] flex-1 rounded-[22px] border border-shellLine bg-shellPanelSoft p-4 web:backdrop-blur-md"
                    >
                      <Text className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                        {metric.label}
                      </Text>
                      <Text className="mt-3 text-[30px] font-semibold leading-none text-textMain">
                        {metric.value}
                      </Text>
                      <Text className="mt-2 text-[12px] leading-5 text-muted">
                        {metric.helper}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View className="gap-4 rounded-[28px] border border-shellLine bg-shellChromeSoft p-4 web:w-[360px] web:backdrop-blur-md">
                <Text className="text-[12px] font-semibold uppercase tracking-[0.2em] text-muted">
                  Access layer
                </Text>
                <Text className="text-[22px] font-semibold text-textMain">
                  {session?.company?.name ?? "Operational company"}
                </Text>
                <Text className="text-sm leading-6 text-muted">
                  Signed in as {session?.name ?? "current user"}. Open a
                  workspace to continue into its active module set.
                </Text>

                <View className="rounded-[22px] border border-shellLine bg-shellPanel p-4">
                  <Text className="text-[11px] font-semibold uppercase tracking-[0.18em] text-shellHighlight">
                    Recommended path
                  </Text>
                  <Text className="mt-2 text-sm leading-6 text-muted">
                    Start with the active maritime workspace, then use Project
                    Settings only when module packaging needs to change.
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="gap-4 rounded-[28px] border border-shellLine bg-shellChrome p-4 web:flex-row web:items-center web:justify-between web:backdrop-blur-xl">
            <View className="flex-row items-center gap-3 rounded-full border border-shellLine bg-shellPanel px-4 py-3 web:min-w-[420px] web:flex-1 web:backdrop-blur-md">
              <Search size={18} color={iconMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search by workspace, vertical, or status..."
                placeholderTextColor={iconMuted}
                className="flex-1 text-textMain web:outline-none"
                autoCapitalize="none"
              />
            </View>

            <Text className="text-sm text-muted">
              Showing {filteredProjects.length} of {projects.length} workspaces
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-4">
            {filteredProjects.map((project) => {
              const tone = statusTone(String(project.status));

              return (
                <Pressable
                  key={project.id}
                  onPress={() => router.push(`/projects/${project.id}/dashboard`)}
                  className="w-full web:min-w-[360px] web:flex-1 web:cursor-pointer"
                >
                  {(state) => {
                    const hovered = Boolean(
                      (state as { hovered?: boolean }).hovered,
                    );

                    return (
                      <View
                        className={[
                          "min-h-[230px] overflow-hidden rounded-[30px] border border-shellLine bg-shellPanel p-5 transition-colors web:backdrop-blur-md",
                          hovered ? "bg-shellCardHover" : "",
                          state.pressed ? "opacity-95" : "",
                        ].join(" ")}
                      >
                        <View className="absolute right-0 top-0 h-full w-1 bg-shellHighlight" />
                        <View className="flex-1 justify-between gap-8">
                          <View className="gap-4">
                            <View className="flex-row items-center justify-between gap-3">
                              <View className="rounded-full border border-shellLine bg-shellPanelSoft px-3 py-1">
                                <Text className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                                  {KIND_SHORT_LABEL[project.kind]}
                                </Text>
                              </View>

                              <View
                                className={[
                                  "flex-row items-center gap-2 rounded-full border px-3 py-1",
                                  tone.pill,
                                ].join(" ")}
                              >
                                <View
                                  className={[
                                    "h-2 w-2 rounded-full",
                                    tone.dot,
                                  ].join(" ")}
                                />
                                <Text
                                  className={[
                                    "text-[11px] font-semibold uppercase tracking-wide",
                                    tone.text,
                                  ].join(" ")}
                                >
                                  {String(project.status)}
                                </Text>
                              </View>
                            </View>

                            <View className="gap-2">
                              <Text className="text-[26px] font-semibold leading-[32px] text-textMain">
                                {project.name}
                              </Text>
                              <Text className="max-w-[520px] text-sm leading-6 text-muted">
                                {KIND_LABEL[project.kind]} workspace configured
                                for modular operations and compliance
                                visibility.
                              </Text>
                            </View>
                          </View>

                          <View className="flex-row items-center justify-between border-t border-shellLine pt-4">
                            <Text className="text-sm font-semibold text-shellHighlight">
                              Enter workspace
                            </Text>
                            <View className="h-10 w-10 items-center justify-center rounded-full border border-shellBadgeBorder bg-shellBadge">
                              <ChevronRight
                                size={18}
                                color="hsl(var(--shell-highlight))"
                              />
                            </View>
                          </View>
                        </View>
                      </View>
                    );
                  }}
                </Pressable>
              );
            })}
          </View>

          {filteredProjects.length === 0 ? (
            <View className="items-center gap-3 rounded-[30px] border border-shellLine bg-shellPanel p-8 web:backdrop-blur-md">
              <Text className="text-lg font-semibold text-textMain">
                No workspaces match that search
              </Text>
              <Text className="max-w-[520px] text-center text-sm leading-6 text-muted">
                Clear the search or ask an administrator to assign the workspace
                to your user.
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
