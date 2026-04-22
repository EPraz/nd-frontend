import { Pressable, View } from "react-native";
import {
  SidebarIcon,
  SidebarIconSelected,
  SidebarLabel,
} from "./Sidebar.styles";

type SidebarItemProps = {
  active: boolean;
  collapsed: boolean;
  label: string;
  iconBase: string;
  onPress: () => void;
  iconColor?: string;
  enabled?: boolean;
  showText: boolean;
  outlinedOnInactive?: boolean;

  // ✅ NUEVO
  iconContainerClassName?: string;
  labelClassName?: string;
};

const SidebarItem = ({
  active,
  collapsed,
  label,
  iconBase,
  iconColor,
  onPress,
  enabled = true,
  outlinedOnInactive = true,
  showText,
  iconContainerClassName,
  labelClassName,
}: SidebarItemProps) => {
  const inactiveName = outlinedOnInactive
    ? (`${iconBase}-outline` as any)
    : (iconBase as any);

  const disabled = !enabled;

  return (
    <Pressable
      className={[
        "flex-row items-center justify-start rounded-[16px] px-1 py-1",
        disabled ? "opacity-45" : "opacity-100",
        disabled ? "web:cursor-not-allowed" : "web:cursor-pointer",
        active ? "bg-shellPanelSoft" : "bg-transparent",
      ].join(" ")}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      <View
        className={[
          "h-8 w-8 items-center justify-center rounded-full border",
          iconContainerClassName
            ? iconContainerClassName
            : active
              ? "bg-accent/15 border-accent/30"
              : "bg-transparent border-transparent",
        ].join(" ")}
      >
        {active ? (
          <SidebarIconSelected
            name={iconBase as any}
            className={iconColor ?? ""}
          />
        ) : (
          <SidebarIcon name={inactiveName} className={iconColor ?? ""} />
        )}
      </View>

      <View className={collapsed ? "w-0 overflow-hidden" : "min-w-0 flex-1"}>
        <SidebarLabel
          numberOfLines={1}
          className={[
            "select-none pl-2 text-[13px]",
            labelClassName
              ? labelClassName
              : active
                ? "text-textMain font-semibold"
                : "text-muted",
            "web:transition-opacity web:duration-150",
            collapsed ? "opacity-0 w-0" : "opacity-100 w-auto",
          ].join(" ")}
        >
          {label}
        </SidebarLabel>

        {showText && disabled ? (
          <SidebarLabel
            numberOfLines={1}
            className="pl-2 text-[10px] text-muted/70"
          >
            Coming soon
          </SidebarLabel>
        ) : null}
      </View>
    </Pressable>
  );
};

export default SidebarItem;
