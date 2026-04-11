import { View } from "react-native";
import { Text } from "../../ui";
import { SpecItem } from "./hero.ui";
import SpecRow from "./SpecRow";

const RightPanel = ({
  left,
  right,
  title,
  leftTitle,
  rightTitle,
}: {
  left: SpecItem[];
  right: SpecItem[];
  title?: string;
  leftTitle?: string;
  rightTitle?: string;
}) => {
  return (
    <View className="flex-1">
      <View className="px-4 pt-4 pb-3">
        <Text className="text-center text-[12px] uppercase tracking-wider text-muted">
          {title ?? "Overview"}
        </Text>
        <Text className="text-textMain text-[14px] font-semibold mt-1 text-center">
          Summary
        </Text>
      </View>

      <View className="h-px bg-white/10" />

      <View className="flex-1 flex-row">
        <View className="flex-1 px-4 py-4">
          <Text className="mb-3 text-[11px] uppercase tracking-wider text-muted">
            {leftTitle ?? "General"}
          </Text>

          <View className="gap-3">
            {left.map((it, idx) => (
              <SpecRow key={`${it.label}-${idx}`} item={it} />
            ))}
          </View>
        </View>

        <View className="w-px bg-white/10" />

        <View className="flex-1 px-4 py-4">
          <Text className="mb-3 text-[11px] uppercase tracking-wider text-muted">
            {rightTitle ?? "Certificates"}
          </Text>

          <View className="gap-3">
            {right.map((it, idx) => (
              <SpecRow key={`${it.label}-${idx}`} item={it} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

export default RightPanel;
