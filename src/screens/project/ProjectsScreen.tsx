import { WorkspaceBackdrop } from "@/src/components/layout/AtmosphericBackdrop";
import { Button } from "@/src/components/ui/button/Button";
import {
  EntryPortalHeader,
  EntryPortalSummaryItem,
  EntryPortalSummaryStrip,
} from "@/src/components/ui/entryPortal";
import Loading from "@/src/components/ui/loading/Loading";
import { Text } from "@/src/components/ui/text/Text";
import { useSessionContext } from "@/src/context/SessionProvider";
import { ProjectDto } from "@/src/contracts/projects.contract";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { canUser } from "@/src/security/rolePermissions";
import { useProjects } from "@/src/hooks/useProjects";
import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import { ScrollView, TextInput, View } from "react-native";
import { ProjectsHeaderActions } from "./projectsScreen/ProjectsHeaderActions";
import { ProjectsWorkspaceRow } from "./projectsScreen/ProjectsWorkspaceRow";
import { isActiveStatus } from "./projectsScreen/projectsScreen.constants";

const SEARCH_ICON_COLOR = "#9fb0c8";
const PLACEHOLDER_COLOR = "#8d9ab0";

export default function ProjectsScreen() {
  const router = useRouter();
  const { projects, loading, error, refresh } = useProjects();
  const { session } = useSessionContext();
  const canManageUsers = canUser(session, "USER_MANAGE");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLowerCase();

    if (!normalizedQuery) return projects;

    return projects.filter((project: ProjectDto) =>
      `${project.name} ${project.kind ?? ""} ${project.status}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [projects, debouncedQuery]);

  const summaryItems = useMemo<EntryPortalSummaryItem[]>(() => {
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
        helper: "assigned to this session",
        tone: "accent",
      },
      {
        label: "Active",
        value: String(active),
        helper: "ready for operations",
        tone: "ok",
      },
      {
        label: "Maritime",
        value: String(maritime),
        helper: "current vertical focus",
        tone: "info",
      },
      {
        label: "Access",
        value: canManageUsers ? "Admin" : "Workspace",
        helper: "current session role",
        tone: canManageUsers ? "warn" : "info",
      },
    ];
  }, [canManageUsers, projects]);

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
            size="pillSm"
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
          <EntryPortalHeader
            eyebrow="Entry portal"
            title="Workspaces"
            subtitle="Choose the right operational context and continue into its active modules without extra ceremony."
            actions={<ProjectsHeaderActions onRefresh={refresh} />}
          />

          <EntryPortalSummaryStrip items={summaryItems} />

          <View className="gap-4">
            <View className="gap-3 web:flex-row web:items-end web:justify-between">
              <View className="gap-1">
                <Text className="text-[24px] font-semibold tracking-tight text-textMain">
                  Workspace directory
                </Text>
                <Text className="text-[13px] leading-6 text-muted">
                  Select a workspace and continue directly into its operational
                  context.
                </Text>
              </View>

              <Text className="text-sm text-muted">
                Showing {filteredProjects.length} of {projects.length} workspaces
              </Text>
            </View>

            <View className="web:flex-row web:items-center web:justify-between web:gap-4">
              <View className="flex-row items-center gap-3 rounded-full border border-shellLine bg-shellChrome px-4 py-3 web:max-w-[560px] web:flex-1 web:backdrop-blur-md">
                <Search size={18} color={SEARCH_ICON_COLOR} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search by workspace, vertical, or status..."
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  className="flex-1 text-textMain web:outline-none"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {filteredProjects.length === 0 ? (
              <View className="items-center gap-3 rounded-[24px] border border-shellLine bg-shellPanel p-8">
                <Text className="text-lg font-semibold text-textMain">
                  No workspaces match that search
                </Text>
                <Text className="max-w-[520px] text-center text-sm leading-6 text-muted">
                  Clear the search or ask an administrator to assign the
                  workspace to your user.
                </Text>
              </View>
            ) : (
              <View className="overflow-hidden rounded-[24px] border border-shellLine bg-shellPanel web:backdrop-blur-md">
                <View className="hidden web:flex web:flex-row web:items-center web:border-b web:border-shellLine web:bg-shellPanelSoft web:px-5 web:py-3">
                  <Text className="flex-[2.6] text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                    Workspace
                  </Text>
                  <Text className="flex-[1.1] text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                    Vertical
                  </Text>
                  <Text className="flex-[1.05] text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                    Status
                  </Text>
                  <Text className="flex-[1.2] text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                    Opened
                  </Text>
                  <Text className="flex-[1.5] text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                    Context
                  </Text>
                  <Text className="flex-[0.95] text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                    Action
                  </Text>
                </View>

                {filteredProjects.map((project, index) => (
                  <ProjectsWorkspaceRow
                    key={project.id}
                    index={index}
                    project={project}
                    onPress={() =>
                      router.push(`/projects/${project.id}/dashboard`)
                    }
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
