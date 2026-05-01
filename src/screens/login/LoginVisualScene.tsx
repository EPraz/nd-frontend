import { Text } from "@/src/components/ui/text/Text";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import { View, useWindowDimensions } from "react-native";
import { LoginMaritimeArtwork } from "./LoginMaritimeArtwork";
import { LoginWordmark } from "./LoginWordmark";
import { LOGIN_PALETTE } from "./login.constants";

type LoginVisualSceneProps = {
  compact?: boolean;
};

export function LoginVisualScene({ compact = false }: LoginVisualSceneProps) {
  const { height } = useWindowDimensions();
  const isTightDesktop = !compact && height < 820;
  const isVeryTightDesktop = !compact && height < 700;
  const horizontalPadding = compact ? 26 : isTightDesktop ? 44 : 56;
  const verticalPadding = compact ? 26 : isTightDesktop ? 36 : 52;
  const dividerOffset = compact ? 24 : isVeryTightDesktop ? 42 : 70;
  const headlineSize = compact ? 18 : isTightDesktop ? 27 : 30;
  const headlineLineHeight = compact ? 28 : isTightDesktop ? 38 : 42;

  return (
    <View
      className="relative min-w-0 flex-1 overflow-hidden"
      style={{
        height: compact ? undefined : "100%",
        minHeight: compact ? 340 : undefined,
        paddingHorizontal: horizontalPadding,
        paddingVertical: verticalPadding,
      }}
    >
      <ExpoLinearGradient
        colors={["#020814", "#030c1f"]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.65, y: 1 }}
        style={{ position: "absolute", inset: 0 }}
      />
      <View
        className="absolute left-[-140px] top-[-110px] h-80 w-80 rounded-full"
        style={{ backgroundColor: "rgba(47, 107, 255, 0.07)" }}
      />

      <LoginMaritimeArtwork compact={compact} />

      <View className="h-full justify-between">
        <View>
          <View style={{ gap: compact ? 14 : 22 }}>
            <LoginWordmark compact={compact} />
            <Text
              className="font-medium uppercase"
              style={{
                color: LOGIN_PALETTE.navySoft,
                fontSize: compact ? 11 : 16,
                lineHeight: compact ? 20 : 27,
                letterSpacing: compact ? 3 : 5.4,
                maxWidth: compact ? 360 : 560,
              }}
            >
              Advanced Risk & Operational Intelligence System
            </Text>
          </View>

          <View
            className="rounded-full"
            style={{
              marginTop: dividerOffset,
              width: 72,
              height: 3,
              backgroundColor: LOGIN_PALETTE.actionHighlight,
            }}
          />

          <View style={{ gap: 8, marginTop: compact ? 22 : 16 }}>
            <Text
              style={{
                color: LOGIN_PALETTE.navy,
                fontSize: headlineSize,
                lineHeight: headlineLineHeight,
              }}
            >
              Intelligence that{" "}
              <Text
                style={{
                  color: LOGIN_PALETTE.action,
                  fontSize: headlineSize,
                  lineHeight: headlineLineHeight,
                }}
              >
                navigates
              </Text>{" "}
              risk.
            </Text>
            <Text
              style={{
                color: LOGIN_PALETTE.navy,
                fontSize: headlineSize,
                lineHeight: headlineLineHeight,
              }}
            >
              Systems that drive{" "}
              <Text
                style={{
                  color: LOGIN_PALETTE.action,
                  fontSize: headlineSize,
                  lineHeight: headlineLineHeight,
                }}
              >
                decisions
              </Text>
              .
            </Text>
          </View>
        </View>

        <Text
          style={{
            color: LOGIN_PALETTE.navySoft,
            fontSize: 12,
            letterSpacing: 2.2,
          }}
        >
          ARXIS v1.0 <Text style={{ color: LOGIN_PALETTE.navyMute }}> | </Text>{" "}
          Secure. Intelligent. Maritime.
        </Text>
      </View>
    </View>
  );
}
