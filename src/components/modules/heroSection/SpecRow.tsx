import React from "react";
import { View } from "react-native";
import { Text } from "../../ui";
import { Bullet, SpecItem, toneDot, toneText } from "./hero.ui";

const SpecRow = ({ item }: { item: SpecItem }) => {
  if (item.kind === "status") {
    return (
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Bullet />
          <Text className="text-textMain/70 text-[12px]">{item.label}:</Text>
        </View>

        <View className="flex-row items-center gap-2">
          <View
            className={`h-2 w-2 rounded-full ${toneDot(item.statusTone)}`}
          />
          <Text
            className={`${toneText(item.statusTone)} text-[12px] font-semibold`}
          >
            {item.value}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-2">
        <Bullet />
        <Text className="text-textMain/70 text-[12px]">{item.label}:</Text>
      </View>

      <Text className="text-textMain text-[12px] font-semibold">
        {item.value}
      </Text>
    </View>
  );
};

export default SpecRow;
