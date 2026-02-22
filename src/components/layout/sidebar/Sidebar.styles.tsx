import { Ionicons } from "@expo/vector-icons";
import { PropsWithChildren, type ComponentProps } from "react";
import { Platform, Text, View, ViewProps, type TextProps } from "react-native";

const cx = (...classes: (string | undefined)[]) =>
  classes.filter(Boolean).join(" ");

export const SidebarLabel = (props: TextProps) => {
  return (
    <Text
      {...props}
      selectable={false}
      className={cx("select-none text-textMain", props.className as string)}
    />
  );
};

export const SidebarIcon = (props: ComponentProps<typeof Ionicons>) => {
  return (
    <Ionicons
      {...props}
      size={22}
      className={cx("text-textMain", props.className as string)}
    />
  );
};

export const SidebarIconSelected = (props: ComponentProps<typeof Ionicons>) => {
  return (
    <Ionicons
      {...props}
      size={22}
      className={cx("text-accent", props.className as string)}
    />
  );
};

type GroupSidebarMenuProps = {
  collapsed: boolean;
  children: React.ReactNode;
  className?: string;
};

export const GroupSidebarMenu = ({
  collapsed,
  children,
  className,
}: GroupSidebarMenuProps) => {
  return (
    <View
      className={cx(
        `${collapsed ? "rounded-full w-fit" : "rounded-[20px] w-full"} p-1 gap-3 h-fit`,
        // “panel” dentro del sidebar: surface suave + borde
        "bg-surface border border-border",
        className as string,
      )}
    >
      {children}
    </View>
  );
};

type SidebarContainerProps = ViewProps & {
  collapsed: boolean;
  isDesktop: boolean;
};

export const SidebarContainer = ({
  collapsed,
  isDesktop,
  children,
  className,
  ...rest
}: PropsWithChildren<SidebarContainerProps>) => {
  const desktopWidth = collapsed ? "w-[92px]" : "w-[320px]";
  const mobileWidth = "w-[85vw] max-w-[360px]";
  const mobileTransform = collapsed ? "-translate-x-full" : "translate-x-0";

  const openTransitionWeb = Platform.OS === "web" && !collapsed;

  return (
    <View
      {...rest}
      className={cx(
        isDesktop ? desktopWidth : mobileWidth,
        "absolute top-0 left-0 z-20 inset-y-0",
        "flex flex-col items-center justify-between gap-[26px] p-[20px]",
        // contenedor principal: baseBg para “depth” y surface en panels internos
        "bg-baseBg border-r border-border overflow-hidden",
        // ✅ SOLO cuando abre (web)
        openTransitionWeb ? "transition-all duration-200" : "",
        // ✅ native: mover con translateX
        !isDesktop ? mobileTransform : "",
        !collapsed
          ? "shadow-lg web:shadow-black/40 rounded-tr-[20px] rounded-br-[20px]"
          : "",
        className,
      )}
    >
      {children}
    </View>
  );
};
