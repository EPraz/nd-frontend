import { SidebarItemType, SidebarKey } from "@/src/constants";
import { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import BrandLogo from "./BrandLogo";
import { GroupSidebarMenu, SidebarContainer } from "./Sidebar.styles";
import SidebarItem from "./SidebarItem";

type Props = {
  collapsed: boolean;
  activeKey: SidebarKey;
  items: { main: SidebarItemType[]; secondary: SidebarItemType[] };
  onChangeActive: (key: SidebarKey) => void;
  onToggleTheme: () => void;
  onLogout: () => void;
  handleSetCollapse: (value: boolean) => void;
};

export default function Sidebar({
  collapsed,
  activeKey = "dashboard",
  items,
  onChangeActive,
  onToggleTheme,
  onLogout,
  handleSetCollapse,
}: Props) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;

  const widthFitFull = collapsed ? "w-fit" : "w-full";
  const [showText, setShowText] = useState(!collapsed);

  useEffect(() => {
    if (!isDesktop) return;

    if (!collapsed) {
      const t = setTimeout(() => setShowText(true), 150);
      return () => clearTimeout(t);
    } else {
      setShowText(false);
    }
  }, [collapsed, isDesktop]);

  return (
    <SidebarContainer
      collapsed={collapsed}
      isDesktop={isDesktop}
      {...(isDesktop && {
        onMouseEnter: () => handleSetCollapse(false),
        onMouseLeave: () => handleSetCollapse(true),
      })}
    >
      {/* Logo */}
      <View
        className={`${widthFitFull} flex-row items-center justify-center gap-4`}
      >
        <Pressable onPress={() => handleSetCollapse(!collapsed)}>
          <BrandLogo collapsed={collapsed} />
        </Pressable>
        {/* {showText && (
          <SidebarLabel className="font-bold text-[18px]">
            Dashboard
          </SidebarLabel>
        )} */}
      </View>

      {/* Menus */}
      <View className={`${widthFitFull} pt-4 flex-1`}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-[26px] items-center pb-6"
          showsVerticalScrollIndicator={false}
        >
          <GroupSidebarMenu collapsed={collapsed}>
            {items.main.map((it) => (
              <SidebarItem
                key={it.key}
                active={activeKey === it.key}
                showText={showText}
                collapsed={collapsed}
                label={it.label}
                iconBase={it.iconBase}
                enabled={it.enabled}
                onPress={() => onChangeActive(it.key)}
              />
            ))}
          </GroupSidebarMenu>

          <View className="w-full h-px bg-border" />

          <GroupSidebarMenu collapsed={collapsed}>
            {items.secondary.map((it) => (
              <SidebarItem
                key={it.key}
                active={activeKey === it.key}
                showText={showText}
                collapsed={collapsed}
                label={it.label}
                iconBase={it.iconBase}
                enabled={it.enabled}
                onPress={() => onChangeActive(it.key)}
              />
            ))}
          </GroupSidebarMenu>

          <View className="h-6" />
        </ScrollView>
      </View>

      {/* Bottom actions */}
      <View className={`${widthFitFull} flex items-center justify-start gap-3`}>
        <GroupSidebarMenu collapsed={collapsed}>
          <SidebarItem
            key="Switch Theme"
            active={false}
            showText={showText}
            collapsed={collapsed}
            label="Switch Theme"
            iconBase="moon"
            onPress={onToggleTheme}
            enabled
          />
        </GroupSidebarMenu>

        <GroupSidebarMenu
          collapsed={collapsed}
          className="bg-destructive/15 border border-destructive/30"
        >
          <SidebarItem
            key="Logout"
            active={false}
            showText={showText}
            collapsed={collapsed}
            label="Logout"
            iconBase="arrow-back-circle"
            outlinedOnInactive={false}
            onPress={onLogout}
            iconColor="text-destructive"
            iconContainerClassName="bg-destructive/15 border border-destructive/30"
            labelClassName="text-textMain"
          />
        </GroupSidebarMenu>
      </View>
    </SidebarContainer>
  );
}

// helper local (igual que en tus otros files)
const cx = (...classes: (string | undefined)[]) =>
  classes.filter(Boolean).join(" ");
