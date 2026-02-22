import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";

export function LoginBackground() {
  return (
    <View className="absolute inset-0 -z-10" pointerEvents="none">
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={["#111B2E", "#0B1220"]}
        style={{ position: "absolute", inset: 0 }}
      />
      {/* overlay opcional para más “depth” */}
      <View className="absolute inset-0 bg-black/20" />
    </View>
  );
}
