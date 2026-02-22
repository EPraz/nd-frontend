import { Feather, Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { Button } from "../button/Button";
import { Text } from "../text/Text";

type Props = {
  title: string;
  subTitle: string;
  onRefresh?: () => void;
};

const PageHeader = ({ title, subTitle, onRefresh }: Props) => {
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

      <View className="flex flex-1 max-w-[380px] flex-row items-center justify-end gap-3">
        {/* Refresh (enterprise: accent outline) */}
        <Button
          variant="iconAccent"
          size="iconLg"
          onPress={onRefresh}
          disabled={!onRefresh}
          leftIcon={
            <Feather name="refresh-cw" size={20} className="text-accent" />
          }
          accessibilityLabel="Refresh"
        />

        {/* Filter (neutral enterprise) */}
        <Button
          variant="icon"
          size="iconLg"
          onPress={() => {}}
          leftIcon={
            <Ionicons name="filter" size={18} className="text-textMain" />
          }
          className="bg-surface/60 border border-border/60"
          accessibilityLabel="Filter"
          disabled
        />
      </View>
    </View>
  );
};

export default PageHeader;
