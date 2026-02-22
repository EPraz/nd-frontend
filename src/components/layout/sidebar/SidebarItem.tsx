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
        "flex-row justify-start items-center",
        disabled ? "opacity-45" : "opacity-100",
        disabled ? "web:cursor-not-allowed" : "web:cursor-pointer",
      ].join(" ")}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      <View
        className={[
          "w-11 h-11 rounded-full items-center justify-center border",
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

      <View className={collapsed ? "w-0 overflow-hidden" : "flex-1"}>
        <SidebarLabel
          numberOfLines={1}
          className={[
            "select-none pl-2",
            labelClassName
              ? labelClassName
              : active
                ? "text-textMain"
                : "text-muted",
            "web:transition-opacity web:duration-150",
            collapsed ? "opacity-0 w-0" : "opacity-100 w-auto",
          ].join(" ")}
        >
          {label}
        </SidebarLabel>

        {showText && disabled ? (
          <SidebarLabel className="text-[11px] text-muted/70 pl-2">
            Coming soon
          </SidebarLabel>
        ) : null}
      </View>
    </Pressable>
  );
};

export default SidebarItem;
