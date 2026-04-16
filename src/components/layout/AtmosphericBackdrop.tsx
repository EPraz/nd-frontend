import { useTheme } from "@/src/context/ThemeProvider";
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";

type BackdropVariant = "auth" | "workspace";
type BackdropMode = "light" | "dark";

type AtmosphericBackdropProps = {
  variant?: BackdropVariant;
};

const BACKDROP_CONFIG: Record<
  BackdropVariant,
  Record<
    BackdropMode,
    {
      base: [string, string, string];
      coolGlow: string;
      warmGlow: string;
      overlay: string;
      topLine: string;
      bottomLine: string;
      leftLine: string;
      rightLine: string;
    }
  >
> = {
  auth: {
    light: {
      base: ["#F4F7FB", "#EAF0F8", "#E7EEF7"],
      coolGlow: "rgba(22, 201, 216, 0.12)",
      warmGlow: "rgba(255, 145, 77, 0.12)",
      overlay: "rgba(255, 255, 255, 0.08)",
      topLine: "rgba(17, 45, 78, 0.08)",
      bottomLine: "rgba(17, 45, 78, 0.06)",
      leftLine: "rgba(17, 45, 78, 0.05)",
      rightLine: "rgba(17, 45, 78, 0.04)",
    },
    dark: {
      base: ["#09111F", "#101A30", "#0B1324"],
      coolGlow: "rgba(22, 201, 216, 0.22)",
      warmGlow: "rgba(255, 145, 77, 0.24)",
      overlay: "rgba(0, 0, 0, 0.12)",
      topLine: "rgba(255,255,255,0.08)",
      bottomLine: "rgba(255,255,255,0.06)",
      leftLine: "rgba(255,255,255,0.06)",
      rightLine: "rgba(255,255,255,0.05)",
    },
  },
  workspace: {
    light: {
      base: ["#F4F7FB", "#EDF2F9", "#E7EDF6"],
      coolGlow: "rgba(22, 201, 216, 0.1)",
      warmGlow: "rgba(255, 145, 77, 0.1)",
      overlay: "rgba(255, 255, 255, 0.08)",
      topLine: "rgba(17, 45, 78, 0.06)",
      bottomLine: "rgba(17, 45, 78, 0.05)",
      leftLine: "rgba(17, 45, 78, 0.05)",
      rightLine: "rgba(17, 45, 78, 0.04)",
    },
    // dark: {
    //   base: ["#09111F", "#0E172A", "#0A1220"],
    //   coolGlow: "rgba(22, 201, 216, 0.16)",
    //   warmGlow: "rgba(255, 145, 77, 0.18)",
    //   overlay: "rgba(0, 0, 0, 0.18)",
    //   topLine: "rgba(255,255,255,0.06)",
    //   bottomLine: "rgba(255,255,255,0.05)",
    //   leftLine: "rgba(255,255,255,0.05)",
    //   rightLine: "rgba(255,255,255,0.04)",
    // },
    dark: {
      base: ["#09111F", "#0E172A", "#10192E"],
      coolGlow: "rgba(22, 201, 216, 0.10)",
      warmGlow: "rgba(255, 145, 77, 0.10)",
      overlay: "rgba(255, 255, 255, 0.01)",
      topLine: "rgba(255,255,255,0.04)",
      bottomLine: "rgba(255,255,255,0.035)",
      leftLine: "rgba(255,255,255,0.03)",
      rightLine: "rgba(255,255,255,0.025)",
    },
  },
};

export function AtmosphericBackdrop({
  variant = "workspace",
}: AtmosphericBackdropProps) {
  const { theme } = useTheme();
  const config = BACKDROP_CONFIG[variant][theme];

  return (
    <View
      className="absolute inset-0 -z-10"
      style={{ pointerEvents: "none" }}
    >
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={config.base}
        style={{ position: "absolute", inset: 0 }}
      />

      <LinearGradient
        start={{ x: 0.08, y: 0.1 }}
        end={{ x: 0.85, y: 0.95 }}
        // colors={[config.coolGlow, "rgba(22, 201, 216, 0)"]}
        colors={[config.coolGlow, "rgba(22, 201, 216, 0)"]}
        style={{
          position: "absolute",
          top: -80,
          left: -120,
          width: 360,
          height: 360,
          borderRadius: 999,
        }}
      />

      <LinearGradient
        start={{ x: 0.2, y: 0.1 }}
        end={{ x: 0.8, y: 0.9 }}
        colors={[config.warmGlow, "rgba(255, 145, 77, 0)"]}
        style={{
          position: "absolute",
          right: -80,
          bottom: -100,
          width: 420,
          height: 420,
          borderRadius: 999,
        }}
      />

      <View
        className="absolute inset-x-0 top-[18%] h-px"
        style={{ backgroundColor: config.topLine }}
      />
      <View
        className="absolute inset-x-0 bottom-[24%] h-px"
        style={{ backgroundColor: config.bottomLine }}
      />
      <View
        className="absolute bottom-0 left-[9%] top-0 w-px"
        style={{ backgroundColor: config.leftLine }}
      />
      <View
        className="absolute bottom-0 right-[11%] top-0 w-px"
        style={{ backgroundColor: config.rightLine }}
      />
      <View
        className="absolute inset-0"
        style={{ backgroundColor: config.overlay }}
      />
    </View>
  );
}

export function WorkspaceBackdrop() {
  return <AtmosphericBackdrop variant="workspace" />;
}
