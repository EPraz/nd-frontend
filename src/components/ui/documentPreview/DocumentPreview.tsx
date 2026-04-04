import { Image, Platform, View } from "react-native";
import { Text } from "../text/Text";

type Props = {
  attachmentUrl: string;
  mimeType: string;
  emptyMessage?: string;
};

export function DocumentPreview({
  attachmentUrl,
  mimeType,
  emptyMessage = "Open the original file when inline preview is not supported on this device.",
}: Props) {
  const normalizedMime = mimeType.toLowerCase();
  const isPdf = normalizedMime.includes("pdf");
  const isImage = normalizedMime.startsWith("image/");

  if (Platform.OS === "web" && isPdf) {
    return (
      <View className="h-[420px] overflow-hidden rounded-[18px] border border-border bg-baseBg/30">
        <iframe
          title="Document preview"
          src={attachmentUrl}
          className="h-full w-full border-0"
        />
      </View>
    );
  }

  if (isImage) {
    return (
      <View className="overflow-hidden rounded-[18px] border border-border bg-baseBg/30 p-2">
        <Image
          source={{ uri: attachmentUrl }}
          resizeMode="contain"
          className="h-[320px] w-full rounded-[14px] bg-baseBg/50"
        />
      </View>
    );
  }

  return (
    <View className="rounded-[18px] border border-border bg-baseBg/30 p-4 gap-2">
      <Text className="text-[13px] text-textMain">
        Inline preview is available for PDFs on web and for image uploads.
      </Text>
      <Text className="text-[12px] text-muted">{emptyMessage}</Text>
    </View>
  );
}
