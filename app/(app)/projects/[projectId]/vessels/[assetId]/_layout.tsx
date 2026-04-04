import { VesselShellLayout } from "@/src/features/vessels/components/vesselShell/VesselShellLayout";
import { VesselShellProvider } from "@/src/features/vessels/context/VesselShellProvider";
import { Slot, useLocalSearchParams } from "expo-router";

export default function VesselLayout() {
  const { projectId, assetId } = useLocalSearchParams<{
    projectId: string;
    assetId: string;
  }>();

  const pid = String(projectId);
  const aid = String(assetId);

  return (
    <VesselShellProvider projectId={pid} assetId={aid}>
      <VesselShellLayout>
        <Slot />
      </VesselShellLayout>
    </VesselShellProvider>
  );
}
