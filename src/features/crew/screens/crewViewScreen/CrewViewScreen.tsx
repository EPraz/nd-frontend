import {
  Button,
  Card,
  CardContent,
  CardHeaderRow,
  CardTitle,
  ConfirmModal,
  DocumentPreview,
  ErrorState,
  FieldDisplay,
  Loading,
  MiniPill,
  Text,
} from "@/src/components";
import { useToast } from "@/src/context";
import { getBaseUrl } from "@/src/api/baseUrl";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Linking, Pressable, View } from "react-native";
import { useMemo, useState } from "react";
import { CrewStatusPill } from "../../components";
import { useCrewById, useDeleteCrew } from "../../hooks";
import { useCrewCertificatesByCrew } from "@/src/features/crew-certificates/hooks";
import { CertificateStatusPill, WorkflowStatusPill } from "@/src/features/certificates/components";

function formatDate(value?: string | null): string {
  return value ? value.slice(0, 10) : "-";
}

function formatMedical(value: boolean | null): string {
  if (value === null) return "Unknown";
  return value ? "Valid" : "Not valid";
}

export default function CrewViewScreen() {
  const router = useRouter();
  const { show } = useToast();
  const { projectId, assetId, crewId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
    crewId: string;
  }>();

  const pid = String(projectId);
  const vid = String(assetId);
  const cid = String(crewId);

  const { crew, loading, error, refresh } = useCrewById(pid, vid, cid);
  const {
    certificates,
    loading: certificatesLoading,
    error: certificatesError,
    refresh: refreshCertificates,
  } = useCrewCertificatesByCrew(pid, vid, cid);
  const {
    submit: deleteCrew,
    loading: deleting,
    error: deleteError,
  } = useDeleteCrew(pid, vid, cid);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCertificateId, setSelectedCertificateId] = useState<string | null>(
    null,
  );

  const goBack = () => router.back();
  const goVessel = () => router.push(`/projects/${pid}/vessels/${vid}`);
  const goEdit = () =>
    router.push(`/projects/${pid}/vessels/${vid}/crew/${cid}/edit`);
  const goCertificates = () =>
    router.push(`/projects/${pid}/vessels/${vid}/crew/${cid}/certificates`);

  async function handleDelete() {
    try {
      await deleteCrew();
      setIsDeleteOpen(false);
      show("Crew member deleted", "success");
      router.replace(`/projects/${pid}/vessels/${vid}/crew`);
    } catch {
      show("Failed to delete crew member", "error");
    }
  }
  const assignedVesselName = crew?.assetName ?? crew?.asset?.name ?? "-";
  const selectedCertificate = useMemo(
    () =>
      certificates.find((item) => item.id === selectedCertificateId) ??
      certificates[0] ??
      null,
    [certificates, selectedCertificateId],
  );
  const selectedAttachment = selectedCertificate?.attachments[0] ?? null;

  function toAbsoluteUrl(url: string) {
    return url.startsWith("http") ? url : `${getBaseUrl()}${url}`;
  }

  async function openAttachment(url: string) {
    const absoluteUrl = toAbsoluteUrl(url);
    await Linking.openURL(absoluteUrl);
  }

  if (loading) return <Loading fullScreen />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!crew)
    return <ErrorState message="Crew member not found." onRetry={refresh} />;

  return (
    <View className="flex-1 bg-shellCanvas p-4 web:p-6 gap-5">
      <View className="gap-3">
        <Pressable
          onPress={goBack}
          className="self-start flex-row items-center gap-2"
        >
          <Ionicons name="chevron-back" size={16} className="text-accent" />
          <Text className="text-accent font-semibold">Back</Text>
        </Pressable>

        <View className="flex-row items-start justify-between gap-4">
          <View className="gap-1 flex-1">
            <Text className="text-textMain text-[34px] font-semibold leading-[110%]">
              Crew Member - {crew.fullName}
            </Text>
            <Text className="text-muted text-[14px]">
              View identity, contract, experience, familiarization, and medical
              readiness for this crew member.
            </Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Button
              variant="icon"
              size="iconLg"
              onPress={refresh}
              leftIcon={
                <Ionicons name="refresh" size={18} className="text-textMain" />
              }
              accessibilityLabel="Refresh"
            />

            <Button
              variant="destructive"
              size="lg"
              onPress={() => setIsDeleteOpen(true)}
              className="rounded-full"
              disabled={deleting}
              rightIcon={
                <Ionicons
                  name="trash-outline"
                  size={16}
                  className="text-textMain"
                />
              }
            >
              Delete
            </Button>

            <Button
              variant="default"
              size="lg"
              onPress={goEdit}
              className="rounded-full"
              rightIcon={
                <Ionicons
                  name="create-outline"
                  size={16}
                  className="text-textMain"
                />
              }
            >
              Edit
            </Button>

            <Button
              variant="outline"
              size="lg"
              onPress={goCertificates}
              className="rounded-full"
            >
              Certificates
            </Button>
          </View>
        </View>
      </View>

      <View className="gap-5 web:lg:flex-row">
        <View className="flex-1 gap-5">
          <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
            <CardHeaderRow>
              <CardTitle className="text-[16px] text-textMain">
                Crew Overview
              </CardTitle>
              <CrewStatusPill status={crew.status} />
            </CardHeaderRow>

            <CardContent className="px-6">
              <View className="gap-4">
                <View className="gap-2">
                  <Text className="text-textMain text-[22px] font-semibold">
                    {crew.fullName}
                  </Text>

                  <View className="flex-row flex-wrap gap-2">
                    {crew.rank ? (
                      <MiniPill>
                        Rank:{" "}
                        <Text className="text-textMain font-semibold">
                          {crew.rank}
                        </Text>
                      </MiniPill>
                    ) : null}

                    {crew.department ? (
                      <MiniPill>
                        Department:{" "}
                        <Text className="text-textMain font-semibold">
                          {crew.department}
                        </Text>
                      </MiniPill>
                    ) : null}
                  </View>
                </View>

                <View className="gap-4 web:flex-row">
                  <View className="flex-1 gap-4">
                    <FieldDisplay label="Nationality" value={crew.nationality ?? "-"} />
                    <FieldDisplay
                      label="Date of Birth"
                      value={formatDate(crew.dateOfBirth)}
                    />
                    <FieldDisplay
                      label="Passport Number"
                      value={crew.passportNumber ?? "-"}
                    />
                    <FieldDisplay
                      label="Seafarer ID"
                      value={crew.seafarerId ?? "-"}
                    />
                    <FieldDisplay
                      label="Personal Email"
                      value={crew.personalEmail ?? "-"}
                    />
                    <FieldDisplay
                      label="Assigned Vessel"
                      value={
                        <Pressable onPress={goVessel}>
                          <Text className="text-accent font-semibold">
                            {assignedVesselName}
                          </Text>
                        </Pressable>
                      }
                    />
                  </View>

                  <View className="flex-1 gap-4">
                    <FieldDisplay
                      label="Contract Type"
                      value={crew.contractType ?? "-"}
                    />
                    <FieldDisplay
                      label="Operating Company"
                      value={crew.operatingCompany ?? "-"}
                    />
                    <FieldDisplay
                      label="Crew Agency"
                      value={crew.crewManagementAgency ?? "-"}
                    />
                    <FieldDisplay
                      label="Embarkation"
                      value={formatDate(crew.dateOfEmbarkation)}
                    />
                    <FieldDisplay
                      label="Disembarkation"
                      value={formatDate(crew.expectedDateOfDisembarkation)}
                    />
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
            <CardHeaderRow>
              <CardTitle className="text-[16px] text-textMain">
                Experience and Familiarization
              </CardTitle>
            </CardHeaderRow>

            <CardContent className="px-6">
              <View className="gap-4 web:flex-row">
                <View className="flex-1 gap-4">
                  <FieldDisplay
                    label="Total Sea Experience"
                    value={
                      crew.totalSeaExperienceYears === null
                        ? "-"
                        : `${crew.totalSeaExperienceYears} years`
                    }
                  />
                  <FieldDisplay
                    label="Years in Current Rank"
                    value={
                      crew.yearsInCurrentRank === null
                        ? "-"
                        : `${crew.yearsInCurrentRank} years`
                    }
                  />
                  <FieldDisplay
                    label="Vessel Type Experience"
                    value={crew.vesselTypeExperience ?? "-"}
                  />
                  <FieldDisplay
                    label="Previous Vessels"
                    value={crew.previousVessels ?? "-"}
                  />
                </View>

                <View className="flex-1 gap-4">
                  <FieldDisplay
                    label="Time with Current Company"
                    value={
                      crew.timeWithCurrentCompanyMonths === null
                        ? "-"
                        : `${crew.timeWithCurrentCompanyMonths} months`
                    }
                  />
                  <FieldDisplay
                    label="Familiarization Date"
                    value={formatDate(crew.onboardFamiliarizationDate)}
                  />
                  <FieldDisplay
                    label="Checklist Completed"
                    value={
                      crew.familiarizationChecklistCompleted ? "Yes" : "No"
                    }
                  />
                  <FieldDisplay
                    label="Responsible Officer"
                    value={crew.responsibleOfficer ?? "-"}
                  />
                </View>
              </View>
            </CardContent>
          </Card>
        </View>

        <View className="w-full web:lg:w-[380px] gap-5">
          <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
            <CardHeaderRow>
              <CardTitle className="text-[16px] text-textMain">
                Medical Status
              </CardTitle>
            </CardHeaderRow>

            <CardContent className="px-6">
              <View className="gap-4">
                <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft p-4">
                  <Text className="text-muted text-[12px]">Current State</Text>
                  <Text className="text-textMain text-[26px] font-semibold">
                    {formatMedical(crew.medicalCertificateValid)}
                  </Text>
                  <Text className="text-muted text-[12px] mt-1">
                    Expiration: {formatDate(crew.medicalCertificateExpirationDate)}
                  </Text>
                </View>

                <FieldDisplay
                  label="Medical Restrictions"
                  value={crew.medicalRestrictions ?? "-"}
                />
              </View>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
            <CardHeaderRow>
              <CardTitle className="text-[16px] text-textMain">
                Crew Certificates
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onPress={goCertificates}
                className="rounded-full"
              >
                Open Crew Certificates
              </Button>
            </CardHeaderRow>

            <CardContent className="px-6">
              <View className="gap-3">
                {certificatesLoading ? (
                  <Text className="text-muted text-[13px]">Loading certificates…</Text>
                ) : certificatesError ? (
                  <View className="gap-3 rounded-[18px] border border-shellLine bg-shellPanelSoft p-4">
                    <Text className="text-[13px] text-destructive">
                      {certificatesError}
                    </Text>
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={refreshCertificates}
                      className="rounded-full self-start"
                    >
                      Retry
                    </Button>
                  </View>
                ) : certificates.length === 0 ? (
                  <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft p-4 gap-3">
                    <Text className="text-[13px] text-textMain">
                      No crew certificates uploaded yet for this crew member.
                    </Text>
                    <Text className="text-[12px] text-muted">
                      Start from the crew certificates module to upload evidence or review requirements.
                    </Text>
                  </View>
                ) : (
                  certificates.map((item) => (
                    <Pressable
                      key={item.id}
                      onPress={() => setSelectedCertificateId(item.id)}
                      className={[
                        "rounded-[18px] border p-4 gap-3",
                        selectedCertificate?.id === item.id
                          ? "border-accent bg-accent/10"
                          : "border-shellLine bg-shellPanelSoft",
                      ].join(" ")}
                    >
                      <View className="gap-2">
                        <Text className="text-textMain font-semibold text-[13px]">
                          {item.certificateName}
                        </Text>
                        <Text className="text-muted text-[12px]">
                          {item.number ?? item.certificateCode}
                        </Text>
                      </View>

                      <View className="flex-row flex-wrap gap-2">
                        <CertificateStatusPill status={item.status} />
                        <WorkflowStatusPill status={item.workflowStatus} />
                      </View>
                    </Pressable>
                  ))
                )}

                <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft p-4">
                  <Text className="text-[12px] text-muted">
                    Operational Notes
                  </Text>
                  <Text className="text-textMain text-[13px] leading-[20px] mt-1">
                    {crew.notes ?? "No operational notes recorded yet."}
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
            <CardHeaderRow>
              <CardTitle className="text-[16px] text-textMain">
                Certificate Preview
              </CardTitle>
            </CardHeaderRow>

            <CardContent className="px-6">
              {selectedCertificate && selectedAttachment ? (
                <View className="gap-4">
                  <View className="gap-2">
                    <Text className="text-textMain font-semibold text-[14px]">
                      {selectedCertificate.certificateName}
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      <MiniPill>{selectedAttachment.fileName}</MiniPill>
                      <MiniPill>{selectedAttachment.mimeType}</MiniPill>
                    </View>
                  </View>

                  <DocumentPreview
                    attachmentUrl={toAbsoluteUrl(selectedAttachment.url)}
                    mimeType={selectedAttachment.mimeType}
                  />

                  <View className="flex-row flex-wrap gap-2">
                    <Button
                      variant="softAccent"
                      size="sm"
                      onPress={() => openAttachment(selectedAttachment.url)}
                      className="rounded-full"
                    >
                      Open original
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() =>
                        router.push(
                          `/projects/${pid}/vessels/${vid}/crew/${cid}/certificates/${selectedCertificate.id}`,
                        )
                      }
                      className="rounded-full"
                    >
                      Open certificate
                    </Button>
                  </View>
                </View>
              ) : (
                <Text className="text-[13px] text-textMain">
                  Select a crew certificate with an uploaded file to preview it here.
                </Text>
              )}
            </CardContent>
          </Card>
        </View>
      </View>

      {deleteError ? <Text className="text-destructive">{deleteError}</Text> : null}

      <ConfirmModal
        visible={isDeleteOpen}
        title="Delete crew member"
        message={`Are you sure you want to delete ${crew.fullName}?`}
        confirmLabel="Delete crew member"
        cancelLabel="Keep crew member"
        variant="destructive"
        loading={deleting}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </View>
  );
}
