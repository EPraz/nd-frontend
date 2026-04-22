import { View } from "react-native";
import { Text } from "../text/Text";

type Props = {
  primary: string;
  secondary?: string | null;
  secondaryTone?: "muted" | "warning" | "destructive";
};

function secondaryToneClass(tone: Props["secondaryTone"]) {
  switch (tone) {
    case "warning":
      return "text-warning";
    case "destructive":
      return "text-destructive";
    case "muted":
    default:
      return "text-muted";
  }
}

export function RegistryTableTextStack({
  primary,
  secondary,
  secondaryTone = "muted",
}: Props) {
  return (
    <View className="gap-1">
      <Text className="font-medium leading-5 text-textMain">{primary}</Text>
      {secondary ? (
        <Text
          className={[
            "text-[12px]",
            secondaryToneClass(secondaryTone),
          ].join(" ")}
        >
          {secondary}
        </Text>
      ) : null}
    </View>
  );
}
