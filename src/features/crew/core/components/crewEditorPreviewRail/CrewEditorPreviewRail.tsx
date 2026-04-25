import type { CrewFormValues } from "../crewFormTypes";
import CrewPhotoPanel from "../crewPhotoPanel/CrewPhotoPanel";
import CrewPreviewCard from "../crewPreviewCard/CrewPreviewCard";
import { View } from "react-native";

type Props = {
  values: CrewFormValues;
  photoPreviewUrl?: string | null;
  photoFileName?: string | null;
  pendingPhotoName?: string | null;
  onSelectPhoto?: () => void;
  onRemovePhoto?: () => void;
  canManagePhoto?: boolean;
  photoBusy?: boolean;
  disabled?: boolean;
};

export default function CrewEditorPreviewRail({
  values,
  photoPreviewUrl,
  photoFileName,
  pendingPhotoName,
  onSelectPhoto,
  onRemovePhoto,
  canManagePhoto = true,
  photoBusy = false,
  disabled = false,
}: Props) {
  return (
    <View className="gap-4 web:xl:sticky web:xl:top-6">
      <CrewPreviewCard values={values} hasPhoto={Boolean(photoPreviewUrl)} />
      <CrewPhotoPanel
        photoPreviewUrl={photoPreviewUrl}
        photoFileName={photoFileName}
        pendingPhotoName={pendingPhotoName}
        onSelectPhoto={onSelectPhoto}
        onRemovePhoto={onRemovePhoto}
        canManagePhoto={canManagePhoto}
        photoBusy={photoBusy}
        disabled={disabled}
      />
    </View>
  );
}
