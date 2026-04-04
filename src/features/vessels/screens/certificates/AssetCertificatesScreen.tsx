import { Button, PageHeader, StatCard, Text } from "@/src/components";
import { ToolbarSelect } from "@/src/components/ui";
import { useToast } from "@/src/context";
import { humanizeTechnicalLabel } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import {
  CertificateRequirementsTable,
  CertificatesTable,
} from "@/src/features/certificates/components";
import { ENABLE_MANUAL_CERTIFICATE_CREATE } from "@/src/features/certificates/config";
import {
  CertificateRequirementDto,
  CertificateStatus,
  RequirementStatus,
} from "@/src/features/certificates/contracts";
import {
  useCertificateRequirementsByAsset,
  useGenerateCertificateRequirements,
} from "@/src/features/certificates/hooks";
import { useCertificatesByAsset } from "@/src/hooks";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";

const REQUIREMENT_FILTERS: ("ALL" | RequirementStatus)[] = [
  "ALL",
  "MISSING",
  "UNDER_REVIEW",
  "PROVIDED",
  "EXPIRED",
  "EXEMPT",
];

const RECORD_STATUS_FILTERS: ("ALL" | CertificateStatus)[] = [
  "ALL",
  "VALID",
  "EXPIRING_SOON",
  "EXPIRED",
  "PENDING",
];

