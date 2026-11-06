/** Per-file limits apply identically in the browser, API and upload finalization. */
export const UPLOAD_LIMITS = {
  videoBytes: 500 * 1024 * 1024,
  fileBytes: 20 * 1024 * 1024,
  dailyBytes: 3 * 1024 * 1024 * 1024,
  unfinishedUploads: 10,
} as const;
export const maxUploadBytes = (contentType: string) =>
  contentType.startsWith("video/") ? UPLOAD_LIMITS.videoBytes : UPLOAD_LIMITS.fileBytes;
