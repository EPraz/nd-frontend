import { Text } from "@/src/components/ui/text/Text";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import { LoginMaritimeArtwork } from "./LoginMaritimeArtwork";
import { LoginWordmark } from "./LoginWordmark";
import { LOGIN_PALETTE } from "./login.constants";

type LoginVisualSceneProps = {
  compact?: boolean;
};

export function LoginVisualScene({ compact = false }: LoginVisualSceneProps) {
  return (
    <View
      className="relative min-w-0 flex-1 overflow-hidden"
      style={{
        minHeight: compact ? 420 : 800,
        paddingHorizontal: compact ? 26 : 56,
        paddingVertical: compact ? 28 : 52,
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
              marginTop: compact ? 26 : 82,
              width: 72,
              height: 3,
              backgroundColor: LOGIN_PALETTE.actionHighlight,
            }}
          />

          <View style={{ gap: 8, marginTop: compact ? 22 : 16 }}>
            <Text
              style={{
                color: LOGIN_PALETTE.navy,
                fontSize: compact ? 18 : 30,
                lineHeight: compact ? 28 : 42,
              }}
            >
              Intelligence that{" "}
              <Text
                style={{
                  color: LOGIN_PALETTE.action,
                  fontSize: compact ? 18 : 30,
                  lineHeight: compact ? 28 : 42,
                }}
              >
                navigates
              </Text>{" "}
              risk.
            </Text>
            <Text
              style={{
                color: LOGIN_PALETTE.navy,
                fontSize: compact ? 18 : 30,
                lineHeight: compact ? 28 : 42,
              }}
            >
              Systems that drive{" "}
              <Text
                style={{
                  color: LOGIN_PALETTE.action,
                  fontSize: compact ? 18 : 30,
                  lineHeight: compact ? 28 : 42,
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
