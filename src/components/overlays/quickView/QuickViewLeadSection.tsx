import { cn } from "@/src/lib/utils";
import React from "react";
import { Platform, View } from "react-native";

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
  const isWeb = Platform.OS === "web";

  return (
    <View
      className="gap-3"
      style={
        isWeb ? { flexDirection: "row", alignItems: "flex-start" } : undefined
      }
    >
      <View className="min-w-0 flex-1 gap-2">{main}</View>

      {aside ? (
        <View
          className={cn("w-full", asideClassName)}
          style={isWeb ? { width: asideWidth, flexShrink: 0 } : undefined}
        >
          {aside}
        </View>
      ) : null}
    </View>
  );
}
