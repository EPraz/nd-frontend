import {
  EvilIcons,
  FontAwesome,
  Fontisto,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
  Zocial,
} from "@expo/vector-icons";

export type iconLib = "mc" | "ft" | "ion" | "zc" | "mi" | "fa" | "ev" | "oc";
export const iconLibMap: Record<iconLib, any> = {
  mc: MaterialCommunityIcons,
  ion: Ionicons,
  ft: Fontisto,
  zc: Zocial,
  mi: MaterialIcons,
  fa: FontAwesome,
  ev: EvilIcons,
  oc: Octicons,
};
