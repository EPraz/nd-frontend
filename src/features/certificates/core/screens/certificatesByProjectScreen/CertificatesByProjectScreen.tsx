import {
  RegistrySegmentedTabs,
  RegistrySummaryStrip,
  RegistryWorkspaceHeader,
} from "@/src/components/ui/registryWorkspace";
import { Text } from "@/src/components/ui/text/Text";
import { useToast } from "@/src/context/ToastProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { CertificateRequirementsTable } from "@/src/features/certificates/requirements/components/certificateRequirementsTable/CertificateRequirementsTable";
import { CertificatesTable } from "@/src/features/certificates/core/components/certificateTable/CertificatesTable";
import {
  CertificateRequirementDto,
  CertificateStatus,
  RequirementStatus,
} from "@/src/features/certificates/shared";
import { useCertificateRequirementsByProject } from "@/src/features/certificates/requirements/hooks/useCertificateRequirementsByProject";
import { useCertificatesByProject } from "@/src/features/certificates/core/hooks/useCertificatesByProject";
import { useGenerateCertificateRequirements } from "@/src/features/certificates/requirements/hooks/useGenerateCertificateRequirements";
import { CertificatesByProjectHeaderActions } from "./CertificatesByProjectHeaderActions";
import { CertificatesByProjectTableActions } from "./CertificatesByProjectTableActions";
import { CERTIFICATES_PROJECT_TABS } from "./certificatesByProject.constants";

