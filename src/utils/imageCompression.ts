import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
}

const defaultOptions: CompressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  try {
    const compressionOptions = {
      ...defaultOptions,
      ...options,
    };

    const compressedFile = await imageCompression(file, compressionOptions);
    
    // Create a new file with the original name but compressed content
    return new File([compressedFile], file.name, {
      type: file.type,
      lastModified: file.lastModified,
    });
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Failed to compress image');
  }
}

export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
} 