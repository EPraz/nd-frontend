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
    <View className="w-full min-w-0 flex-row flex-wrap justify-start gap-2 lg:w-auto lg:justify-end">
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
