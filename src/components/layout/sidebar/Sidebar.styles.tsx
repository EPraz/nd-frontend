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
      size={14}
      className={cx("text-textMain", props.className as string)}
    />
  );
};

export const SidebarIconSelected = (props: ComponentProps<typeof Ionicons>) => {
  return (
    <Ionicons
      {...props}
      size={14}
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
        `${collapsed ? "w-fit" : "w-full"} h-fit gap-1 border border-transparent bg-transparent p-0`,
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
  const desktopWidth = collapsed ? "w-[76px]" : "w-[176px]";
  const mobileWidth = "w-[74vw] max-w-[264px]";
  const mobileTransform = collapsed ? "-translate-x-full" : "translate-x-0";
  const animateWeb = Platform.OS === "web";

  return (
    <View
      {...rest}
      className={cx(
        isDesktop ? desktopWidth : mobileWidth,
        "pt-3 absolute inset-y-0 left-0 z-20 flex flex-col items-center justify-start gap-3 overflow-hidden border-r border-shellLine bg-shellChrome p-[12px] web:backdrop-blur-xl",
        animateWeb ? "transition-all duration-200" : "",
        !isDesktop ? mobileTransform : "",
        !isDesktop && !collapsed
          ? "rounded-br-[18px] rounded-tr-[18px] shadow-lg web:shadow-black/40"
          : "",
        className,
      )}
    >
      {children}
    </View>
  );
};
