import {
  Card,
  CardContent,
  CardHeaderRow,
  CardTitle,
} from "@/src/components/ui/card/Card";
import { RowInfo } from "@/src/components/ui/forms/RowInfo";
import { Text } from "@/src/components/ui/text/Text";
import { View } from "react-native";
import { CertificateFormValues } from "../../contracts";

const EMPTY_VALUE = "-";

export default function CertificatePreviewCard({
  values,
}: {
  values: CertificateFormValues;
}) {
  const vesselName = values.selectedVessel?.name ?? EMPTY_VALUE;
  const certificateTypeName =
    values.selectedCertificateType?.name ?? EMPTY_VALUE;
  const certificateCode = values.selectedCertificateType?.code ?? EMPTY_VALUE;

  return (
    <Card className="rounded-[24px] shadow-sm shadow-black/10 web:shadow-black/30">
      <CardHeaderRow>
        <View className="gap-1">
          <CardTitle className="text-[16px] text-textMain">Preview</CardTitle>
          <Text className="text-muted text-[13px]">Summary before saving.</Text>
        </View>
      </CardHeaderRow>

      <CardContent className="px-6">
        <View className="rounded-[18px] border border-shellLine bg-shellPanelSoft p-4 gap-3">
          <RowInfo label="Type" value={certificateTypeName} />
          <RowInfo label="Code" value={certificateCode} />
          <RowInfo label="Number" value={values.number.trim() || EMPTY_VALUE} />
          <RowInfo label="Issuer" value={values.issuer.trim() || EMPTY_VALUE} />
          <RowInfo
            label="Issue Date"
            value={values.issueDate.trim() || EMPTY_VALUE}
          />
          <RowInfo
            label="Expiry Date"
            value={values.expiryDate.trim() || EMPTY_VALUE}
          />
          <RowInfo label="Notes" value={values.notes.trim() || EMPTY_VALUE} />
          <RowInfo label="Vessel" value={vesselName} />
        </View>

        <View className="mt-4 rounded-[18px] border border-shellLine bg-shellPanelSoft p-4">
          <Text className="text-muted text-[12px] leading-[16px]">
            Tip: choose the certificate type first so compliance rules and
            requirements map correctly.
          </Text>
        </View>
      </CardContent>
    </Card>
  );
}
