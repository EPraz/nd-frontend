import { RegistrySummaryStrip } from "@/src/components/ui/registryWorkspace";
import { Text } from "@/src/components/ui/text/Text";
import { useSessionContext } from "@/src/context/SessionProvider";
import { canUser } from "@/src/security/rolePermissions";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { getCrewCertificatesProjectSummaryItems } from "../helpers";
import type { CrewCertificatesProjectWorkspaceState } from "../hooks/useCrewCertificatesProjectWorkspace";
import { CrewCertificateRequirementsTable } from "./CrewCertificateRequirementsTable";
import { CrewCertificatesProjectTableActions } from "./CrewCertificatesProjectTableActions";
import { CrewMsmcComplianceSummary } from "./CrewMsmcComplianceSummary";
import type {
  CrewCertificateRequirementFilter,
  CrewCertificateSortOption,
} from "./crewCertificatesProject.constants";

export function CrewCertificatesProjectWorkspaceContent({
  projectId,
  workspace,
}: {
  projectId: string;
  workspace: CrewCertificatesProjectWorkspaceState;
}) {
  const router = useRouter();
  const { session } = useSessionContext();
  const canUploadDocuments = canUser(session, "DOCUMENT_UPLOAD");
  const [statusFilter, setStatusFilter] =
    useState<CrewCertificateRequirementFilter>("ALL");
  const [sortBy, setSortBy] = useState<CrewCertificateSortOption>("PRIORITY");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const summaryItems = useMemo(
    () => getCrewCertificatesProjectSummaryItems(workspace.stats),
    [workspace.stats],
  );

  const filteredRequirements = useMemo(() => {
    return workspace.requirements.filter((row) => {
      return statusFilter === "ALL" || row.status === statusFilter;
    });
  }, [statusFilter, workspace.requirements]);

  return (
    <View className="gap-2">
      <RegistrySummaryStrip items={summaryItems} />
      <View className="gap-2">
        {workspace.generationError ? (
          <Text className="text-[12px] text-destructive">
            {workspace.generationError}
          </Text>
        ) : null}

        {workspace.statsError ? (
          <Text className="text-[12px] text-warning">
            {workspace.statsError}
          </Text>
        ) : null}
      </View>
      <CrewMsmcComplianceSummary
        title="Fleet safe manning overview"
        summaries={workspace.msmcSummaries}
        loading={workspace.msmcLoading}
        error={workspace.msmcError}
        onRetry={workspace.refreshMsmc}
      />
      <CrewCertificateRequirementsTable
        projectId={projectId}
        title="Crew certificate requirements"
        subtitleRight={`${filteredRequirements.length} rows after filtering`}
        headerActions={
          <CrewCertificatesProjectTableActions
            statusFilter={statusFilter}
            onStatusFilterChange={(value) => {
              setStatusFilter(value);
              setShowStatusMenu(false);
            }}
            showStatusMenu={showStatusMenu}
            onToggleStatusMenu={() => setShowStatusMenu((prev) => !prev)}
            sortBy={sortBy}
            onSortChange={(value) => {
              setSortBy(value);
              setShowSortMenu(false);
            }}
            showSortMenu={showSortMenu}
            onToggleSortMenu={() => setShowSortMenu((prev) => !prev)}
          />
        }
        data={filteredRequirements}
        isLoading={workspace.loading}
        error={workspace.error}
        onRetry={workspace.refreshAll}
        sortBy={sortBy}
        canUpload={canUploadDocuments}
        onUpload={(row) =>
          router.push({
            pathname: "/projects/[projectId]/crew/certificates/upload",
            params: {
              projectId,
              assetId: row.assetId,
              crewId: row.crewMemberId,
              requirementId: row.id,
            },
          })
        }
      />
    </View>
  );
}
