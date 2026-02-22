// features/crew/components/CrewPreviewCard.tsx
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

  return (
    <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
      <CardHeaderRow>
        <View className="gap-1">
          <CardTitle className="text-[16px] text-textMain">Preview</CardTitle>
          <Text className="text-muted text-[13px]">Summary before saving.</Text>
        </View>
      </CardHeaderRow>

      <CardContent className="px-6">
        <View className="rounded-[18px] border border-border bg-baseBg/35 p-4 gap-3">
          <RowInfo label="Name" value={values.fullName.trim() || "—"} />
          <RowInfo label="Rank" value={values.rank.trim() || "—"} />
          <RowInfo
            label="Nationality"
            value={values.nationality.trim() || "—"}
          />
          <RowInfo
            label="Primary Document ID"
            value={values.documentId.trim() || "—"}
          />
          <RowInfo label="Status" value={values.status} />
          <RowInfo label="Vessel" value={vesselName} />
        </View>

        <View className="mt-4 rounded-[18px] border border-border bg-baseBg/35 p-4">
          <Text className="text-muted text-[12px] leading-[16px]">
            Tip: Keep Rank and Nationality consistent for reports and crew
            lists.
          </Text>
        </View>
      </CardContent>
    </Card>
  );
}
