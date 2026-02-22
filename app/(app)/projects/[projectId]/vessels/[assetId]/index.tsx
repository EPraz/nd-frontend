import { Loading } from "@/src/components";
import { useVessel } from "@/src/features/vessels/hooks/useVessel";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function AssetDetailsScreen() {
  const { projectId, assetId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
  }>();

  const {
    vessel: item,
    loading,
    error,
    refresh,
  } = useVessel(String(projectId), String(assetId));

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Loading />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, padding: 20, gap: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Vessel</Text>
        <Text style={{ color: "#b00020" }}>{error}</Text>
        <Pressable
          onPress={refresh}
          style={{ padding: 12, backgroundColor: "#eee", borderRadius: 10 }}
        >
          <Text>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={{ flex: 1, padding: 20 }}>
        <Text>Vessel not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 20, gap: 10 }}>
      <Text style={{ fontSize: 20, fontWeight: "800" }}>{item.name}</Text>

      <Text style={{ opacity: 0.75 }}>Status: {item.status}</Text>
      <Text style={{ opacity: 0.7 }}>
        {item.vessel?.imo
          ? `IMO: ${item.vessel.imo}`
          : item.vessel?.licenseNumber
            ? `Licencia: ${item.vessel.licenseNumber}`
            : "Sin identificador"}
      </Text>
      <Text style={{ opacity: 0.75 }}>
        {item.vessel?.flag ? `Flag: ${item.vessel?.flag}` : "Sin bandera"}
      </Text>

      {/* Guardrails: módulos por buque (no implementados aún) */}
      <View style={{ marginTop: 16, gap: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: "700" }}>Módulos</Text>

        <Pressable
          style={{
            padding: 12,
            backgroundColor: "#f3f3f3",
            borderRadius: 12,
          }}
          onPress={() =>
            router.push(
              `/projects/${projectId}/vessels/${assetId}/certificates`,
            )
          }
        >
          <Text>Certificates </Text>
        </Pressable>
        <Pressable
          style={{
            padding: 12,
            backgroundColor: "#f3f3f3",
            borderRadius: 12,
          }}
          onPress={() =>
            router.push(`/projects/${projectId}/vessels/${assetId}/crew`)
          }
        >
          <Text>Crew </Text>
        </Pressable>
        <Pressable
          style={{
            padding: 12,
            backgroundColor: "#f3f3f3",
            borderRadius: 12,
          }}
          onPress={() =>
            router.push(`/projects/${projectId}/vessels/${assetId}/maintenance`)
          }
        >
          <Text>Maintenance</Text>
        </Pressable>
        <Pressable
          style={{
            padding: 12,
            backgroundColor: "#f3f3f3",
            borderRadius: 12,
          }}
          onPress={() =>
            router.push(`/projects/${projectId}/vessels/${assetId}/fuel`)
          }
        >
          <Text>Fuel</Text>
        </Pressable>
      </View>
    </View>
  );
}
