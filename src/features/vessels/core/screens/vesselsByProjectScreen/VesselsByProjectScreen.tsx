import {
  RegistrySegmentedTabs,
  RegistrySummaryStrip,
  RegistryWorkspaceHeader,
} from "@/src/components/ui/registryWorkspace";
import { DEFAULT_PAGE_SIZE } from "@/src/contracts/pagination.contract";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";
import {
  useVesselsPageData,
  type VesselsSortKey,
} from "../../hooks/useVesselsPageData";
import { VESSEL_WORKSPACE_TABS } from "../../../shared/vesselWorkspaceTabs";
import { VesselsOverviewHeaderActions } from "./VesselsOverviewHeaderActions";
import { VesselsOverviewWorkspaceSection } from "./VesselsOverviewWorkspaceSection";
import { getVesselWorkspaceSummaryItems } from "./vesselsWorkspace.helpers";

export default function VesselsByProjectScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const pid = String(projectId);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState<VesselsSortKey>("NAME_ASC");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 180);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [profileFilter, setProfileFilter] = useState("ALL");
  const page = useVesselsPageData(pid, {
    page: pageNumber,
    pageSize,
    sort: sortBy,
    search: debouncedSearch,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    profileState: profileFilter === "ALL" ? undefined : profileFilter,
  });
  const summaryItems = useMemo(
    () => getVesselWorkspaceSummaryItems(page.stats),
    [page.stats],
  );

  return (
    <View className="gap-4 p-4 web:p-6">
      <View className="gap-5">
        <RegistryWorkspaceHeader
          title="Vessels"
          eyebrow="Project vessel registry"
          actions={
            <VesselsOverviewHeaderActions
              projectId={pid}
              onRefresh={page.refetch}
            />
          }
        />

        <RegistrySegmentedTabs
          tabs={VESSEL_WORKSPACE_TABS}
          activeKey="overview"
          onChange={() => {}}
        />

        <RegistrySummaryStrip items={summaryItems} loading={page.isLoading} />
      </View>

      <VesselsOverviewWorkspaceSection
        projectId={pid}
        isLoading={page.isLoading}
        error={page.error}
        onRetry={page.refetch}
        list={page.list}
        pagination={page.pagination}
        onPageChange={setPageNumber}
        onPageSizeChange={(nextPageSize) => {
          setPageSize(nextPageSize);
          setPageNumber(1);
        }}
        sortBy={sortBy}
        onSortChange={(nextSort) => {
          setSortBy(nextSort);
          setPageNumber(1);
        }}
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPageNumber(1);
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          setPageNumber(1);
        }}
        profileFilter={profileFilter}
        onProfileFilterChange={(value) => {
          setProfileFilter(value);
          setPageNumber(1);
        }}
      />
    </View>
  );
}
