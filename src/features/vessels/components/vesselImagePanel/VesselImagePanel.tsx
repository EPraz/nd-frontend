import { Button, Text } from "@/src/components";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

type Props = {
  imagePreviewUrl?: string | null;
  storedFileName?: string | null;
  pendingFileName?: string | null;
  onSelectImage?: () => void;
  onRemoveImage?: () => void;
  canManageImage?: boolean;
  busy?: boolean;
  disabled?: boolean;
};

export default function VesselImagePanel({
  imagePreviewUrl,
  storedFileName,
  pendingFileName,
  onSelectImage,
  onRemoveImage,
  canManageImage = true,
  busy = false,
  disabled = false,
}: Props) {
  const resolvedFileLabel =
    pendingFileName ?? storedFileName ?? "No image selected yet";

  return (
    <View className="gap-4 rounded-[18px] border border-shellLine bg-shellCanvas p-4">
      <View className="gap-1">
        <Text className="font-semibold text-textMain">Vessel Image</Text>
        <Text className="text-[12px] leading-[18px] text-muted">
          Use an uploaded vessel image so overview banners and quick views stop
          depending on generic placeholders.
        </Text>
      </View>

      <View className="gap-4 web:flex-row">
        <View className="h-[220px] flex-1 overflow-hidden rounded-[18px] border border-shellLine bg-shellPanelSoft">
          {imagePreviewUrl ? (
            <Image
              source={{ uri: imagePreviewUrl }}
              contentFit="cover"
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <View className="flex-1 items-center justify-center gap-2 px-4">
              <Ionicons
                name="boat-outline"
                size={42}
                className="text-muted"
              />
              <Text className="font-semibold text-textMain">
                No vessel image
              </Text>
              <Text className="text-center text-[12px] leading-[18px] text-muted">
                Add a real vessel photo to make the vessel shell feel current
                and client-ready.
              </Text>
            </View>
          )}
        </View>

        <View className="flex-1 gap-3">
          <View className="gap-1 rounded-[18px] border border-shellLine bg-shellPanelSoft px-4 py-3">
            <Text className="text-[12px] text-muted">Selected file</Text>
            <Text className="font-semibold text-textMain">
              {resolvedFileLabel}
            </Text>
            <Text className="text-[12px] text-muted">JPG, PNG or WEBP</Text>
          </View>

          <View className="flex-row flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onPress={onSelectImage}
              disabled={disabled || !canManageImage || busy}
              className="rounded-full"
            >
              {imagePreviewUrl ? "Change image" : "Select image"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onPress={onRemoveImage}
              disabled={
                disabled ||
                !canManageImage ||
                busy ||
                (!imagePreviewUrl && !pendingFileName)
              }
              className="rounded-full"
            >
              Remove image
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}
