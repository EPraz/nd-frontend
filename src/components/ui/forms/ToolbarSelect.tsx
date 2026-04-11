import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  View,
  type LayoutRectangle,
} from "react-native";
import { Text } from "../text/Text";

type ToolbarSelectProps<T extends string> = {
  value: T;
  options: T[];
  open: boolean;
  onToggle: () => void;
  onChange: (value: T) => void;
  renderLabel: (value: T) => string;
  minWidth?: number;
};

export function ToolbarSelect<T extends string>(props: ToolbarSelectProps<T>) {
  const anchorRef = useRef<View>(null);
  const [anchorRect, setAnchorRect] = useState<LayoutRectangle | null>(null);

  const syncPosition = () => {
    anchorRef.current?.measureInWindow((x, y, width, height) => {
      setAnchorRect({ x, y, width, height });
    });
  };

  const handleToggle = () => {
    if (!props.open) {
      syncPosition();
    }
    props.onToggle();
  };

  useEffect(() => {
    if (!props.open) return;

    const frame = requestAnimationFrame(() => {
      syncPosition();
    });

    return () => cancelAnimationFrame(frame);
  }, [props.open]);

  return (
    <>
      <View ref={anchorRef} collapsable={false}>
        <Pressable
          onPress={handleToggle}
      className="min-h-11 flex-row items-center justify-between gap-3 rounded-full border border-shellLine bg-shellGlass px-4 py-2 web:backdrop-blur-md"
          style={props.minWidth ? { minWidth: props.minWidth } : undefined}
        >
          <Text className="text-[13px] font-medium text-textMain">
            {props.renderLabel(props.value)}
          </Text>

          <Ionicons
            name={props.open ? "chevron-up" : "chevron-down"}
            size={16}
            color="rgba(221,230,237,0.92)"
          />
        </Pressable>
      </View>

      <Modal
        visible={props.open}
        transparent
        animationType="fade"
        onRequestClose={props.onToggle}
      >
        <Pressable onPress={props.onToggle} className="flex-1 bg-black/20">
          <Pressable
            onPress={() => {}}
        className="absolute rounded-2xl border border-shellLine bg-shellPanel p-2 shadow-sm shadow-black/30 web:backdrop-blur-md"
            style={{
              top: (anchorRect?.y ?? 0) + (anchorRect?.height ?? 0) + 8,
              left:
                (anchorRect?.x ?? 0) +
                Math.max((anchorRect?.width ?? props.minWidth ?? 220) - 220, 0),
              width: Math.max(anchorRect?.width ?? 0, props.minWidth ?? 220),
            }}
          >
            {props.options.map((option) => {
              const active = option === props.value;

              return (
                <Pressable
                  key={option}
                  onPress={() => props.onChange(option)}
                  className={[
                    "flex-row items-center justify-between rounded-xl px-3 py-3",
                    active ? "bg-accent/12" : "bg-transparent",
                  ].join(" ")}
                >
                  <Text
                    className={[
                      "text-[13px] font-medium",
                      active ? "text-accent" : "text-textMain",
                    ].join(" ")}
                  >
                    {props.renderLabel(option)}
                  </Text>

                  {active ? (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color="hsl(24 95% 60%)"
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
