import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import { View } from "react-native";

export function LoginBackground() {
  return (
    <View className="absolute inset-0 overflow-hidden bg-authCanvas">
      <ExpoLinearGradient
        colors={["#020814", "#030c1f", "#020814"]}
        locations={[0, 0.52, 1]}
        style={{ position: "absolute", inset: 0 }}
      />
      <View
        className="absolute left-[-90px] top-[-130px] h-[360px] w-[360px] rounded-full"
        style={{ backgroundColor: "rgba(8, 61, 88, 0.22)" }}
      />
      <View
        className="absolute bottom-[-220px] right-[-120px] h-[420px] w-[420px] rounded-full"
        style={{ backgroundColor: "rgba(47, 107, 255, 0.08)" }}
      />
    </View>
  );
}
