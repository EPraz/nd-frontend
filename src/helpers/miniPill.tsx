import { cn } from "@/src/lib/utils";
import { View } from "react-native";
import { Text } from "../components";

type MiniPillProps = {
  children: React.ReactNode;
  className?: string;
};

export function MiniPill({ children, className }: MiniPillProps) {
  return (
    <View
      className={cn(
        "rounded-full border border-border bg-baseBg/35 px-3 py-1 items-center justify-center",
        className,
      )}
    >
      <Text className="text-textMain/80 text-[11px]">{children}</Text>
    </View>
  );
}
