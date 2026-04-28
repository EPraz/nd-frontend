import { RegistrySummaryStrip } from "@/src/components/ui/registryWorkspace";
import { Text } from "@/src/components/ui/text/Text";
import type { AssetDto } from "@/src/contracts/assets.contract";
import type { PaginationMetaDto } from "@/src/contracts/pagination.contract";
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
import type { CrewCertificateSortOption } from "./crewCertificatesProject.constants";

export function CrewCertificatesProjectWorkspaceContent({
  projectId,
  workspace,
  sortBy: controlledSortBy,
  search,
  statusFilter,
  assetFilter,
  vessels,
  crewStateFilter,
  onSearchChange,
  onStatusFilterChange,
  onAssetFilterChange,
  onCrewStateFilterChange,
  onSortChange,
  onPageChange,
  onPageSizeChange,
}: {
  projectId: string;
  workspace: CrewCertificatesProjectWorkspaceState;
  sortBy?: CrewCertificateSortOption;
  search: string;
  statusFilter: string;
  assetFilter: string;
  vessels: AssetDto[];
  crewStateFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onAssetFilterChange: (value: string) => void;
  onCrewStateFilterChange: (value: string) => void;
  onSortChange?: (value: CrewCertificateSortOption) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}) {
  const router = useRouter();
  const { session } = useSessionContext();
  const canUploadDocuments = canUser(session, "DOCUMENT_UPLOAD");
  const [localSortBy, setLocalSortBy] =
    useState<CrewCertificateSortOption>("PRIORITY");
  const [showSearch, setShowSearch] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showAssetMenu, setShowAssetMenu] = useState(false);
  const [showCrewStateMenu, setShowCrewStateMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortBy = controlledSortBy ?? localSortBy;

  const summaryItems = useMemo(
    () => getCrewCertificatesProjectSummaryItems(workspace.stats),
    [workspace.stats],
  );

  return (
    <View className="gap-2">
      <RegistrySummaryStrip
        items={summaryItems}
        loading={workspace.statsLoading || workspace.loading}
      />
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
              onPageChange?.(1);
              setShowStatusMenu(false);
            }}
            showStatusMenu={showStatusMenu}
            onToggleStatusMenu={() => setShowStatusMenu((prev) => !prev)}
            assetFilter={assetFilter}
            vessels={vessels}
            onAssetFilterChange={(value) => {
              onAssetFilterChange(value);
              onPageChange?.(1);
              setShowAssetMenu(false);
            }}
            showAssetMenu={showAssetMenu}
            onToggleAssetMenu={() => setShowAssetMenu((prev) => !prev)}
            crewStateFilter={crewStateFilter}
            onCrewStateFilterChange={(value) => {
              onCrewStateFilterChange(value);
              onPageChange?.(1);
              setShowCrewStateMenu(false);
            }}
            showCrewStateMenu={showCrewStateMenu}
            onToggleCrewStateMenu={() => setShowCrewStateMenu((prev) => !prev)}
            sortBy={sortBy}
            onSortChange={(value) => {
              if (onSortChange) onSortChange(value);
              else setLocalSortBy(value);
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
          workspace.pagination && onPageChange
            ? {
                meta: workspace.pagination as PaginationMetaDto,
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
