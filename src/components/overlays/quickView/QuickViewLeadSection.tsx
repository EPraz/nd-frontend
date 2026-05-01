import { cn } from "@/src/lib/utils";
import React from "react";
import { useWindowDimensions, View } from "react-native";

type Props = {
  main: React.ReactNode;
  aside?: React.ReactNode;
  asideClassName?: string;
  asideWidth?: number;
};

export function QuickViewLeadSection({
  main,
  aside,
  asideClassName,
  asideWidth = 300,
}: Props) {
  const { width } = useWindowDimensions();
  const useAsideRail = width >= 1024;

  return (
    <View className="min-w-0 gap-3 lg:flex-row lg:items-start">
      <View className="min-w-0 flex-1 gap-2">{main}</View>

      {aside ? (
        <View
          className={cn("w-full min-w-0 lg:flex-none", asideClassName)}
          style={useAsideRail ? { width: asideWidth, flexShrink: 0 } : undefined}
        >
          {aside}
        </View>
      ) : null}
    </View>
  );
}
