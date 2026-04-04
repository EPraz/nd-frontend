import { Modal, Pressable, View } from "react-native";
import { Button } from "../button/Button";
import { Card, CardContent, CardHeaderRow, CardTitle } from "../card/Card";
import { Text } from "../text/Text";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  variant = "default",
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 items-center justify-center px-4">
        <Pressable className="absolute inset-0 bg-black/45" onPress={onCancel} />

        <Card className="w-full max-w-[520px] rounded-[28px] border border-border bg-surface p-0 overflow-hidden">
          <CardHeaderRow className="px-6 pt-6 pb-4 border-b border-border">
            <CardTitle className="text-[18px] text-textMain">{title}</CardTitle>
          </CardHeaderRow>

          <CardContent className="px-6 py-6 gap-6">
            <Text className="text-[14px] leading-[22px] text-textMain/85">
              {message}
            </Text>

            <View className="flex-row justify-end gap-3">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full"
                onPress={onCancel}
                disabled={loading}
              >
                {cancelLabel}
              </Button>

              <Button
                variant={variant === "destructive" ? "destructive" : "default"}
                size="lg"
                className="rounded-full"
                onPress={onConfirm}
                loading={loading}
              >
                {confirmLabel}
              </Button>
            </View>
          </CardContent>
        </Card>
      </View>
    </Modal>
  );
}
