import { Button, PageHeader, StatCard, Text } from "@/src/components";
import { useToast } from "@/src/context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";
import {
  CrewCertificateRequirementsTable,
  CrewMsmcComplianceSummary,
} from "../../components";
import type { CrewCertificateRequirementDto } from "../../contracts";
import {
  useCrewCertificateOverviewStatsByProject,
  useCrewCertificateRequirementsByProject,
  useCrewComplianceSummaryByProject,
  useGenerateCrewCertificateRequirements,
} from "../../hooks";

export default function CrewCertificatesByProjectScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const pid = String(projectId);

  const { requirements, loading, error, refresh } =
    useCrewCertificateRequirementsByProject(pid);
  const {
    stats,
    loading: statsLoading,
    error: statsError,
  } = useCrewCertificateOverviewStatsByProject(pid, requirements);
  const {
    summaries: msmcSummaries,
    loading: msmcLoading,
    error: msmcError,
    refresh: refreshMsmc,
  } = useCrewComplianceSummaryByProject(pid);
  const {
    generateProject,
    loading: generating,
    error: generationError,
  } = useGenerateCrewCertificateRequirements(pid);

  async function refreshAll() {
    await Promise.all([refresh(), refreshMsmc()]);
  }

  async function onGenerate() {
    try {
      const result = await generateProject();
      await refreshAll();
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
      pathname: "/projects/[projectId]/crew-certificates/upload",
      params: {
        projectId: pid,
        assetId: row.assetId,
        crewId: row.crewMemberId,
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

      <Button
        variant="outline"
        size="sm"
        onPress={() => router.push(`/projects/${pid}/crew`)}
        className="rounded-full"
      >
        Open crew module
      </Button>
    </>
  );

  return (
    <View className="gap-6 p-4 web:p-6">
      <PageHeader
        title="Crew Certificate Compliance"
        subTitle="Track crew requirements by rank and upload real evidence from each missing or outdated row."
        onRefresh={refreshAll}
        actions={headerActions}
      />

      <View className="gap-2 xl:gap-5 flex flex-row flex-wrap items-center justify-start xl:justify-between">
        <StatCard
          loading={loading || statsLoading}
          iconName="documents-outline"
          iconLib="ion"
          title="Requirements"
          value={String(stats.totalRequirements)}
          suffix="active crew certificate requirements"
          badgeValue={String(stats.uploadedRequirements)}
          badgeColor={stats.uploadedRequirements > 0 ? "success" : "fail"}
          badgeLabel="records"
        />

        <StatCard
          loading={loading || statsLoading}
          iconName="alert-circle-outline"
          iconLib="ion"
          title="Missing"
          value={String(stats.missingRequirements)}
          suffix="need evidence upload"
          badgeValue={stats.missingRequirements > 0 ? "ACTION" : "OK"}
          badgeColor={stats.missingRequirements > 0 ? "fail" : "success"}
          badgeLabel="status"
        />

        <StatCard
          loading={loading || statsLoading}
          iconName="search-outline"
          iconLib="ion"
          title="Under Review"
          value={String(stats.underReviewRequirements)}
          suffix="awaiting confirmation"
        />

        <StatCard
          loading={loading || statsLoading}
          iconName="checkmark-circle-outline"
          iconLib="ion"
          title="Active Certificates"
          value={String(stats.activeCertificates)}
          suffix="currently valid or approved"
        />

        <StatCard
          loading={loading || statsLoading}
          iconName="time-outline"
          iconLib="ion"
          title="Expiring in 30 days"
          value={String(stats.expiringSoonCertificates)}
          suffix="need attention soon"
        />
      </View>

      <View className="rounded-[20px] border border-shellLine bg-shellPanelSoft p-4 gap-3">
        <Text className="text-textMain font-semibold text-[14px]">
          Crew-first compliance flow
        </Text>
        <Text className="text-muted text-[12px] leading-[18px]">
          This view is the project-level control room. Upload from a requirement
          row when the system expects a certificate for a specific rank, and use
          the crew member profile for extra certificates outside the current rule set.
        </Text>

        {generationError ? (
          <Text className="text-[12px] text-destructive">{generationError}</Text>
        ) : null}

        {statsError ? (
          <Text className="text-[12px] text-warning">{statsError}</Text>
        ) : null}
      </View>

      <CrewMsmcComplianceSummary
        title="MSMC fleet crew compliance"
        summaries={msmcSummaries}
        loading={msmcLoading}
        error={msmcError}
        onRetry={refreshMsmc}
      />

      <CrewCertificateRequirementsTable
        projectId={pid}
        title="Crew Requirements"
        subtitleRight="Upload from the row that is missing, expiring, or under review"
        data={requirements}
        isLoading={loading}
        error={error}
        onRetry={refresh}
        onUpload={openUpload}
      />
    </View>
  );
}
