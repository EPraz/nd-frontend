import * as DocumentPicker from "expo-document-picker";
import { Platform } from "react-native";
import type { UploadFileInput } from "../contracts/uploads.contract";

function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () =>
      reject(reader.error ?? new Error("Failed to build image preview"));
    reader.readAsDataURL(blob);
  });
}

export async function pickImageUpload(): Promise<UploadFileInput | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["image/jpeg", "image/png", "image/webp"],
    multiple: false,
    copyToCacheDirectory: true,
  });

  if (result.canceled || result.assets.length === 0) return null;

  const asset = result.assets[0];
  let previewUri = asset.uri;

  if (Platform.OS === "web" && asset.file instanceof Blob) {
    try {
      previewUri = await readBlobAsDataUrl(asset.file);
    } catch {
      previewUri = asset.uri;
    }
  }

  return {
    uri: asset.uri,
    name: asset.name,
    mimeType: asset.mimeType ?? "application/octet-stream",
    file: "file" in asset ? asset.file : undefined,
    previewUri,
    size: asset.size,
  };
}
