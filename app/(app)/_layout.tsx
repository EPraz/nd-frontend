import { Loading } from "@/src/components";
import { useSessionContext } from "@/src/context";
import { Slot, useRootNavigationState, useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function AppLayout() {
  const router = useRouter();
  const navState = useRootNavigationState();
  const { session, loading } = useSessionContext();

  const navReady = !!navState?.key;

  useEffect(() => {
    if (!navReady) return;
    if (!loading && !session) router.replace("/login");
  }, [navReady, loading, session, router]);

  if (!navReady || loading) {
    return (
      <View className="flex-1 items-center justify-center bg-baseBg">
        <Loading fullScreen />
      </View>
    );
  }

  if (!session) return null;

  return <Slot />;
}
