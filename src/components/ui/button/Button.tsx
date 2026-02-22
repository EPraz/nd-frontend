import { cn } from "@/src/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ActivityIndicator, Platform, Pressable, View } from "react-native";
import { Text, TextClassContext } from "../text/Text";

const buttonVariants = cva(
  cn(
    "group shrink-0 flex-row items-center justify-center gap-2 rounded-xl transition-all",
    Platform.select({
      web: "focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none",
    }),
  ),
  {
    variants: {
      variant: {
        default: cn(
          "bg-accent active:bg-accent/90",
          Platform.select({ web: "hover:bg-accent/90" }),
        ),

        destructive: cn(
          "bg-destructive active:bg-destructive/90",
          Platform.select({ web: "hover:bg-destructive/90" }),
        ),

        outline: cn(
          "border border-border/70 bg-surface active:bg-surface/80",
          Platform.select({ web: "hover:bg-surface/80" }),
        ),

        ghost: cn(
          "bg-transparent active:bg-surface/60",
          Platform.select({ web: "hover:bg-surface/60" }),
        ),

        link: cn("bg-transparent", Platform.select({ web: "hover:underline" })),

        icon: cn(
          "border border-border/60 bg-surface/60",
          Platform.select({ web: "hover:bg-surface/80 web:backdrop-blur-md" }),
        ),

        iconAccent: cn(
          "border border-accent/25 bg-accent/10",
          Platform.select({ web: "hover:bg-accent/15" }),
        ),

        // ✅ NEW: soft/tinted pills (QuickView header actions)
        soft: cn(
          "border border-border bg-baseBg/35 active:bg-baseBg/50",
          Platform.select({ web: "hover:bg-baseBg/50" }),
        ),
        softAccent: cn(
          "border border-accent/40 bg-accent/15 active:bg-accent/20",
          Platform.select({ web: "hover:bg-accent/20" }),
        ),
        softDestructive: cn(
          "border border-destructive/30 bg-destructive/10 active:bg-destructive/15",
          Platform.select({ web: "hover:bg-destructive/15" }),
        ),
      },

      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3",
        lg: "h-11 px-6",

        icon: "h-9 w-9 rounded-full",
        iconLg: "h-10 w-10 rounded-full",

        pill: "h-12 rounded-full px-6",
        // ✅ NEW: para acciones compactas tipo chip
        pillSm: "h-9 rounded-full px-4",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const buttonTextVariants = cva("text-sm font-semibold", {
  variants: {
    variant: {
      default: "text-textMain",
      destructive: "text-textMain",
      outline: "text-textMain",
      ghost: "text-textMain",
      link: "text-accent",
      icon: "text-textMain",
      iconAccent: "text-textMain",

      soft: "text-textMain",
      softAccent: "text-accent",
      softDestructive: "text-destructive",
    },
    size: {
      default: "",
      sm: "",
      lg: "",
      icon: "",
      iconLg: "",
      pill: "",
      pillSm: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type ButtonProps = React.ComponentProps<typeof Pressable> &
  React.RefAttributes<typeof Pressable> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    spinnerColor?: string;
  };

function Button({
  className,
  variant,
  size,
  loading,
  disabled,
  leftIcon,
  rightIcon,
  spinnerColor,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = Boolean(disabled || loading);

  const resolvedSpinnerColor =
    spinnerColor ??
    (variant === "default" || variant === "destructive"
      ? "hsl(var(--text-main))"
      : "hsl(var(--text-main))");

  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        className={cn(
          buttonVariants({ variant, size }),
          isDisabled && "opacity-50",
          isDisabled && Platform.select({ web: "web:pointer-events-none" }),
          className,
        )}
        role="button"
        disabled={isDisabled}
        {...props}
      >
        <View className="flex-row items-center gap-2">
          {loading ? (
            <ActivityIndicator color={resolvedSpinnerColor} />
          ) : (
            <>
              {leftIcon}
              {typeof children === "string" ? (
                <Text>{children}</Text>
              ) : (
                children
              )}
              {rightIcon}
            </>
          )}
        </View>
      </Pressable>
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
