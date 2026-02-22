import { Badge, Card, Loading, Separator, Text } from "@/src/components";
import { useSessionContext } from "@/src/context";
import { ProjectDto, ProjectKind } from "@/src/contracts/projects.contract";
import { useProjects } from "@/src/hooks";
import { useRouter } from "expo-router";
import { ChevronRight, LogOut, RefreshCw, Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import { FlatList, Pressable, TextInput, View } from "react-native";

const KIND_LABEL: Record<ProjectKind, string> = {
  MARITIME: "Maritime Operations",
  STORE: "Retail / Store",
  BARBERSHOP: "Service Business",
  OTHER: "General Project",
};
function statusChip(status: string) {
  const s = status.toLowerCase();
  if (["active", "open", "running"].includes(s)) return "success";
  if (["paused", "on_hold", "blocked"].includes(s)) return "warning";
  if (["closed", "archived", "inactive"].includes(s)) return "secondary";
  return "secondary";
}
export default function ProjectsScreen() {
  const router = useRouter();
  const { projects, loading, error, refresh } = useProjects();
  const { signOut } = useSessionContext();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p: ProjectDto) =>
      `${p.name} ${p.kind ?? ""} ${p.status} ${p.id}`.toLowerCase().includes(q),
    );
  }, [projects, query]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-baseBg">
        <Loading />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-baseBg px-6 pt-10 gap-3">
        <Text className="text-2xl font-semibold tracking-tight">
          Workspaces
        </Text>
        <Text className="text-destructive">{String(error)}</Text>
        <Pressable
          onPress={refresh}
          className="h-11 items-center justify-center rounded-xl bg-secondary"
        >
          <Text className="font-semibold text-secondary-foreground">
            Reintentar
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-baseBg">
      {/* Centered portal container */}
      <View className="flex-1 px-5 pt-10 web:items-center">
        <View className="w-full web:max-w-[980px] gap-6">
          {/* Header */}
          <View className="flex-row items-start justify-between gap-4">
            <View className="gap-1">
              <Text className="text-3xl font-semibold tracking-tight">
                Workspace Portal
              </Text>
              <Text className="text-sm text-muted">
                Selecciona el entorno operativo al que deseas acceder.
              </Text>
            </View>

            <View className="flex-row gap-2">
              <Pressable
                onPress={refresh}
                className="h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-surface/70 web:backdrop-blur-md web:shadow-black/40"
              >
                <RefreshCw size={18} color="#9AA7B8" />
              </Pressable>

              <Pressable
                onPress={signOut}
                className="h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-surface/70 web:backdrop-blur-md web:shadow-black/40"
              >
                <LogOut size={18} color="#9AA7B8" />
              </Pressable>
            </View>
          </View>

          {/* Search / Command bar */}
          <View className="flex-row items-center gap-3 rounded-2xl border border-border/70 bg-surface/70 px-4 py-4 web:backdrop-blur-md web:shadow-black/30">
            <Search size={18} color="#9AA7B8" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar workspace… (nombre, ID, status)"
              placeholderTextColor="#9AA7B8"
              className="flex-1 text-foreground web:outline-none"
              autoCapitalize="none"
            />
          </View>

          <Separator className="opacity-40" />

          {/* List (grid feel on web by limiting width and card style) */}
          <FlatList
            data={filtered}
            keyExtractor={(p: ProjectDto) => p.id}
            contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
            renderItem={({ item }: { item: ProjectDto }) => {
              const tone = statusChip(String(item.status));

              return (
                <Pressable
                  onPress={() => router.push(`/projects/${item.id}/dashboard`)}
                  className="active:opacity-95"
                >
                  <Card className="rounded-2xl border border-border/70 bg-surface/75 p-5 web:backdrop-blur-md web:shadow-black/40 web:hover:bg-surface/85">
                    <View className="flex-row items-start justify-between gap-4">
                      <View className="flex-1 gap-2">
                        <View className="flex-row items-center justify-between gap-3">
                          <Text className="text-textMain font-semibold text-base">
                            {item.name}
                          </Text>

                          <Badge variant={tone as any}>
                            <Text className="text-xs uppercase">
                              {String(item.status)}
                            </Text>
                          </Badge>
                        </View>

                        <Text className="text-xs text-muted">
                          {KIND_LABEL[item.kind]} • ID: {item.id}
                        </Text>

                        <View className="h-px bg-border/50" />

                        <Text className="text-xs text-muted">
                          Enter workspace →
                        </Text>
                      </View>

                      <ChevronRight size={18} color="#9AA7B8" />
                    </View>
                  </Card>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <View className="py-12 items-center gap-2">
                <Text className="text-baseBg font-semibold text-base">
                  No hay workspaces
                </Text>
                <Text className="text-sm text-muted text-center">
                  Crea un proyecto o ajusta el filtro de búsqueda.
                </Text>
              </View>
            }
          />

          {/* Footer (portal vibe) */}
          <View className="pb-6">
            <Text className="text-xs text-muted">
              Navigate Marine • Workspace Portal
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
