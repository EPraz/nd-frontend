import { Text } from "@/src/components/ui/text/Text";
import { useSessionContext } from "@/src/context/SessionProvider";
import {
  CrewCertificateRequirementsTable,
  CrewCertificatesProjectTableActions,
  CrewMsmcComplianceSummary,
} from "@/src/features/crew/certificates";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import type { CrewByAssetCertificatesWorkspaceState } from "./useCrewByAssetCertificatesWorkspace";
import type {
  CrewCertificateRequirementFilter,
  CrewCertificateSortOption,
} from "@/src/features/crew/certificates/components/crewCertificatesProject.constants";
import { canUser } from "@/src/security/rolePermissions";

export function CrewByAssetCertificatesWorkspaceSection({
  projectId,
  workspace,
}: {
  projectId: string;
  workspace: CrewByAssetCertificatesWorkspaceState;
}) {
  const router = useRouter();
  const { session } = useSessionContext();
  const canUploadDocuments = canUser(session, "DOCUMENT_UPLOAD");
  const [statusFilter, setStatusFilter] =
    useState<CrewCertificateRequirementFilter>("ALL");
  const [sortBy, setSortBy] = useState<CrewCertificateSortOption>("PRIORITY");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const filteredRequirements = workspace.requirements.filter((row) => {
    return statusFilter === "ALL" || row.status === statusFilter;
  });

  return (
    <View className="gap-2">
      <View className="gap-2">
        {workspace.statsError ? (
          <Text className="text-[12px] text-warning">{workspace.statsError}</Text>
        ) : null}
      </View>

      <CrewMsmcComplianceSummary
        title="Safe manning overview"
        summaries={workspace.msmcSummary ? [workspace.msmcSummary] : []}
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
