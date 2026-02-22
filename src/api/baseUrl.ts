import * as Device from "expo-device";
import { Platform } from "react-native";

function trimSlash(url: string) {
  return url.replace(/\/$/, "");
}

export function resolveBaseUrl(): string {
  const PROD_URL = process.env.EXPO_PUBLIC_API_URL;

  if (PROD_URL) return PROD_URL;

  // Web -> localhost
  if (Platform.OS === "web") {
    const u = process.env.EXPO_PUBLIC_API_URL_WEB;
    if (!u) throw new Error("Missing EXPO_PUBLIC_API_URL_WEB");
    return trimSlash(u);
  }

  // Native (iOS/Android físico) -> IP LAN / dominio público
  const native = process.env.EXPO_PUBLIC_API_URL_NATIVE;
  if (!native) throw new Error("Missing EXPO_PUBLIC_API_URL_NATIVE");

  // Android emulator -> 10.0.2.2
  if (Platform.OS === "android" && !Device.isDevice) {
    const emu = process.env.EXPO_PUBLIC_API_URL_ANDROID_EMULATOR;
    if (!emu) throw new Error("Missing EXPO_PUBLIC_API_URL_ANDROID_EMULATOR");
    return trimSlash(emu);
  }

  return trimSlash(native);
}

export function getBaseUrl(): string {
  const url = resolveBaseUrl();
  if (!url) throw new Error("Missing API base URL");
  return url;
}
