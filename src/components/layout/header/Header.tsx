import { useProjectContext } from "@/src/context/ProjectProvider";
import { useSessionContext } from "@/src/context/SessionProvider";
import { useToast } from "@/src/context/ToastProvider";
import { humanizeTechnicalLabel } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Modal,
  Pressable,
  TextInput,
  View,
  useWindowDimensions,
  type View as RNView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../ui/button/Button";
import { MiniPill } from "../../ui/miniPill/MiniPill";
import { Text } from "../../ui/text/Text";

type Props = {
  collapsed: boolean;
  handleSetCollapse: (value: boolean) => void;
};

function getInitials(name: string | null | undefined) {
  if (!name) return "U";

  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (parts.length === 0) return "U";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export default function Header({ collapsed, handleSetCollapse }: Props) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const { projectName, projectStatus, projectKind } = useProjectContext();
  const { session, loading, signOut, refresh } = useSessionContext();
  const { show } = useToast();

  const [profileOpen, setProfileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [profileAnchor, setProfileAnchor] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const profileTriggerRef = useRef<RNView | null>(null);

  const iconMuted = "hsl(var(--muted))";
  const userName = session?.name ?? (loading ? "Loading user" : "Signed in");
  const userMeta = session?.company?.name
    ? `${humanizeTechnicalLabel(session.role)} - ${session.company.name}`
    : humanizeTechnicalLabel(session?.role ?? "viewer");
  const initials = getInitials(session?.name);
  const leftInset = isDesktop ? (collapsed ? 112 : 340) : 16;

  function handleHeaderSearch() {
    const query = searchValue.trim();

    show(
      query
        ? `Search for "${query}" will be connected in a future iteration.`
        : "Global search will be connected in a future iteration.",
      "info",
    );
  }

  function handleSoon(label: string) {
    show(`${label} is not wired yet in this workspace.`, "info");
  }

  async function handleRefreshSession() {
    await refresh();
    show("Session refreshed.", "success");
  }

  async function handleSignOut() {
    setProfileOpen(false);
    await signOut();
  }

  function openProfileMenu() {
    if (!isDesktop) return;

    profileTriggerRef.current?.measureInWindow(
      (x, y, measuredWidth, measuredHeight) => {
        const menuWidth = 320;
        const viewportPadding = 16;
        const anchoredLeft = x + measuredWidth - menuWidth;
        const safeLeft = Math.max(
          viewportPadding,
          Math.min(anchoredLeft, width - menuWidth - viewportPadding),
        );

        setProfileAnchor({
          top: y + measuredHeight + 10,
          left: safeLeft,
          width: menuWidth,
        });
        setProfileOpen(true);
      },
    );
  }

  return (
    <>
      <SafeAreaView
        edges={["top", "left", "right"]}
        className="border-b border-shellLine bg-shellChrome web:backdrop-blur-xl"
      >
        <View
          className="w-full flex-row items-center gap-4 px-4 py-3 lg:px-6"
          style={{ paddingLeft: leftInset }}
        >
          <View className="hidden lg:flex min-w-[220px] max-w-[320px] gap-1">
            <Text className="text-[11px] uppercase tracking-[0.16em] text-muted">
              Current Workspace
            </Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-[20px] font-semibold text-textMain">
                {projectName}
              </Text>
              <MiniPill className="rounded-full border border-shellLine bg-shellPanelSoft px-2.5 py-1">
                <Text className="text-[10px] font-semibold text-muted">
                  {humanizeTechnicalLabel(projectKind)}
                </Text>
              </MiniPill>
            </View>
            <Text className="text-[12px] text-muted">
              Status: {humanizeTechnicalLabel(projectStatus)}
            </Text>
          </View>

          <View className="flex-1 items-stretch justify-center">
            <View className="h-[52px] w-full max-w-[720px] flex-row items-center gap-3 self-center rounded-full border border-shellLine bg-shellChromeSoft px-5 web:backdrop-blur-md">
              <Ionicons name="search" size={18} color={iconMuted} />
              <TextInput
                disableFullscreenUI
                placeholder="Search anything..."
                placeholderTextColor={iconMuted}
                className="flex-1 text-[14px] text-textMain web:outline-none"
                returnKeyType="search"
                submitBehavior="submit"
                value={searchValue}
                onChangeText={setSearchValue}
                onSubmitEditing={handleHeaderSearch}
              />
              <Button
                variant="soft"
                size="pillSm"
                className="h-9 border-shellLine bg-shellPanelSoft px-3"
                onPress={handleHeaderSearch}
              >
                Search
              </Button>
            </View>
          </View>

          <View className="flex-row items-center gap-3">
            <Button
              variant="icon"
              size="icon"
              className="border-shellLine bg-shellPanelSoft lg:hidden"
              onPress={() => handleSoon("Global search")}
            >
              <Ionicons name="search" size={16} color={iconMuted} />
            </Button>

            <Button
              variant="icon"
              size="icon"
              className="border-shellLine bg-shellPanelSoft"
              onPress={() => handleSoon("Messages")}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={16}
                color={iconMuted}
              />
            </Button>

            <Button
              variant="icon"
              size="icon"
              className="border-shellLine bg-shellPanelSoft"
              onPress={() => handleSoon("Notifications")}
            >
              <Ionicons
                name="notifications-outline"
                size={16}
                color={iconMuted}
              />
            </Button>

            <View className="hidden lg:flex h-6 w-px bg-shellLine mx-1" />

            <Pressable
              ref={profileTriggerRef}
              onPress={() => {
                if (profileOpen) {
                  setProfileOpen(false);
                  return;
                }

                openProfileMenu();
              }}
              className="hidden lg:flex flex-row items-center gap-3 rounded-full border border-shellLine bg-shellChromeSoft px-2.5 py-1.5 web:backdrop-blur-md"
            >
              <View className="h-9 w-9 items-center justify-center rounded-full border border-accent/30 bg-accent/18">
                <Text className="text-[12px] font-semibold text-accent">
                  {initials}
                </Text>
              </View>

              <View className="pr-1">
                <Text className="text-[13px] leading-4 font-semibold text-textMain">
                  {userName}
                </Text>
                <Text className="text-[10px] leading-4 text-muted">
                  {userMeta}
                </Text>
              </View>

              <Ionicons name="chevron-down" size={18} color={iconMuted} />
            </Pressable>

            <Button
              variant="iconAccent"
              size="icon"
              className="lg:hidden"
              onPress={() => handleSetCollapse(!collapsed)}
            >
              <Ionicons name="menu" size={16} color="hsl(var(--accent))" />
            </Button>
          </View>
        </View>
      </SafeAreaView>

      <Modal
        visible={profileOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setProfileOpen(false)}
      >
        <View className="flex-1">
          <Pressable
            className="absolute inset-0 bg-black/35"
            onPress={() => setProfileOpen(false)}
          />

          <View
            className="absolute rounded-[24px] border border-shellLine bg-shellPanel p-5 gap-4 shadow-2xl"
            style={{
              top: profileAnchor?.top ?? 88,
              left:
                profileAnchor?.left ??
                Math.max(16, width - (profileAnchor?.width ?? 320) - 24),
              width: profileAnchor?.width ?? 320,
            }}
          >
            <View className="flex-row items-start gap-4">
              <View className="h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-accent/18">
                <Text className="text-[14px] font-semibold text-accent">
                  {initials}
                </Text>
              </View>

              <View className="flex-1 gap-1">
                <Text className="text-[18px] font-semibold text-textMain">
                  {userName}
                </Text>
                <Text className="text-[13px] text-muted">
                  {session?.email ?? "No session email"}
                </Text>
              </View>
            </View>

            <View className="mt-5 gap-2">
              <Button
                variant="soft"
                size="sm"
                className="justify-between rounded-[16px] border-shellLine bg-shellPanelSoft px-4"
                onPress={handleRefreshSession}
                leftIcon={
                  <Ionicons
                    name="refresh-outline"
                    size={16}
                    color={iconMuted}
                  />
                }
                rightIcon={
                  <Ionicons
                    name="arrow-forward"
                    size={15}
                    color={iconMuted}
                  />
                }
              >
                <Text className="flex-1 text-left">Refresh session</Text>
              </Button>

              <Button
                variant="softDestructive"
                size="default"
                className="justify-between rounded-[16px] px-4"
                onPress={handleSignOut}
                leftIcon={
                  <Ionicons
                    name="log-out-outline"
                    size={16}
                    color={iconMuted}
                  />
                }
                rightIcon={
                  <Ionicons
                    name="arrow-forward"
                    size={15}
                    color={iconMuted}
                  />
                }
              >
                <Text className="flex-1 text-left text-destructive">
                  Sign out
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
