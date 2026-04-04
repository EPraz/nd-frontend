import {
  Button,
  Card,
  CardContent,
  CardHeaderRow,
  CardTitle,
  ErrorState,
  FieldDisplay,
  Loading,
  MiniPill,
  Text,
} from "@/src/components";
import { useToast } from "@/src/context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Platform, Pressable, View } from "react-native";
import { CrewStatusPill } from "../../components";
import { useCrewById, useDeleteCrew } from "../../hooks";

function formatDate(value?: string | null): string {
  return value ? value.slice(0, 10) : "—";
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

  const goBack = () => router.back();
  const goVessel = () => router.push(`/projects/${pid}/vessels/${vid}`);
  const goEdit = () =>
    router.push(`/projects/${pid}/vessels/${vid}/crew/${cid}/edit`);
  const goCertificates = () =>
    router.push(`/projects/${pid}/vessels/${vid}/crew/${cid}/certificates`);

  async function confirmDelete(): Promise<boolean> {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      return window.confirm(
        "Delete this crew member? This is intended for cleanup and cannot be undone.",
      );
    }

    return new Promise((resolve) => {
      Alert.alert(
        "Delete crew member",
        "This is intended for cleanup and cannot be undone.",
        [
          { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => resolve(true),
          },
        ],
      );
    });
  }

  async function handleDelete() {
    const confirmed = await confirmDelete();
    if (!confirmed) return;

    try {
      await deleteCrew();
      show("Crew member deleted", "success");
      router.replace(`/projects/${pid}/vessels/${vid}/crew`);
    } catch {
      show("Failed to delete crew member", "error");
    }
  }

  if (loading) return <Loading fullScreen />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!crew)
    return <ErrorState message="Crew member not found." onRetry={refresh} />;

  return (
    <View className="flex-1 bg-baseBg p-4 web:p-6 gap-5">
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
              onPress={handleDelete}
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
                    <Pressable
                      onPress={goVessel}
                      className="web:rounded-full web:hover:bg-accent/10"
                    >
                      <MiniPill>
                        Vessel:{" "}
                        <Text className="text-textMain font-semibold">
                          {crew.assetName ?? crew.asset?.name ?? "—"}
                        </Text>
                      </MiniPill>
                    </Pressable>

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
                    <FieldDisplay label="Nationality" value={crew.nationality ?? "—"} />
                    <FieldDisplay
                      label="Date of Birth"
                      value={formatDate(crew.dateOfBirth)}
                    />
                    <FieldDisplay
                      label="Passport Number"
                      value={crew.passportNumber ?? "—"}
                    />
                    <FieldDisplay
                      label="Seafarer ID"
                      value={crew.seafarerId ?? "—"}
                    />
                    <FieldDisplay
                      label="Personal Email"
                      value={crew.personalEmail ?? "—"}
                    />
                  </View>

                  <View className="flex-1 gap-4">
                    <FieldDisplay
                      label="Contract Type"
                      value={crew.contractType ?? "—"}
                    />
                    <FieldDisplay
                      label="Operating Company"
                      value={crew.operatingCompany ?? "—"}
                    />
                    <FieldDisplay
                      label="Crew Agency"
                      value={crew.crewManagementAgency ?? "—"}
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
                        ? "—"
                        : `${crew.totalSeaExperienceYears} years`
                    }
                  />
                  <FieldDisplay
                    label="Years in Current Rank"
                    value={
                      crew.yearsInCurrentRank === null
                        ? "—"
                        : `${crew.yearsInCurrentRank} years`
                    }
                  />
                  <FieldDisplay
                    label="Vessel Type Experience"
                    value={crew.vesselTypeExperience ?? "—"}
                  />
                  <FieldDisplay
                    label="Previous Vessels"
                    value={crew.previousVessels ?? "—"}
                  />
                </View>

                <View className="flex-1 gap-4">
                  <FieldDisplay
                    label="Time with Current Company"
                    value={
                      crew.timeWithCurrentCompanyMonths === null
                        ? "—"
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
                    value={crew.responsibleOfficer ?? "—"}
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
                <View className="rounded-[18px] border border-border bg-baseBg/40 p-4">
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
                  value={crew.medicalRestrictions ?? "—"}
                />
              </View>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
            <CardHeaderRow>
              <CardTitle className="text-[16px] text-textMain">
                Compliance Next
              </CardTitle>
            </CardHeaderRow>

            <CardContent className="px-6">
              <View className="gap-4">
                <Text className="text-textMain text-[13px] leading-[20px]">
                  Crew certificates are managed separately so compliance by rank
                  can stay grounded in uploaded evidence and approval state.
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={goCertificates}
                  className="rounded-full self-start"
                >
                  Open Crew Certificates
                </Button>
                <View className="rounded-[18px] border border-border bg-baseBg/35 p-4">
                  <Text className="text-[12px] text-muted">Notes</Text>
                  <Text className="text-textMain text-[13px] leading-[20px] mt-1">
                    {crew.notes ?? "No operational notes recorded yet."}
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>
        </View>
      </View>

      {deleteError ? (
        <Text className="text-destructive">{deleteError}</Text>
      ) : null}
    </View>
  );
}