export default function CertificatesByProjectScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const pid = String(projectId);
  const [activeTab, setActiveTab] = useState<"requirements" | "overview">(
    "overview",
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [requirementFilter, setRequirementFilter] = useState<
    "ALL" | RequirementStatus
  >("ALL");
  const [recordStatusFilter, setRecordStatusFilter] = useState<
    "ALL" | CertificateStatus
  >("ALL");
  const [vesselQuery, setVesselQuery] = useState("");

  const { requirements, loading, error, refresh } =
    useCertificateRequirementsByProject(pid);
  const {
    certificates,
    loading: recordsLoading,
    error: recordsError,
    refresh: refreshRecords,
  } = useCertificatesByProject(pid);
  const {
    generateProject,
    loading: generating,
    error: generationError,
  } = useGenerateCertificateRequirements(pid);

  const stats = useMemo(() => {
    let missing = 0;
    let underReview = 0;
    let provided = 0;
    let expired = 0;
    let exempt = 0;

    for (const row of requirements) {
      if (row.status === "MISSING") missing += 1;
      if (row.status === "UNDER_REVIEW") underReview += 1;
      if (row.status === "PROVIDED") provided += 1;
      if (row.status === "EXPIRED") expired += 1;
      if (row.status === "EXEMPT") exempt += 1;
    }

    return {
      total: requirements.length,
      missing,
      underReview,
      provided,
      expired,
      exempt,
      uploaded: certificates.length,
    };
  }, [certificates.length, requirements]);

  const normalizedVesselQuery = vesselQuery.trim().toLowerCase();

  const filteredRequirements = useMemo(() => {
    return requirements.filter((row) => {
      const statusMatch =
        requirementFilter === "ALL" || row.status === requirementFilter;
      const vesselMatch = normalizedVesselQuery
        ? row.assetName.toLowerCase().includes(normalizedVesselQuery)
        : true;

      return statusMatch && vesselMatch;
    });
  }, [normalizedVesselQuery, requirementFilter, requirements]);

  const filteredCertificates = useMemo(() => {
    return certificates.filter((row) => {
      const statusMatch =
        recordStatusFilter === "ALL" || row.status === recordStatusFilter;
      const vesselMatch = normalizedVesselQuery
        ? (row.assetName ?? "").toLowerCase().includes(normalizedVesselQuery)
        : true;

      return statusMatch && vesselMatch;
    });
  }, [certificates, normalizedVesselQuery, recordStatusFilter]);

  useEffect(() => {
    setShowStatusMenu(false);
  }, [activeTab, isExpanded]);

  async function refreshAll() {
    await Promise.all([refresh(), refreshRecords()]);
  }

  async function onGenerate() {
    try {
      const result = await generateProject();
      await refreshAll();
      show(
        `Requirements refreshed for ${result.processedAssets} vessel${result.processedAssets === 1 ? "" : "s"}.`,
        "success",
      );
    } catch {
      show("Failed to refresh certificate requirements", "error");
    }
  }

  function openUpload(row: CertificateRequirementDto) {
    router.push({
      pathname: "/projects/[projectId]/certificates/upload",
      params: {
        projectId: pid,
        assetId: row.assetId,
        requirementId: row.id,
      },
    });
  }

  function openExtraUpload() {
    router.push({
      pathname: "/projects/[projectId]/certificates/upload",
      params: {
        projectId: pid,
      },
    });
  }

  const summaryItems = [
    {
      label: "Requirements",
      value: String(stats.total),
      helper: "active certificate requirements",
      tone: "accent" as const,
    },
    {
      label: "Missing",
      value: String(stats.missing),
      helper: "need a document upload",
      tone: stats.missing > 0 ? ("danger" as const) : ("ok" as const),
    },
    {
      label: "Under review",
      value: String(stats.underReview),
      helper: "uploaded and awaiting confirmation",
      tone: stats.underReview > 0 ? ("warn" as const) : ("ok" as const),
    },
    {
      label: "Provided",
      value: String(stats.provided),
      helper:
        stats.expired > 0
          ? `${stats.expired} expired`
          : "currently backed by a certificate",
      tone: stats.expired > 0 ? ("danger" as const) : ("ok" as const),
    },
  ];

  return (
    <View className="gap-4 p-4 web:p-6">
      <View className="gap-5">
        <RegistryWorkspaceHeader
          title="Certificates"
          eyebrow="Project compliance registry"
          actions={
            <CertificatesByProjectHeaderActions
              projectId={pid}
              onRefresh={onGenerate}
              onOpenUpload={openExtraUpload}
              loading={generating}
            />
          }
        />

        <View className="gap-3">
          <View className="flex-row flex-wrap items-center justify-between gap-3">
            <RegistrySegmentedTabs
              tabs={CERTIFICATES_PROJECT_TABS}
              activeKey={activeTab}
              onChange={setActiveTab}
            />
          </View>

          {generationError ? (
            <Text className="mt-3 text-[12px] text-destructive">
              {generationError}
            </Text>
          ) : null}
        </View>
      </View>
      {/* {true ? <View className="h-px bg-shellLine" /> : null} */}
      {!isExpanded ? <RegistrySummaryStrip items={summaryItems} /> : null}

      {activeTab === "requirements" ? (
        <CertificateRequirementsTable
          title="Vessel Requirements"
          subtitleRight={`${filteredRequirements.length} rows after filtering`}
          headerActions={
            <CertificatesByProjectTableActions
              activeTab={activeTab}
              requirementFilter={requirementFilter}
              recordStatusFilter={recordStatusFilter}
              showStatusMenu={showStatusMenu}
              onToggleStatusMenu={() => setShowStatusMenu((prev) => !prev)}
              onRequirementFilterChange={(value) => {
                setRequirementFilter(value);
                setShowStatusMenu(false);
              }}
              onRecordStatusFilterChange={(value) => {
                setRecordStatusFilter(value);
                setShowStatusMenu(false);
              }}
              vesselQuery={vesselQuery}
              onVesselQueryChange={setVesselQuery}
              isSearchOpen={isSearchOpen}
              onSearchOpenChange={setIsSearchOpen}
              isExpanded={isExpanded}
              onExpandedChange={setIsExpanded}
              onReset={() => {
                setRequirementFilter("ALL");
                setRecordStatusFilter("ALL");
                setVesselQuery("");
                setIsSearchOpen(false);
              }}
            />
          }
          toolbarContent={null}
          data={filteredRequirements}
          isLoading={loading}
          error={error}
          onRetry={refresh}
          onUpload={openUpload}
        />
      ) : (
        <View className="flex-1">
          <CertificatesTable
            title="Project Records"
            subtitleRight={`${filteredCertificates.length} rows after filtering`}
            headerActions={
              <CertificatesByProjectTableActions
                activeTab={activeTab}
                requirementFilter={requirementFilter}
                recordStatusFilter={recordStatusFilter}
                showStatusMenu={showStatusMenu}
                onToggleStatusMenu={() => setShowStatusMenu((prev) => !prev)}
                onRequirementFilterChange={(value) => {
                  setRequirementFilter(value);
                  setShowStatusMenu(false);
                }}
                onRecordStatusFilterChange={(value) => {
                  setRecordStatusFilter(value);
                  setShowStatusMenu(false);
                }}
                vesselQuery={vesselQuery}
                onVesselQueryChange={setVesselQuery}
                isSearchOpen={isSearchOpen}
                onSearchOpenChange={setIsSearchOpen}
                isExpanded={isExpanded}
                onExpandedChange={setIsExpanded}
                onReset={() => {
                  setRequirementFilter("ALL");
                  setRecordStatusFilter("ALL");
                  setVesselQuery("");
                  setIsSearchOpen(false);
                }}
              />
            }
            toolbarContent={null}
            data={filteredCertificates}
            isLoading={recordsLoading}
            error={recordsError}
            onRetry={refreshRecords}
            showVesselColumn
            sortByExpiry
          />
        </View>
      )}
    </View>
  );
}


