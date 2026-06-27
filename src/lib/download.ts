/**
 * Client-side file IO for the People's Home Passport — fully offline, no network.
 * Export = a Blob the browser downloads; Import = reading a picked file's text.
 * Nothing leaves the device; the only "transport" is a file the user holds.
 * (Web-only feature — gated behind !Capacitor.isNativePlatform() at the call site.)
 */
export function downloadText(filename: string, text: string, type = 'application/json'): void {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read the file.'));
    reader.readAsText(file);
  });
}
