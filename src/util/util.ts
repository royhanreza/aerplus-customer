export const isObjectEmpty = (object: object): boolean => {
  return Object.keys(object).length === 0;
};

export const formatFileSize = (bytes: number | undefined): string => {
  if (typeof bytes == "undefined") return "0 Bytes";
  if (bytes === 0) return "0 Bytes";
  if (bytes < 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);

  return `${size.toFixed(2)} ${sizes[i]}`;
};
