import { Text } from "@/src/components";
import { cn } from "@/src/lib/utils";
import { Pressable, ScrollView, View } from "react-native";
import {
  isVesselNavItemActive,
  toneStyle,
  type VesselShellNavItem,
} from "./vesselShellLayout.helpers";

type Props = {
  navItems: VesselShellNavItem[];
  pathname: string;
  hasDedicatedActiveSection: boolean;
  onNavigate: (href: string) => void;
};

export function VesselModuleTabs({
  navItems,
  pathname,
  hasDedicatedActiveSection,
  onNavigate,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="flex-row items-end gap-8"
    >
      {navItems.map((item) => {
        const isActive = isVesselNavItemActive(
          pathname,
          item.href,
          item.key,
          hasDedicatedActiveSection,
        );
        const tone = toneStyle(item.tone);
        const showDot = item.key !== "overview" && item.tone !== "neutral";

        return (
          <Pressable
            key={item.key}
            onPress={() => onNavigate(item.href)}
            className={cn(
              "flex-row items-center gap-2 border-b-2 px-1 py-3",
              isActive ? "border-accent" : "border-transparent",
            )}
          >
            <Text
              className={cn(
                "text-[15px] font-semibold",
                isActive ? "text-textMain" : "text-muted",
              )}
            >
              {item.label}
            </Text>

            {showDot ? (
              <View
                className="mt-0.5 h-2 w-2 rounded-full"
                style={tone.dot}
              />
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
