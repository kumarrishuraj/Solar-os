// =============================================================================
// SolarOS — Browser file & image helpers
//
// Event-time only: every function here touches File, canvas, FileReader or
// crypto and must run inside an event handler / async callback, never during
// render. Images are decoded, downscaled on a canvas and stored as compact
// JPEG/WebP data URLs so the mock data layer can persist them in the browser.
// =============================================================================

/** Shared image shape — identical in the data layer and the uploader. */
export interface UploadedImage {
  id: string;
  name: string;
  data_url: string;
  /** Pixel size of the stored (downscaled) image. */
  width: number;
  height: number;
  /** Bytes of the stored (compressed) image. */
  size_bytes: number;
  mime_type: string;
  uploaded_at?: string;
}

/** A single document (electricity bill, ID proof, datasheet). */
export interface UploadedFile {
  id: string;
  name: string;
  size_bytes: number;
  mime_type: string;
  /** Present only for small images (≤ 1.5 MB by default); PDFs keep metadata only. */
  data_url?: string;
  uploaded_at?: string;
}

export interface ImageCompressionOptions {
  /** Longest edge in pixels after downscaling (default 1280). */
  maxDimension?: number;
  /** Encoder quality 0–1 (default 0.8). */
  quality?: number;
  /** Output format (default JPEG). WebP falls back to JPEG where unsupported. */
  mimeType?: "image/jpeg" | "image/webp";
}

export const DEFAULT_IMAGE_COMPRESSION = {
  maxDimension: 1280,
  quality: 0.8,
  mimeType: "image/jpeg",
} as const satisfies Required<ImageCompressionOptions>;

/** Photo formats every modern browser can decode onto a canvas. */
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** Documents (bills, proofs) default to images or PDF. */
export const DEFAULT_DOCUMENT_ACCEPT = "image/*,application/pdf";

/** Inline data URLs are kept only for images up to this size (1.5 MB). */
export const MAX_INLINE_DOCUMENT_BYTES = 1.5 * 1024 * 1024;

const EXTENSION_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
  csv: "text/csv",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

/** "820 KB", "2.4 MB", "512 B". */
export function formatBytes(bytes: number | null | undefined, decimals = 1): string {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const fixed = value >= 100 || unit === 0 ? value.toFixed(0) : value.toFixed(decimals);
  return `${fixed.replace(/\.0+$/, "")} ${units[unit]}`;
}

/** Random id; falls back to getRandomValues where randomUUID is unavailable (non-HTTPS LAN hosts). */
export function createId(): string {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID();
  const bytes = new Uint8Array(16);
  if (cryptoApi?.getRandomValues) cryptoApi.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Best-effort MIME type (some browsers leave File.type empty for HEIC/PDF). */
export function getMimeType(file: { name: string; type: string }): string {
  if (file.type) return file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_MIME[ext] ?? "application/octet-stream";
}

/**
 * Does the file satisfy an `accept` attribute? Supports MIME types
 * ("image/png"), wildcards ("image/*") and extensions (".pdf").
 */
export function matchesAccept(file: { name: string; type: string }, accept?: string | readonly string[]): boolean {
  if (!accept || accept.length === 0) return true;
  const tokens = (typeof accept === "string" ? accept.split(",") : accept)
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return true;
  const mime = getMimeType(file).toLowerCase();
  const name = file.name.toLowerCase();
  return tokens.some((token) => {
    if (token.startsWith(".")) return name.endsWith(token);
    if (token.endsWith("/*")) return mime.startsWith(token.slice(0, -1));
    return mime === token;
  });
}

/** "JPG, PNG or WebP" style list for error messages. */
export function describeAccept(accept?: string | readonly string[]): string {
  if (!accept || accept.length === 0) return "any file";
  const tokens = (typeof accept === "string" ? accept.split(",") : accept).map((t) => t.trim()).filter(Boolean);
  const labels = Array.from(
    new Set(
      tokens.map((token) => {
        if (token === "image/*") return "images";
        if (token === "application/pdf" || token === ".pdf") return "PDF";
        if (token === "image/jpeg" || token === ".jpg" || token === ".jpeg") return "JPG";
        if (token === "image/png" || token === ".png") return "PNG";
        if (token === "image/webp" || token === ".webp") return "WebP";
        return token.replace(/^\./, "").replace(/^.*\//, "").toUpperCase();
      }),
    ),
  );
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(", ")} or ${labels[labels.length - 1]}`;
}

export interface ValidateFileOptions {
  accept?: string | readonly string[];
  maxSizeMb?: number;
}

/** Returns a user-facing error message, or `null` when the file is acceptable. */
export function validateFile(file: File, options: ValidateFileOptions = {}): string | null {
  if (options.accept && !matchesAccept(file, options.accept)) {
    return `${file.name} isn't a supported file type. Use ${describeAccept(options.accept)}.`;
  }
  if (file.size === 0) return `${file.name} is empty.`;
  if (options.maxSizeMb !== undefined && file.size > options.maxSizeMb * 1024 * 1024) {
    return `${file.name} is ${formatBytes(file.size)}. The limit is ${options.maxSizeMb} MB.`;
  }
  return null;
}

