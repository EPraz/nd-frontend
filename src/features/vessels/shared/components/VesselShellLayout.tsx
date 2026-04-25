import { Button, ErrorState, Loading, Text } from "@/src/components";
import { useProjectEntitlements } from "@/src/context/ProjectEntitlementsProvider";
import { useProjectContext } from "@/src/context/ProjectProvider";
import { useSessionContext } from "@/src/context/SessionProvider";
import {
  getGuardedVesselSection,
  resolveVesselSectionModuleKey,
} from "@/src/helpers/projectEntitlements";
import { canUser } from "@/src/security/rolePermissions";
import { usePathname, useRouter } from "expo-router";
import { View } from "react-native";
import { useVesselShell } from "../context/VesselShellProvider";
import { VesselShellReviewFrame } from "./VesselShellReviewFrame";
import {
  buildVesselShellNavItems,
  isVesselNavItemActive,
} from "./vesselShellLayout.helpers";

export function VesselShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { projectName } = useProjectContext();
  const { session } = useSessionContext();
  const { isModuleEnabled, loading: entitlementsLoading } =
    useProjectEntitlements();
  const canManageProject = canUser(session, "PROJECT_CONFIGURE");
  const {
    projectId,
    assetId,
    vessel,
    summary,
    loading,
    vesselError,
    summaryError,
    refresh,
  } = useVesselShell();

  if (loading && !vessel) {
    return <Loading fullScreen />;
  }

  if (vesselError && !vessel) {
    return <ErrorState message={vesselError} onRetry={refresh} />;
  }

  if (!vessel) {
    return <ErrorState message="Vessel not found." onRetry={refresh} />;
  }

  const basePath = `/projects/${projectId}/vessels/${assetId}`;
  const navItems = buildVesselShellNavItems(basePath, summary).filter((item) => {
    const moduleKey = resolveVesselSectionModuleKey(item.key);
    return moduleKey ? isModuleEnabled(moduleKey) : true;
  });

  const hasDedicatedActiveSection = navItems
    .filter((item) => item.key !== "overview")
    .some((item) =>
      isVesselNavItemActive(pathname, item.href, item.key, false),
    );

  const guardedSection = getGuardedVesselSection(pathname, basePath);
  const blockedSubmodule =
    guardedSection && !isModuleEnabled(guardedSection.moduleKey)
      ? guardedSection.label
      : null;
  const guardedSubmodule = guardedSection?.label ?? null;

  if (guardedSubmodule && entitlementsLoading) {
    return <Loading fullScreen />;
  }

  if (blockedSubmodule) {
    return (
      <View className="gap-5">
        <View className="gap-4 rounded-[24px] border border-shellLine bg-shellPanel p-6 web:backdrop-blur-md">
          <View className="gap-2">
            <Text className="text-xl font-semibold text-textMain">
              Submodule unavailable
            </Text>
            <Text className="text-muted">
              {blockedSubmodule} is disabled for this project. Re-enable it from
              Project Settings to access it from the vessel shell.
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onPress={() => router.push(basePath)}
              className="rounded-full"
            >
              Back to vessel overview
            </Button>
            {canManageProject ? (
              <Button
                variant="default"
                size="sm"
                onPress={() => router.push(`/projects/${projectId}/settings`)}
                className="rounded-full"
              >
                Open settings
              </Button>
            ) : null}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="gap-5">
      <VesselShellReviewFrame
        vessel={vessel}
        summary={summary}
        projectName={projectName}
        pathname={pathname}
        navItems={navItems}
        hasDedicatedActiveSection={hasDedicatedActiveSection}
        refresh={refresh}
        onNavigate={(href) => router.push(href)}
        onOpenEdit={() => router.push(`${basePath}/edit`)}
      />

      {summaryError ? (
        <Text className="text-[12px] text-warning">
          Operational summary is temporarily unavailable. The vessel shell stays
          usable while summary data retries.
        </Text>
      ) : null}

      <View>{children}</View>
    </View>
  );
}
