import {
  Card,
  CardContent,
  CardHeaderRow,
  CardTitle,
  RowInfo,
  Text,
} from "@/src/components";
import { View } from "react-native";
import { FuelFormValues } from "../../contracts";

export default function FuelPreviewCard({
  values,
}: {
  values: FuelFormValues;
}) {
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
          <RowInfo label="Date" value={values.date.trim() || "—"} />
          <RowInfo label="Quantity" value={values.quantity.trim() || "—"} />
          <RowInfo label="Unit" value={values.unit || "—"} />
          <RowInfo label="Price" value={values.price.trim() || "—"} />
          <RowInfo label="Currency" value={values.currency.trim() || "—"} />
          <RowInfo label="Location" value={values.location.trim() || "—"} />
          <RowInfo label="Note" value={values.note.trim() || "—"} />
        </View>

        <View className="mt-4 rounded-[18px] border border-border bg-baseBg/35 p-4">
          <Text className="text-muted text-[12px] leading-[16px]">
            Tip: Mantén unidades y precios consistentes para auditorías y
            costos.
          </Text>
        </View>
      </CardContent>
    </Card>
  );
}