/** Decoded byte length of a base64 data URL. */
export function dataUrlByteSize(dataUrl: string): number {
  const comma = dataUrl.indexOf(",");
  if (comma === -1) return 0;
  const header = dataUrl.slice(0, comma);
  const payload = dataUrl.slice(comma + 1);
  if (!header.includes(";base64")) return decodeURIComponent(payload).length;
  const padding = payload.endsWith("==") ? 2 : payload.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((payload.length * 3) / 4) - padding);
}

/** Reads any file as a data URL. */
export function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Couldn't read the file."));
    reader.readAsDataURL(file);
  });
}

interface DecodedImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
}

async function decodeImage(file: File): Promise<DecodedImage> {
  if (typeof createImageBitmap === "function") {
    try {
      // "from-image" applies EXIF orientation so phone photos are upright.
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
    } catch {
      // Fall through to the <img> decoder (older Safari, some PNG variants).
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("decode failed"));
      img.src = url;
    });
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    };
  } catch {
    URL.revokeObjectURL(url);
    throw new Error(`Couldn't read ${file.name}. Use a JPG, PNG or WebP photo.`);
  }
}

/**
 * Decodes an image file, downscales it so the longest edge is at most
 * `maxDimension`, and re-encodes it as a JPEG (or WebP) data URL.
 * `width`/`height`/`size_bytes` describe the stored, downscaled image.
 */
export async function readImageFile(file: File, options: ImageCompressionOptions = {}): Promise<UploadedImage> {
  const maxDimension = options.maxDimension ?? DEFAULT_IMAGE_COMPRESSION.maxDimension;
  const quality = options.quality ?? DEFAULT_IMAGE_COMPRESSION.quality;
  const requestedType = options.mimeType ?? DEFAULT_IMAGE_COMPRESSION.mimeType;

  const decoded = await decodeImage(file);
  try {
    if (!decoded.width || !decoded.height) throw new Error(`Couldn't read ${file.name}.`);
    const scale = Math.min(1, maxDimension / Math.max(decoded.width, decoded.height));
    const width = Math.max(1, Math.round(decoded.width * scale));
    const height = Math.max(1, Math.round(decoded.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser can't process images.");
    // JPEG has no alpha channel: flatten transparent PNGs onto white.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(decoded.source, 0, 0, width, height);

    let mimeType: string = requestedType;
    let dataUrl = canvas.toDataURL(requestedType, quality);
    if (!dataUrl.startsWith(`data:${requestedType}`)) {
      mimeType = "image/jpeg";
      dataUrl = canvas.toDataURL(mimeType, quality);
    }

    return {
      id: createId(),
      name: file.name,
      data_url: dataUrl,
      width,
      height,
      size_bytes: dataUrlByteSize(dataUrl),
      mime_type: mimeType,
      uploaded_at: new Date().toISOString(),
    };
  } finally {
    decoded.release();
  }
}

/**
 * Reads a single document. Images up to `maxInlineBytes` (1.5 MB) keep a data
 * URL for previews; larger images and all PDFs/other files keep metadata only.
 */
export async function readDocumentFile(
  file: File,
  options: { maxInlineBytes?: number } = {},
): Promise<UploadedFile> {
  const maxInline = options.maxInlineBytes ?? MAX_INLINE_DOCUMENT_BYTES;
  const mimeType = getMimeType(file);
  const keepInline = mimeType.startsWith("image/") && file.size <= maxInline;
  const dataUrl = keepInline ? await readFileAsDataUrl(file) : undefined;
  return {
    id: createId(),
    name: file.name,
    size_bytes: file.size,
    mime_type: mimeType,
    ...(dataUrl ? { data_url: dataUrl } : {}),
    uploaded_at: new Date().toISOString(),
  };
}
