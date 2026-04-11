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
  subtitle?: string;
  leftSectionTitle?: string;
  rightSectionTitle?: string;
};

export function HeroBanner({
  title,
  source,
  left,
  right,
  blur = true,
  rightTitle,
  subtitle,
  leftSectionTitle,
  rightSectionTitle,
}: Props) {
  const isWeb = Platform.OS === "web";
  const webUri = isWeb ? toWebUri(source as any) : "";

  return (
    <View className="w-full overflow-hidden rounded-xl border border-shellLine">
      {isWeb ? (
        <View
          className="w-full h-[375px]"
          style={
            Platform.OS === "web"
              ? ({
                  backgroundImage: `url(${webUri})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                } as any)
              : undefined
          }
        >
          <OverlayContent
            title={title}
            subtitle={subtitle}
            left={left}
            right={right}
            blur={blur}
            rightTitle={rightTitle}
            leftSectionTitle={leftSectionTitle}
            rightSectionTitle={rightSectionTitle}
          />
        </View>
      ) : (
        <ImageBackground
          source={source}
          resizeMode="cover"
          className="w-full h-[375px]"
        >
          <OverlayContent
            title={title}
            subtitle={subtitle}
            left={left}
            right={right}
            blur={blur}
            rightTitle={rightTitle}
            leftSectionTitle={leftSectionTitle}
            rightSectionTitle={rightSectionTitle}
          />
        </ImageBackground>
      )}
    </View>
  );
}

function OverlayContent(props: {
  title: string;
  subtitle?: string;
  left: SpecItem[];
  right: SpecItem[];
  blur: boolean;
  rightTitle?: string;
  leftSectionTitle?: string;
  rightSectionTitle?: string;
}) {
  const {
    title,
    subtitle,
    left,
    right,
    blur,
    rightTitle,
    leftSectionTitle,
    rightSectionTitle,
  } = props;

  return (
    <>
      <View className="absolute inset-0 bg-black/20" />
      <View className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/15 to-transparent" />

      <View className="flex-1 flex-row items-stretch">
        <View className="flex-1 px-8 py-7 justify-between">
          <View className="gap-2">
            <Text className="text-textMain text-[28px] font-semibold">
              {title}
            </Text>

            <Text className="max-w-[520px] text-[13px] text-muted">
              {subtitle ?? "Project overview - fleet, crew and certificates status."}
            </Text>
          </View>
        </View>

        <View className="w-[420px] p-4">
          {blur ? (
            <BlurView
              intensity={42}
              tint="dark"
              className="flex-1 overflow-hidden rounded-xl border border-shellLine"
            >
              <RightPanel
                left={left}
                right={right}
                title={rightTitle}
                leftTitle={leftSectionTitle}
                rightTitle={rightSectionTitle}
              />
            </BlurView>
          ) : (
            <View className="flex-1 overflow-hidden rounded-xl border border-shellLine bg-black/55">
              <RightPanel
                left={left}
                right={right}
                title={rightTitle}
                leftTitle={leftSectionTitle}
                rightTitle={rightSectionTitle}
              />
            </View>
          )}
        </View>
      </View>
    </>
  );
}
