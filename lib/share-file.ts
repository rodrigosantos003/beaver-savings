import { isStandalone } from '@/lib/pwa';

/**
 * Installed apps (iOS especially) handle `<a download>` and `window.print()` poorly, so hand
 * the file to the native share sheet ("Save to Files", AirDrop, Print, …).
 * Returns false when the caller should fall back to `downloadFile`.
 */
export async function shareFile(file: File): Promise<boolean> {
  if (!isStandalone() || !navigator.canShare?.({ files: [file] })) return false;

  try {
    await navigator.share({ files: [file] });
    return true;
  } catch (error) {
    // AbortError: the user closed the sheet. Anything else (e.g. NotAllowedError once the tap's
    // user activation has expired) falls back to a regular download.
    return error instanceof DOMException && error.name === 'AbortError';
  }
}

export function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.click();
  // Revoking right away can cancel the download (Safari, some Firefox versions) because
  // the browser reads the blob asynchronously after the click; give it time first.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
