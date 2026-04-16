import type { AssetDto } from "@/src/contracts/assets.contract";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { Text } from "../text/Text";

export function VesselPill({ vessel }: { vessel: AssetDto }) {
  const profile = vessel.vessel;
  const idLabel =
    profile?.identifierType === "IMO"
      ? profile.imo
        ? `IMO: ${profile.imo}`
        : "IMO"
      : profile?.licenseNumber
        ? `LIC: ${profile.licenseNumber}`
        : "LICENSE";

  const flag = profile?.flag ? `Flag: ${profile.flag}` : null;

  return (
    <View className="flex-row items-center gap-2 self-start rounded-full border border-shellLine bg-shellPanelSoft px-3 py-1.5">
      <Ionicons name="boat-outline" size={14} color="rgba(221,230,237,0.85)" />
      <Text className="text-[12px] text-textMain">
        Vessel:{" "}
        <Text className="text-textMain font-semibold">{vessel.name}</Text>
        {"  "}
        <Text className="text-muted">- {idLabel}</Text>
        {flag ? <Text className="text-muted"> - {flag}</Text> : null}
      </Text>
    </View>
  );
}
