import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Keyboard, TextInput, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Text } from "../../ui";

type Props = {
  collapsed: boolean;
  handleSetCollapse: (value: boolean) => void;
};

export default function Header({ collapsed, handleSetCollapse }: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const CONTENT_MAX_WIDTH = 1200;
  const contentWidth = Math.min(screenWidth, CONTENT_MAX_WIDTH);

  const ICON_MUTED = "hsl(var(--muted))";
  const ICON_ACCENT = "hsl(var(--accent))";

  return (
    <SafeAreaView edges={["top", "left", "right"]} className="bg-baseBg">
      <View className="w-full items-center">
        <View
          style={{ maxWidth: contentWidth, width: "100%" }}
          className="h-[72px] lg:h-[84px] flex-row items-center justify-between px-4 lg:px-6"
        >
          {/* Left */}
          <View className="flex-row items-center gap-3">
            <View className="lg:hidden" />
            <View className="hidden lg:flex flex-row items-center gap-3" />
          </View>

          {/* Center: Search (web/desktop) */}
          <Button
            variant="ghost"
            className="hidden lg:flex flex-1 px-6 ml-3 items-stretch justify-center"
            onPress={() => Keyboard.dismiss()}
          >
            <View className="flex-row items-center w-full max-w-[520px] h-[52px] gap-3 px-5 rounded-full border border-border/70 bg-surface/70 web:backdrop-blur-md">
              <Ionicons name="search" size={20} color={ICON_MUTED} />
              <TextInput
                placeholder="Search anything…"
                placeholderTextColor={ICON_MUTED}
                className="flex-1 text-[14px] text-textMain web:outline-none"
                returnKeyType="search"
                submitBehavior="blurAndSubmit"
              />
            </View>
          </Button>

          {/* Right */}
          <View className="flex-row items-center gap-3">
            {/* mobile search */}
            <Button variant="icon" size="icon" className="lg:hidden">
              <Ionicons name="search" size={16} color={ICON_MUTED} />
            </Button>

            {/* chat */}
            <Button variant="icon" size="icon">
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={16}
                color={ICON_MUTED}
              />
            </Button>

            {/* notifications */}
            <Button variant="icon" size="icon">
              <Ionicons
                name="notifications-outline"
                size={16}
                color={ICON_MUTED}
              />
            </Button>

            <View className="hidden lg:flex h-6 w-px bg-border/60 mx-1" />

            {/* profile dropdown button (desktop) */}
            <Button
              variant="outline"
              className="hidden lg:flex flex-row items-center rounded-full px-2.5 h-11 gap-2 border-border/70 bg-surface/70 web:backdrop-blur-md"
            >
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop",
                }}
                className="h-8 w-8 rounded-full"
                contentFit="cover"
              />

              <View className="pr-1">
                <Text className="text-[13px] leading-4 font-semibold text-textMain">
                  Hanna Calzoni
                </Text>
                <Text className="text-[12px] leading-4 text-muted/70">
                  Admin Store
                </Text>
              </View>

              <Ionicons name="chevron-down" size={18} color={ICON_MUTED} />
            </Button>

            {/* mobile menu */}
            <Button
              variant="icon"
              size="icon"
              className="lg:hidden bg-accent/15 border border-accent/25"
              onPress={() => handleSetCollapse(!collapsed)}
            >
              <Ionicons name="menu" size={16} color={ICON_ACCENT} />
            </Button>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
