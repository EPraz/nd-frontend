import { Button } from "@/src/components/ui/button/Button";
import { useRouter } from "expo-router";
import { ArrowUpRight, RefreshCw } from "lucide-react-native";

const ICON_COLOR = "#cad5e7";
const ACCENT_ICON_COLOR = "#ff8a3d";

export function SuperAdminHeaderActions({
  onRefresh,
}: {
  onRefresh: () => Promise<void>;
}) {
  const router = useRouter();

  return (
    <>
      <Button
        variant="softAccent"
        size="pillSm"
        className="rounded-full"
        onPress={() => router.replace("/projects")}
        rightIcon={<ArrowUpRight size={14} color={ACCENT_ICON_COLOR} />}
      >
        Workspaces
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
