import { Button, PageHeader, StatCard, Text } from "@/src/components";
import { ToolbarSelect } from "@/src/components/ui";
import { useToast } from "@/src/context";
import { humanizeTechnicalLabel } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import {
  CertificateRequirementsTable,
  CertificatesTable,
} from "../../components";
import { ENABLE_MANUAL_CERTIFICATE_CREATE } from "../../config";
import {
  CertificateRequirementDto,
  CertificateStatus,
  RequirementStatus,
} from "../../contracts";
import {
  useCertificatesByProject,
  useCertificateRequirementsByProject,
  useGenerateCertificateRequirements,
} from "../../hooks";

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

export default function CertificatesByProjectScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const pid = String(projectId);
  const [activeTab, setActiveTab] = useState<"requirements" | "records">(
    "requirements",
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
    </>
  );

  const tabs = [
    {
      key: "requirements" as const,
      label: "Requirements",
      helper: `${stats.total} active requirements`,
    },
    {
      key: "records" as const,
      label: "Records",
      helper: `${certificates.length} structured records`,
    },
  ];

  const tableActions = (
    <>
      <View className="flex-row items-center gap-2">
        <View
          className={[
            "flex-row items-center overflow-hidden rounded-full border border-shellLine bg-shellPanel",
            isSearchOpen || vesselQuery ? "min-w-[260px]" : "w-11",
          ].join(" ")}
        >
          <Pressable
            onPress={() => {
              if (isSearchOpen && !vesselQuery) {
                setIsSearchOpen(false);
                return;
              }
              setIsSearchOpen(true);
            }}
            className="h-11 w-11 items-center justify-center"
          >
            <Ionicons
              name="search-outline"
              size={18}
              color="rgba(221,230,237,0.95)"
            />
          </Pressable>

          {isSearchOpen || vesselQuery ? (
            <View className="flex-1 flex-row items-center pr-2">
              <TextInput
                value={vesselQuery}
                onChangeText={setVesselQuery}
                placeholder="Search vessel"
                placeholderTextColor="rgba(221,230,237,0.35)"
                className="h-11 flex-1 text-textMain"
                autoCapitalize="words"
                autoCorrect={false}
              />

              <Pressable
                onPress={() => {
                  setVesselQuery("");
                  setIsSearchOpen(false);
                }}
                className="h-9 w-9 items-center justify-center"
              >
                <Ionicons
                  name="close"
                  size={16}
                  color="rgba(221,230,237,0.75)"
                />
              </Pressable>
            </View>
          ) : null}
        </View>

        <ToolbarSelect
          value={
            activeTab === "requirements" ? requirementFilter : recordStatusFilter
          }
          options={
            activeTab === "requirements"
              ? REQUIREMENT_FILTERS
              : RECORD_STATUS_FILTERS
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
      </View>

      <Button
        variant="icon"
        size="iconLg"
        onPress={() => {
          setRequirementFilter("ALL");
          setRecordStatusFilter("ALL");
          setVesselQuery("");
          setIsSearchOpen(false);
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

  const tableToolbar = null;

  return (
    <View className="gap-6 p-4 web:p-6">
      <PageHeader
        title="Certificate Compliance"
        subTitle="Upload documents from each vessel requirement so compliance stays grounded in real evidence."
        onRefresh={refreshAll}
        actions={headerActions}
      />

      {!isExpanded ? (
        <>
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
                        : "border-shellLine bg-shellPanelSoft",
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
                            isActive ? "bg-accent/15" : "bg-shellPanelSoft",
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

            <View className="rounded-[20px] border border-shellLine bg-shellGlass px-4 py-4">
              <View className="flex-row flex-wrap items-start justify-between gap-4">
                <View className="max-w-[780px] gap-1.5">
                  <Text className="text-[12px] font-semibold uppercase tracking-wide text-textMain/70">
                    Maritime-first flow
                  </Text>
                  <Text className="text-[14px] leading-[22px] text-textMain">
                    {activeTab === "requirements"
                      ? "Expected compliance work by vessel. Upload from the row that is missing or needs fresher evidence."
                      : "Structured certificate evidence already on file across the project fleet."}
                  </Text>
                </View>

                <View className="rounded-full border border-shellLine bg-shellPanelSoft px-3 py-2">
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
          title="Vessel Requirements"
          subtitleRight={`${filteredRequirements.length} rows after filtering`}
          headerActions={tableActions}
          toolbarContent={tableToolbar}
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
            headerActions={tableActions}
            toolbarContent={tableToolbar}
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
