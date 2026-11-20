import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import sharp from "sharp";

const PUBLIC_UPLOAD_DIR = path.resolve(
  process.cwd(),
  process.env.STORAGE_DIR || "storage/uploads",
);
const PRIVATE_UPLOAD_DIR = path.resolve(process.cwd(), "storage/private");

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const ATTACHMENT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 60 * 1024 * 1024;

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "application/pdf": "pdf",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

async function monthDirectory(base: string) {
  const now = new Date();
  const relative = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const directory = path.join(base, relative);
  await mkdir(directory, { recursive: true });
  return { directory, relative };
}

export type StoredImage = {
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
};

export async function saveImage(file: File): Promise<StoredImage> {
  if (!IMAGE_TYPES.has(file.type)) {
    throw new Error("Unsupported image type. Use JPG, PNG, WebP or AVIF.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image is larger than 8 MB.");
  }

  const input = Buffer.from(await file.arrayBuffer());
  let metadata;
  try {
    metadata = await sharp(input).metadata();
  } catch {
    throw new Error("The uploaded file is not a valid image.");
  }
  if (!metadata.width || !metadata.height) {
    throw new Error("The uploaded image has no readable dimensions.");
  }

  const { directory, relative } = await monthDirectory(PUBLIC_UPLOAD_DIR);
  const id = randomUUID();
  const fileName = `${id}.webp`;
  const thumbName = `${id}-thumb.webp`;

  const optimized = await sharp(input)
    .rotate()
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  await writeFile(path.join(directory, fileName), optimized.data);

  const thumb = await sharp(input)
    .rotate()
    .resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 72 })
    .toBuffer();
  await writeFile(path.join(directory, thumbName), thumb);

  return {
    url: `/api/media/${relative}/${fileName}`,
    thumbnailUrl: `/api/media/${relative}/${thumbName}`,
    width: optimized.info.width,
    height: optimized.info.height,
    size: optimized.info.size,
    mimeType: "image/webp",
  };
}

export type StoredVideo = {
  url: string;
  size: number;
  mimeType: string;
};

export async function saveVideo(file: File): Promise<StoredVideo> {
  if (!VIDEO_TYPES.has(file.type)) {
    throw new Error("Unsupported video type. Use MP4 or WebM.");
  }
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error("Video is larger than 60 MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const isMp4 = buffer.subarray(4, 8).toString("ascii") === "ftyp";
  const isWebm = buffer.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
  if (!isMp4 && !isWebm) {
    throw new Error("The uploaded file is not a valid MP4 or WebM video.");
  }

  const { directory, relative } = await monthDirectory(PUBLIC_UPLOAD_DIR);
  const extension = isWebm ? "webm" : "mp4";
  const fileName = `${randomUUID()}.${extension}`;
  await writeFile(path.join(directory, fileName), buffer);

  return {
    url: `/api/media/${relative}/${fileName}`,
    size: file.size,
    mimeType: extension === "webm" ? "video/webm" : "video/mp4",
  };
}

export type StoredAttachment = {
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
};

export async function saveAttachment(file: File): Promise<StoredAttachment | null> {
  if (!file.size) return null;
  if (!ATTACHMENT_TYPES.has(file.type)) {
    throw new Error("Attachments must be PDF, JPG, PNG or WebP files.");
  }
  if (file.size > MAX_ATTACHMENT_BYTES) {
    throw new Error("Attachment is larger than 10 MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "application/pdf") {
    if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
      throw new Error("The PDF attachment appears to be invalid.");
    }
  } else {
    try {
      await sharp(buffer).metadata();
    } catch {
      throw new Error("The image attachment appears to be invalid.");
    }
  }

  const { directory, relative } = await monthDirectory(PRIVATE_UPLOAD_DIR);
  const extension = EXT_BY_MIME[file.type] || "bin";
  const storedName = `${randomUUID()}.${extension}`;
  await writeFile(path.join(directory, storedName), buffer);

  return {
    fileName: path.basename(file.name).slice(0, 180) || `attachment.${extension}`,
    filePath: `${relative}/${storedName}`,
    mimeType: file.type,
    size: file.size,
  };
}

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

function safeResolve(base: string, relativePath: string) {
  const decoded = decodeURIComponent(relativePath).replace(/\\/g, "/");
  const resolved = path.resolve(base, decoded);
  if (!resolved.startsWith(`${base}${path.sep}`)) return null;
  return resolved;
}

export async function readPublicMedia(relativePath: string) {
  const target = safeResolve(PUBLIC_UPLOAD_DIR, relativePath);
  if (!target) return null;
  try {
    const data = await readFile(target);
    return {
      data,
      contentType: CONTENT_TYPES[path.extname(target).toLowerCase()] || "application/octet-stream",
    };
  } catch {
    return null;
  }
}

export async function readPrivateFile(relativePath: string) {
  const target = safeResolve(PRIVATE_UPLOAD_DIR, relativePath);
  if (!target) return null;
  try {
    const data = await readFile(target);
    return {
      data,
      contentType: CONTENT_TYPES[path.extname(target).toLowerCase()] || "application/octet-stream",
    };
  } catch {
    return null;
  }
}

export async function deletePublicMedia(url: string) {
  if (!url.startsWith("/api/media/")) return;
  const relative = url.replace("/api/media/", "");
  const target = safeResolve(PUBLIC_UPLOAD_DIR, relative);
  if (!target) return;
  try {
    await unlink(target);
  } catch {
    // The file may already be gone.
  }
}
