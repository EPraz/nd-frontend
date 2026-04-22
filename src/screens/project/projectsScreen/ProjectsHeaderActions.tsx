import { Button } from "@/src/components/ui/button/Button";
import { useSessionContext } from "@/src/context/SessionProvider";
import { useRouter } from "expo-router";
import { LogOut, RefreshCw } from "lucide-react-native";

const ICON_COLOR = "#cad5e7";

export function ProjectsHeaderActions({
  onRefresh,
}: {
  onRefresh: () => Promise<void>;
}) {
  const router = useRouter();
  const { signOut, session } = useSessionContext();

  return (
    <>
      {session?.role === "ADMIN" ? (
        <Button
          variant="outline"
          size="pillSm"
          className="rounded-full"
          onPress={() => router.push("/admin")}
        >
          Admin console
        </Button>
      ) : null}

      <Button
        variant="icon"
        size="icon"
        onPress={onRefresh}
        accessibilityLabel="Refresh workspaces"
      >
        <RefreshCw size={17} color={ICON_COLOR} />
      </Button>

      <Button
        variant="icon"
        size="icon"
        onPress={signOut}
        accessibilityLabel="Sign out"
      >
        <LogOut size={17} color={ICON_COLOR} />
      </Button>
    </>
  );
}
