import maritimeNetworkArt from "@/assets/images/login-maritime-network.jpeg";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import { ImageBackground, View, useWindowDimensions } from "react-native";

type LoginMaritimeArtworkProps = {
  compact: boolean;
};

export function LoginMaritimeArtwork({ compact }: LoginMaritimeArtworkProps) {
  const { height } = useWindowDimensions();
  const isTightDesktop = !compact && height < 820;

  return (
    <View
      className="absolute inset-x-0 overflow-hidden"
      style={{
        bottom: compact ? 34 : isTightDesktop ? 56 : 88,
        height: compact ? 112 : isTightDesktop ? 220 : 280,
      }}
    >
      <ImageBackground
        source={maritimeNetworkArt}
        resizeMode="cover"
        className="h-full w-full"
        imageStyle={{ opacity: compact ? 0.72 : 0.94 }}
      >
        <ExpoLinearGradient
          colors={[
            "rgba(2, 8, 20, 0.08)",
            "rgba(2, 8, 20, 0.00)",
            "rgba(2, 8, 20, 0.62)",
          ]}
          locations={[0, 0.42, 1]}
          style={{ position: "absolute", inset: 0 }}
        />
      </ImageBackground>
    </View>
  );
}
