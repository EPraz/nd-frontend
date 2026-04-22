import { View } from "react-native";
import { Text } from "../../ui/text/Text";

type Props = { collapsed?: boolean };

export default function BrandLogo({ collapsed }: Props) {
  if (collapsed) {
    return (
      <View className="h-10 w-10 items-center justify-center rounded-[12px] border border-shellBadgeBorder bg-shellBadge">
        <Text className="text-[10px] font-semibold tracking-[0.18em] text-shellHighlight">
          AX
        </Text>
      </View>
    );
  }

  return (
    <View className="min-w-0 flex-row items-center gap-2 px-1">
      <View className="h-10 w-10 items-center justify-center rounded-[12px] border border-shellBadgeBorder bg-shellBadge">
        <Text className="text-[10px] font-semibold tracking-[0.18em] text-shellHighlight">
          AX
        </Text>
      </View>
      <View className="min-w-0 flex-1">
        <Text
          numberOfLines={1}
          className="text-[12px] font-semibold tracking-[0.18em] text-textMain"
        >
          ARXIS
        </Text>
      </View>
    </View>
  );
}
