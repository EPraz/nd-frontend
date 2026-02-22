import { Ionicons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import { Platform } from "react-native";

if (Platform.OS !== "web") {
  cssInterop(Ionicons, {
    className: {
      target: false,
      nativeStyleToProp: {
        color: "color",
        fontSize: "size",
      },
    },
  });
}
