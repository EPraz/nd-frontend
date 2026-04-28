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
import type { CrewCertificateSortOption } from "@/src/features/crew/certificates/components/crewCertificatesProject.constants";
import { canUser } from "@/src/security/rolePermissions";

export function CrewByAssetCertificatesWorkspaceSection({
  projectId,
  workspace,
  sortBy,
  search,
  statusFilter,
  crewStateFilter,
  onSearchChange,
  onStatusFilterChange,
  onCrewStateFilterChange,
  onSortChange,
  onPageChange,
  onPageSizeChange,
}: {
  projectId: string;
  workspace: CrewByAssetCertificatesWorkspaceState;
  sortBy: CrewCertificateSortOption;
  search: string;
  statusFilter: string;
  crewStateFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onCrewStateFilterChange: (value: string) => void;
  onSortChange: (value: CrewCertificateSortOption) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const router = useRouter();
  const { session } = useSessionContext();
  const canUploadDocuments = canUser(session, "DOCUMENT_UPLOAD");
  const [showSearch, setShowSearch] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showCrewStateMenu, setShowCrewStateMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

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
        subtitleRight={
          workspace.pagination
            ? `${workspace.pagination.totalItems} rows in scope`
            : `${workspace.requirements.length} rows currently visible`
        }
        headerActions={
          <CrewCertificatesProjectTableActions
            search={search}
            onSearchChange={onSearchChange}
            showSearch={showSearch}
            onSearchOpenChange={setShowSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={(value) => {
              onStatusFilterChange(value);
              onPageChange(1);
              setShowStatusMenu(false);
            }}
            showStatusMenu={showStatusMenu}
            onToggleStatusMenu={() => setShowStatusMenu((prev) => !prev)}
            crewStateFilter={crewStateFilter}
            onCrewStateFilterChange={(value) => {
              onCrewStateFilterChange(value);
              onPageChange(1);
              setShowCrewStateMenu(false);
            }}
            showCrewStateMenu={showCrewStateMenu}
            onToggleCrewStateMenu={() => setShowCrewStateMenu((prev) => !prev)}
            sortBy={sortBy}
            onSortChange={(value) => {
              onSortChange(value);
              setShowSortMenu(false);
            }}
            showSortMenu={showSortMenu}
            onToggleSortMenu={() => setShowSortMenu((prev) => !prev)}
          />
        }
        data={workspace.requirements}
        isLoading={workspace.loading}
        error={workspace.error}
        onRetry={workspace.refreshAll}
        sortBy={sortBy}
        pagination={
          workspace.pagination
            ? {
                meta: workspace.pagination,
                onPageChange,
                onPageSizeChange,
              }
            : undefined
        }
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
