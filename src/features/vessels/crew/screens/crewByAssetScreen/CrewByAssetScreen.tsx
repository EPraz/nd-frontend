import {
  RegistrySegmentedTabs,
  type RegistrySummaryItem,
  RegistrySummaryStrip,
  RegistryWorkspaceHeader,
} from "@/src/components/ui/registryWorkspace";
import { DEFAULT_PAGE_SIZE } from "@/src/contracts/pagination.contract";
import { type CrewSortOption, useCrewByAsset } from "@/src/features/crew/core";
import type { CrewCertificateSortOption } from "@/src/features/crew/certificates/components/crewCertificatesProject.constants";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import {
  normalizeVesselCrewWorkspaceTab,
  VESSEL_CREW_WORKSPACE_TABS,
  type VesselCrewWorkspaceTab,
} from "../../vesselCrewWorkspaceTabs";
import { CrewByAssetCertificatesHeaderActions } from "./CrewByAssetCertificatesHeaderActions";
import { CrewByAssetCertificatesWorkspaceSection } from "./CrewByAssetCertificatesWorkspaceSection";
import { CrewByAssetHeaderActions } from "./CrewByAssetHeaderActions";
import { CrewByAssetWorkspaceSection } from "./CrewByAssetWorkspaceSection";
import {
  getCrewByAssetStatsFromRows,
  getCrewByAssetSummaryItems,
} from "./crewByAssetWorkspace.helpers";
import { useCrewByAssetCertificatesWorkspace } from "./useCrewByAssetCertificatesWorkspace";

type VesselCrewWorkspaceConfig = {
  actions: ReactNode;
  summaryItems?: RegistrySummaryItem[];
  summaryLoading?: boolean;
  content: ReactNode;
};

