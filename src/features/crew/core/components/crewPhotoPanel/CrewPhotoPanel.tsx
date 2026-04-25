import { Button, Text } from "@/src/components";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import CrewPhotoMedia from "../crewPhotoMedia/CrewPhotoMedia";

type Props = {
  photoPreviewUrl?: string | null;
  photoFileName?: string | null;
  pendingPhotoName?: string | null;
  onSelectPhoto?: () => void;
  onRemovePhoto?: () => void;
  canManagePhoto?: boolean;
  photoBusy?: boolean;
  disabled?: boolean;
};

export default function CrewPhotoPanel({
  photoPreviewUrl,
  photoFileName,
  pendingPhotoName,
  onSelectPhoto,
  onRemovePhoto,
  canManagePhoto = true,
  photoBusy = false,
  disabled = false,
}: Props) {
  const resolvedPhotoLabel = pendingPhotoName ?? photoFileName ?? null;

  return (
    <View className="gap-3 rounded-[22px] border border-shellLine bg-shellPanel p-3">
      <View className="gap-1">
        <Text className="font-semibold text-textMain">Crew Photo</Text>
        <Text className="text-[12px] leading-[18px] text-muted">
          Use a real uploaded portrait so quick views and crew profile cards
          stop relying on placeholders.
        </Text>
      </View>

      <View className="gap-3">
        <View className="h-[220px] overflow-hidden rounded-[20px] border border-shellLine bg-shellPanelSoft">
          {photoPreviewUrl ? (
            <CrewPhotoMedia
              uri={photoPreviewUrl}
              stageClassName="rounded-[16px]"
            />
          ) : (
            <View className="flex-1 items-center justify-center gap-2 px-4">
              <Ionicons
                name="person-circle-outline"
                size={42}
                className="text-muted"
              />
              <Text className="font-semibold text-textMain">No crew photo</Text>
              <Text className="text-center text-[12px] leading-[18px] text-muted">
                Add a portrait to make the crew baseline feel current before
                save.
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row flex-wrap gap-2">
          <Button
            variant="default"
            size="pillXs"
            onPress={onSelectPhoto}
            disabled={disabled || !canManagePhoto || photoBusy}
            className="rounded-full"
          >
            {photoPreviewUrl ? "Change photo" : "Select photo"}
          </Button>

          <Button
            variant="softDestructive"
            size="pillXs"
            onPress={onRemovePhoto}
            disabled={
              disabled ||
              !canManagePhoto ||
              photoBusy ||
              (!photoPreviewUrl && !pendingPhotoName)
            }
            className="rounded-full"
          >
            Remove photo
          </Button>
        </View>

        {resolvedPhotoLabel ? (
          <Text className="text-[12px] leading-[18px] text-muted">
            Selected file: {resolvedPhotoLabel}
          </Text>
        ) : (
          <Text className="text-[12px] leading-[18px] text-muted">
            JPG, PNG or WEBP
          </Text>
        )}

        {!canManagePhoto ? (
          <Text className="text-[12px] leading-[18px] text-muted">
            Save the crew member first if you want the image persisted to
            storage.
          </Text>
        ) : null}
      </View>
    </View>
  );
}
