import { Button } from "@/src/components/ui/button/Button";
import { useSessionContext } from "@/src/context/SessionProvider";
import { canUser } from "@/src/security/rolePermissions";
import { useRouter } from "expo-router";
import { LogOut, RefreshCw, ShieldCheck } from "lucide-react-native";

const ICON_COLOR = "#cad5e7";
const ACCENT_ICON_COLOR = "#ff8a3d";
const DESTRUCTIVE_ICON_COLOR = "#ff6b6b";

export function ProjectsHeaderActions({
  onRefresh,
}: {
  onRefresh: () => Promise<void>;
}) {
  const router = useRouter();
  const { signOut, session } = useSessionContext();
  const canManageUsers = canUser(session, "USER_MANAGE");

  return (
    <>
      {canManageUsers ? (
        <Button
          variant="softAccent"
          size="pillSm"
          className="rounded-full"
          onPress={() => router.push("/admin")}
          rightIcon={<ShieldCheck size={14} color={ACCENT_ICON_COLOR} />}
        >
          Manage access
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
        variant="softDestructive"
        size="icon"
        onPress={signOut}
        accessibilityLabel="Sign out"
      >
        <LogOut size={17} color={DESTRUCTIVE_ICON_COLOR} />
      </Button>
    </>
  );
}
