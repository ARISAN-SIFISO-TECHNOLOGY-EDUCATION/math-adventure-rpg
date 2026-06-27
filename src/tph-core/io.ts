// VENDORED from @tph/core (ARISAN-SIFISO-TECHNOLOGY-EDUCATION/tph-core) — do not edit here.
// Update upstream, then re-vendor. Source-only until @tph/core is published to a registry.
/**
 * @tph/core — Passport file IO. Fully offline, no network: export is a Blob the
 * browser downloads; import reads a picked file's text. Nothing leaves the device;
 * the only "transport" is a file the user holds. (DOM-only — keep this out of any
 * Node smoke; the envelope logic in ./passport stays runtime-agnostic.)
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
