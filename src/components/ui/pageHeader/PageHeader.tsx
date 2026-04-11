import { Feather, Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { View } from "react-native";
import { Button } from "../button/Button";
import { Text } from "../text/Text";

type Props = {
  title: string;
  subTitle: string;
  onRefresh?: () => void;
  actions?: ReactNode;
  showFilterButton?: boolean;
};

const PageHeader = ({
  title,
  subTitle,
  onRefresh,
  actions,
  showFilterButton = false,
}: Props) => {
  return (
    <View className="flex flex-col items-start md:flex-row md:items-center justify-between gap-10">
      <View className="flex flex-1 gap-2">
        <Text className="leading-[120%] text-textMain font-semibold text-[40px]">
          {title}
        </Text>
        <Text className="text-muted text-[16px] leading-[130%]">
          {subTitle}
        </Text>
      </View>

      <View className="flex flex-1 max-w-[640px] flex-row flex-wrap items-center justify-end gap-3">
        {actions}

        {onRefresh ? (
          <Button
            variant="iconAccent"
            size="iconLg"
            onPress={onRefresh}
            leftIcon={
              <Feather name="refresh-cw" size={20} className="text-accent" />
            }
            accessibilityLabel="Refresh"
          />
        ) : null}

        {showFilterButton ? (
          <Button
            variant="icon"
            size="iconLg"
            onPress={() => {}}
            leftIcon={
              <Ionicons name="filter" size={18} className="text-textMain" />
            }
            className="border border-shellLine bg-shellGlass web:backdrop-blur-md"
            accessibilityLabel="Filter"
            disabled
          />
        ) : null}
      </View>
    </View>
  );
};

export default PageHeader;
