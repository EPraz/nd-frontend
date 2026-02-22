import { Text } from "@/src/components";
import { BlurView } from "expo-blur";
import React from "react";
import {
  ImageBackground,
  ImageSourcePropType,
  Platform,
  View,
} from "react-native";
import { SpecItem, toWebUri } from "./hero.ui";
import RightPanel from "./RightPanel";

type Props = {
  title: string;
  source: ImageSourcePropType;
  left: SpecItem[];
  right: SpecItem[];
  blur?: boolean;
  rightTitle?: string;
};

export function HeroBanner({
  title,
  source,
  left,
  right,
  blur = true,
  rightTitle,
}: Props) {
  const isWeb = Platform.OS === "web";
  const webUri = isWeb ? toWebUri(source as any) : "";

  return (
    <View className="w-full overflow-hidden rounded-xl border border-border">
      {isWeb ? (
        <View
          className="w-full h-[320px]"
          style={
            {
              backgroundImage: `url(${webUri})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            } as unknown as React.CSSProperties
          }
        >
          <OverlayContent
            title={title}
            left={left}
            right={right}
            blur={blur}
            rightTitle={rightTitle}
          />
        </View>
      ) : (
        <ImageBackground
          source={source}
          resizeMode="cover"
          className="w-full h-[340px]"
        >
          <OverlayContent
            title={title}
            left={left}
            right={right}
            blur={blur}
            rightTitle={rightTitle}
          />
        </ImageBackground>
      )}
    </View>
  );
}

function OverlayContent(props: {
  title: string;
  left: SpecItem[];
  right: SpecItem[];
  blur: boolean;
  rightTitle?: string;
}) {
  const { title, left, right, blur, rightTitle } = props;

  return (
    <>
      {/* overlays */}
      <View className="absolute inset-0 bg-black/20" />
      <View className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/15 to-transparent" />

      <View className="flex-1 flex-row items-stretch">
        {/* LEFT: title zone */}
        <View className="flex-1 px-8 py-7 justify-between">
          <View className="gap-2">
            <Text className="text-textMain text-[28px] font-semibold">
              {title}
            </Text>

            {/* opcional: subtitle contextual */}
            <Text className="text-textMain/70 text-[13px] max-w-[520px]">
              Project overview — fleet, crew and certificates status.
            </Text>
          </View>
        </View>

        {/* RIGHT: glass panel */}
        <View className="w-[420px] p-4">
          {blur ? (
            <BlurView
              // intensity={22}
              intensity={42}
              tint="dark"
              className="flex-1 overflow-hidden rounded-xl border border-white/10"
            >
              <RightPanel left={left} right={right} title={rightTitle} />
            </BlurView>
          ) : (
            <View className="flex-1 overflow-hidden rounded-xl border border-white/10 bg-black/55">
              <RightPanel left={left} right={right} title={rightTitle} />
            </View>
          )}
        </View>
      </View>
    </>
  );
}
