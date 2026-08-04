/**
 * Browser-side image upload, so a visitor can send a doodle without saving a
 * PNG and composing their own email.
 *
 * Cloudinary's *unsigned* upload accepts a plain multipart POST straight from
 * the page — no signature, no server of our own, which keeps the site a static
 * GitHub Pages build. The trade is that the preset name is visible in the
 * bundle and anything sent from here can be forged, so the limits have to live
 * on the preset itself (image-only, max file size, fixed folder) rather than in
 * this file. Nothing below should be treated as a constraint on an attacker.
 */
const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

export const isUploadConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

/** A 900px canvas of pen strokes lands well under 500KB. This only exists to
 *  fail fast and locally if something ever produces a pathological PNG. */
const MAX_BYTES = 8 * 1024 * 1024;

/** canvas.toBlob is callback-based and can hand back null. Wrap it so the
 *  caller gets a promise that either resolves with a blob or throws. */
export function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not read the drawing off the canvas'));
    }, 'image/png');
  });
}

/** Uploads the PNG and resolves with its public URL. */
export async function uploadDoodle(blob: Blob): Promise<string> {
  if (blob.size > MAX_BYTES) throw new Error('That image is too large to send');

  const form = new FormData();
  form.append('file', blob);
  form.append('upload_preset', UPLOAD_PRESET as string);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: form }
  );

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }

  const result = await response.json();
  if (!result.secure_url) {
    throw new Error('Upload returned no URL');
  }
  return result.secure_url as string;
}
