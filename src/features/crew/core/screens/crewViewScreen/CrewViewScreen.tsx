import {
  ConfirmModal,
  ErrorState,
  FieldDisplay,
  Loading,
  Text,
} from "@/src/components";
import { useToast } from "@/src/context/ToastProvider";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, type ReactNode } from "react";
import { ScrollView, View } from "react-native";
import CrewPhotoMedia from "../../components/crewPhotoMedia/CrewPhotoMedia";
import { useDeleteCrew } from "../../hooks/useDeleteCrew";
import { useCrewById } from "../../hooks/useCrewById";
import CrewProfileFactTile from "./CrewProfileFactTile";
import CrewProfileHero from "./CrewProfileHero";
import {
  familiarizationLabel,
  familiarizationTone,
  formatDate,
  formatMedicalState,
  formatMonths,
  formatYears,
  humanizeCrewValue,
  medicalTone,
  statusTone,
} from "./crewView.helpers";

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
  const crewHref = `/projects/${pid}/vessels/${vid}/crew`;

  const { crew, loading, error, refresh } = useCrewById(pid, vid, cid);
  const {
    submit: deleteCrew,
    loading: deleting,
    error: deleteError,
  } = useDeleteCrew(pid, vid, cid);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const goBack = () => router.replace(crewHref);
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
      router.replace(crewHref);
    } catch {
      show("Failed to delete crew member", "error");
    }
  }

  if (loading) return <Loading fullScreen />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (!crew) {
    return <ErrorState message="Crew member not found." onRetry={refresh} />;
  }

  const assignedVesselName = crew.assetName ?? crew.asset?.name ?? "Not set";

  return (
    <View className="flex-1">
      <ScrollView
        contentContainerClassName="p-4 pb-10 web:p-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="mx-auto w-full max-w-[1480px] gap-5">
          <CrewProfileHero
            crew={crew}
            assignedVesselName={assignedVesselName}
            onBack={goBack}
            onRefresh={refresh}
            onOpenVessel={goVessel}
            onEdit={goEdit}
            onOpenCertificates={goCertificates}
            onDelete={() => setIsDeleteOpen(true)}
            deleting={deleting}
          />

          <View className="gap-5 web:xl:flex-row web:xl:items-start">
            <View className="flex-1 gap-5">
              <CrewProfileSection
                eyebrow="Identity"
                title="Profile baseline"
                description="Core identity, travel documents, and vessel assignment the crew surfaces read."
              >
                <View className="gap-5 web:grid web:grid-cols-2">
                  <FieldDisplay
                    label="Assigned vessel"
                    value={assignedVesselName}
                  />
                  <FieldDisplay
                    label="Department"
                    value={humanizeCrewValue(crew.department)}
                  />
                  <FieldDisplay label="Nationality" value={crew.nationality ?? "Not set"} />
                  <FieldDisplay
                    label="Date of birth"
                    value={formatDate(crew.dateOfBirth)}
                  />
                  <FieldDisplay
                    label="Passport number"
                    value={crew.passportNumber ?? "Not set"}
                  />
                  <FieldDisplay
                    label="Seafarer ID / Book"
                    value={crew.seafarerId ?? "Not set"}
                  />
                  <FieldDisplay
                    label="Personal email"
                    value={crew.personalEmail ?? "Not set"}
                  />
                  <FieldDisplay label="Rank" value={crew.rank ?? "Not set"} />
                </View>
              </CrewProfileSection>

              <CrewProfileSection
                eyebrow="Assignment"
                title="Contract cycle"
                description="Ownership, embarkation window, and next leave planning around the current assignment."
              >
                <View className="gap-5 web:grid web:grid-cols-2">
                  <FieldDisplay
                    label="Contract type"
                    value={crew.contractType ?? "Not set"}
                  />
                  <FieldDisplay
                    label="Operating company"
                    value={crew.operatingCompany ?? "Not set"}
                  />
                  <FieldDisplay
                    label="Crew agency"
                    value={crew.crewManagementAgency ?? "Not set"}
                  />
                  <FieldDisplay
                    label="Port of embarkation"
                    value={crew.portOfEmbarkation ?? "Not set"}
                  />
                  <FieldDisplay
                    label="Date of embarkation"
                    value={formatDate(crew.dateOfEmbarkation)}
                  />
                  <FieldDisplay
                    label="Expected disembarkation"
                    value={formatDate(crew.expectedDateOfDisembarkation)}
                  />
                  <FieldDisplay
                    label="Next planned vacation"
                    value={formatDate(crew.nextVacationDate)}
                  />
                  <FieldDisplay
                    label="Status context"
                    value={
                      crew.status === "INACTIVE"
                        ? humanizeCrewValue(crew.inactiveReason, "Inactive")
                        : "Active"
                    }
                  />
                </View>
              </CrewProfileSection>

              <CrewProfileSection
                eyebrow="Experience"
                title="Experience and familiarization"
                description="Sea time depth, current-rank context, and onboard familiarization readiness."
              >
                <View className="gap-5 web:grid web:grid-cols-2">
                  <FieldDisplay
                    label="Total sea experience"
                    value={formatYears(crew.totalSeaExperienceYears)}
                  />
                  <FieldDisplay
                    label="Years in current rank"
                    value={formatYears(crew.yearsInCurrentRank)}
                  />
                  <FieldDisplay
                    label="Vessel type experience"
                    value={crew.vesselTypeExperience ?? "Not set"}
                  />
                  <FieldDisplay
                    label="Previous vessels"
                    value={crew.previousVessels ?? "Not set"}
                  />
                  <FieldDisplay
                    label="Time with current company"
                    value={formatMonths(crew.timeWithCurrentCompanyMonths)}
                  />
                  <FieldDisplay
                    label="Onboard familiarization date"
                    value={formatDate(crew.onboardFamiliarizationDate)}
                  />
                  <FieldDisplay
                    label="Checklist completed"
                    value={crew.familiarizationChecklistCompleted ? "Yes" : "No"}
                  />
                  <FieldDisplay
                    label="Responsible officer"
                    value={crew.responsibleOfficer ?? "Not set"}
                  />
                </View>
              </CrewProfileSection>
            </View>

            <View className="w-full gap-5 web:xl:w-[390px]">
              <CrewProfileSection
                eyebrow="Portrait"
                title="Crew photo"
                description="Portrait used by quick views and profile surfaces."
              >
                <View className="gap-4">
                  <View className="h-[280px] overflow-hidden rounded-[20px] border border-shellLine bg-shellCanvas">
                    {crew.photoUrl ? (
                      <CrewPhotoMedia
                        uri={crew.photoUrl}
                        stageClassName="rounded-[16px]"
                      />
                    ) : (
                      <View className="flex-1 items-center justify-center gap-2 px-4">
                        <Ionicons
                          name="person-circle-outline"
                          size={54}
                          className="text-muted"
                        />
                        <Text className="font-semibold text-textMain">
                          No crew photo
                        </Text>
                        <Text className="text-center text-[12px] leading-[18px] text-muted">
                          Add a portrait from edit mode to keep quick views and
                          profile surfaces current.
                        </Text>
                      </View>
                    )}
                  </View>

                  <View className="gap-4">
                    <FieldDisplay
                      label="Stored file"
                      value={crew.photoFileName ?? "Not set"}
                    />
                    <FieldDisplay
                      label="Last updated"
                      value={formatDate(crew.updatedAt, "-")}
                    />
                  </View>
                </View>
              </CrewProfileSection>

              <CrewProfileSection
                eyebrow="Readiness"
                title="Readiness snapshot"
                description="What currently matters operationally before jumping to edit or certificates."
                bodyClassName="gap-3"
              >
                <CrewProfileFactTile
                  label="Status"
                  value={
                    crew.status === "INACTIVE"
                      ? humanizeCrewValue(crew.inactiveReason, "Inactive")
                      : "Active"
                  }
                  helper="Current operational state"
                  tone={statusTone(crew)}
                />
                <CrewProfileFactTile
                  label="Medical"
                  value={formatMedicalState(crew.medicalCertificateValid)}
                  helper={`Expires ${formatDate(crew.medicalCertificateExpirationDate)}`}
                  tone={medicalTone(crew.medicalCertificateValid)}
                />
                <CrewProfileFactTile
                  label="Familiarization"
                  value={familiarizationLabel(crew)}
                  helper={`Date ${formatDate(crew.onboardFamiliarizationDate)}`}
                  tone={familiarizationTone(crew)}
                />
                <CrewProfileFactTile
                  label="Next vacation"
                  value={formatDate(crew.nextVacationDate)}
                  helper="Forward leave planning"
                  tone={crew.nextVacationDate ? "accent" : "neutral"}
                />
              </CrewProfileSection>

              <CrewProfileSection
                eyebrow="Medical"
                title="Medical and notes"
                description="Clinical readiness, restrictions, and operator context that still belongs in crew core."
              >
                <View className="gap-4">
                  <View className="rounded-[20px] border border-shellLine bg-shellCanvas p-4">
                    <Text className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                      Current state
                    </Text>
                    <Text
                      className="mt-2 text-[28px] font-semibold leading-none"
                      style={{
                        color:
                          crew.medicalCertificateValid === true
                            ? "#6ee7b7"
                            : crew.medicalCertificateValid === false
                              ? "#fb7185"
                              : "#7dd3fc",
                      }}
                    >
                      {formatMedicalState(crew.medicalCertificateValid)}
                    </Text>
                    <Text className="mt-2 text-[12px] leading-[18px] text-muted">
                      Expiration: {formatDate(crew.medicalCertificateExpirationDate)}
                    </Text>
                  </View>

                  <FieldDisplay
                    label="Medical restrictions"
                    value={crew.medicalRestrictions ?? "Not set"}
                  />
                  <FieldDisplay
                    label="Notes"
                    value={crew.notes ?? "Not set"}
                  />
                  <FieldDisplay
                    label="Created"
                    value={formatDate(crew.createdAt, "-")}
                  />
                </View>
              </CrewProfileSection>
            </View>
          </View>

          {deleteError ? (
            <Text className="text-[13px] text-destructive">{deleteError}</Text>
          ) : null}
        </View>
      </ScrollView>

      <ConfirmModal
        visible={isDeleteOpen}
        title="Delete crew member"
        message={`Are you sure you want to delete ${crew.fullName}?`}
        confirmLabel="Delete"
        cancelLabel="Keep crew member"
        variant="destructive"
        loading={deleting}
        onCancel={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </View>
  );
}

function CrewProfileSection({
  eyebrow,
  title,
  description,
  children,
  bodyClassName,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  bodyClassName?: string;
}) {
  return (
    <View className="gap-3">
      <View className="gap-1 px-1">
        <Text className="text-[10px] font-semibold uppercase tracking-[0.22em] text-shellHighlight">
          {eyebrow}
        </Text>
        <Text className="text-[20px] font-semibold text-textMain">
          {title}
        </Text>
        <Text className="text-[12px] leading-[18px] text-muted">
          {description}
        </Text>
      </View>

      <View
        className={[
          "rounded-[24px] border border-shellLine bg-shellPanel px-5 py-5",
          bodyClassName ?? "",
        ].join(" ")}
      >
        {children}
      </View>
    </View>
  );
}
