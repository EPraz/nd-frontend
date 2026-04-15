import * as DocumentPicker from "expo-document-picker";
import type { UploadFileInput } from "../contracts/uploads.contract";

export async function pickImageUpload(): Promise<UploadFileInput | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["image/jpeg", "image/png", "image/webp"],
    multiple: false,
    copyToCacheDirectory: true,
  });

  if (result.canceled || result.assets.length === 0) return null;

  const asset = result.assets[0];

  return {
    uri: asset.uri,
    name: asset.name,
    mimeType: asset.mimeType ?? "application/octet-stream",
    file: "file" in asset ? asset.file : undefined,
    size: asset.size,
  };
}