export default function CrewByAssetScreen() {
  const { projectId, assetId, tab } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
    tab?: string;
  }>();

  const pid = String(projectId);
  const aid = String(assetId);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState<CrewSortOption>("ACTIVE_FIRST");
  const [crewSearch, setCrewSearch] = useState("");
  const [crewStatusFilter, setCrewStatusFilter] = useState("ALL");
  const [crewDepartmentFilter, setCrewDepartmentFilter] = useState("ALL");
  const [crewMedicalFilter, setCrewMedicalFilter] = useState("ALL");
  const [crewDateWindow, setCrewDateWindow] = useState("ALL");
  const [crewDateFrom, setCrewDateFrom] = useState("");
  const [crewDateTo, setCrewDateTo] = useState("");
  const debouncedCrewSearch = useDebouncedValue(crewSearch, 180);
  const [certificatePageNumber, setCertificatePageNumber] = useState(1);
  const [certificatePageSize, setCertificatePageSize] =
    useState(DEFAULT_PAGE_SIZE);
  const [certificateSortBy, setCertificateSortBy] =
    useState<CrewCertificateSortOption>("PRIORITY");
  const [certificateSearch, setCertificateSearch] = useState("");
  const [certificateStatusFilter, setCertificateStatusFilter] = useState("ALL");
  const [certificateCrewStateFilter, setCertificateCrewStateFilter] =
    useState("ALL");
  const debouncedCertificateSearch = useDebouncedValue(certificateSearch, 180);
  const page = useCrewByAsset(pid, aid, {
    page: pageNumber,
    pageSize,
    sort: sortBy,
    search: debouncedCrewSearch,
    status: crewStatusFilter === "ALL" ? undefined : crewStatusFilter,
    department:
      crewDepartmentFilter === "ALL" ? undefined : crewDepartmentFilter,
    medicalState: crewMedicalFilter === "ALL" ? undefined : crewMedicalFilter,
    dateWindow: crewDateWindow === "ALL" ? undefined : crewDateWindow,
    dateFrom: crewDateFrom,
    dateTo: crewDateTo,
  });
  const certificatesWorkspace = useCrewByAssetCertificatesWorkspace(pid, aid, {
    page: certificatePageNumber,
    pageSize: certificatePageSize,
    sort: certificateSortBy,
    search: debouncedCertificateSearch,
    status:
      certificateStatusFilter === "ALL" ? undefined : certificateStatusFilter,
    crewState:
      certificateCrewStateFilter === "ALL"
        ? undefined
        : certificateCrewStateFilter,
  });
  const [activeTab, setActiveTab] = useState<VesselCrewWorkspaceTab>(
    normalizeVesselCrewWorkspaceTab(tab),
  );
  const summaryItems = useMemo(
    () =>
      getCrewByAssetSummaryItems(
        page.stats ?? getCrewByAssetStatsFromRows(page.crew),
      ),
    [page.crew, page.stats],
  );

  useEffect(() => {
    setActiveTab(normalizeVesselCrewWorkspaceTab(tab));
  }, [tab]);

  const tabConfigs = useMemo<
    Record<VesselCrewWorkspaceTab, VesselCrewWorkspaceConfig>
  >(
    () => ({
      overview: {
        actions: (
          <CrewByAssetHeaderActions
            projectId={pid}
            assetId={aid}
            onRefresh={page.refresh}
          />
        ),
        summaryItems,
        summaryLoading: page.loading,
        content: (
          <CrewByAssetWorkspaceSection
            projectId={pid}
            list={page.crew}
            isLoading={page.loading}
            error={page.error}
            onRetry={page.refresh}
            pagination={page.pagination}
            onPageChange={setPageNumber}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setPageNumber(1);
            }}
            sortBy={sortBy}
            search={crewSearch}
            onSearchChange={(value) => {
              setCrewSearch(value);
              setPageNumber(1);
            }}
            statusFilter={crewStatusFilter}
            onStatusFilterChange={(value) => {
              setCrewStatusFilter(value);
              setPageNumber(1);
            }}
            departmentFilter={crewDepartmentFilter}
            onDepartmentFilterChange={(value) => {
              setCrewDepartmentFilter(value);
              setPageNumber(1);
            }}
            medicalFilter={crewMedicalFilter}
            onMedicalFilterChange={(value) => {
              setCrewMedicalFilter(value);
              setPageNumber(1);
            }}
            dateWindow={crewDateWindow}
            dateFrom={crewDateFrom}
            dateTo={crewDateTo}
            onDateWindowChange={(value) => {
              setCrewDateWindow(value);
              setCrewDateFrom("");
              setCrewDateTo("");
              setPageNumber(1);
            }}
            onDateFromChange={(value) => {
              setCrewDateFrom(value);
              setCrewDateWindow("ALL");
              setPageNumber(1);
            }}
            onDateToChange={(value) => {
              setCrewDateTo(value);
              setCrewDateWindow("ALL");
              setPageNumber(1);
            }}
            onDateRangeClear={() => {
              setCrewDateFrom("");
              setCrewDateTo("");
              setPageNumber(1);
            }}
            onSortChange={(nextSort) => {
              setSortBy(nextSort);
              setPageNumber(1);
            }}
          />
        ),
      },
      certificates: {
        actions: (
          <CrewByAssetCertificatesHeaderActions
            onRefresh={certificatesWorkspace.refreshAll}
          />
        ),
        summaryItems: certificatesWorkspace.summaryItems,
        summaryLoading:
          certificatesWorkspace.statsLoading || certificatesWorkspace.loading,
        content: (
          <CrewByAssetCertificatesWorkspaceSection
            projectId={pid}
            workspace={certificatesWorkspace}
            sortBy={certificateSortBy}
            search={certificateSearch}
            statusFilter={certificateStatusFilter}
            crewStateFilter={certificateCrewStateFilter}
            onSearchChange={(value) => {
              setCertificateSearch(value);
              setCertificatePageNumber(1);
            }}
            onStatusFilterChange={(value) => {
              setCertificateStatusFilter(value);
              setCertificatePageNumber(1);
            }}
            onCrewStateFilterChange={(value) => {
              setCertificateCrewStateFilter(value);
              setCertificatePageNumber(1);
            }}
            onSortChange={(nextSort) => {
              setCertificateSortBy(nextSort);
              setCertificatePageNumber(1);
            }}
            onPageChange={setCertificatePageNumber}
            onPageSizeChange={(nextPageSize) => {
              setCertificatePageSize(nextPageSize);
              setCertificatePageNumber(1);
            }}
          />
        ),
      },
    }),
    [
      aid,
      certificatesWorkspace,
      certificateCrewStateFilter,
      certificateSortBy,
      certificateSearch,
      certificateStatusFilter,
      page.crew,
      page.error,
      page.loading,
      page.pagination,
      page.refresh,
      pid,
      crewDateWindow,
      crewDateFrom,
      crewDateTo,
      crewDepartmentFilter,
      crewMedicalFilter,
      crewSearch,
      crewStatusFilter,
      sortBy,
      summaryItems,
    ],
  );
  const activeTabConfig = tabConfigs[activeTab];

  return (
    <View className="gap-5">
      <View className="gap-4">
        <RegistryWorkspaceHeader
          title="Crew"
          eyebrow="Vessel crew registry"
          actions={activeTabConfig.actions}
        />

        <RegistrySegmentedTabs
          tabs={VESSEL_CREW_WORKSPACE_TABS}
          activeKey={activeTab}
          onChange={setActiveTab}
        />

        {activeTabConfig.summaryItems ? (
          <RegistrySummaryStrip
            items={activeTabConfig.summaryItems}
            loading={activeTabConfig.summaryLoading}
          />
        ) : null}
      </View>

      {activeTabConfig.content}
    </View>
  );
}
