import { Button, Text } from "@/src/components";
import { VesselImageMedia } from "@/src/features/vessels/shared";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

type Props = {
  imagePreviewUrl?: string | null;
  storedFileName?: string | null;
  pendingFileName?: string | null;
  onSelectImage?: () => void;
  onRemoveImage?: () => void;
  canManageImage?: boolean;
  busy?: boolean;
  disabled?: boolean;
  compact?: boolean;
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
  compact = false,
}: Props) {
  const [previewErrored, setPreviewErrored] = useState(false);

  useEffect(() => {
    setPreviewErrored(false);
  }, [imagePreviewUrl]);

  const resolvedFileLabel = pendingFileName ?? storedFileName ?? null;
  const hasRenderablePreview = Boolean(imagePreviewUrl) && !previewErrored;
  const previewCopy = previewErrored
    ? {
        title: "Preview unavailable",
        description:
          "This image could not be rendered in the editor. Try selecting it again before saving.",
      }
    : {
        title: "No vessel image",
        description:
          "Add a real vessel photo to make the vessel shell feel current and client-ready.",
      };

  return (
    <View
      className={[
        "border border-shellLine bg-shellPanel",
        compact ? "gap-3 rounded-[22px] p-3" : "gap-4 rounded-[18px] p-4",
      ].join(" ")}
    >
      <View className="gap-1">
        <Text className="font-semibold text-textMain">Vessel Image</Text>
        <Text className="text-[12px] leading-[18px] text-muted">
          Use an uploaded vessel image so overview banners and quick views stop
          depending on generic placeholders.
        </Text>
      </View>

      <View className={compact ? "gap-3" : "gap-4 web:flex-row"}>
        <View
          className={[
            "overflow-hidden border border-shellLine bg-shellPanelSoft",
            compact ? "rounded-[20px]" : "rounded-[18px]",
          ].join(" ")}
          style={compact ? styles.compactPreviewFrame : styles.previewFrame}
          testID="vessel-image-preview-frame"
        >
          {hasRenderablePreview ? (
            <VesselImageMedia
              uri={imagePreviewUrl!}
              onError={() => setPreviewErrored(true)}
              testID="vessel-image-preview"
              accessibilityLabel="Vessel image preview"
            />
          ) : (
            <View className="flex-1 items-center justify-center gap-2 px-4">
              <Ionicons
                name={previewErrored ? "alert-circle-outline" : "boat-outline"}
                size={42}
                className="text-muted"
              />
              <Text className="font-semibold text-textMain">
                {previewCopy.title}
              </Text>
              <Text className="text-center text-[12px] leading-[18px] text-muted">
                {previewCopy.description}
              </Text>
            </View>
          )}
        </View>

        <View className={compact ? "gap-3" : "flex-1 gap-3"}>
          <View className="flex-row flex-wrap gap-2">
            <Button
              variant="default"
              size={compact ? "pillXs" : "sm"}
              onPress={onSelectImage}
              disabled={disabled || !canManageImage || busy}
              className="rounded-full"
            >
              {imagePreviewUrl ? "Change image" : "Select image"}
            </Button>

            <Button
              variant="softDestructive"
              size={compact ? "pillXs" : "sm"}
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

          {resolvedFileLabel ? (
            <Text className="text-[12px] leading-[18px] text-muted">
              Selected file: {resolvedFileLabel}
            </Text>
          ) : (
            <Text className="text-[12px] leading-[18px] text-muted">
              JPG, PNG or WEBP
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  previewFrame: {
    flex: 1,
    height: 220,
  },
  compactPreviewFrame: {
    alignSelf: "stretch",
    height: 220,
    width: "100%",
  },
});
