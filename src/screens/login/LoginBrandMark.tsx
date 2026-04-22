import { View } from "react-native";
import { LOGIN_PALETTE } from "./login.constants";

export function LoginBrandMark() {
  return (
    <View className="relative h-8 w-8">
      <View
        className="absolute left-3 top-0 h-3.5 w-2.5 rounded-full"
        style={{ backgroundColor: LOGIN_PALETTE.accent }}
      />
      <View
        className="absolute bottom-0 left-1 h-4 w-2.5 rounded-full"
        style={{
          backgroundColor: LOGIN_PALETTE.accent,
          transform: [{ rotate: "-28deg" }],
        }}
      />
      <View
        className="absolute bottom-0 right-1 h-4 w-2.5 rounded-full"
        style={{
          backgroundColor: LOGIN_PALETTE.accent,
          transform: [{ rotate: "28deg" }],
        }}
      />
    </View>
  );
}
