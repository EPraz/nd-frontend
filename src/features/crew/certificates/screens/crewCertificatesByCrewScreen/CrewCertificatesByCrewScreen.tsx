import { ErrorState, Loading, Text } from "@/src/components";
import {
  RegistryHeaderActionButton,
  RegistrySummaryStrip,
  RegistryWorkspaceHeader,
  RegistryWorkspaceSection,
  type RegistrySummaryItem,
} from "@/src/components/ui/registryWorkspace";
import { useToast } from "@/src/context/ToastProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
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

  const {
    crew,
    loading: crewLoading,
    error: crewError,
    refresh: refreshCrew,
  } = useCrewById(pid, aid, cid);
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

              <RegistryHeaderActionButton
                variant="outline"
                onPress={onGenerate}
                loading={generating}
              >
                Refresh requirements
              </RegistryHeaderActionButton>

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
        subtitleRight={`${requirements.length} rows in this crew lane`}
        data={requirements}
        isLoading={requirementsLoading}
        error={requirementsError}
        onRetry={refreshRequirements}
        onUpload={openUpload}
      />

      <CrewCertificatesTable
        projectId={pid}
        title="Uploaded certificates"
        subtitleRight={`${certificates.length} certificate records`}
        data={certificates}
        isLoading={certificatesLoading}
        error={certificatesError}
        onRetry={refreshCertificates}
      />
    </View>
  );
}
