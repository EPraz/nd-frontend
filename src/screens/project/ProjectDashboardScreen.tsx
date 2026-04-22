import { useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { Text } from "../../components";
import { RecentActivityPanel } from "../../components/modules/recentActivity";
import {
  DashboardScopeProvider,
  useProjectContext,
  useProjectEntitlements,
} from "../../context";
import { useProjectAuditEvents } from "../../hooks/useProjectAuditEvents";
import { CommandCenterReviewLayout } from "./CommandCenterReviewLayout";

export default function ProjectDashboardScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const pid = String(projectId);
  const { projectKind } = useProjectContext();
  const { isModuleEnabled } = useProjectEntitlements();
  const auditState = useProjectAuditEvents(pid, { limit: 8 });

  return (
    <DashboardScopeProvider
      value={{ scope: "PROJECT", projectId: pid, projectKind }}
    >
      <ScrollView className="flex-1 bg-transparent">
        <View className="gap-4 p-4 web:p-0">
          <View className="flex-row flex-wrap items-start justify-between gap-3">
            <View className="gap-1">
              <Text className="text-2xl font-semibold">ARXIS Dashboard</Text>
              <Text className="text-sm text-muted">
                Vista agregada de todos los assets del proyecto.
              </Text>
            </View>
          </View>

          <CommandCenterReviewLayout projectId={pid} />

          <RecentActivityPanel
            title="Recent Activity"
            description="Latest changes across enabled project modules, using the transversal audit foundation instead of separate per-screen logic."
            events={auditState.events}
            isLoading={auditState.loading}
            error={auditState.error}
            onRetry={auditState.refresh}
            isModuleEnabled={isModuleEnabled}
            maxItems={6}
          />
        </View>
      </ScrollView>
    </DashboardScopeProvider>
  );
}
