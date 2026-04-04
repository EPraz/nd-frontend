import { Button, PageHeader, StatCard, Text } from "@/src/components";
import { useToast } from "@/src/context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";
import { CrewCertificateRequirementsTable } from "../../components";
import type { CrewCertificateRequirementDto } from "../../contracts";
import {
  useCrewCertificateRequirementsByProject,
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
    generateProject,
    loading: generating,
    error: generationError,
  } = useGenerateCrewCertificateRequirements(pid);

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
      uploaded: requirements.filter((row) => row.hasStructuredCertificate).length,
    };
  }, [requirements]);

  async function onGenerate() {
    try {
      const result = await generateProject();
      await refresh();
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

  return (
    <View className="gap-6 p-4 web:p-6">
      <PageHeader
        title="Crew Certificate Compliance"
        subTitle="Track crew requirements by rank and upload real evidence from each missing or outdated row."
        onRefresh={refresh}
      />

      <View className="gap-2 xl:gap-5 flex flex-row flex-wrap items-center justify-start xl:justify-between">
        <StatCard
          loading={loading}
          iconName="documents-outline"
          iconLib="ion"
          title="Requirements"
          value={String(stats.total)}
          suffix="active crew certificate requirements"
          badgeValue={String(stats.uploaded)}
          badgeColor={stats.uploaded > 0 ? "success" : "fail"}
          badgeLabel="records"
        />

        <StatCard
          loading={loading}
          iconName="alert-circle-outline"
          iconLib="ion"
          title="Missing"
          value={String(stats.missing)}
          suffix="need evidence upload"
          badgeValue={stats.missing > 0 ? "ACTION" : "OK"}
          badgeColor={stats.missing > 0 ? "fail" : "success"}
          badgeLabel="status"
        />

        <StatCard
          loading={loading}
          iconName="search-outline"
          iconLib="ion"
          title="Under Review"
          value={String(stats.underReview)}
          suffix="awaiting confirmation"
          badgeValue={stats.underReview > 0 ? "QUEUE" : "CLEAR"}
          badgeColor={stats.underReview > 0 ? "fail" : "success"}
          badgeLabel="queue"
        />

        <StatCard
          loading={loading}
          iconName="checkmark-circle-outline"
          iconLib="ion"
          title="Provided"
          value={String(stats.provided)}
          suffix="currently backed by a certificate"
          badgeValue={String(stats.expired)}
          badgeColor={stats.expired > 0 ? "fail" : "success"}
          badgeLabel="expired"
        />
      </View>

      <View className="rounded-[20px] border border-border bg-baseBg/35 p-4 gap-3">
        <Text className="text-textMain font-semibold text-[14px]">
          Crew-first compliance flow
        </Text>
        <Text className="text-muted text-[12px] leading-[18px]">
          This view is the project-level control room. Upload from a requirement
          row when the system expects a certificate for a specific rank, and use
          the crew member profile for extra certificates outside the current rule set.
        </Text>

        <View className="flex-row flex-wrap gap-2">
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
            onPress={() => router.push(`/projects/${pid}/crew`)}
            className="rounded-full"
          >
            Open crew module
          </Button>
        </View>

        {generationError ? (
          <Text className="text-[12px] text-destructive">{generationError}</Text>
        ) : null}
      </View>

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
