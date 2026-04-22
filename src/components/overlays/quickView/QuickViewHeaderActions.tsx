import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Button, type ButtonProps } from "../../ui/button/Button";

type QuickViewHeaderAction = {
  label: string;
  onPress: () => void;
  variant?: NonNullable<ButtonProps["variant"]>;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
};

type Props = {
  actions?: QuickViewHeaderAction[];
  onClose: () => void;
  closeLabel?: string;
};

export function QuickViewHeaderActions({
  actions = [],
  onClose,
  closeLabel = "Close modal",
}: Props) {
  return (
    <View className="flex-row flex-wrap items-center justify-end gap-2">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant={action.variant ?? "soft"}
          size="pillXs"
          onPress={action.onPress}
          disabled={action.disabled}
          leftIcon={action.leftIcon}
        >
          {action.label}
        </Button>
      ))}

      <Button
        variant="soft"
        size="iconSm"
        onPress={onClose}
        accessibilityLabel={closeLabel}
        leftIcon={<Ionicons name="close" size={16} className="text-textMain" />}
      />
    </View>
  );
}

export type { QuickViewHeaderAction };