export default function AssetCertificatesScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { projectId, assetId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
  }>();

  const pid = String(projectId);
  const aid = String(assetId);
  const [activeTab, setActiveTab] = useState<"requirements" | "records">(
    "requirements",
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [requirementFilter, setRequirementFilter] = useState<
    "ALL" | RequirementStatus
  >("ALL");
  const [recordStatusFilter, setRecordStatusFilter] = useState<
    "ALL" | CertificateStatus
  >("ALL");

  const {
    requirements,
    loading: requirementsLoading,
    error: requirementsError,
    refresh: refreshRequirements,
  } = useCertificateRequirementsByAsset(pid, aid);
  const { certificates, loading, error, refresh } = useCertificatesByAsset(
    pid,
    aid,
  );
  const {
    generateAsset,
    loading: generating,
    error: generationError,
  } = useGenerateCertificateRequirements(pid);

  const stats = useMemo(() => {
    let missing = 0;
    let expired = 0;
    let underReview = 0;
    let provided = 0;

    for (const row of requirements ?? []) {
      switch (row.status) {
        case "MISSING":
          missing += 1;
          break;
        case "EXPIRED":
          expired += 1;
          break;
        case "UNDER_REVIEW":
          underReview += 1;
          break;
        case "PROVIDED":
          provided += 1;
          break;
      }
    }

    return {
      totalRequirements: requirements?.length ?? 0,
      records: certificates?.length ?? 0,
      missing,
      expired,
      underReview,
      provided,
    };
  }, [certificates, requirements]);

  const filteredRequirements = useMemo(() => {
    return requirements.filter((row) => {
      return requirementFilter === "ALL" || row.status === requirementFilter;
    });
  }, [requirementFilter, requirements]);

  const filteredCertificates = useMemo(() => {
    return certificates.filter((row) => {
      return recordStatusFilter === "ALL" || row.status === recordStatusFilter;
    });
  }, [certificates, recordStatusFilter]);

  useEffect(() => {
    setShowStatusMenu(false);
  }, [activeTab, isExpanded]);

  async function refreshAll() {
    await Promise.all([refreshRequirements(), refresh()]);
  }

  async function onGenerate() {
    try {
      const result = await generateAsset(aid);
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
        assetId: aid,
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
      >
        Refresh requirements
      </Button>

      <Button
        variant="outline"
        size="sm"
        onPress={() =>
          router.push({
            pathname: "/projects/[projectId]/certificates/upload",
            params: {
              projectId: pid,
              assetId: aid,
            },
          })
        }
        className="rounded-full"
      >
        Add extra certificate
      </Button>

      {ENABLE_MANUAL_CERTIFICATE_CREATE ? (
        <Button
          variant="outline"
          size="sm"
          onPress={() =>
            router.push(`/projects/${pid}/vessels/${aid}/certificates/new`)
          }
          className="rounded-full"
        >
          Manual entry
        </Button>
      ) : null}
    </>
  );

  const tabs = [
    {
      key: "requirements" as const,
      label: "Requirements",
      helper: `${stats.totalRequirements} expected for this vessel`,
    },
    {
      key: "records" as const,
      label: "Records",
      helper: `${stats.records} structured records on file`,
    },
  ];

  const tableActions = (
    <>
      <ToolbarSelect
        value={activeTab === "requirements" ? requirementFilter : recordStatusFilter}
        options={
          activeTab === "requirements" ? REQUIREMENT_FILTERS : RECORD_STATUS_FILTERS
        }
        open={showStatusMenu}
        onToggle={() => setShowStatusMenu((prev) => !prev)}
        onChange={(value) => {
          if (activeTab === "requirements") {
            setRequirementFilter(value as "ALL" | RequirementStatus);
          } else {
            setRecordStatusFilter(value as "ALL" | CertificateStatus);
          }
          setShowStatusMenu(false);
        }}
        renderLabel={(value) =>
          value === "ALL"
            ? activeTab === "requirements"
              ? "All Compliance"
              : "All Status"
            : humanizeTechnicalLabel(value)
        }
        minWidth={180}
      />

      <Button
        variant="icon"
        size="iconLg"
        onPress={() => {
          setRequirementFilter("ALL");
          setRecordStatusFilter("ALL");
        }}
        leftIcon={
          <Ionicons
            name="refresh-outline"
            size={18}
            className="text-textMain"
          />
        }
        accessibilityLabel="Clear filters"
      />

      <Button
        variant="icon"
        size="iconLg"
        onPress={() => setIsExpanded((prev) => !prev)}
        leftIcon={
          <Ionicons
            name={isExpanded ? "contract-outline" : "expand-outline"}
            size={18}
            className="text-textMain"
          />
        }
        accessibilityLabel={isExpanded ? "Exit expanded view" : "Expand table"}
      />
    </>
  );

  return (
    <View className="gap-6">
      <PageHeader
        title="Certificates"
        subTitle="Operate vessel compliance with a clear split between expected requirements and uploaded records."
        onRefresh={refreshAll}
        actions={headerActions}
      />

      {!isExpanded ? (
        <>
          <View className="gap-2 xl:gap-5 flex flex-row flex-wrap items-center justify-start xl:justify-between">
            <StatCard
              iconName="documents-outline"
              iconLib="ion"
              title="Requirements"
              value={String(stats.totalRequirements)}
              suffix="expected for this vessel"
              badgeValue={String(stats.records)}
              badgeColor={stats.records > 0 ? "success" : "fail"}
              badgeLabel="records"
            />

            <StatCard
              iconName="alert-circle-outline"
              iconLib="ion"
              title="Missing"
              value={String(stats.missing)}
              suffix="need fresh evidence"
              badgeValue={stats.missing > 0 ? "ACTION" : "OK"}
              badgeColor={stats.missing > 0 ? "fail" : "success"}
              badgeLabel="status"
            />

            <StatCard
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
              iconName="checkmark-circle-outline"
              iconLib="ion"
              title="Provided"
              value={String(stats.provided)}
              suffix="currently backed by a record"
              badgeValue={String(stats.expired)}
              badgeColor={stats.expired > 0 ? "fail" : "success"}
              badgeLabel="expired"
            />
          </View>

          <View className="gap-3">
            <View className="flex-row flex-wrap gap-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;

                return (
                  <Pressable
                    key={tab.key}
                    onPress={() => setActiveTab(tab.key)}
                    className={[
                      "min-w-[220px] flex-1 rounded-[22px] border px-4 py-4",
                      isActive
                        ? "border-accent/45 bg-accent/10"
                        : "border-border bg-baseBg/25",
                    ].join(" ")}
                  >
                    <View className="gap-2">
                      <View className="flex-row items-center justify-between gap-3">
                        <Text
                          className={[
                            "text-[15px] font-semibold",
                            isActive ? "text-accent" : "text-textMain",
                          ].join(" ")}
                        >
                          {tab.label}
                        </Text>

                        <View
                          className={[
                            "rounded-full px-2.5 py-1",
                            isActive ? "bg-accent/15" : "bg-baseBg/40",
                          ].join(" ")}
                        >
                          <Text
                            className={[
                              "text-[10px] font-semibold",
                              isActive ? "text-accent" : "text-textMain/70",
                            ].join(" ")}
                          >
                            {isActive ? "Current" : "Open"}
                          </Text>
                        </View>
                      </View>

                      <Text className="text-[12px] leading-[18px] text-muted">
                        {tab.helper}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View className="rounded-[20px] border border-border bg-baseBg/20 px-4 py-4">
              <View className="flex-row flex-wrap items-start justify-between gap-4">
                <View className="max-w-[780px] gap-1.5">
                  <Text className="text-[12px] font-semibold uppercase tracking-wide text-textMain/70">
                    Vessel-first flow
                  </Text>
                  <Text className="text-[14px] leading-[22px] text-textMain">
                    {activeTab === "requirements"
                      ? "Expected certificate work for this vessel. Upload from the row that is missing or needs fresher evidence."
                      : "Structured certificate evidence already linked to this vessel."}
                  </Text>
                </View>

                <View className="rounded-full border border-border bg-baseBg/35 px-3 py-2">
                  <Text className="text-[11px] font-semibold text-textMain/75">
                    {activeTab === "requirements"
                      ? `${filteredRequirements.length} active rows`
                      : `${filteredCertificates.length} records visible`}
                  </Text>
                </View>
              </View>

              {generationError ? (
                <Text className="mt-3 text-[12px] text-destructive">
                  {generationError}
                </Text>
              ) : null}
            </View>
          </View>
        </>
      ) : null}

      {activeTab === "requirements" ? (
        <CertificateRequirementsTable
          title="Requirements"
          subtitleRight={`${filteredRequirements.length} rows after filtering`}
          headerActions={tableActions}
          toolbarContent={null}
          data={filteredRequirements}
          isLoading={requirementsLoading}
          error={requirementsError}
          onRetry={refreshRequirements}
          onUpload={openUpload}
        />
      ) : (
        <View className="flex-1">
          <CertificatesTable
            title="Records"
            subtitleRight={`${filteredCertificates.length} rows after filtering`}
            headerActions={tableActions}
            toolbarContent={null}
            data={filteredCertificates}
            isLoading={loading}
            error={error}
            onRetry={refresh}
            sortByExpiry
          />
        </View>
      )}
    </View>
  );
}
