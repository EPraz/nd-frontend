import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import { Button } from "../button/Button";

type ButtonVariant = ComponentProps<typeof Button>["variant"];
type ButtonSize = ComponentProps<typeof Button>["size"];

type RegistryHeaderActionButtonProps = Omit<
  ComponentProps<typeof Button>,
  "leftIcon" | "variant" | "size"
> & {
  children: ReactNode;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function RegistryHeaderActionButton({
  children,
  iconName,
  iconSize = 14,
  variant = "outline",
  size = "pillSm",
  className,
  ...props
}: RegistryHeaderActionButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={["rounded-full", className].filter(Boolean).join(" ")}
      leftIcon={
        iconName ? (
          <Ionicons name={iconName} size={iconSize} className="text-textMain" />
        ) : undefined
      }
      {...props}
    >
      {children}
    </Button>
  );
}
