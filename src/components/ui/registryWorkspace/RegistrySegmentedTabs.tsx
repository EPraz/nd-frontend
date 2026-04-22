import { Pressable, View } from "react-native";
import { Text } from "../text/Text";

export type RegistrySegmentedTab<T extends string> = {
  key: T;
  label: string;
};

type Props<T extends string> = {
  tabs: RegistrySegmentedTab<T>[];
  activeKey: T;
  onChange: (key: T) => void;
};

export function RegistrySegmentedTabs<T extends string>({
  tabs,
  activeKey,
  onChange,
}: Props<T>) {
  return (
    <View className="w-fit flex-row flex-wrap items-center rounded-full border border-shellLine bg-shellPanelSoft p-1">
      {tabs.map((tab) => {
        const isActive = activeKey === tab.key;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            className={[
              "rounded-full px-3 py-1.5",
              isActive ? "bg-accent" : "bg-transparent",
            ].join(" ")}
          >
            <Text
              className={[
                "text-[12px] font-semibold",
                isActive ? "text-textMain" : "text-muted",
              ].join(" ")}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
