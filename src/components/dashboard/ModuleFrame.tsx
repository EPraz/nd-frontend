import { View } from "react-native";
import { Text } from "../ui/text/Text";

export function ModuleFrame(props: {
  isLoading: boolean;
  error?: string | null;
  onRetry: () => void;
  children: React.ReactNode;
}) {
  const { isLoading, error, onRetry, children } = props;

  if (isLoading) {
    return <Text className="text-sm text-muted">Loading…</Text>;
  }

  if (error) {
    return (
      <View className="gap-2">
        <Text className="text-sm text-destructive">{String(error)}</Text>
        <Text className="text-sm underline" onPress={onRetry as any}>
          Retry
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}
