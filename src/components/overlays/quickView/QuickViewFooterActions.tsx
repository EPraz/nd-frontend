import React from "react";
import { View } from "react-native";
import { Button, type ButtonProps } from "../../ui/button/Button";

type QuickViewFooterAction = {
  label: string;
  onPress: () => void;
  variant?: NonNullable<ButtonProps["variant"]>;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
};

type Props = {
  onClose: () => void;
  closeLabel?: string;
  actions?: QuickViewFooterAction[];
};

export function QuickViewFooterActions({
  onClose,
  closeLabel = "Close",
  actions = [],
}: Props) {
  return (
    <View className="flex-row flex-wrap justify-end gap-2">
      <Button variant="outline" size="pillXs" onPress={onClose}>
        {closeLabel}
      </Button>

      {actions.map((action) => (
        <Button
          key={action.label}
          variant={action.variant ?? "default"}
          size="pillXs"
          onPress={action.onPress}
          disabled={action.disabled}
          leftIcon={action.leftIcon}
        >
          {action.label}
        </Button>
      ))}
    </View>
  );
}

export type { QuickViewFooterAction };
