import { useProjectContext } from "@/src/context/ProjectProvider";
import { useSessionContext } from "@/src/context/SessionProvider";
import { useToast } from "@/src/context/ToastProvider";
import { humanizeTechnicalLabel } from "@/src/helpers";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
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

export default function Header({
  collapsed,
  handleSetCollapse,
}: Props) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const compactDesktop = isDesktop && width < 1480;
  const showStatusPill = isDesktop && width >= 1620;
  const showProfileName = isDesktop && width >= 1380;
  const { projectName, projectStatus, projectKind } = useProjectContext();
  const { session, loading, signOut, refresh } = useSessionContext();
  const { show } = useToast();

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const profileTriggerRef = useRef<RNView | null>(null);

  const iconMain = "#e7edf7";
  const userName = session?.name ?? (loading ? "Loading user" : "Signed in");
  const initials = getInitials(session?.name);
  const leftInset = isDesktop ? (collapsed ? 100 : 200) : 12;

  async function handleRefreshSession() {
    await refresh();
    show("Session refreshed.", "success");
  }

  async function handleSignOut() {
    setProfileOpen(false);
    await signOut();
  }

  function openProfileMenu() {
    profileTriggerRef.current?.measureInWindow(
      (x, y, measuredWidth, measuredHeight) => {
        const menuWidth = Math.min(320, Math.max(280, width - 32));
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
          className="w-full flex-row items-center gap-3 px-3 py-2 lg:px-4"
          style={{ paddingLeft: leftInset }}
        >
          <View
            className={[
              "min-w-0 flex-1 flex-row items-center gap-2 lg:flex-none",
              compactDesktop ? "max-w-[360px]" : "max-w-[520px]",
            ].join(" ")}
          >
            <View className="min-w-0 flex-row items-center gap-2 rounded-full border border-shellLine bg-shellChromeSoft px-3 py-2 web:backdrop-blur-md">
              <Text
                numberOfLines={1}
                className={[
                  "min-w-0 shrink font-semibold text-textMain",
                  compactDesktop
                    ? "max-w-[150px] text-[16px]"
                    : "max-w-[224px] text-[17px]",
                ].join(" ")}
              >
                {projectName}
              </Text>
              <MiniPill className="hidden rounded-full border border-shellLine bg-shellPanelSoft px-2.5 py-1 sm:flex">
                <Text className="text-[10px] font-semibold text-muted">
                  {humanizeTechnicalLabel(projectKind)}
                </Text>
              </MiniPill>
              {showStatusPill ? (
                <MiniPill className="rounded-full border border-shellLine bg-shellPanelSoft px-2.5 py-1">
                  <Text className="text-[10px] font-semibold text-muted">
                    {humanizeTechnicalLabel(projectStatus)}
                  </Text>
                </MiniPill>
              ) : null}
            </View>
          </View>

          <View className="hidden lg:flex flex-1" />

          <View className="flex-row items-center gap-2">
            <View className="hidden lg:flex h-5 w-px bg-shellLine mx-1" />

            <Pressable
              ref={profileTriggerRef}
              onPress={() => {
                if (profileOpen) {
                  setProfileOpen(false);
                  return;
                }

                openProfileMenu();
              }}
              className="flex-row items-center gap-2 rounded-full border border-shellLine bg-shellChromeSoft px-2.5 py-1.5 web:backdrop-blur-md"
            >
              <View className="h-8 w-8 items-center justify-center rounded-full border border-accent/30 bg-accent/18">
                <Text className="text-[12px] font-semibold text-accent">
                  {initials}
                </Text>
              </View>

              {showProfileName ? (
                <View className="min-w-0 max-w-[126px] pr-1">
                  <Text
                    numberOfLines={1}
                    className="text-[12px] leading-4 font-semibold text-textMain"
                  >
                    {userName}
                  </Text>
                </View>
              ) : null}

              <Ionicons name="chevron-down" size={12} color={iconMain} />
            </Pressable>

            <Button
              variant="iconAccent"
              size="icon"
              className="h-8 w-8 lg:hidden"
              onPress={() => handleSetCollapse(!collapsed)}
            >
              <Ionicons name="menu" size={12} className="text-accent" />
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
                rightIcon={
                  <Ionicons
                    name="refresh-outline"
                    size={12}
                    className="text-textMain"
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
                rightIcon={
                  <Ionicons
                    name="log-out-outline"
                    size={12}
                    className="text-destructive"
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
