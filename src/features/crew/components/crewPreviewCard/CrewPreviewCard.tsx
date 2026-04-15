import {
  Card,
  CardContent,
  CardHeaderRow,
  CardTitle,
  RowInfo,
  Text,
} from "@/src/components";
import { View } from "react-native";
import { CrewFormValues } from "../crewFormTypes";

export default function CrewPreviewCard({
  values,
}: {
  values: CrewFormValues;
}) {
  const vesselName = values.selectedVessel?.name ?? "—";
  const medicalStatus =
    values.medicalCertificateValid === null
      ? "Unknown"
      : values.medicalCertificateValid
        ? "Valid"
        : "Not valid";

  return (
    <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
      <CardHeaderRow>
        <View className="gap-1">
          <CardTitle className="text-[16px] text-textMain">Preview</CardTitle>
          <Text className="text-muted text-[13px]">
            Quick summary before saving.
          </Text>
        </View>
      </CardHeaderRow>

      <CardContent className="px-6">
        <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft p-4 gap-3">
          <RowInfo label="Name" value={values.fullName.trim() || "—"} />
          <RowInfo label="Rank" value={values.rank.trim() || "—"} />
          <RowInfo
            label="Department"
            value={values.department ? values.department : "—"}
          />
          <RowInfo label="Vessel" value={vesselName} />
          <RowInfo label="Embarkation" value={values.dateOfEmbarkation || "—"} />
          <RowInfo
            label="Disembarkation"
            value={values.expectedDateOfDisembarkation || "—"}
          />
          <RowInfo
            label="Next Vacation"
            value={values.nextVacationDate || "—"}
          />
          <RowInfo
            label="Inactive Reason"
            value={values.status === "INACTIVE" ? values.inactiveReason ?? "—" : "—"}
          />
          <RowInfo label="Medical" value={medicalStatus} />
          <RowInfo label="Status" value={values.status} />
        </View>

        <View className="mt-4 rounded-[18px] border border-shellLine bg-shellPanelSoft p-4 gap-2">
          <Text className="text-muted text-[12px] leading-[16px]">
            Crew core now captures identity, contract, experience,
            familiarization, and medical status. Certificates and training come
            next.
          </Text>
        </View>
      </CardContent>
    </Card>
  );
}
