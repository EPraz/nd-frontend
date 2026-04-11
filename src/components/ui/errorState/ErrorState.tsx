import { View } from "react-native";
import { Button } from "../button/Button";
import { Text } from "../text/Text";

const ErrorState = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => {
  return (
    <View className="gap-3 rounded-[24px] border border-shellLine bg-shellPanel p-5 web:backdrop-blur-md">
      <Text className="text-destructive font-semibold">Error</Text>
      <Text className="text-muted">{message}</Text>
      <Button variant="outline" size="sm" onPress={onRetry}>
        Retry
      </Button>
    </View>
  );
};

export default ErrorState;
