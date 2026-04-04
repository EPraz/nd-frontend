import { Button, ErrorState, Loading, PageHeader, StatCard, Text } from "@/src/components";
import { useToast } from "@/src/context";
import { useCrewById } from "@/src/features/crew";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";
import {
  CrewCertificateRequirementsTable,
  CrewCertificatesTable,
} from "../../components";
import type { CrewCertificateRequirementDto } from "../../contracts";
import {
  useCrewCertificateRequirementsByCrew,
  useCrewCertificatesByCrew,
  useGenerateCrewCertificateRequirements,
} from "../../hooks";

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
    generateCrew,
    loading: generating,
    error: generationError,
  } = useGenerateCrewCertificateRequirements(pid, aid, cid);

  const stats = useMemo(() => {
    let missing = 0;
    let underReview = 0;
    let provided = 0;
    let expired = 0;

    for (const row of requirements) {
      if (row.status === "MISSING") missing += 1;
      if (row.status === "UNDER_REVIEW") underReview += 1;
      if (row.status === "PROVIDED") provided += 1;
      if (row.status === "EXPIRED") expired += 1;
    }

    return {
      total: requirements.length,
      missing,
      underReview,
      provided,
      expired,
      uploaded: certificates.length,
    };
  }, [certificates.length, requirements]);

  async function refreshAll() {
    await Promise.all([refreshCrew(), refreshRequirements(), refreshCertificates()]);
  }

  async function onGenerate() {
    try {
      const result = await generateCrew();
      await Promise.all([refreshRequirements(), refreshCertificates()]);
      show(
        `Requirements refreshed for ${result.processedCrewMembers} crew member${result.processedCrewMembers === 1 ? "" : "s"}.`,
        "success",
      );
    } catch {
      show("Failed to refresh crew certificate requirements", "error");
    }
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
            pathname: "/projects/[projectId]/crew-certificates/upload",
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

  function openUpload(row: CrewCertificateRequirementDto) {
    router.push({
      pathname: "/projects/[projectId]/crew-certificates/upload",
      params: {
        projectId: pid,
        assetId: aid,
        crewId: cid,
        requirementId: row.id,
      },
    });
  }

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
          loading={requirementsLoading}
          iconName="documents-outline"
          iconLib="ion"
          title="Requirements"
          value={String(stats.total)}
          suffix="active compliance items"
          badgeValue={String(stats.uploaded)}
          badgeColor={stats.uploaded > 0 ? "success" : "fail"}
          badgeLabel="uploaded"
        />

        <StatCard
          loading={requirementsLoading}
          iconName="alert-circle-outline"
          iconLib="ion"
          title="Missing"
          value={String(stats.missing)}
          suffix="need certificate evidence"
          badgeValue={stats.missing > 0 ? "ACTION" : "OK"}
          badgeColor={stats.missing > 0 ? "fail" : "success"}
          badgeLabel="status"
        />

        <StatCard
          loading={requirementsLoading}
          iconName="search-outline"
          iconLib="ion"
          title="Under Review"
          value={String(stats.underReview)}
          suffix="uploaded and pending confirmation"
          badgeValue={stats.underReview > 0 ? "QUEUE" : "CLEAR"}
          badgeColor={stats.underReview > 0 ? "fail" : "success"}
          badgeLabel="queue"
        />

        <StatCard
          loading={requirementsLoading}
          iconName="checkmark-circle-outline"
          iconLib="ion"
          title="Provided"
          value={String(stats.provided)}
          suffix="currently covered"
          badgeValue={String(stats.expired)}
          badgeColor={stats.expired > 0 ? "fail" : "success"}
          badgeLabel="expired"
        />
      </View>

      <View className="rounded-[20px] border border-border bg-baseBg/35 p-4 gap-3">
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
