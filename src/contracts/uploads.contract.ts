export type UploadFileInput = {
  uri: string;
  name: string;
  mimeType: string;
  file?: Blob;
  size?: number;
};
