// Client-side photo checks and compression for the publish-listing form.
// Server limits (server/utils/multer.js): JPEG, PNG, GIF, WebP or AVIF; at most 8 files; 4 MB per file; and
// Vercel rejects request bodies over about 4.5 MB in total. The server re-encodes to 800×600 JPEG anyway, so
// compressing to the same size here costs nothing in quality and keeps uploads small.

export interface CompressedFile {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export const UPLOAD_LIMITS = {
  maxFiles: 8,
  maxFileBytes: 4 * 1024 * 1024,
  /** Leaves room for the text fields under Vercel's ~4.5 MB body cap. */
  maxTotalBytes: 4 * 1024 * 1024,
  types: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"],
  accept: "image/jpeg,image/png,image/gif,image/webp,image/avif",
} as const;

export class FileCompressor {
  private static readonly MAX_WIDTH = 800;
  private static readonly MAX_HEIGHT = 600;
  private static readonly QUALITY = 0.7;

  /** Resize to fit 800×600 and re-encode; GIFs (possibly animated) are kept as they are. */
  static async compressImage(file: File): Promise<CompressedFile> {
    const unchanged = { file, originalSize: file.size, compressedSize: file.size, compressionRatio: 1 };
    if (!file.type.startsWith("image/") || file.type === "image/gif") return unchanged;

    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("image could not be read"));
        el.src = url;
      });
      let { width, height } = img;
      if (width > this.MAX_WIDTH || height > this.MAX_HEIGHT) {
        const ratio = Math.min(this.MAX_WIDTH / width, this.MAX_HEIGHT / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")?.drawImage(img, 0, 0, width, height);
      // PNG keeps transparency; everything else becomes JPEG, as on the server.
      const type = file.type === "image/png" ? "image/png" : "image/jpeg";
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, this.QUALITY));
      if (!blob || blob.size >= file.size) return unchanged;
      const name = type === "image/jpeg" ? file.name.replace(/\.[^.]+$/, "") + ".jpg" : file.name;
      const compressed = new File([blob], name, { type, lastModified: Date.now() });
      return {
        file: compressed,
        originalSize: file.size,
        compressedSize: compressed.size,
        compressionRatio: compressed.size / file.size,
      };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  /** Compress each file; a file that cannot be compressed is kept as it is. */
  static async compressFiles(files: File[]): Promise<CompressedFile[]> {
    return Promise.all(
      files.map((file) =>
        this.compressImage(file).catch(() => ({
          file,
          originalSize: file.size,
          compressedSize: file.size,
          compressionRatio: 1,
        })),
      ),
    );
  }

  /** Type and size check against the server limits, with an Arabic message. */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    if (!(UPLOAD_LIMITS.types as readonly string[]).includes(file.type)) {
      return { isValid: false, error: `«${file.name}» ليست صورة مدعومة. استخدم JPG أو PNG أو WebP أو AVIF أو GIF.` };
    }
    if (file.type === "image/gif" && file.size > UPLOAD_LIMITS.maxFileBytes) {
      return { isValid: false, error: `«${file.name}» أكبر من 4 ميجابايت.` };
    }
    return { isValid: true };
  }

  static getTotalSize(files: File[]): number {
    return files.reduce((total, file) => total + file.size, 0);
  }

  /** "1.2 ميجابايت", "350 كيلوبايت". */
  static formatFileSize(bytes: number): string {
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} ميجابايت`;
    return `${Math.max(1, Math.round(bytes / 1024))} كيلوبايت`;
  }
}

export default FileCompressor;
