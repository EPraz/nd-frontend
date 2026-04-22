import { cn } from "@/src/lib/utils";
import React from "react";
import { View } from "react-native";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function QuickViewMediaPanel({ children, className }: Props) {
  return (
    <View
      className={cn(
        "h-[190px] w-full overflow-hidden rounded-[18px] border border-shellLine bg-shellPanelSoft",
        className,
      )}
    >
      {children}
    </View>
  );
}
