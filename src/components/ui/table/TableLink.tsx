import { Pressable } from "react-native";
import { Text } from "../text/Text";

type Props = {
  children: string;
  onPress: () => void;
  tooltip?: string;
};

type PressState = { pressed: boolean } & { hovered?: boolean };

export function TableLink({ children, onPress, tooltip }: Props) {
  return (
    <Pressable
      onPress={(e) => {
        // // @ts-expect-error RN Web
        e?.stopPropagation?.();
        onPress();
      }}
      className="web:cursor-pointer"
      {...(tooltip ? { accessibilityLabel: tooltip } : {})}
    >
      {(state) => {
        const s = state as PressState;
        const hovered = Boolean(s.hovered);
        const pressed = Boolean(s.pressed);

        return (
          <Text
            className={[
              hovered ? "text-textMain underline" : "",
              pressed ? "opacity-90" : "",
              "underline-offset-4",
            ].join(" ")}
          >
            {children}
          </Text>
        );
      }}
    </Pressable>
  );
}
