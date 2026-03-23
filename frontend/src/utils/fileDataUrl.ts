/**
 * Read files as data URLs for admin property forms — no resizing or re-encoding (quality preserved).
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result as string)
    r.onerror = () => reject(new Error('Failed to read file'))
    r.readAsDataURL(file)
  })
}

/** Images and PDFs: full fidelity binary → data URL */
export async function readPropertyAttachmentAsDataUrl(file: File): Promise<string> {
  return readFileAsDataUrl(file)
}
