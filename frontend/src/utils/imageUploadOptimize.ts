/**
 * Resize (max width 1920px), JPEG encode ~0.7 quality, cap output at 2MB for property uploads.
 */

const MAX_WIDTH = 1920
const MAX_BYTES = 2 * 1024 * 1024
const BASE_QUALITY = 0.7
const MIN_QUALITY = 0.45

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Invalid image'))
    img.src = src
  })
}

/**
 * Returns optimized JPEG `File`. Skips non-raster images (e.g. SVG).
 */
export async function optimizeImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file
  }

  const url = URL.createObjectURL(file)
  try {
    const img = await loadImage(url)
    const w = img.naturalWidth
    const h = img.naturalHeight
    const scale = w > MAX_WIDTH ? MAX_WIDTH / w : 1
    const cw = Math.max(1, Math.round(w * scale))
    const ch = Math.max(1, Math.round(h * scale))

    const canvas = document.createElement('canvas')
    canvas.width = cw
    canvas.height = ch
    const ctx = canvas.getContext('2d')
    if (!ctx) return file

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, cw, ch)
    ctx.drawImage(img, 0, 0, cw, ch)

    let q = BASE_QUALITY
    let blob: Blob | null = null
    while (q >= MIN_QUALITY) {
      blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/jpeg', q)
      )
      if (blob && blob.size <= MAX_BYTES) break
      q -= 0.08
    }

    if (!blob || blob.size > MAX_BYTES) {
      throw new Error(
        `Image still exceeds ${Math.round(MAX_BYTES / 1024 / 1024)}MB after optimization. Try a smaller source file.`
      )
    }

    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
    return new File([blob], name, { type: 'image/jpeg' })
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function optimizeImageFiles(files: File[]): Promise<File[]> {
  return Promise.all(files.map((f) => optimizeImageForUpload(f)))
}
