/**
 * Compresses an image in the browser before upload — resizes to a max
 * dimension and re-encodes as JPEG at reduced quality. Cuts a typical
 * 5-10MB phone photo down to a few hundred KB, which is what actually
 * makes uploads feel fast on mobile data instead of hanging on "Uploading…".
 */
export function compressImage(file: File, maxDimension = 1600, quality = 0.75): Promise<File> {
  return new Promise((resolve, reject) => {
    // Skip compression for already-small files or non-standard image types.
    if (file.size < 400 * 1024 || !file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressedFile = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), {
            type: 'image/jpeg',
          });
          resolve(compressedFile.size < file.size ? compressedFile : file);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // fall back to original file if compression fails
    };

    img.src = objectUrl;
  });
}  