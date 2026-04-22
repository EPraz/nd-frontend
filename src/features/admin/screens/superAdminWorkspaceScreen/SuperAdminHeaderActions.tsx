import { Button } from "@/src/components/ui/button/Button";
import { useRouter } from "expo-router";
import { RefreshCw } from "lucide-react-native";

const ICON_COLOR = "#cad5e7";

export function SuperAdminHeaderActions({
  onRefresh,
}: {
  onRefresh: () => Promise<void>;
}) {
  const router = useRouter();

  return (
    <>
      <Button
        variant="outline"
        size="pillSm"
        className="rounded-full"
        onPress={() => router.replace("/projects")}
      >
        Back to workspaces
      </Button>

      <Button
        variant="icon"
        size="icon"
        onPress={onRefresh}
        accessibilityLabel="Refresh admin workspace"
      >
        <RefreshCw size={17} color={ICON_COLOR} />
      </Button>
    </>
  );
}
