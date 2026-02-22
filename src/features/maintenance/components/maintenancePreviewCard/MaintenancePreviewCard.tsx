import {
  Card,
  CardContent,
  CardHeaderRow,
  CardTitle,
  RowInfo,
  Text,
} from "@/src/components";
import { View } from "react-native";
import { MaintenanceFormValues } from "../../helpers";

export default function MaintenancePreviewCard({
  values,
}: {
  values: MaintenanceFormValues;
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
          <RowInfo label="Title" value={values.title.trim() || "—"} />
          <RowInfo
            label="Description"
            value={values.description.trim() || "—"}
          />
          <RowInfo label="Due Date" value={values.dueDate.trim() || "—"} />
          <RowInfo label="Priority" value={values.priority || "—"} />
          <RowInfo label="Status" value={values.status || "—"} />
          <RowInfo label="Vessel" value={vesselName} />
        </View>
      </CardContent>
    </Card>
  );
}
