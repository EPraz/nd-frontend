import { cn } from "@/src/lib/utils";
import React from "react";
import { View } from "react-native";
import { Text } from "../../ui/text/Text";

type Props = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function QuickViewSectionCard({ title, children, className }: Props) {
  return (
    <View
      className={cn(
        "flex-1 rounded-[18px] border border-shellLine bg-shellPanelSoft p-2.5",
        className,
      )}
    >
      <Text className="mb-1.5 text-[14px] font-semibold text-textMain">
        {title}
      </Text>
      {children}
    </View>
  );
}
