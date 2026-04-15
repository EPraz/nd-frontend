import {
  Button,
  Card,
  CardContent,
  CardHeaderRow,
  CardTitle,
  ConfirmModal,
  ErrorState,
  FieldDisplay,
  Loading,
  MiniPill,
  Text,
} from "@/src/components";
import { useToast } from "@/src/context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { useState } from "react";
import { CrewStatusPill } from "../../components";
import { useCrewById, useDeleteCrew } from "../../hooks";

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
    submit: deleteCrew,
    loading: deleting,
    error: deleteError,
  } = useDeleteCrew(pid, vid, cid);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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

  if (loading) return <Loading fullScreen />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!crew) {
    return <ErrorState message="Crew member not found." onRetry={refresh} />;
  }

  const assignedVesselName = crew.assetName ?? crew.asset?.name ?? "-";

  return (
    <View className="flex-1 gap-5 bg-shellCanvas p-4 web:p-6">
      <View className="gap-3">
        <Pressable
          onPress={goBack}
          className="self-start flex-row items-center gap-2"
        >
          <Ionicons name="chevron-back" size={16} className="text-accent" />
          <Text className="font-semibold text-accent">Back</Text>
        </Pressable>

        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1 gap-1">
            <Text className="text-[34px] font-semibold leading-[110%] text-textMain">
              Crew Member - {crew.fullName}
            </Text>
            <Text className="text-[14px] text-muted">
              View identity, contract, leave planning, familiarization, and
              medical readiness for this crew member.
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
              Crew Certificates
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
              <CrewStatusPill
                status={crew.status}
                inactiveReason={crew.inactiveReason}
              />
            </CardHeaderRow>

            <CardContent className="px-6">
              <View className="gap-4">
                <View className="gap-2">
                  <Text className="text-[22px] font-semibold text-textMain">
                    {crew.fullName}
                  </Text>

                  <View className="flex-row flex-wrap gap-2">
                    {crew.rank ? (
                      <MiniPill>
                        Rank:{" "}
                        <Text className="font-semibold text-textMain">
                          {crew.rank}
                        </Text>
                      </MiniPill>
                    ) : null}

                    {crew.department ? (
                      <MiniPill>
                        Department:{" "}
                        <Text className="font-semibold text-textMain">
                          {crew.department}
                        </Text>
                      </MiniPill>
                    ) : null}

                    {crew.inactiveReason ? (
                      <MiniPill>
                        Inactive Reason:{" "}
                        <Text className="font-semibold text-textMain">
                          {crew.inactiveReason}
                        </Text>
                      </MiniPill>
                    ) : null}
                  </View>
                </View>

                <View className="gap-4 web:flex-row">
                  <View className="flex-1 gap-4">
                    <FieldDisplay
                      label="Assigned Vessel"
                      value={
                        <Pressable onPress={goVessel}>
                          <Text className="font-semibold text-accent">
                            {assignedVesselName}
                          </Text>
                        </Pressable>
                      }
                    />
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
                    <FieldDisplay
                      label="Next Vacation"
                      value={formatDate(crew.nextVacationDate)}
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

        <View className="w-full gap-5 web:lg:w-[380px]">
          <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
            <CardHeaderRow>
              <CardTitle className="text-[16px] text-textMain">
                Crew Photo
              </CardTitle>
            </CardHeaderRow>

            <CardContent className="px-6">
              <View className="gap-4">
                <View className="h-[260px] overflow-hidden rounded-[18px] border border-shellLine bg-shellPanelSoft">
                  {crew.photoUrl ? (
                    <Image
                      source={{ uri: crew.photoUrl }}
                      contentFit="cover"
                      style={{ width: "100%", height: "100%" }}
                    />
                  ) : (
                    <View className="flex-1 items-center justify-center gap-2 px-4">
                      <Ionicons
                        name="person-circle-outline"
                        size={52}
                        className="text-muted"
                      />
                      <Text className="font-semibold text-textMain">
                        No crew photo
                      </Text>
                      <Text className="text-center text-[12px] leading-[18px] text-muted">
                        Upload a crew image from edit mode to keep quick views
                        and profile cards current.
                      </Text>
                    </View>
                  )}
                </View>

                <FieldDisplay
                  label="Stored file"
                  value={crew.photoFileName ?? "-"}
                />
              </View>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
            <CardHeaderRow>
              <CardTitle className="text-[16px] text-textMain">
                Medical Status
              </CardTitle>
            </CardHeaderRow>

            <CardContent className="px-6">
              <View className="gap-4">
                <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft p-4">
                  <Text className="text-[12px] text-muted">Current State</Text>
                  <Text className="text-[26px] font-semibold text-textMain">
                    {formatMedical(crew.medicalCertificateValid)}
                  </Text>
                  <Text className="mt-1 text-[12px] text-muted">
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
