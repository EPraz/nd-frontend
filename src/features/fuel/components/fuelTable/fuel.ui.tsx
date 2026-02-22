import { Text } from "@/src/components";
import { View } from "react-native";
import { FuelEventType, FuelType } from "../../contracts";

export function FuelEventPill({ type }: { type: FuelEventType }) {
  const tone =
    type === "BUNKERED"
      ? pillTone("success")
      : type === "CONSUMED"
        ? pillTone("fail")
        : type === "TRANSFERRED"
          ? pillTone("info")
          : pillTone("warn");

  const label =
    type === "BUNKERED"
      ? "Bunkered"
      : type === "CONSUMED"
        ? "Consumed"
        : type === "TRANSFERRED"
          ? "Transferred"
          : "Adjustment";

  return (
    <View
      className={[
        "self-start rounded-full px-3 py-1 border border-border",
        tone.bg,
      ].join(" ")}
    >
      <Text className={["text-[12px] font-semibold", tone.text].join(" ")}>
        {label}
      </Text>
    </View>
  );
}

function pillTone(kind: "success" | "warn" | "fail" | "info") {
  switch (kind) {
    case "success":
      return { bg: "bg-success/15", text: "text-success" };
    case "warn":
      return { bg: "bg-warning/15", text: "text-warning" };
    case "fail":
      return { bg: "bg-destructive/15", text: "text-destructive" };
    case "info":
    default:
      return { bg: "bg-accent/15", text: "text-accent" };
  }
}

export function FuelTypePill({ fuelType }: { fuelType: FuelType }) {
  const tone =
    fuelType === "MGO"
      ? pillTone("info")
      : fuelType === "VLSFO"
        ? pillTone("success")
        : fuelType === "HSFO"
          ? pillTone("fail")
          : fuelType === "LNG"
            ? pillTone("warn")
            : pillTone("info");

  return (
    <View
      className={[
        "self-start rounded-full px-3 py-1 border border-border",
        tone.bg,
      ].join(" ")}
    >
      <Text className={["text-[12px] font-semibold", tone.text].join(" ")}>
        {fuelType}
      </Text>
    </View>
  );
}

export function quantityTextClass(t: FuelEventType) {
  switch (t) {
    case "BUNKERED":
      return "text-success";
    case "CONSUMED":
      return "text-destructive";
    case "TRANSFERRED":
      return "text-warning";
    case "ADJUSTMENT":
      return "text-info";
    default:
      return "text-info";
  }
}
