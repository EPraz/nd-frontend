import { Text } from "@/src/components/ui/text/Text";
import { Pressable, View } from "react-native";

export type AdminWorkspaceTab = "projects" | "users" | "setup";

const ADMIN_WORKSPACE_TABS: {
  key: AdminWorkspaceTab;
  label: string;
}[] = [
  { key: "projects", label: "Projects" },
  { key: "users", label: "Users" },
  { key: "setup", label: "Setup" },
];

export function SuperAdminWorkspaceTabs({
  activeKey,
  onChange,
}: {
  activeKey: AdminWorkspaceTab;
  onChange: (key: AdminWorkspaceTab) => void;
}) {
  return (
    <View className="w-full border-b border-shellLine">
      <View className="flex-row flex-wrap items-end gap-8">
        {ADMIN_WORKSPACE_TABS.map((tab) => {
          const isActive = activeKey === tab.key;

          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              onPress={() => onChange(tab.key)}
              className={[
                "-mb-px border-b-2 px-1 pb-3",
                isActive ? "border-accent" : "border-transparent",
              ].join(" ")}
            >
              <Text
                className={[
                  "text-[15px] font-semibold",
                  isActive ? "text-textMain" : "text-muted",
                ].join(" ")}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
