import { SidebarItemType, SidebarKey } from "@/src/constants";
import { Ionicons } from "@expo/vector-icons";
import {
  Platform,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { Button } from "../../ui/button/Button";
import BrandLogo from "./BrandLogo";
import {
  GroupSidebarMenu,
  SidebarContainer,
  SidebarLabel,
} from "./Sidebar.styles";
import SidebarItem from "./SidebarItem";

type Props = {
  collapsed: boolean;
  activeKey: SidebarKey;
  items: { main: SidebarItemType[]; secondary: SidebarItemType[] };
  onChangeActive: (key: SidebarKey) => void;
  onToggleCollapse: () => void;
  onOpenWorkspaces: () => void;
};

export default function Sidebar({
  collapsed,
  activeKey = "dashboard",
  items,
  onChangeActive,
  onToggleCollapse,
  onOpenWorkspaces,
}: Props) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;

  const widthFitFull = collapsed ? "w-fit" : "w-full";
  const showText = !collapsed;
  const toggleIcon = collapsed
    ? "chevron-forward-outline"
    : isDesktop
      ? "chevron-back-outline"
      : "close-outline";
  const toggleLabel = collapsed
    ? "Expand sidebar"
    : isDesktop
      ? "Collapse sidebar"
      : "Close menu";

  const visibleMainItems = items.main.filter((item) => item.enabled !== false);
  const visibleSecondaryItems = items.secondary.filter(
    (item) => item.enabled !== false,
  );

  return (
    <SidebarContainer collapsed={collapsed} isDesktop={isDesktop}>
      <View className={`${widthFitFull} items-center`}>
        <BrandLogo collapsed={collapsed} />
      </View>

      <View className={`${widthFitFull} pt-4 flex-1`}>
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-2 items-center pb-4"
          showsVerticalScrollIndicator={false}
        >
          <SectionSlot collapsed={collapsed} label="Navigation" />

          <GroupSidebarMenu collapsed={collapsed} className="gap-1">
            {visibleMainItems.map((it) => (
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

          <SectionSlot collapsed={collapsed} label="Controls" />

          <GroupSidebarMenu collapsed={collapsed} className="gap-1">
            <SidebarItem
              active={false}
              showText={showText}
              collapsed={collapsed}
              label="Workspaces"
              iconBase="grid"
              onPress={onOpenWorkspaces}
            />

            {visibleSecondaryItems.map((it) => (
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

      {isDesktop || !collapsed ? (
        <View className={`${widthFitFull} mt-auto items-center gap-3 pt-3`}>
          <View className="w-full items-center">
            <View
              className={`${collapsed ? "w-7" : "w-full"} h-px rounded-full bg-shellLine`}
            />
          </View>

          <Button
            variant="icon"
            size="icon"
            className="h-9 w-9 border-shellLine bg-shellPanelSoft"
            onPress={onToggleCollapse}
            accessibilityLabel={toggleLabel}
          >
            <Ionicons
              name={toggleIcon}
              size={13}
              className="text-textMain"
            />
          </Button>
        </View>
      ) : null}
    </SidebarContainer>
  );
}

function SidebarSectionLabel({ children }: { children: string }) {
  return (
    <View>
      <BrandLabel>{children}</BrandLabel>
    </View>
  );
}

function BrandLabel({ children }: { children: string }) {
  return (
    <View>
      <SidebarLabel className="text-[9px] font-semibold uppercase tracking-[0.22em] text-muted">
        {children}
      </SidebarLabel>
    </View>
  );
}

function SectionSlot({
  collapsed,
  label,
}: {
  collapsed: boolean;
  label: string;
}) {
  if (collapsed) {
    return (
      <View className="w-full items-center justify-center py-1.5">
        <View className="h-px w-6 rounded-full bg-shellLine" />
      </View>
    );
  }

  return (
    <View className="w-full px-1 pt-1">
      <View className="h-[18px] justify-center overflow-hidden rounded-full border border-transparent px-1">
        <View className="opacity-100">
          <SidebarSectionLabel>{label}</SidebarSectionLabel>
        </View>
      </View>
    </View>
  );
}
