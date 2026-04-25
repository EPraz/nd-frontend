import { Text } from "@/src/components/ui/text/Text";
import { View } from "react-native";
import type { CrewFormValues } from "../crewFormTypes";

function PreviewItem({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "accent" | "success" | "warning";
}) {
  const dotStyle =
    tone === "success"
      ? { backgroundColor: "#34d399" }
      : tone === "warning"
        ? { backgroundColor: "#fbbf24" }
        : tone === "accent"
          ? { backgroundColor: "#ff8f3a" }
          : { backgroundColor: "#94a3b8" };

  return (
    <View className="gap-1">
      <Text className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
        {label}
      </Text>
      <View className="flex-row items-center gap-2">
        <View className="h-2 w-2 rounded-full" style={dotStyle} />
        <Text className="text-[14px] font-semibold text-textMain">{value}</Text>
      </View>
    </View>
  );
}

function normalizeValue(value: string | null | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function getDepartmentLabel(value: CrewFormValues["department"]) {
  switch (value) {
    case "DECK":
      return "Deck";
    case "ENGINE":
      return "Engine";
    case "ELECTRICAL":
      return "Electrical";
    case "CATERING":
      return "Catering";
    case "OTHER":
      return "Other";
    default:
      return "Department pending";
  }
}

export default function CrewPreviewCard({
  values,
  hasPhoto = false,
}: {
  values: CrewFormValues;
  hasPhoto?: boolean;
}) {
  const vesselName = values.selectedVessel?.name ?? "Vessel pending";
  const medicalStatus =
    values.medicalCertificateValid === null
      ? "Unknown"
      : values.medicalCertificateValid
        ? "Valid"
        : "Not valid";
  const crewName = normalizeValue(values.fullName, "Unnamed crew member");
  const rank = normalizeValue(values.rank, "Rank pending");
  const nationality = normalizeValue(values.nationality, "No nationality");
  const department = getDepartmentLabel(values.department);
  const contact = normalizeValue(values.personalEmail, "Optional");
  const embarkation = normalizeValue(values.dateOfEmbarkation, "Not set");
  const passport = normalizeValue(values.passportNumber, "Not set");
  const seafarerId = normalizeValue(values.seafarerId, "Not set");
  const nextVacation = normalizeValue(values.nextVacationDate, "Not set");
  const inactiveReason =
    values.status === "INACTIVE"
      ? normalizeValue(values.inactiveReason ?? null, "Not set")
      : "Not set";
  const portrait = hasPhoto ? "Selected" : "Not set";
  const hasBaseline =
    values.fullName.trim().length >= 3 &&
    Boolean(values.assetId || values.selectedVessel?.id);
  const hasSelectedVessel = Boolean(values.selectedVessel);
  const hasEmail = Boolean(values.personalEmail.trim());

  return (
    <View>
      <View className="overflow-hidden rounded-[28px] border border-shellLine bg-shellPanel">
        <View className="gap-1 border-b border-shellLine px-5 py-4">
          <Text className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
            Live Preview
          </Text>
          <Text className="text-[18px] font-semibold text-textMain">
            Crew baseline
          </Text>
          <Text className="text-[13px] leading-[19px] text-muted">
            This is the profile baseline the crew workspace and quick views will
            read.
          </Text>
        </View>

        <View className="gap-4 p-5">
          <View className="gap-1">
            <Text className="text-[26px] font-semibold leading-[110%] text-textMain">
              {crewName}
            </Text>
            <Text className="text-[13px] text-muted">
              {[vesselName, rank, department].join(" | ")}
            </Text>
          </View>

          <View className="gap-4 rounded-[22px] border border-shellLine bg-shellCanvas p-4">
            <PreviewItem
              label="Profile"
              value={hasBaseline ? "Ready" : "Missing basics"}
              tone={hasBaseline ? "success" : "warning"}
            />
            <PreviewItem
              label="Assignment"
              value={vesselName}
              tone={hasSelectedVessel ? "accent" : "warning"}
            />
            <PreviewItem
              label="Contact"
              value={contact}
              tone={hasEmail ? "success" : "neutral"}
            />
            <PreviewItem
              label="Portrait"
              value={portrait}
              tone={hasPhoto ? "success" : "neutral"}
            />
          </View>

          <View className="gap-3 rounded-[22px] border border-shellLine bg-shellCanvas px-4 py-4">
            <Text className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
              Profile details
            </Text>

            <View className="gap-3 web:grid web:grid-cols-2">
              <PreviewItem
                label="Department"
                value={department}
                tone={values.department ? "accent" : "neutral"}
              />
              <PreviewItem label="Rank" value={rank} tone="accent" />
              <PreviewItem
                label="Nationality"
                value={nationality}
                tone={values.nationality.trim() ? "accent" : "neutral"}
              />
              <PreviewItem
                label="Passport"
                value={passport}
                tone={values.passportNumber.trim() ? "accent" : "neutral"}
              />
              <PreviewItem
                label="Seafarer ID"
                value={seafarerId}
                tone={values.seafarerId.trim() ? "accent" : "neutral"}
              />
              <PreviewItem
                label="Embarkation"
                value={embarkation}
                tone={values.dateOfEmbarkation.trim() ? "accent" : "neutral"}
              />
              <PreviewItem
                label="Medical"
                value={medicalStatus}
                tone={
                  values.medicalCertificateValid === true
                    ? "success"
                    : values.medicalCertificateValid === false
                      ? "warning"
                      : "neutral"
                }
              />
              <PreviewItem
                label="Status"
                value={values.status}
                tone={values.status === "ACTIVE" ? "success" : "warning"}
              />
              <PreviewItem
                label="Next vacation"
                value={nextVacation}
                tone={values.nextVacationDate.trim() ? "accent" : "neutral"}
              />
              <PreviewItem
                label="Inactive reason"
                value={inactiveReason}
                tone={
                  values.status === "INACTIVE" && values.inactiveReason
                    ? "warning"
                    : "neutral"
                }
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
