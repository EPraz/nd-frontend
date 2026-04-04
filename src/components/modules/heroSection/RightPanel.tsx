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
      {/* Header del panel */}
      <View className="px-4 pt-4 pb-3">
        <Text className="text-textMain/90 text-[12px] uppercase tracking-wider text-center">
          {title ?? "Overview"}
        </Text>
        <Text className="text-textMain text-[14px] font-semibold mt-1 text-center">
          Summary
        </Text>
      </View>

      <View className="h-px bg-white/10" />

      {/* Body */}
      <View className="flex-1 flex-row">
        {/* Columna A */}
        <View className="flex-1 px-4 py-4">
          <Text className="text-textMain/60 text-[11px] uppercase tracking-wider mb-3">
            {leftTitle ?? "General"}
          </Text>

          <View className="gap-3">
            {left.map((it, idx) => (
              <SpecRow key={`${it.label}-${idx}`} item={it} />
            ))}
          </View>
        </View>

        <View className="w-px bg-white/10" />

        {/* Columna B */}
        <View className="flex-1 px-4 py-4">
          <Text className="text-textMain/60 text-[11px] uppercase tracking-wider mb-3">
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
