import { cn } from "@/src/lib/utils";
import { Text, View, type ViewProps } from "react-native";
import { TextClassContext } from "../text/Text";

export const Card = ({
  className,
  ...props
}: ViewProps & React.RefAttributes<View>) => {
  return (
    <TextClassContext.Provider value="text-surface">
      <View
        className={cn(
          "bg-surface border-border flex flex-col gap-6 rounded-xl border py-6 shadow-sm shadow-black/5 web:shadow-black/20",
          className,
        )}
        {...props}
      />
    </TextClassContext.Provider>
  );
};

export const CardHeader = ({
  className,
  ...props
}: ViewProps & React.RefAttributes<View>) => {
  return (
    <View className={cn("flex flex-col gap-1.5 px-6", className)} {...props} />
  );
};

export const CardHeaderRow = ({
  className,
  ...props
}: ViewProps & React.RefAttributes<View>) => {
  return (
    <View
      className={cn(
        "flex flex-row items-center justify-between gap-3 px-6",
        className,
      )}
      {...props}
    />
  );
};

export const CardTitle = ({
  className,
  ...props
}: React.ComponentProps<typeof Text> & React.RefAttributes<Text>) => {
  return (
    <Text
      role="heading"
      aria-level={3}
      className={cn("font-semibold leading-none", className)}
      {...props}
    />
  );
};

export const CardDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof Text> & React.RefAttributes<Text>) => {
  return <Text className={cn("text-muted text-sm", className)} {...props} />;
};

export const CardContent = ({
  className,
  ...props
}: ViewProps & React.RefAttributes<View>) => {
  return <View className={cn("px-6", className)} {...props} />;
};

export const CardFooter = ({
  className,
  ...props
}: ViewProps & React.RefAttributes<View>) => {
  return (
    <View
      className={cn("flex flex-row items-center px-6", className)}
      {...props}
    />
  );
};

export default {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardHeaderRow,
};
