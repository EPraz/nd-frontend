import { ErrorState, Loading, Text } from "@/src/components";
import { ToolbarSelect } from "@/src/components/ui/forms/ToolbarSelect";
import {
  RegistryHeaderActionButton,
  RegistrySummaryStrip,
  RegistryWorkspaceHeader,
  RegistryWorkspaceSection,
  type RegistrySummaryItem,
} from "@/src/components/ui/registryWorkspace";
import {
  TableDateRangeFilter,
  TableFilterSearch,
} from "@/src/components/ui/table";
import { useSessionContext } from "@/src/context/SessionProvider";
import { useToast } from "@/src/context/ToastProvider";
import { DEFAULT_PAGE_SIZE } from "@/src/contracts/pagination.contract";
import { humanizeTechnicalLabel } from "@/src/helpers/humanizeTechnicalLabel";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { canUser } from "@/src/security/rolePermissions";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { useCrewById } from "../../../core/hooks/useCrewById";
import {
  CrewCertificateRequirementsTable,
  CrewCertificatesTable,
  CrewMsmcComplianceSummary,
} from "../../components";
import type { CrewCertificateRequirementDto } from "../../contracts";
import {
  summarizeCrewCertificateRequirements,
  summarizeCrewCertificates,
} from "../../helpers";
import {
  useCrewComplianceSummaryByAsset,
  useCrewCertificateRequirementsByCrew,
  useCrewCertificatesByCrew,
  useGenerateCrewCertificateRequirements,
} from "../../hooks";

const REQUIREMENT_STATUS_OPTIONS = [
  "ALL",
  "MISSING",
  "UNDER_REVIEW",
  "PROVIDED",
  "EXPIRED",
  "EXEMPT",
  "REQUIRED",
] as const;
const CERTIFICATE_STATUS_OPTIONS = [
  "ALL",
  "VALID",
  "EXPIRED",
  "EXPIRING_SOON",
  "PENDING",
] as const;
const WORKFLOW_STATUS_OPTIONS = [
  "ALL",
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
  "ARCHIVED",
] as const;
const CERTIFICATE_DATE_WINDOWS = [
  "ALL",
  "OVERDUE",
  "NEXT_30",
  "NEXT_90",
  "THIS_YEAR",
] as const;
const CERTIFICATE_SORT_OPTIONS = [
  "EXPIRY_ASC",
  "EXPIRY_DESC",
  "CERT_ASC",
  "UPDATED_DESC",
] as const;

export default function CrewCertificatesByCrewScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { session } = useSessionContext();
  const { projectId, assetId, crewId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
    crewId: string;
  }>();

  const pid = String(projectId);
  const aid = String(assetId);
  const cid = String(crewId);
  const canUploadDocuments = canUser(session, "DOCUMENT_UPLOAD");
  const canUpdateOperationalRecords = canUser(session, "OPERATIONAL_WRITE");
  const [requirementsPage, setRequirementsPage] = useState(1);
  const [requirementsPageSize, setRequirementsPageSize] =
    useState(DEFAULT_PAGE_SIZE);
  const [requirementsSearch, setRequirementsSearch] = useState("");
  const [requirementsStatusFilter, setRequirementsStatusFilter] =
    useState("ALL");
  const [certificatesPage, setCertificatesPage] = useState(1);
  const [certificatesPageSize, setCertificatesPageSize] =
    useState(DEFAULT_PAGE_SIZE);
  const [certificatesSearch, setCertificatesSearch] = useState("");
  const [certificatesStatusFilter, setCertificatesStatusFilter] =
    useState("ALL");
  const [workflowStatusFilter, setWorkflowStatusFilter] = useState("ALL");
  const [certificateDateWindow, setCertificateDateWindow] = useState("ALL");
  const [certificateDateFrom, setCertificateDateFrom] = useState("");
  const [certificateDateTo, setCertificateDateTo] = useState("");
  const [certificatesSort, setCertificatesSort] = useState("EXPIRY_ASC");
  const [openControl, setOpenControl] = useState<string | null>(null);
  const debouncedRequirementsSearch = useDebouncedValue(requirementsSearch, 180);
  const debouncedCertificatesSearch = useDebouncedValue(certificatesSearch, 180);

  const {
    crew,
    loading: crewLoading,
    error: crewError,
    refresh: refreshCrew,
  } = useCrewById(pid, aid, cid);
  const {
    requirements,
    pagination: requirementsPagination,
    stats: requirementsPageStats,
    loading: requirementsLoading,
    error: requirementsError,
    refresh: refreshRequirements,
  } = useCrewCertificateRequirementsByCrew(pid, aid, cid, {
    page: requirementsPage,
    pageSize: requirementsPageSize,
    search: debouncedRequirementsSearch,
    status:
      requirementsStatusFilter === "ALL" ? undefined : requirementsStatusFilter,
  });
  const {
    certificates,
    pagination: certificatesPagination,
    stats: certificatesPageStats,
    loading: certificatesLoading,
    error: certificatesError,
    refresh: refreshCertificates,
  } = useCrewCertificatesByCrew(pid, aid, cid, {
    page: certificatesPage,
    pageSize: certificatesPageSize,
    sort: certificatesSort,
    search: debouncedCertificatesSearch,
    status:
      certificatesStatusFilter === "ALL" ? undefined : certificatesStatusFilter,
    workflowStatus:
      workflowStatusFilter === "ALL" ? undefined : workflowStatusFilter,
    dateWindow:
      certificateDateWindow === "ALL" ? undefined : certificateDateWindow,
    dateFrom: certificateDateFrom,
    dateTo: certificateDateTo,
  });
  const {
    summary: msmcSummary,
    loading: msmcLoading,
    error: msmcError,
    refresh: refreshMsmc,
  } = useCrewComplianceSummaryByAsset(pid, aid);
  const {
    generateCrew,
    loading: generating,
    error: generationError,
  } = useGenerateCrewCertificateRequirements(pid, aid, cid);

  const localRequirementStats = summarizeCrewCertificateRequirements(requirements);
  const localCertificateStats = summarizeCrewCertificates(certificates);
  const requirementStats = {
    totalRequirements:
      requirementsPageStats?.total ?? localRequirementStats.totalRequirements,
    missingRequirements:
      requirementsPageStats?.missing ?? localRequirementStats.missingRequirements,
    underReviewRequirements:
      requirementsPageStats?.underReview ??
      localRequirementStats.underReviewRequirements,
  };
  const certificateStats = {
    activeCertificates:
      certificatesPageStats?.valid ?? localCertificateStats.activeCertificates,
    expiringSoonCertificates:
      certificatesPageStats?.expiringSoon ??
      localCertificateStats.expiringSoonCertificates,
  };
  const statsLoading = requirementsLoading || certificatesLoading;

  const assignedVesselName = crew?.assetName ?? crew?.asset?.name ?? "Assigned vessel";

  const summaryItems = useMemo<RegistrySummaryItem[]>(
    () => [
      {
        label: "Requirements",
        value: String(requirementStats.totalRequirements),
        helper: "active crew certificate requirements",
        tone: "accent",
      },
      {
        label: "Missing",
        value: String(requirementStats.missingRequirements),
        helper: "need evidence upload",
        tone: requirementStats.missingRequirements > 0 ? "danger" : "ok",
      },
      {
        label: "Under review",
        value: String(requirementStats.underReviewRequirements),
        helper: "awaiting confirmation",
        tone: requirementStats.underReviewRequirements > 0 ? "warn" : "ok",
      },
      {
        label: "Active certificates",
        value: String(certificateStats.activeCertificates),
        helper:
          certificateStats.expiringSoonCertificates > 0
            ? `${certificateStats.expiringSoonCertificates} expiring in 30 days`
            : "currently valid or approved",
        tone: certificateStats.expiringSoonCertificates > 0 ? "warn" : "ok",
      },
    ],
    [certificateStats.activeCertificates, certificateStats.expiringSoonCertificates, requirementStats.missingRequirements, requirementStats.totalRequirements, requirementStats.underReviewRequirements],
  );

  async function refreshAll() {
    await Promise.all([
      refreshCrew(),
      refreshRequirements(),
      refreshCertificates(),
      refreshMsmc(),
    ]);
  }

  function toggleControl(controlId: string) {
    setOpenControl((current) => (current === controlId ? null : controlId));
  }

  async function onGenerate() {
    try {
      await generateCrew();
      await Promise.all([refreshRequirements(), refreshCertificates(), refreshMsmc()]);
      show(`Requirements refreshed for ${crew?.fullName ?? "this crew member"}.`, "success");
    } catch {
      show("Failed to refresh crew certificate requirements", "error");
    }
  }

  function openUpload(row: CrewCertificateRequirementDto) {
    router.push({
      pathname: "/projects/[projectId]/crew/certificates/upload",
      params: {
        projectId: pid,
        assetId: aid,
        crewId: cid,
        requirementId: row.id,
      },
    });
  }

  function goCrewMember() {
    router.push(`/projects/${pid}/vessels/${aid}/crew/${cid}`);
  }

  if (crewLoading) return <Loading fullScreen />;
  if (crewError) return <ErrorState message={crewError} onRetry={refreshCrew} />;
  if (!crew) {
    return <ErrorState message="Crew member not found." onRetry={refreshCrew} />;
  }

  return (
    <View className="gap-5 p-4 web:p-6">
      <View className="gap-4">
        <RegistryWorkspaceHeader
          title="Certificates"
          eyebrow="Crew certificate workspace"
          subtitle={`Track rank-based requirements, uploaded evidence, and approval state for ${crew.fullName} on ${assignedVesselName}.`}
          actions={
            <>
              <RegistryHeaderActionButton
                variant="soft"
                iconName="chevron-back-outline"
                iconSide="left"
                onPress={goCrewMember}
              >
                Crew member
              </RegistryHeaderActionButton>

              <RegistryHeaderActionButton
                variant="soft"
                iconName="refresh-outline"
                onPress={refreshAll}
              >
                Refresh
              </RegistryHeaderActionButton>

              {canUpdateOperationalRecords ? (
                <RegistryHeaderActionButton
                  variant="outline"
                  onPress={onGenerate}
                  loading={generating}
                >
                  Refresh requirements
                </RegistryHeaderActionButton>
              ) : null}

              {canUploadDocuments ? (
                <RegistryHeaderActionButton
                  variant="default"
                  iconName="add-outline"
                  iconSize={15}
                  onPress={() =>
                    router.push({
                      pathname: "/projects/[projectId]/crew/certificates/upload",
                      params: {
                        projectId: pid,
                        assetId: aid,
                        crewId: cid,
                      },
                    })
                  }
                >
                  Add extra certificate
                </RegistryHeaderActionButton>
              ) : null}
            </>
          }
        />

        {!statsLoading ? <RegistrySummaryStrip items={summaryItems} /> : null}
      </View>

      <RegistryWorkspaceSection
        title="Workflow lane"
        subtitle="Upload from a requirement row when the system expects a certificate for this crew member. Use extra certificate only for supporting records outside the active rule set."
      >
        <View className="gap-4">
          <View className="flex-row flex-wrap gap-x-8 gap-y-4">
            <View className="min-w-[180px] gap-1">
              <Text className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">
                Crew member
              </Text>
              <Text className="text-[15px] font-semibold text-textMain">
                {crew.fullName}
              </Text>
            </View>

            <View className="min-w-[180px] gap-1">
              <Text className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">
                Assigned vessel
              </Text>
              <Text className="text-[15px] font-semibold text-textMain">
                {assignedVesselName}
              </Text>
            </View>

            <View className="min-w-[180px] gap-1">
              <Text className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted">
                Rank
              </Text>
              <Text className="text-[15px] font-semibold text-textMain">
                {crew.rank ?? "Not set"}
              </Text>
            </View>
          </View>

          {generationError ? (
            <Text className="text-[12px] text-destructive">{generationError}</Text>
          ) : null}
        </View>
      </RegistryWorkspaceSection>

      <CrewMsmcComplianceSummary
        title={`Safe manning context - ${assignedVesselName}`}
        summaries={msmcSummary ? [msmcSummary] : []}
        loading={msmcLoading}
        error={msmcError}
        onRetry={refreshMsmc}
      />

      <CrewCertificateRequirementsTable
        projectId={pid}
        title="Crew certificate requirements"
        subtitleRight={`${requirementsPagination?.totalItems ?? requirements.length} rows in this crew lane`}
        headerActions={
          <>
            <TableFilterSearch
              value={requirementsSearch}
              onChangeText={(value) => {
                setRequirementsSearch(value);
                setRequirementsPage(1);
              }}
              placeholder="Search requirements..."
              open={openControl === "requirements-search"}
              onOpenChange={(open) =>
                setOpenControl(open ? "requirements-search" : null)
              }
              minWidth={300}
            />
            <ToolbarSelect
              value={requirementsStatusFilter}
              options={[...REQUIREMENT_STATUS_OPTIONS]}
              open={openControl === "requirements-status"}
              onToggle={() => toggleControl("requirements-status")}
              onChange={(value) => {
                setRequirementsStatusFilter(value);
                setRequirementsPage(1);
              }}
              renderLabel={(value) =>
                value === "ALL" ? "All status" : humanizeTechnicalLabel(value)
              }
              triggerIconName="filter-outline"
              minWidth={170}
            />
          </>
        }
        data={requirements}
        isLoading={requirementsLoading}
        error={requirementsError}
        onRetry={refreshRequirements}
        onUpload={openUpload}
        canUpload={canUploadDocuments}
        pagination={
          requirementsPagination
            ? {
                meta: requirementsPagination,
                onPageChange: setRequirementsPage,
                onPageSizeChange: (nextPageSize) => {
                  setRequirementsPageSize(nextPageSize);
                  setRequirementsPage(1);
                },
              }
            : undefined
        }
      />

      <CrewCertificatesTable
        projectId={pid}
        title="Uploaded certificates"
        subtitleRight={`${certificatesPagination?.totalItems ?? certificates.length} certificate records`}
        headerActions={
          <>
            <TableFilterSearch
              value={certificatesSearch}
              onChangeText={(value) => {
                setCertificatesSearch(value);
                setCertificatesPage(1);
              }}
              placeholder="Search certificates..."
              open={openControl === "certificates-search"}
              onOpenChange={(open) =>
                setOpenControl(open ? "certificates-search" : null)
              }
              minWidth={300}
            />
            <ToolbarSelect
              value={certificatesStatusFilter}
              options={[...CERTIFICATE_STATUS_OPTIONS]}
              open={openControl === "certificates-status"}
              onToggle={() => toggleControl("certificates-status")}
              onChange={(value) => {
                setCertificatesStatusFilter(value);
                setCertificatesPage(1);
              }}
              renderLabel={(value) =>
                value === "ALL" ? "All status" : humanizeTechnicalLabel(value)
              }
              triggerIconName="shield-checkmark-outline"
              minWidth={170}
            />
            <ToolbarSelect
              value={workflowStatusFilter}
              options={[...WORKFLOW_STATUS_OPTIONS]}
              open={openControl === "certificates-workflow"}
              onToggle={() => toggleControl("certificates-workflow")}
              onChange={(value) => {
                setWorkflowStatusFilter(value);
                setCertificatesPage(1);
              }}
              renderLabel={(value) =>
                value === "ALL" ? "All workflow" : humanizeTechnicalLabel(value)
              }
              triggerIconName="git-branch-outline"
              minWidth={174}
            />
            <ToolbarSelect
              value={certificateDateWindow}
              options={[...CERTIFICATE_DATE_WINDOWS]}
              open={openControl === "certificates-date-window"}
              onToggle={() => toggleControl("certificates-date-window")}
              onChange={(value) => {
                setCertificateDateWindow(value);
                setCertificateDateFrom("");
                setCertificateDateTo("");
                setCertificatesPage(1);
              }}
              renderLabel={(value) =>
                value === "ALL" ? "All expiry" : humanizeTechnicalLabel(value)
              }
              triggerIconName="calendar-outline"
              minWidth={160}
            />
            <TableDateRangeFilter
              from={certificateDateFrom}
              to={certificateDateTo}
              open={openControl === "certificates-date-range"}
              onOpenChange={(open) =>
                setOpenControl(open ? "certificates-date-range" : null)
              }
              onFromChange={(value) => {
                setCertificateDateFrom(value);
                setCertificateDateWindow("ALL");
                setCertificatesPage(1);
              }}
              onToChange={(value) => {
                setCertificateDateTo(value);
                setCertificateDateWindow("ALL");
                setCertificatesPage(1);
              }}
              onClear={() => {
                setCertificateDateFrom("");
                setCertificateDateTo("");
                setCertificatesPage(1);
              }}
              label="Custom expiry"
            />
            <ToolbarSelect
              value={certificatesSort}
              options={[...CERTIFICATE_SORT_OPTIONS]}
              open={openControl === "certificates-sort"}
              onToggle={() => toggleControl("certificates-sort")}
              onChange={(value) => {
                setCertificatesSort(value);
                setCertificatesPage(1);
              }}
              renderLabel={renderCertificateSortLabel}
              triggerIconName="swap-vertical-outline"
              minWidth={160}
            />
          </>
        }
        data={certificates}
        isLoading={certificatesLoading}
        error={certificatesError}
        onRetry={refreshCertificates}
        pagination={
          certificatesPagination
            ? {
                meta: certificatesPagination,
                onPageChange: setCertificatesPage,
                onPageSizeChange: (nextPageSize) => {
                  setCertificatesPageSize(nextPageSize);
                  setCertificatesPage(1);
                },
              }
            : undefined
        }
      />
    </View>
  );
}

function renderCertificateSortLabel(value: string) {
  switch (value) {
    case "EXPIRY_DESC":
      return "Expiry latest";
    case "CERT_ASC":
      return "Certificate A-Z";
    case "UPDATED_DESC":
      return "Recently updated";
    case "EXPIRY_ASC":
    default:
      return "Expiry soonest";
  }
}
