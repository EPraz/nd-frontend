import maritimeNetworkArt from "@/assets/images/login-maritime-network.jpeg";
import { Image } from "expo-image";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import { View, useWindowDimensions } from "react-native";

type LoginMaritimeArtworkProps = {
  compact: boolean;
};

export function LoginMaritimeArtwork({ compact }: LoginMaritimeArtworkProps) {
  const { height, width } = useWindowDimensions();
  const isTightDesktop = !compact && height < 820;
  const widthScale = compact ? 1 : Math.min(1.12, Math.max(0.95, width / 1600));
  const baseHeight = compact
    ? Math.min(150, Math.max(108, height * 0.18))
    : height * (isTightDesktop ? 0.34 : 0.44) * widthScale;
  const artworkHeight = compact
    ? baseHeight
    : Math.min(height * 0.52, Math.max(isTightDesktop ? 220 : 340, baseHeight));
  const artworkBottom = compact ? 34 : isTightDesktop ? 44 : 64;

  return (
    <View
      className={compact ? "relative overflow-hidden" : "absolute inset-x-0 overflow-hidden"}
      style={{
        bottom: compact ? undefined : artworkBottom,
        height: artworkHeight,
        marginHorizontal: compact ? -26 : undefined,
        marginTop: compact ? 22 : undefined,
      }}
    >
      <Image
        source={maritimeNetworkArt}
        contentFit="cover"
        contentPosition={compact ? "center" : "right center"}
        style={{
          bottom: 0,
          height: "100%",
          left: 0,
          opacity: compact ? 0.72 : 0.94,
          position: "absolute",
          right: 0,
          top: 0,
          width: "100%",
        }}
      />
      <ExpoLinearGradient
        colors={[
          "rgba(2, 8, 20, 0.86)",
          "rgba(2, 8, 20, 0.10)",
          "rgba(2, 8, 20, 0.62)",
        ]}
        locations={[0, 0.36, 1]}
        style={{ position: "absolute", inset: 0 }}
      />
    </View>
  );
}
