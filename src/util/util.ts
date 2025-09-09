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

export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, "");

  // If phone number starts with 0, replace with 62
  if (digitsOnly.startsWith("0")) {
    return "62" + digitsOnly.substring(1);
  }

  // If phone number does NOT start with 62, add 62 prefix
  if (!digitsOnly.startsWith("62")) {
    return "62" + digitsOnly;
  }

  return digitsOnly;
};

export const getAppStoreLink = (): string => {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return "https://apps.apple.com/id/app/sahabat-aerplus/id6748373005";
  } else if (/android/.test(userAgent)) {
    return "https://play.google.com/store/apps/details?id=com.depotaerplus.sahabataerplus&pcampaignid=web_share";
  } else {
    // Default to Android for other platforms
    return "https://play.google.com/store/apps/details?id=com.depotaerplus.sahabataerplus&pcampaignid=web_share";
  }
};
