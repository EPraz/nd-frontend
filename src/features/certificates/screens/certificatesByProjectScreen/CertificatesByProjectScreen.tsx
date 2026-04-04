import { Button, PageHeader, StatCard, Text } from "@/src/components";
import { useToast } from "@/src/context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";
import { CertificateRequirementsTable } from "../../components";
import { ENABLE_MANUAL_CERTIFICATE_CREATE } from "../../config";
import { CertificateRequirementDto } from "../../contracts";
import {
  useCertificateRequirementsByProject,
  useGenerateCertificateRequirements,
} from "../../hooks";

export default function CertificatesByProjectScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const pid = String(projectId);

  const { requirements, loading, error, refresh } =
    useCertificateRequirementsByProject(pid);
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
      uploaded: requirements.filter((row) => row.hasStructuredCertificate).length,
    };
  }, [requirements]);

  async function onGenerate() {
    try {
      const result = await generateProject();
      await refresh();
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

  return (
    <View className="gap-6 p-4 web:p-6">
      <PageHeader
        title="Certificate Compliance"
        subTitle="Upload documents from each vessel requirement so compliance stays grounded in real evidence."
        onRefresh={refresh}
      />

      <View className="gap-2 xl:gap-5 flex flex-row flex-wrap items-center justify-start xl:justify-between">
        <StatCard
          loading={loading}
          iconName="documents-outline"
          iconLib="ion"
          title="Requirements"
          value={String(stats.total)}
          suffix="active certificate requirements"
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
          suffix="need a document upload"
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
          suffix="uploaded and awaiting confirmation"
          badgeValue={stats.underReview > 0 ? "REVIEW" : "CLEAR"}
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
          Maritime-first flow
        </Text>
        <Text className="text-muted text-[12px] leading-[18px]">
          Requirements drive the main flow. Upload from a row when the system
          expects a certificate, or use `Add extra certificate` for documents
          that are outside the current rule set.
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
            onPress={openExtraUpload}
            className="rounded-full"
          >
            Add extra certificate
          </Button>

          {ENABLE_MANUAL_CERTIFICATE_CREATE ? (
            <Button
              variant="outline"
              size="sm"
              onPress={() => router.push(`/projects/${pid}/certificates/new`)}
              className="rounded-full"
            >
              Manual entry
            </Button>
          ) : null}
        </View>

        {generationError ? (
          <Text className="text-[12px] text-destructive">{generationError}</Text>
        ) : null}
      </View>

      <CertificateRequirementsTable
        title="Vessel Requirements"
        subtitleRight="Upload from the row that is missing or needs a fresher document"
        data={requirements}
        isLoading={loading}
        error={error}
        onRetry={refresh}
        onUpload={openUpload}
      />
    </View>
  );
}
