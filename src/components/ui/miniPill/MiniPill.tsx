import { cn } from "@/src/lib/utils";
import { View } from "react-native";
import { Text } from "../..";

type MiniPillProps = {
  children: React.ReactNode;
  className?: string;
};

export function MiniPill({ children, className }: MiniPillProps) {
  return (
    <View
      className={cn(
        "items-center justify-center rounded-full border border-shellLine bg-shellPanelSoft px-3 py-1 web:backdrop-blur-md",
        className,
      )}
    >
      <Text className="text-[11px] text-muted">{children}</Text>
    </View>
  );
}
