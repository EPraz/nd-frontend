import { Text } from "@/src/components/ui/text/Text";
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import { LOGIN_PALETTE } from "./login.constants";

type LoginVisualSceneProps = {
  compact?: boolean;
};

type GlassTileProps = {
  width: number;
  height: number;
  top: number;
  left: number;
  rotate?: string;
};

function GlassTile({
  width,
  height,
  top,
  left,
  rotate = "0deg",
}: GlassTileProps) {
  return (
    <View
      className="absolute overflow-hidden rounded-[28px]"
      style={{
        top,
        left,
        width,
        height,
        transform: [{ rotate }],
        borderWidth: 1,
        borderColor: LOGIN_PALETTE.artEdge,
        backgroundColor: LOGIN_PALETTE.artPanel,
        shadowColor: "#000000",
        shadowOpacity: 0.24,
        shadowRadius: 24,
      }}
    >
      <LinearGradient
        colors={[
          "rgba(105, 121, 235, 0.52)",
          "rgba(41, 188, 173, 0.48)",
          "rgba(157, 174, 255, 0.38)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      />
      <View
        className="absolute inset-0"
        style={{
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.12)",
          borderRadius: 28,
        }}
      />
    </View>
  );
}

export function LoginVisualScene({ compact = false }: LoginVisualSceneProps) {
  const sceneWidth = compact ? 300 : 500;
  const sceneHeight = compact ? 220 : 372;

  return (
    <View className="flex-1 overflow-hidden px-5 py-5 web:px-8 web:py-7">
      <LinearGradient
        colors={["rgba(12,20,34,0.96)", "rgba(15,24,40,0.90)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", inset: 0 }}
      />

      <View
        className="absolute left-[-36px] top-14 h-32 w-32 rounded-full"
        style={{ backgroundColor: LOGIN_PALETTE.artGlowA }}
      />
      <View
        className="absolute bottom-12 right-8 h-44 w-44 rounded-full"
        style={{ backgroundColor: LOGIN_PALETTE.artGlowB }}
      />

      <View className="h-full justify-between">
        <View className="gap-3">
          <View
            className="self-start rounded-full px-4 py-2"
            style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
          >
            <Text
              className="text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: LOGIN_PALETTE.accent }}
            >
              ARXIS
            </Text>
          </View>

          <Text
            className="max-w-[320px] text-[14px] leading-6"
            style={{ color: LOGIN_PALETTE.navySoft }}
          >
            Quiet access into workspaces, control surfaces, and operational
            views.
          </Text>
        </View>

        <View
          className="self-center"
          style={{ width: sceneWidth, height: sceneHeight }}
        >
          <GlassTile
            width={compact ? 88 : 122}
            height={compact ? 88 : 122}
            top={compact ? 4 : 8}
            left={compact ? 20 : 40}
            rotate="-2deg"
          />
          <GlassTile
            width={compact ? 118 : 168}
            height={compact ? 38 : 54}
            top={compact ? 10 : 22}
            left={compact ? 130 : 168}
            rotate="-16deg"
          />
          <GlassTile
            width={compact ? 156 : 222}
            height={compact ? 156 : 222}
            top={compact ? 58 : 90}
            left={compact ? 70 : 96}
          />
          <GlassTile
            width={compact ? 156 : 222}
            height={compact ? 156 : 222}
            top={compact ? 58 : 90}
            left={compact ? 162 : 232}
          />
          <GlassTile
            width={compact ? 156 : 222}
            height={compact ? 156 : 222}
            top={compact ? 138 : 194}
            left={compact ? 70 : 96}
          />
          <GlassTile
            width={compact ? 156 : 222}
            height={compact ? 156 : 222}
            top={compact ? 138 : 194}
            left={compact ? 162 : 232}
          />
          <GlassTile
            width={compact ? 44 : 62}
            height={compact ? 44 : 62}
            top={compact ? 102 : 138}
            left={compact ? 0 : 6}
            rotate="-12deg"
          />
          <GlassTile
            width={compact ? 48 : 68}
            height={compact ? 48 : 68}
            top={compact ? 118 : 150}
            left={compact ? 256 : 432}
            rotate="12deg"
          />
          <GlassTile
            width={compact ? 58 : 84}
            height={compact ? 34 : 46}
            top={compact ? 182 : 300}
            left={compact ? 40 : 74}
            rotate="-12deg"
          />
          <GlassTile
            width={compact ? 62 : 92}
            height={compact ? 38 : 52}
            top={compact ? 186 : 304}
            left={compact ? 214 : 336}
            rotate="16deg"
          />
        </View>

        <View className="gap-2">
          <Text
            className="text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: LOGIN_PALETTE.accent }}
          >
            Entry portal
          </Text>
          <Text
            className="max-w-[380px] text-[13px] leading-6"
            style={{ color: LOGIN_PALETTE.navySoft }}
          >
            One sign-in, then the product shifts into projects, admin control,
            and the operational views we already defined.
          </Text>
        </View>
      </View>
    </View>
  );
}
