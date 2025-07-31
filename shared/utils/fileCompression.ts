// File compression utility for reducing upload sizes
export interface CompressedFile {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export class FileCompressor {
  private static readonly MAX_WIDTH = 800;
  private static readonly MAX_HEIGHT = 600;
  private static readonly QUALITY = 0.7;
  private static readonly MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

  /**
   * Compress an image file using canvas
   */
  static async compressImage(file: File): Promise<CompressedFile> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        resolve({
          file,
          originalSize: file.size,
          compressedSize: file.size,
          compressionRatio: 1
        });
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > this.MAX_WIDTH || height > this.MAX_HEIGHT) {
          const ratio = Math.min(this.MAX_WIDTH / width, this.MAX_HEIGHT / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });

            resolve({
              file: compressedFile,
              originalSize: file.size,
              compressedSize: compressedFile.size,
              compressionRatio: compressedFile.size / file.size
            });
          },
          file.type,
          this.QUALITY
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Compress multiple files
   */
  static async compressFiles(files: File[]): Promise<CompressedFile[]> {
    const compressedFiles: CompressedFile[] = [];

    for (const file of files) {
      try {
        if (file.type.startsWith('image/')) {
          const compressed = await this.compressImage(file);
          compressedFiles.push(compressed);
        } else {
          // For non-image files, check if they need compression
          if (file.size > this.MAX_FILE_SIZE) {
            console.warn(`File ${file.name} is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Consider reducing file size.`);
          }
          compressedFiles.push({
            file,
            originalSize: file.size,
            compressedSize: file.size,
            compressionRatio: 1
          });
        }
      } catch (error) {
        console.error(`Failed to compress file ${file.name}:`, error);
        // Return original file if compression fails
        compressedFiles.push({
          file,
          originalSize: file.size,
          compressedSize: file.size,
          compressionRatio: 1
        });
      }
    }

    return compressedFiles;
  }

  /**
   * Validate file size and type
   */
  static validateFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 4 * 1024 * 1024; // 4MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/avif',
      'video/mp4',
      'video/quicktime',
      'video/x-matroska',
      'video/webm'
    ];

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size must be less than 4MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not allowed`
      };
    }

    return { isValid: true };
  }

  /**
   * Get total size of files
   */
  static getTotalSize(files: File[]): number {
    return files.reduce((total, file) => total + file.size, 0);
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default FileCompressor; 