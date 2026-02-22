import { SafeScreen } from "@/src/components";
import { SessionProvider, ToastProvider } from "@/src/context";
import { ThemeProvider } from "@/src/context/ThemeProvider";
import "@/src/lib/interop";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SessionProvider>
          <ToastProvider>
            <SafeScreen>
              <View className={`flex-1`}>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="(app)" />
                </Stack>
                <PortalHost />
              </View>
            </SafeScreen>
          </ToastProvider>
        </SessionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
