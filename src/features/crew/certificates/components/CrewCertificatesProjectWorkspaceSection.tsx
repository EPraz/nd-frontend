import { DEFAULT_PAGE_SIZE } from "@/src/contracts/pagination.contract";
import { useVessels } from "@/src/features/vessels/core";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { useState } from "react";
import { useCrewCertificatesProjectWorkspace } from "../hooks/useCrewCertificatesProjectWorkspace";
import type { CrewCertificateSortOption } from "./crewCertificatesProject.constants";
import { CrewCertificatesProjectWorkspaceContent } from "./CrewCertificatesProjectWorkspaceContent";

export function CrewCertificatesProjectWorkspaceSection({
  projectId,
}: {
  projectId: string;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] =
    useState<CrewCertificateSortOption>("PRIORITY");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [assetFilter, setAssetFilter] = useState("ALL");
  const [crewStateFilter, setCrewStateFilter] = useState("ALL");
  const debouncedSearch = useDebouncedValue(search, 180);
  const { vessels } = useVessels(projectId);
  const workspace = useCrewCertificatesProjectWorkspace(projectId, {
    page,
    pageSize,
    sort: sortBy,
    search: debouncedSearch,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    assetId: assetFilter === "ALL" ? undefined : assetFilter,
    crewState: crewStateFilter === "ALL" ? undefined : crewStateFilter,
  });

  return (
    <CrewCertificatesProjectWorkspaceContent
      projectId={projectId}
      workspace={workspace}
      sortBy={sortBy}
      search={search}
      statusFilter={statusFilter}
      assetFilter={assetFilter}
      vessels={vessels}
      crewStateFilter={crewStateFilter}
      onSearchChange={(value) => {
        setSearch(value);
        setPage(1);
      }}
      onStatusFilterChange={(value) => {
        setStatusFilter(value);
        setPage(1);
      }}
      onAssetFilterChange={(value) => {
        setAssetFilter(value);
        setPage(1);
      }}
      onCrewStateFilterChange={(value) => {
        setCrewStateFilter(value);
        setPage(1);
      }}
      onSortChange={(nextSort) => {
        setSortBy(nextSort);
        setPage(1);
      }}
      onPageChange={setPage}
      onPageSizeChange={(nextPageSize) => {
        setPageSize(nextPageSize);
        setPage(1);
      }}
    />
  );
}
