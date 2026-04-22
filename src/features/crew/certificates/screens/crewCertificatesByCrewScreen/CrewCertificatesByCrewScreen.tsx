import { Button, ErrorState, Loading, PageHeader, StatCard, Text } from "@/src/components";
import { useToast } from "@/src/context/ToastProvider";
import { useCrewById } from "../../../core/hooks/useCrewById";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";
import {
  CrewCertificateRequirementsTable,
  CrewCertificatesTable,
  CrewMsmcComplianceSummary,
} from "../../components";
import type { CrewCertificateRequirementDto } from "../../contracts";
import {
  useCrewComplianceSummaryByAsset,
  useCrewCertificateRequirementsByCrew,
  useCrewCertificatesByCrew,
  useGenerateCrewCertificateRequirements,
} from "../../hooks";
import {
  summarizeCrewCertificateRequirements,
  summarizeCrewCertificates,
} from "../../helpers";

export default function CrewCertificatesByCrewScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { projectId, assetId, crewId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
    crewId: string;
  }>();

  const pid = String(projectId);
  const aid = String(assetId);
  const cid = String(crewId);

  const { crew, loading: crewLoading, error: crewError, refresh: refreshCrew } =
    useCrewById(pid, aid, cid);
  const {
    requirements,
    loading: requirementsLoading,
    error: requirementsError,
    refresh: refreshRequirements,
  } = useCrewCertificateRequirementsByCrew(pid, aid, cid);
  const {
    certificates,
    loading: certificatesLoading,
    error: certificatesError,
    refresh: refreshCertificates,
  } = useCrewCertificatesByCrew(pid, aid, cid);
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

  const requirementStats = summarizeCrewCertificateRequirements(requirements);
  const certificateStats = summarizeCrewCertificates(certificates);
  const statsLoading = requirementsLoading || certificatesLoading;

  async function refreshAll() {
    await Promise.all([
      refreshCrew(),
      refreshRequirements(),
      refreshCertificates(),
      refreshMsmc(),
    ]);
  }

  async function onGenerate() {
    try {
      const result = await generateCrew();
      await Promise.all([
        refreshRequirements(),
        refreshCertificates(),
        refreshMsmc(),
      ]);
      show(
        `Requirements refreshed for ${result.processedCrewMembers} crew member${result.processedCrewMembers === 1 ? "" : "s"}.`,
        "success",
      );
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

  const headerActions = (
    <>
      <Button
        variant="default"
        size="sm"
        onPress={onGenerate}
        loading={generating}
        className="rounded-full"
        rightIcon={
          <Ionicons
            name="refresh-outline"
            size={16}
            className="text-textMain"
          />
        }
      >
        Refresh requirements
      </Button>

      <Button
        variant="outline"
        size="sm"
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
        className="rounded-full"
      >
        Add extra certificate
      </Button>

      <Button
        variant="icon"
        size="iconLg"
        onPress={refreshAll}
        leftIcon={
          <Ionicons
            name="refresh-outline"
            size={18}
            className="text-textMain"
          />
        }
        accessibilityLabel="Reload current data"
      />
    </>
  );

  if (crewLoading) return <Loading fullScreen />;
  if (crewError) return <ErrorState message={crewError} onRetry={refreshCrew} />;
  if (!crew) return <ErrorState message="Crew member not found." onRetry={refreshCrew} />;

  return (
    <View className="gap-6 p-4 web:p-6">
      <PageHeader
        title={`Crew Certificates - ${crew.fullName}`}
        subTitle="Manage rank-based requirements, uploaded evidence, and approval state for this crew member."
        onRefresh={refreshAll}
        actions={headerActions}
      />

      <View className="gap-2 xl:gap-5 flex flex-row flex-wrap items-center justify-start xl:justify-between">
        <StatCard
          loading={statsLoading}
          iconName="documents-outline"
          iconLib="ion"
          title="Requirements"
          value={String(requirementStats.totalRequirements)}
          suffix="active compliance items"
          badgeValue={String(requirementStats.uploadedRequirements)}
          badgeColor={requirementStats.uploadedRequirements > 0 ? "success" : "fail"}
          badgeLabel="uploaded"
        />

        <StatCard
          loading={statsLoading}
          iconName="alert-circle-outline"
          iconLib="ion"
          title="Missing"
          value={String(requirementStats.missingRequirements)}
          suffix="need certificate evidence"
          badgeValue={requirementStats.missingRequirements > 0 ? "ACTION" : "OK"}
          badgeColor={requirementStats.missingRequirements > 0 ? "fail" : "success"}
          badgeLabel="status"
        />

        <StatCard
          loading={statsLoading}
          iconName="search-outline"
          iconLib="ion"
          title="Under Review"
          value={String(requirementStats.underReviewRequirements)}
          suffix="uploaded and pending confirmation"
        />

        <StatCard
          loading={statsLoading}
          iconName="checkmark-circle-outline"
          iconLib="ion"
          title="Active Certificates"
          value={String(certificateStats.activeCertificates)}
          suffix="currently valid or approved"
        />

        <StatCard
          loading={statsLoading}
          iconName="time-outline"
          iconLib="ion"
          title="Expiring in 30 days"
          value={String(certificateStats.expiringSoonCertificates)}
          suffix="need attention soon"
        />
      </View>

      <View className="rounded-[20px] border border-shellLine bg-shellPanelSoft p-4 gap-3">
        <Text className="text-textMain font-semibold text-[14px]">
          Crew certificate flow
        </Text>
        <Text className="text-muted text-[12px] leading-[18px]">
          Upload from a requirement row when the system expects a certificate for
          this rank. Use `Add extra certificate` for supporting documents outside
          the current rule set.
        </Text>

        <Button
          variant="outline"
          size="sm"
          onPress={() => router.push(`/projects/${pid}/vessels/${aid}/crew/${cid}`)}
          className="rounded-full self-start"
        >
          Back to crew profile
        </Button>

        {generationError ? (
          <Text className="text-[12px] text-destructive">{generationError}</Text>
        ) : null}
      </View>

      <CrewMsmcComplianceSummary
        title={`MSMC compliance - ${crew.assetName ?? crew.asset?.name ?? "assigned vessel"}`}
        summaries={msmcSummary ? [msmcSummary] : []}
        loading={msmcLoading}
        error={msmcError}
        onRetry={refreshMsmc}
      />

      <CrewCertificateRequirementsTable
        projectId={pid}
        title="Crew Requirements"
        subtitleRight="Upload from the row that is missing or needs fresher evidence"
        data={requirements}
        isLoading={requirementsLoading}
        error={requirementsError}
        onRetry={refreshRequirements}
        onUpload={openUpload}
      />

      <CrewCertificatesTable
        projectId={pid}
        title="Uploaded Certificates"
        subtitleRight="Includes extra certificates outside the current requirement set"
        data={certificates}
        isLoading={certificatesLoading}
        error={certificatesError}
        onRetry={refreshCertificates}
      />
    </View>
  );
}
